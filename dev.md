Build a web-based Kit-Build Concept Map learning application with the following specifications:

## Language
- All UI text, labels, buttons, messages, tooltips, and placeholder text must be written in Korean (한국어)
- Example button labels: "개념 지도 저장", "키트 생성", "내 지도 확인", "실행 취소", "다시 실행"
- Example feedback messages: "정답입니다!", "누락된 연결이 있습니다", "불필요한 연결이 포함되어 있습니다"
- Node default label prompt: "개념 이름을 입력하세요"
- Link label prompt: "관계 이름을 입력하세요"

---

## Tech Stack
- Framework: React (JavaScript only, NO TypeScript, NO .tsx files)
- All files must use .jsx or .js extension
- Styling: Tailwind CSS + ShadCN UI components
- Graph / canvas rendering: React Flow
- State management: Zustand (no Redux, no Context API for global state)
- No backend required — all state managed in Zustand store in memory

---

## ShadCN Components to Use
Use the following ShadCN components where appropriate:
- Button → all clickable actions
- Dialog → modal prompts for node label input
- Slider → partial decomposition percentage in kit generation
- RadioGroup → decomposition mode selection (전체 분해 / 부분 분해)
- Badge → score display (정답, 누락, 초과)
- Tooltip → hover hints on toolbar buttons
- Tabs → switch between 교사 모드 / 학생 모드 on home screen
- Card → home screen mode selection cards
- Sheet → collapsible feedback panel from bottom
- Alert → error or warning messages
- Progress → show kit completion percentage in student mode

---

## Zustand Store Structure
Create a single Zustand store (useMapStore) with the following slices:

### Teacher slice
{
  teacherNodes: [],         // complete concept map nodes
  teacherEdges: [],         // complete concept map edges
  setTeacherNodes: (nodes) => void,
  setTeacherEdges: (edges) => void,
  saveTeacherMap: () => void,
}

### Kit slice
{
  kit: {
    conceptNodes: [],       // scattered nodes for student
    linkLabels: [],         // available link label strings
    frozenEdges: [],        // edges kept intact (partial decomposition)
  },
  decompositionMode: "full" | "partial",
  decompositionRatio: 50,   // percentage of edges to keep (0-100)
  setDecompositionMode: (mode) => void,
  setDecompositionRatio: (ratio) => void,
  generateKit: () => void,
  activateKit: () => void,
  kitActivated: boolean,
}

### Student slice
{
  studentNodes: [],         // repositioned nodes on canvas
  studentEdges: [],         // student-created propositions
  setStudentNodes: (nodes) => void,
  setStudentEdges: (edges) => void,
  resetStudentMap: () => void,
}

### Feedback slice
{
  feedbackEdges: [],        // edges colored by comparison result
  score: {
    correct: 0,
    missing: 0,
    excessive: 0,
    total: 0,
    percentage: 0,
  },
  checkStudentMap: () => void,   // runs comparison algorithm
  clearFeedback: () => void,
}

### History slice (undo/redo)
{
  history: [],
  future: [],
  pushHistory: (snapshot) => void,
  undo: () => void,
  redo: () => void,
}

---

## User Roles
Two modes accessible from the home screen:
- 교사 모드 (Teacher Mode)
- 학생 모드 (Student Mode)

---

## Teacher Mode (교사 모드) Features

### Concept Map Authoring Tool
- React Flow canvas as the main authoring area
- Add concept node (개념 노드 추가):
  - Click empty canvas → ShadCN Dialog opens → input field with placeholder "개념 이름을 입력하세요" → confirm → node appears as orange rounded rectangle
- Add link (관계 추가):
  - Select source node → click "관계 추가" button → Dialog opens for link label → select target node → directed edge created with labeled link node in middle
- Edit node: double-click → inline edit or Dialog
- Delete: select node or edge → press Delete or click "삭제" button
- Undo (실행 취소): Ctrl+Z
- Redo (다시 실행): Ctrl+Y
- Auto layout (자동 정렬): arranges nodes top-down hierarchically
- Node colorize (색상 변경): select node → color palette picker
- Save Map (지도 저장): saves to Zustand teacherNodes + teacherEdges

### Kit Generation (키트 생성)
- ShadCN RadioGroup:
  - "전체 분해" (Full decomposition): remove all edges
  - "부분 분해" (Partial decomposition): keep some edges
- If "부분 분해" selected → ShadCN Slider appears (0–100%) labeled "유지할 연결 비율"
- Preview panel shows scattered kit components
- "학생에게 키트 활성화" button → sets kitActivated = true in Zustand

---

## Student Mode (학생 모드) Features

### Kit-Build Recomposition Tool
- React Flow canvas showing scattered concept nodes from kit
- Left panel (키트 트레이):
  - Lists available link labels as draggable ShadCN Badge components
  - Label: "사용 가능한 관계 목록"
- Connecting nodes:
  - Click source concept node → click link label badge → click target node → proposition created
- ShadCN Progress bar at top showing completion percentage (완성도 %)
- Undo / Redo support via Zustand history slice
- Node colorization available
- Search bar (검색): ShadCN Input with placeholder "개념 검색..."

