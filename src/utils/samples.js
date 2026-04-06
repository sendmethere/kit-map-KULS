import { MarkerType } from '@xyflow/react'

const edgeDefaults = {
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { strokeWidth: 2 },
  labelStyle: { fontSize: 12, fill: '#374151' },
  labelBgStyle: { fill: '#F3F4F6', fillOpacity: 0.9 },
  labelBgPadding: [4, 2],
  labelBgBorderRadius: 4,
}

const node = (id, label, x, y, color = '#F97316') => ({
  id,
  type: 'concept',
  position: { x, y },
  data: { label, color },
})

const edge = (id, source, target, label) => ({
  id,
  source,
  target,
  label,
  ...edgeDefaults,
})

// ── 과학: 광합성 ──────────────────────────────────────────────────────────────
const scienceNodes = [
  node('n1',  '광합성',      380,  40, '#16A34A'),
  node('n2',  '엽록체',      160,  40, '#15803D'),
  node('n3',  '빛에너지',    640, 120, '#CA8A04'),
  node('n4',  '이산화탄소',  100, 180, '#6B7280'),
  node('n5',  '물',          280, 220, '#2563EB'),
  node('n6',  '포도당',      480, 220, '#EA580C'),
  node('n7',  '산소',        660, 220, '#0891B2'),
  node('n8',  '식물세포',    380, 340, '#16A34A'),
  node('n9',  '미토콘드리아',200, 340, '#7C3AED'),
  node('n10', '세포호흡',    200, 460, '#BE185D'),
]

const scienceEdges = [
  edge('e1',  'n2', 'n1',  '에서 일어난다'),
  edge('e2',  'n3', 'n1',  '필요하다'),
  edge('e3',  'n4', 'n1',  '흡수한다'),
  edge('e4',  'n5', 'n1',  '이용한다'),
  edge('e5',  'n1', 'n6',  '생성한다'),
  edge('e6',  'n1', 'n7',  '방출한다'),
  edge('e7',  'n2', 'n8',  '포함된다'),
  edge('e8',  'n9', 'n8',  '포함된다'),
  edge('e9',  'n6', 'n10', '에너지원으로 쓰인다'),
  edge('e10', 'n9', 'n10', '에서 일어난다'),
]

// ── 사회: 민주주의와 삼권분립 ─────────────────────────────────────────────────
const socialNodes = [
  node('n1',  '민주주의',  360,  40, '#DC2626'),
  node('n2',  '국민',      160, 140, '#B91C1C'),
  node('n3',  '주권',      120, 280, '#991B1B'),
  node('n4',  '선거',      340, 160, '#EA580C'),
  node('n5',  '삼권분립',  600,  80, '#7C3AED'),
  node('n6',  '국회',      480, 220, '#1D4ED8'),
  node('n7',  '정부',      660, 220, '#047857'),
  node('n8',  '법원',      580, 340, '#B45309'),
  node('n9',  '법률',      340, 320, '#374151'),
  node('n10', '헌법',      120, 420, '#6B21A8'),
  node('n11', '기본권',    340, 460, '#0891B2'),
]

const socialEdges = [
  edge('e1',  'n2', 'n1',  '구성한다'),
  edge('e2',  'n2', 'n3',  '가진다'),
  edge('e3',  'n2', 'n4',  '참여한다'),
  edge('e4',  'n4', 'n6',  '구성한다'),
  edge('e5',  'n5', 'n6',  '포함한다'),
  edge('e6',  'n5', 'n7',  '포함한다'),
  edge('e7',  'n5', 'n8',  '포함한다'),
  edge('e8',  'n6', 'n9',  '제정한다'),
  edge('e9',  'n7', 'n9',  '집행한다'),
  edge('e10', 'n8', 'n9',  '해석한다'),
  edge('e11', 'n10', 'n11','보장한다'),
  edge('e12', 'n1', 'n10', '기반으로 한다'),
]

// ── 정보: 프로그래밍 기초 ────────────────────────────────────────────────────
const infoNodes = [
  node('n1',  '프로그램',   380,  40, '#1D4ED8'),
  node('n2',  '알고리즘',   160,  40, '#1E40AF'),
  node('n3',  '입력',        80, 180, '#6B7280'),
  node('n4',  '출력',       600, 180, '#374151'),
  node('n5',  '변수',       220, 200, '#7C3AED'),
  node('n6',  '데이터',     160, 340, '#6D28D9'),
  node('n7',  '조건문',     380, 200, '#B45309'),
  node('n8',  '반복문',     520, 320, '#92400E'),
  node('n9',  '함수',       160, 460, '#047857'),
  node('n10', '오류',       560, 460, '#DC2626'),
  node('n11', '디버깅',     700, 360, '#B91C1C'),
]

const infoEdges = [
  edge('e1',  'n2', 'n1',  '구현된다'),
  edge('e2',  'n1', 'n3',  '받는다'),
  edge('e3',  'n1', 'n4',  '생성한다'),
  edge('e4',  'n1', 'n5',  '사용한다'),
  edge('e5',  'n5', 'n6',  '저장한다'),
  edge('e6',  'n7', 'n1',  '흐름을 제어한다'),
  edge('e7',  'n8', 'n1',  '반복 실행한다'),
  edge('e8',  'n9', 'n1',  '모듈화한다'),
  edge('e9',  'n1', 'n10', '발생할 수 있다'),
  edge('e10', 'n10', 'n11','해결하는'),
]

// ── 샘플 목록 ────────────────────────────────────────────────────────────────
const SAMPLES = [
  {
    id: 'science',
    subject: '과학',
    title: '광합성',
    description: '식물의 광합성 과정과 엽록체·미토콘드리아의 역할',
    color: '#16A34A',
    bgColor: '#F0FDF4',
    borderColor: '#86EFAC',
    nodeCount: scienceNodes.length,
    edgeCount: scienceEdges.length,
    nodes: scienceNodes,
    edges: scienceEdges,
  },
  {
    id: 'social',
    subject: '사회',
    title: '민주주의와 삼권분립',
    description: '국민 주권, 선거, 입법·행정·사법의 권력 분리 구조',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    nodeCount: socialNodes.length,
    edgeCount: socialEdges.length,
    nodes: socialNodes,
    edges: socialEdges,
  },
  {
    id: 'info',
    subject: '정보',
    title: '프로그래밍 기초',
    description: '알고리즘, 변수, 조건문, 반복문, 함수의 관계 구조',
    color: '#1D4ED8',
    bgColor: '#EFF6FF',
    borderColor: '#93C5FD',
    nodeCount: infoNodes.length,
    edgeCount: infoEdges.length,
    nodes: infoNodes,
    edges: infoEdges,
  },
]

export default SAMPLES
