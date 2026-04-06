import { Handle, Position } from '@xyflow/react'

export default function ConceptNode({ data, selected }) {
  const bgColor = data.color || '#F97316'

  return (
    <div
      style={{ background: bgColor, borderColor: selected ? '#1D4ED8' : 'rgba(0,0,0,0.2)' }}
      className="px-4 py-2 rounded-lg border-2 text-white font-medium text-sm min-w-[100px] text-center shadow-md cursor-pointer select-none"
    >
      <Handle type="target" position={Position.Top} className="!bg-white !border-gray-400" />
      <div className="truncate max-w-[160px]">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-white !border-gray-400" />
    </div>
  )
}