### Feedback (피드백)
- "내 지도 확인" button → triggers checkStudentMap() in Zustand
- React Flow edge colors update:
  - Green (#22C55E): correct (정답)
  - Red dashed (#EF4444): missing (누락)
  - Blue (#3B82F6): excessive (초과)
- ShadCN Sheet slides up from bottom showing:
  - Score summary with ShadCN Badge:
    - 정답: X개
    - 누락: Y개
    - 초과: Z개
    - 점수: N%
  - List of missing propositions: "[출발 개념] → [관계] → [도착 개념]"
- "초기화" button → calls resetStudentMap() + clearFeedback()

---

## Comparison Algorithm (in Zustand checkStudentMap action)
```
function checkStudentMap() {
  const { teacherEdges, studentEdges } = get();
  const feedbackEdges = [];
  const matched = new Set();

  for (const te of teacherEdges) {
    const match = studentEdges.find(se =>
      se.source === te.source &&
      se.label === te.label &&
      se.target === te.target
    );
    if (match) {
      feedbackEdges.push({ ...match, feedbackType: "correct" });
      matched.add(match.id);
    } else {
      feedbackEdges.push({ ...te, feedbackType: "missing" });
    }
  }

  for (const se of studentEdges) {
    if (!matched.has(se.id)) {
      feedbackEdges.push({ ...se, feedbackType: "excessive" });
    }
  }

  const correct = feedbackEdges.filter(e => e.feedbackType === "correct").length;
  const missing = feedbackEdges.filter(e => e.feedbackType === "missing").length;
  const excessive = feedbackEdges.filter(e => e.feedbackType === "excessive").length;

  set({
    feedbackEdges,
    score: {
      correct,
      missing,
      excessive,
      total: teacherEdges.length,
      percentage: Math.round((correct / teacherEdges.length) * 100),
    }
  });
}
```

---

## Data Model (Zustand in-memory)

### Node object
{
  id: "n1",
  label: "요구사항 공학",
  type: "concept" | "link",
  color: "#FFA500",
  position: { x: 100, y: 200 }
}

### Edge object
{
  id: "e1",
  source: "n1",
  target: "n2",
  label: "포함한다",
  feedbackType: null | "correct" | "missing" | "excessive"
}

---

## UI Layout

### Home Screen (홈 화면)
- Title: "Kit-Build 개념 지도"
- Subtitle: "지식 재구성을 통한 효과적인 학습 도구"
- Two ShadCN Cards side by side:
  - 교사 모드 Card: icon + "교사 모드" title + "개념 지도를 작성하고 키트를 생성합니다" description + "시작하기" Button
  - 학생 모드 Card: icon + "학생 모드" title + "키트를 재조립하여 지식을 구성합니다" description + "시작하기" Button

### Teacher Mode Screen (교사 모드 화면)
- Top bar: "교사 모드" label, 저장, 키트 생성, 활성화 Buttons with ShadCN Tooltip
- Main area: React Flow canvas (full width)
- Right panel: node property editor (label, color)
- Bottom toolbar: 실행 취소, 다시 실행, 자동 정렬, 색상 변경

### Student Mode Screen (학생 모드 화면)
- Top bar: "학생 모드" label, ShadCN Progress bar, 내 지도 확인 Button, 초기화 Button
- Left panel (키트 트레이): available link label Badges + search Input
- Main canvas: React Flow recomposition area
- Bottom Sheet: feedback results (slides up on check)

---

## Styling Guidelines
- All text in Korean
- Background: #F9FAFB (gray-50)
- Concept nodes: orange (#F97316) rounded rectangle, white text
- Link nodes: gray (#9CA3AF) small rounded rectangle
- Green feedback edge: #22C55E, strokeWidth 3
- Red feedback edge: #EF4444, strokeDasharray "5,5", strokeWidth 3
- Blue feedback edge: #3B82F6, strokeWidth 3
- Font: Noto Sans KR (import from Google Fonts) or system Korean font
- ShadCN theme: use default zinc theme
- Responsive: works on desktop (min 1024px width)

---

## File Structure
src/
  App.jsx                  → routing between home / teacher / student
  store/
    useMapStore.js         → single Zustand store with all slices
  components/
    HomeScreen.jsx         → home screen with two mode cards
    TeacherMode.jsx        → teacher authoring canvas
    StudentMode.jsx        → student recomposition canvas
    NodeEditor.jsx         → node label + color editor panel
    KitGenerator.jsx       → decomposition options + kit preview
    FeedbackSheet.jsx      → ShadCN Sheet with score + details
    Toolbar.jsx            → undo/redo/layout/color toolbar
  utils/
    comparison.js          → checkStudentMap comparison logic
    decompose.js           → kit generation / decomposition logic
    layout.js              → auto layout algorithm (dagre or simple grid)

---

## Additional Constraints
- JavaScript only (.jsx / .js) — absolutely NO TypeScript, NO .tsx
- Do NOT use localStorage or sessionStorage
- All state in Zustand store (in memory only)
- ShadCN components must be imported from "@/components/ui/..."
- React Flow nodes and edges must be fully controlled via Zustand
- All interactive elements must have aria-label in Korean
- Keyboard accessible: Tab, Enter, Delete
- Single responsibility per component — keep each file under 200 lines if possible
