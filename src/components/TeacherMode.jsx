import { useState, useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Home, Save, Package, Undo2, Redo2, LayoutDashboard, Trash2, Database, BookOpen } from 'lucide-react'
import useMapStore, { MAX_NODES, MAX_EDGES } from '@/store/useMapStore'
import ConceptNode from './ConceptNode'
import NodeEditor from './NodeEditor'
import KitGenerator from './KitGenerator'
import { getLayoutedElements } from '@/utils/layout'
import SAMPLES from '@/utils/samples'

const nodeTypes = { concept: ConceptNode }

let nodeIdCounter = 1
const getId = () => `n${nodeIdCounter++}`

export default function TeacherMode({ onHome, onKitActivated }) {
  const {
    teacherNodes, teacherEdges,
    setTeacherNodes, setTeacherEdges,
    saveTeacherMap, clearTeacherMap,
    pushHistory, undo, redo,
  } = useMapStore()

  const [nodes, setNodes, onNodesChange] = useNodesState(teacherNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(teacherEdges)
  const [selectedNode, setSelectedNode] = useState(null)
  const [showKitPanel, setShowKitPanel] = useState(false)
  const [limitAlert, setLimitAlert] = useState(null) // 'node' | 'edge' | null

  // Dialog states
  const [nodeDialog, setNodeDialog] = useState({ open: false, label: '' })
  const [edgeDialog, setEdgeDialog] = useState({ open: false, label: '' })
  const [pendingConnection, setPendingConnection] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showSamples, setShowSamples] = useState(false)

  // Sync to store when nodes/edges change — respect limits
  useEffect(() => {
    setTeacherNodes(nodes)
  }, [nodes])

  useEffect(() => {
    setTeacherEdges(edges)
  }, [edges])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        undo()
        const s = useMapStore.getState()
        setNodes(s.teacherNodes)
        setEdges(s.teacherEdges)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redo()
        const s = useMapStore.getState()
        setNodes(s.teacherNodes)
        setEdges(s.teacherEdges)
      }
      if (e.key === 'Delete' && selectedNode) {
        handleDeleteNode(selectedNode.id)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedNode])

  const pushSnap = () => {
    pushHistory({ teacherNodes: nodes, teacherEdges: edges })
  }

  const handlePaneClick = useCallback((e) => {
    if (e.target.classList.contains('react-flow__pane')) {
      if (nodes.length >= MAX_NODES) {
        setLimitAlert('node')
        return
      }
      setNodeDialog({ open: true, label: '', clickPos: { x: e.clientX, y: e.clientY } })
    }
    setSelectedNode(null)
  }, [nodes.length])

  const handleAddNode = () => {
    if (!nodeDialog.label.trim()) {
      setNodeDialog({ open: false, label: '' })
      return
    }
    if (nodes.length >= MAX_NODES) {
      setNodeDialog({ open: false, label: '' })
      setLimitAlert('node')
      return
    }
    pushSnap()
    const rect = document.querySelector('.react-flow').getBoundingClientRect()
    const pos = nodeDialog.clickPos
      ? {
          x: nodeDialog.clickPos.x - rect.left - 100,
          y: nodeDialog.clickPos.y - rect.top - 25,
        }
      : { x: 200, y: 200 }

    const newNode = {
      id: getId(),
      type: 'concept',
      position: { x: Math.max(0, pos.x), y: Math.max(0, pos.y) },
      data: { label: nodeDialog.label.trim(), color: '#F97316' },
    }
    setNodes((nds) => [...nds, newNode])
    setNodeDialog({ open: false, label: '' })
  }

  const handleConnect = useCallback((connection) => {
    setPendingConnection(connection)
    setEdgeDialog({ open: true, label: '' })
  }, [])

  const handleAddEdge = () => {
    if (!pendingConnection) return
    if (edges.length >= MAX_EDGES) {
      setEdgeDialog({ open: false, label: '' })
      setPendingConnection(null)
      setLimitAlert('edge')
      return
    }
    pushSnap()
    const newEdge = {
      ...pendingConnection,
      id: `e${Date.now()}`,
      label: edgeDialog.label.trim() || '관계',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2 },
      labelStyle: { fontSize: 12, fill: '#374151' },
      labelBgStyle: { fill: '#F3F4F6', fillOpacity: 0.9 },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 4,
    }
    setEdges((eds) => addEdge(newEdge, eds))
    setEdgeDialog({ open: false, label: '' })
    setPendingConnection(null)
  }

  const handleNodeClick = (_, node) => setSelectedNode(node)
  const handleNodeDoubleClick = (_, node) => setSelectedNode(node)

  const handleUpdateNode = (id, updates) => {
    pushSnap()
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, label: updates.label, color: updates.color } } : n
      )
    )
    setSelectedNode(null)
  }

  const handleDeleteNode = (id) => {
    pushSnap()
    setNodes((nds) => nds.filter((n) => n.id !== id))
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
    setSelectedNode(null)
  }

  const handleSave = () => {
    saveTeacherMap()
    alert('개념 지도가 저장되었습니다.')
  }

  const handleClear = () => {
    clearTeacherMap()
    setNodes([])
    setEdges([])
    setSelectedNode(null)
    setShowClearConfirm(false)
  }

  const handleLoadSample = (sample) => {
    pushSnap()
    setNodes(sample.nodes)
    setEdges(sample.edges)
    setShowSamples(false)
  }

  const handleAutoLayout = () => {
    pushSnap()
    const { nodes: ln, edges: le } = getLayoutedElements(nodes, edges)
    setNodes(ln)
    setEdges(le)
  }

  const nodeCount = nodes.length
  const edgeCount = edges.length

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Top Bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 shadow-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onHome} aria-label="홈으로 돌아가기">
                <Home className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>홈으로</TooltipContent>
          </Tooltip>

          <span className="font-bold text-orange-600 text-lg">교사 모드</span>

          {/* 저장 현황 표시 */}
          <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
            <Database className="w-3 h-3" />
            <span>
              노드 <span className={nodeCount >= MAX_NODES ? 'text-red-500 font-bold' : 'text-gray-700 font-medium'}>{nodeCount}/{MAX_NODES}</span>
            </span>
            <span className="mx-1">·</span>
            <span>
              관계 <span className={edgeCount >= MAX_EDGES ? 'text-red-500 font-bold' : 'text-gray-700 font-medium'}>{edgeCount}/{MAX_EDGES}</span>
            </span>
          </div>

          <div className="flex-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSamples(true)}
                aria-label="샘플 지도 불러오기"
              >
                <BookOpen className="w-4 h-4 mr-1" />
                샘플 불러오기
              </Button>
            </TooltipTrigger>
            <TooltipContent>과학·사회·정보 교과 샘플 지도를 불러옵니다</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
                className="text-red-500 border-red-200 hover:bg-red-50"
                aria-label="저장된 지도 초기화"
              >
                초기화
              </Button>
            </TooltipTrigger>
            <TooltipContent>저장된 지도를 모두 지웁니다</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleSave} aria-label="개념 지도 저장">
                <Save className="w-4 h-4 mr-1" />
                개념 지도 저장
              </Button>
            </TooltipTrigger>
            <TooltipContent>현재 지도를 localStorage에 저장합니다</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                size="sm"
                onClick={() => setShowKitPanel((v) => !v)}
                aria-label="키트 생성 패널 열기"
              >
                <Package className="w-4 h-4 mr-1" />
                키트 생성
              </Button>
            </TooltipTrigger>
            <TooltipContent>학생용 키트를 생성합니다</TooltipContent>
          </Tooltip>
        </div>

        {/* Main Area */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={handleConnect}
              onPaneClick={handlePaneClick}
              onNodeClick={handleNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              fitView
              deleteKeyCode={null}
            >
              <Background variant="dots" gap={16} size={1} color="#E5E7EB" />
              <Controls />
              <MiniMap nodeColor={(n) => n.data?.color || '#F97316'} />
            </ReactFlow>

            {/* 빈 캔버스 안내 */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-400 text-sm">빈 캔버스를 클릭하여 개념 노드를 추가하세요</p>
              </div>
            )}

            {/* Bottom Toolbar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded-xl shadow-md px-4 py-2 border border-gray-200">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => {
                      undo()
                      const s = useMapStore.getState()
                      setNodes(s.teacherNodes)
                      setEdges(s.teacherEdges)
                    }}
                    aria-label="실행 취소"
                  >
                    <Undo2 className="w-4 h-4 mr-1" />실행 취소
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ctrl+Z</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => {
                      redo()
                      const s = useMapStore.getState()
                      setNodes(s.teacherNodes)
                      setEdges(s.teacherEdges)
                    }}
                    aria-label="다시 실행"
                  >
                    <Redo2 className="w-4 h-4 mr-1" />다시 실행
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ctrl+Y</TooltipContent>
              </Tooltip>

              <div className="w-px h-6 bg-gray-200" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleAutoLayout} aria-label="자동 정렬">
                    <LayoutDashboard className="w-4 h-4 mr-1" />자동 정렬
                  </Button>
                </TooltipTrigger>
                <TooltipContent>노드를 자동으로 정렬합니다</TooltipContent>
              </Tooltip>

              {selectedNode && (
                <>
                  <div className="w-px h-6 bg-gray-200" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => handleDeleteNode(selectedNode.id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="선택된 노드 삭제"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />삭제
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete 키로도 삭제 가능합니다</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </div>

          {/* Right Panels */}
          {selectedNode && !showKitPanel && (
            <NodeEditor
              node={selectedNode}
              onUpdate={handleUpdateNode}
              onDelete={handleDeleteNode}
              onClose={() => setSelectedNode(null)}
            />
          )}
          {showKitPanel && (
            <KitGenerator onClose={() => setShowKitPanel(false)} onActivate={onKitActivated} />
          )}
        </div>

        {/* ── Dialogs ── */}

        {/* 개념 노드 추가 */}
        <Dialog open={nodeDialog.open} onOpenChange={(open) => !open && setNodeDialog({ open: false, label: '' })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>개념 노드 추가</DialogTitle>
            </DialogHeader>
            <Input
              autoFocus
              value={nodeDialog.label}
              onChange={(e) => setNodeDialog((d) => ({ ...d, label: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNode()}
              placeholder="개념 이름을 입력하세요"
              aria-label="개념 이름 입력"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setNodeDialog({ open: false, label: '' })}>취소</Button>
              <Button onClick={handleAddNode} aria-label="노드 추가 확인">추가</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 관계 이름 입력 */}
        <Dialog open={edgeDialog.open} onOpenChange={(open) => !open && setEdgeDialog({ open: false, label: '' })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>관계 이름 입력</DialogTitle>
            </DialogHeader>
            <Input
              autoFocus
              value={edgeDialog.label}
              onChange={(e) => setEdgeDialog((d) => ({ ...d, label: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleAddEdge()}
              placeholder="관계 이름을 입력하세요"
              aria-label="관계 이름 입력"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEdgeDialog({ open: false, label: '' }); setPendingConnection(null) }}>취소</Button>
              <Button onClick={handleAddEdge} aria-label="관계 추가 확인">추가</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 한도 초과 경고 */}
        <Dialog open={!!limitAlert} onOpenChange={() => setLimitAlert(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>한도 초과</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              {limitAlert === 'node'
                ? `개념 노드는 최대 ${MAX_NODES}개까지 추가할 수 있습니다.`
                : `관계(엣지)는 최대 ${MAX_EDGES}개까지 추가할 수 있습니다.`}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              일부 노드나 관계를 삭제한 후 다시 시도해 주세요.
            </p>
            <DialogFooter>
              <Button onClick={() => setLimitAlert(null)}>확인</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 샘플 선택 */}
        <Dialog open={showSamples} onOpenChange={setShowSamples}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>교과 샘플 지도 불러오기</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-500 -mt-2">
              샘플을 선택하면 현재 캔버스에 불러옵니다. 기존 작업은 실행 취소로 복원할 수 있습니다.
            </p>
            <div className="grid grid-cols-3 gap-4 my-2">
              {SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleLoadSample(sample)}
                  style={{ borderColor: sample.borderColor, background: sample.bgColor }}
                  className="flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2"
                  aria-label={`${sample.subject} 샘플 불러오기: ${sample.title}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{ background: sample.color }}
                      className="text-white text-xs font-bold px-2 py-0.5 rounded-full"
                    >
                      {sample.subject}
                    </span>
                  </div>
                  <p className="font-bold text-gray-800 text-sm leading-tight">{sample.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{sample.description}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>노드 {sample.nodeCount}개</span>
                    <span>관계 {sample.edgeCount}개</span>
                  </div>
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSamples(false)}>취소</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 초기화 확인 */}
        <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>지도 초기화</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              저장된 모든 노드와 관계가 삭제됩니다. 계속하시겠습니까?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowClearConfirm(false)}>취소</Button>
              <Button variant="destructive" onClick={handleClear} aria-label="지도 초기화 확인">초기화</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
