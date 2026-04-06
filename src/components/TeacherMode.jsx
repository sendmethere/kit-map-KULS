import { useState, useCallback, useRef, useEffect } from 'react'
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
import { Home, Save, Package, Undo2, Redo2, LayoutDashboard, Trash2 } from 'lucide-react'
import useMapStore from '@/store/useMapStore'
import ConceptNode from './ConceptNode'
import NodeEditor from './NodeEditor'
import KitGenerator from './KitGenerator'
import { getLayoutedElements } from '@/utils/layout'

const nodeTypes = { concept: ConceptNode }

let nodeIdCounter = 1
const getId = () => `n${nodeIdCounter++}`

export default function TeacherMode({ onHome, onKitActivated }) {
  const {
    teacherNodes, teacherEdges,
    setTeacherNodes, setTeacherEdges,
    saveTeacherMap,
    pushHistory, undo, redo,
  } = useMapStore()

  const [nodes, setNodes, onNodesChange] = useNodesState(teacherNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(teacherEdges)
  const [selectedNode, setSelectedNode] = useState(null)
  const [showKitPanel, setShowKitPanel] = useState(false)

  // Dialog states
  const [nodeDialog, setNodeDialog] = useState({ open: false, label: '' })
  const [edgeDialog, setEdgeDialog] = useState({ open: false, label: '', connection: null })
  const [pendingConnection, setPendingConnection] = useState(null)

  // Sync to store when nodes/edges change
  useEffect(() => {
    setTeacherNodes(nodes)
    setTeacherEdges(edges)
  }, [nodes, edges])

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
  }, [selectedNode, undo, redo])

  const pushSnap = () => {
    pushHistory({ teacherNodes: nodes, teacherEdges: edges })
  }

  const handlePaneClick = useCallback(
    (e) => {
      if (e.target.classList.contains('react-flow__pane')) {
        setNodeDialog({ open: true, label: '', clickPos: { x: e.clientX, y: e.clientY } })
      }
      setSelectedNode(null)
    },
    []
  )

  const handleAddNode = () => {
    if (!nodeDialog.label.trim()) {
      setNodeDialog({ open: false, label: '' })
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

  const handleConnect = useCallback(
    (connection) => {
      setPendingConnection(connection)
      setEdgeDialog({ open: true, label: '' })
    },
    []
  )

  const handleAddEdge = () => {
    if (!pendingConnection) return
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

  const handleNodeClick = (_, node) => {
    setSelectedNode(node)
  }

  const handleNodeDoubleClick = (_, node) => {
    setSelectedNode(node)
  }

  const handleUpdateNode = (id, updates) => {
    pushSnap()
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, label: updates.label, color: updates.color } }
          : n
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

  const handleAutoLayout = () => {
    pushSnap()
    const { nodes: ln, edges: le } = getLayoutedElements(nodes, edges)
    setNodes(ln)
    setEdges(le)
  }

  const handleDeleteSelected = () => {
    if (selectedNode) handleDeleteNode(selectedNode.id)
  }

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
          <div className="flex-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleSave} aria-label="개념 지도 저장">
                <Save className="w-4 h-4 mr-1" />
                개념 지도 저장
              </Button>
            </TooltipTrigger>
            <TooltipContent>현재 지도를 저장합니다</TooltipContent>
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
          {/* Canvas */}
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

            {/* Bottom Toolbar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded-xl shadow-md px-4 py-2 border border-gray-200">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      undo()
                      const s = useMapStore.getState()
                      setNodes(s.teacherNodes)
                      setEdges(s.teacherEdges)
                    }}
                    aria-label="실행 취소"
                  >
                    <Undo2 className="w-4 h-4 mr-1" />
                    실행 취소
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ctrl+Z</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      redo()
                      const s = useMapStore.getState()
                      setNodes(s.teacherNodes)
                      setEdges(s.teacherEdges)
                    }}
                    aria-label="다시 실행"
                  >
                    <Redo2 className="w-4 h-4 mr-1" />
                    다시 실행
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ctrl+Y</TooltipContent>
              </Tooltip>

              <div className="w-px h-6 bg-gray-200" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleAutoLayout} aria-label="자동 정렬">
                    <LayoutDashboard className="w-4 h-4 mr-1" />
                    자동 정렬
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
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteSelected}
                        className="text-red-500 hover:text-red-700"
                        aria-label="선택된 노드 삭제"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        삭제
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
            <KitGenerator
              onClose={() => setShowKitPanel(false)}
              onActivate={onKitActivated}
            />
          )}
        </div>

        {/* Node Label Dialog */}
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
              <Button variant="outline" onClick={() => setNodeDialog({ open: false, label: '' })}>
                취소
              </Button>
              <Button onClick={handleAddNode} aria-label="노드 추가 확인">
                추가
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edge Label Dialog */}
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
              <Button
                variant="outline"
                onClick={() => {
                  setEdgeDialog({ open: false, label: '' })
                  setPendingConnection(null)
                }}
              >
                취소
              </Button>
              <Button onClick={handleAddEdge} aria-label="관계 추가 확인">
                추가
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
