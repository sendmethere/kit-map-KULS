import { useState, useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Home, Search, CheckCircle, RotateCcw } from 'lucide-react'
import useMapStore from '@/store/useMapStore'
import ConceptNode from './ConceptNode'
import FeedbackSheet from './FeedbackSheet'

const nodeTypes = { concept: ConceptNode }

const getFeedbackEdgeStyle = (feedbackType) => {
  switch (feedbackType) {
    case 'correct':
      return { stroke: '#22C55E', strokeWidth: 3 }
    case 'missing':
      return { stroke: '#EF4444', strokeWidth: 3, strokeDasharray: '5,5' }
    case 'excessive':
      return { stroke: '#3B82F6', strokeWidth: 3 }
    default:
      return { stroke: '#9CA3AF', strokeWidth: 2 }
  }
}

export default function StudentMode({ onHome }) {
  const {
    kit,
    kitActivated,
    studentNodes,
    studentEdges,
    feedbackEdges,
    score,
    setStudentNodes,
    setStudentEdges,
    checkStudentMap,
    resetStudentMap,
    clearFeedback,
    teacherEdges,
  } = useMapStore()

  const [nodes, setNodes, onNodesChange] = useNodesState(studentNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(studentEdges)
  const [showFeedback, setShowFeedback] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSource, setSelectedSource] = useState(null)
  const [selectedLabel, setSelectedLabel] = useState(null)
  const [hasFeedback, setHasFeedback] = useState(false)

  // Sync from store on mount or kit change
  useEffect(() => {
    setNodes(studentNodes.map((n) => ({ ...n })))
    setEdges(studentEdges.map((e) => renderEdge(e, null)))
  }, [kitActivated])

  // Sync to store
  useEffect(() => {
    setStudentNodes(nodes)
  }, [nodes])

  useEffect(() => {
    setStudentEdges(edges.map((e) => ({ ...e, feedbackType: undefined })))
  }, [edges])

  // Apply feedback edges when feedback is available
  useEffect(() => {
    if (feedbackEdges.length > 0) {
      const renderedFeedback = feedbackEdges.map((e) => renderEdge(e, e.feedbackType))
      setEdges(renderedFeedback)
      setHasFeedback(true)
    }
  }, [feedbackEdges])

  function renderEdge(edge, feedbackType) {
    const style = getFeedbackEdgeStyle(feedbackType)
    return {
      ...edge,
      id: edge.id || `e${Date.now()}-${Math.random()}`,
      markerEnd: { type: MarkerType.ArrowClosed },
      style,
      label: edge.label,
      labelStyle: { fontSize: 11, fill: '#374151' },
      labelBgStyle: { fill: '#F9FAFB', fillOpacity: 0.95 },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 4,
    }
  }

  const completionPercentage = teacherEdges.length > 0
    ? Math.min(100, Math.round((edges.filter((e) => !e.id?.startsWith('missing')).length / teacherEdges.length) * 100))
    : 0

  const filteredLabels = kit.linkLabels.filter((label) =>
    label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNodeClick = (_, node) => {
    if (hasFeedback) return

    if (!selectedSource) {
      setSelectedSource(node)
    } else if (selectedLabel && selectedSource.id !== node.id) {
      // Create edge
      const newEdge = renderEdge(
        {
          id: `e${Date.now()}`,
          source: selectedSource.id,
          target: node.id,
          label: selectedLabel,
        },
        null
      )
      setEdges((eds) => [...eds, newEdge])
      setSelectedSource(null)
      setSelectedLabel(null)
    } else {
      setSelectedSource(node)
    }
  }

  const handleLabelSelect = (label) => {
    setSelectedLabel(label === selectedLabel ? null : label)
  }

  const handleCheck = () => {
    checkStudentMap()
    setShowFeedback(true)
  }

  const handleReset = () => {
    resetStudentMap()
    clearFeedback()
    setShowFeedback(false)
    setHasFeedback(false)
    setSelectedSource(null)
    setSelectedLabel(null)
    const s = useMapStore.getState()
    setNodes(s.studentNodes.map((n) => ({ ...n })))
    setEdges(s.studentEdges.map((e) => renderEdge(e, null)))
  }

  if (!kitActivated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">키트가 활성화되지 않았습니다</h2>
          <p className="text-gray-500 mb-4">교사 모드에서 키트를 생성하고 활성화해 주세요.</p>
          <Button onClick={onHome} aria-label="홈으로 이동">홈으로 이동</Button>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Top Bar */}
        <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 shadow-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onHome} aria-label="홈으로 돌아가기">
                <Home className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>홈으로</TooltipContent>
          </Tooltip>

          <span className="font-bold text-blue-600 text-lg">학생 모드</span>

          <div className="flex-1 max-w-xs mx-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">완성도</span>
              <Progress value={completionPercentage} className="flex-1 h-2" />
              <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{completionPercentage}%</span>
            </div>
          </div>

          <div className="flex-1" />

          <Button
            variant="outline"
            size="sm"
            onClick={handleCheck}
            disabled={hasFeedback}
            aria-label="내 지도 확인"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            내 지도 확인
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            aria-label="학생 지도 초기화"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            초기화
          </Button>
        </div>

        {/* Interaction hint */}
        {!hasFeedback && (
          <div className="bg-blue-50 border-b border-blue-100 px-4 py-1.5 text-xs text-blue-700">
            {!selectedSource && '① 출발 개념 노드를 클릭하세요'}
            {selectedSource && !selectedLabel && `② "${selectedSource.data?.label}" 선택됨 → 관계 레이블을 클릭하세요`}
            {selectedSource && selectedLabel && `③ "${selectedLabel}" 선택됨 → 도착 개념 노드를 클릭하세요`}
          </div>
        )}

        {/* Main Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Tray */}
          <div className="w-52 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-600 mb-2">사용 가능한 관계 목록</p>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="개념 검색..."
                  className="pl-7 h-7 text-xs"
                  aria-label="관계 레이블 검색"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {filteredLabels.length === 0 ? (
                <p className="text-xs text-gray-400 text-center mt-4">
                  {kit.linkLabels.length === 0
                    ? '사용 가능한 관계가 없습니다'
                    : '검색 결과가 없습니다'}
                </p>
              ) : (
                filteredLabels.map((label) => (
                  <Badge
                    key={label}
                    variant={selectedLabel === label ? 'default' : 'secondary'}
                    className={`cursor-pointer text-center justify-center py-1.5 text-xs select-none transition-all ${
                      selectedLabel === label
                        ? 'ring-2 ring-blue-400 scale-105'
                        : 'hover:bg-gray-200'
                    }`}
                    onClick={() => !hasFeedback && handleLabelSelect(label)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && !hasFeedback && handleLabelSelect(label)}
                    aria-label={`관계 레이블 선택: ${label}`}
                    aria-pressed={selectedLabel === label}
                  >
                    {label}
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1">
            <ReactFlow
              nodes={nodes.map((n) => ({
                ...n,
                data: {
                  ...n.data,
                  color:
                    selectedSource?.id === n.id
                      ? '#3B82F6'
                      : n.data?.color || '#F97316',
                },
              }))}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              fitView
              deleteKeyCode={null}
            >
              <Background variant="dots" gap={16} size={1} color="#E5E7EB" />
              <Controls />
            </ReactFlow>
          </div>
        </div>

        {/* Feedback Sheet */}
        {showFeedback && (
          <FeedbackSheet
            onClose={() => setShowFeedback(false)}
            onReset={handleReset}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
