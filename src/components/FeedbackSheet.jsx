import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import useMapStore from '@/store/useMapStore'

export default function FeedbackSheet({ onClose, onReset }) {
  const { score, feedbackEdges, studentNodes, teacherNodes, teacherEdges } = useMapStore()

  const missingEdges = feedbackEdges.filter((e) => e.feedbackType === 'missing')

  const getNodeLabel = (nodeId) => {
    const allNodes = [...studentNodes, ...teacherNodes]
    const node = allNodes.find((n) => n.id === nodeId)
    return node?.data?.label || nodeId
  }

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">피드백 결과</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">점수</span>
            <span className="text-2xl font-bold text-orange-500">{score.percentage}%</span>
          </div>
          <Progress value={score.percentage} className="h-3" />
        </div>

        <div className="flex gap-3 mb-4">
          <Badge variant="success" className="gap-1 px-3 py-1">
            <span>정답</span>
            <span className="font-bold">{score.correct}개</span>
          </Badge>
          <Badge variant="destructive" className="gap-1 px-3 py-1">
            <span>누락</span>
            <span className="font-bold">{score.missing}개</span>
          </Badge>
          <Badge variant="info" className="gap-1 px-3 py-1">
            <span>초과</span>
            <span className="font-bold">{score.excessive}개</span>
          </Badge>
          <Badge variant="secondary" className="gap-1 px-3 py-1">
            <span>전체</span>
            <span className="font-bold">{score.total}개</span>
          </Badge>
        </div>

        {missingEdges.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">누락된 연결:</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {missingEdges.map((edge, i) => (
                <div key={i} className="text-sm bg-red-50 border border-red-200 rounded px-3 py-1.5 text-red-700">
                  {getNodeLabel(edge.source)} → <span className="font-medium">{edge.label}</span> → {getNodeLabel(edge.target)}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            aria-label="학생 지도 초기화"
          >
            초기화
          </Button>
          <Button size="sm" onClick={onClose} aria-label="피드백 닫기">
            닫기
          </Button>
        </div>
      </div>
    </div>
  )
}
