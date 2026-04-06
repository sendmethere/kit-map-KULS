import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import useMapStore from '@/store/useMapStore'

export default function KitGenerator({ onClose, onActivate }) {
  const {
    decompositionMode,
    decompositionRatio,
    kit,
    setDecompositionMode,
    setDecompositionRatio,
    generateKit,
    activateKit,
    teacherNodes,
  } = useMapStore()

  const handleGenerate = () => {
    generateKit()
  }

  const handleActivate = () => {
    activateKit()
    onActivate()
    onClose()
  }

  if (teacherNodes.length === 0) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">키트 생성</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
        </div>
        <p className="text-sm text-gray-500">먼저 개념 지도를 작성하고 저장해 주세요.</p>
      </div>
    )
  }

  return (
    <div className="w-72 bg-white border-l border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">키트 생성</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
      </div>

      <div className="flex flex-col gap-3">
        <Label className="font-medium">분해 방식</Label>
        <RadioGroup
          value={decompositionMode}
          onValueChange={setDecompositionMode}
          aria-label="분해 방식 선택"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="full" id="full" />
            <Label htmlFor="full" className="cursor-pointer">전체 분해</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="partial" id="partial" />
            <Label htmlFor="partial" className="cursor-pointer">부분 분해</Label>
          </div>
        </RadioGroup>
      </div>

      {decompositionMode === 'partial' && (
        <div className="flex flex-col gap-3">
          <Label className="font-medium">
            유지할 연결 비율: <span className="text-orange-500">{decompositionRatio}%</span>
          </Label>
          <Slider
            min={0}
            max={100}
            step={5}
            value={[decompositionRatio]}
            onValueChange={([v]) => setDecompositionRatio(v)}
            aria-label="연결 유지 비율 조절"
          />
        </div>
      )}

      <Button onClick={handleGenerate} variant="outline" aria-label="키트 미리보기 생성">
        미리보기 생성
      </Button>

      {kit.conceptNodes.length > 0 && (
        <div className="border rounded-lg p-3 bg-gray-50">
          <p className="text-xs font-medium text-gray-600 mb-2">키트 구성</p>
          <p className="text-xs text-gray-500">개념 노드: {kit.conceptNodes.length}개</p>
          <p className="text-xs text-gray-500">관계 레이블: {kit.linkLabels.length}개</p>
          {decompositionMode === 'partial' && (
            <p className="text-xs text-gray-500">유지된 연결: {kit.frozenEdges.length}개</p>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            {kit.conceptNodes.slice(0, 6).map((n) => (
              <span
                key={n.id}
                style={{ background: n.data?.color || '#F97316' }}
                className="text-white text-xs px-2 py-0.5 rounded"
              >
                {n.data?.label}
              </span>
            ))}
            {kit.conceptNodes.length > 6 && (
              <span className="text-xs text-gray-400">+{kit.conceptNodes.length - 6}개</span>
            )}
          </div>
        </div>
      )}

      {kit.conceptNodes.length > 0 && (
        <Button
          onClick={handleActivate}
          className="bg-orange-500 hover:bg-orange-600"
          aria-label="학생에게 키트 활성화"
        >
          학생에게 키트 활성화
        </Button>
      )}
    </div>
  )
}
