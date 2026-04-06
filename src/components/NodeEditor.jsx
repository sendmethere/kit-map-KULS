import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const COLORS = [
  '#F97316', '#EF4444', '#8B5CF6', '#3B82F6',
  '#10B981', '#F59E0B', '#EC4899', '#6B7280',
]

export default function NodeEditor({ node, onUpdate, onDelete, onClose }) {
  const [label, setLabel] = useState(node?.data?.label || '')
  const [color, setColor] = useState(node?.data?.color || '#F97316')

  useEffect(() => {
    setLabel(node?.data?.label || '')
    setColor(node?.data?.color || '#F97316')
  }, [node])

  if (!node) return null

  const handleApply = () => {
    onUpdate(node.id, { label, color })
  }

  return (
    <div className="w-56 bg-white border-l border-gray-200 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">노드 편집</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="node-label">개념 이름</Label>
        <Input
          id="node-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="개념 이름을 입력하세요"
          aria-label="개념 이름 입력"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>노드 색상</Label>
        <div className="grid grid-cols-4 gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ background: c }}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                color === c ? 'border-gray-800 scale-110' : 'border-transparent'
              }`}
              aria-label={`색상 선택 ${c}`}
            />
          ))}
        </div>
      </div>

      <Button size="sm" onClick={handleApply} aria-label="변경사항 적용">
        적용
      </Button>

      <Button
        size="sm"
        variant="destructive"
        onClick={() => onDelete(node.id)}
        aria-label="노드 삭제"
      >
        삭제
      </Button>
    </div>
  )
}
