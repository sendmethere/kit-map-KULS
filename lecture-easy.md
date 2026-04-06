# 교육용 웹 앱 만들기 — 처음 시작하는 사람을 위한 안내서

> "코딩을 배운 적 있지만 실제 앱은 처음 만들어 보는 사람"을 위해 씁니다.
> 어려운 말 없이, 비유를 통해 설명합니다.

---

## [1페이지] 웹 앱이 어떻게 돌아가는지 큰 그림 이해하기

### 웹 앱을 "식당"에 비유하면

- **프론트엔드** = 홀 (손님이 보고 주문하는 곳, 브라우저 화면)
- **백엔드** = 주방 (실제 요리를 만드는 곳, 서버)
- **데이터베이스** = 냉장고·창고 (재료와 데이터를 보관하는 곳)
- **API** = 주문서 (홀과 주방이 소통하는 규칙)

### 내가 만든 Kit-Build 앱은 어떤 구조인가

- 지금은 **홀만 있는 구조** — 프론트엔드만으로 모든 것을 처리
- 저장은 브라우저 안의 작은 메모장(localStorage)에 함
- 나중에 주방(FastAPI)과 창고(Supabase)를 붙이면 진짜 서비스가 됨

### 처음엔 작게 시작해도 됩니다

- 1단계: 화면만 만들기 (HTML, CSS)
- 2단계: 화면에 동작 넣기 (React)
- 3단계: 데이터 저장하기 (localStorage → Supabase)
- 4단계: 여러 사람이 쓸 수 있게 만들기 (로그인, 서버)
- 한 번에 다 할 필요 없습니다. 단계별로 완성해 나가면 됩니다.

---

## [2페이지] HTML과 CSS — 웹의 뼈대와 옷

### HTML은 "구조"입니다

- 웹 페이지에 무엇이 있는지를 정의하는 언어
- 태그(꺾쇠괄호)로 감싸서 표현합니다

```html
<h1>안녕하세요</h1>         ← 제목
<p>내용을 여기 씁니다</p>   ← 문단
<button>클릭하세요</button>  ← 버튼
<img src="사진.jpg" />      ← 이미지
```

### CSS는 "스타일"입니다

- 색깔, 크기, 위치 등 외모를 꾸미는 언어

```css
button {
  background-color: orange;   /* 배경색 */
  color: white;               /* 글자색 */
  border-radius: 8px;         /* 모서리 둥글게 */
  padding: 10px 20px;         /* 안쪽 여백 */
}
```

### Tailwind CSS — CSS를 더 빠르게 쓰는 방법

- CSS를 직접 쓰는 대신, 미리 만들어진 **클래스 이름**을 HTML에 붙이는 방식
- `bg-orange-500` = 주황색 배경 / `text-white` = 흰 글자 / `p-4` = 여백 4칸

```html
<!-- 일반 CSS 방식 -->
<button class="내-버튼">클릭</button>

<!-- Tailwind 방식 — 클래스만 붙이면 끝 -->
<button class="bg-orange-500 text-white rounded-lg px-4 py-2">클릭</button>
```

- 장점: CSS 파일 따로 안 만들어도 됨, 수정이 빠름
- 처음엔 클래스 이름이 많아 낯설지만, 자주 쓰다 보면 외워집니다

---

## [3페이지] JavaScript — 웹 페이지를 움직이게 하는 언어

### JavaScript가 하는 일

- 버튼 클릭하면 뭔가 일어나게 하기
- 데이터를 저장하고 불러오기
- 화면의 내용을 동적으로 바꾸기

### 꼭 알아야 할 기본 문법

```js
// 변수 — 값을 담는 상자
let 나이 = 20
const 이름 = '김철수'   // const는 바꿀 수 없는 변수

// 함수 — 반복할 일을 묶어두기
function 인사하기(이름) {
  return '안녕하세요, ' + 이름 + '!'
}

// 화살표 함수 — 더 짧게 쓰는 방법 (React에서 자주 씀)
const 인사하기 = (이름) => '안녕하세요, ' + 이름 + '!'

// 배열 — 여러 값을 순서대로 담기
const 과일 = ['사과', '바나나', '딸기']
과일[0]  // '사과' (0번째)

// 객체 — 이름표가 붙은 값들의 묶음
const 노드 = {
  id: 'n1',
  label: '광합성',
  color: 'green'
}
노드.label  // '광합성'

// 조건문
if (나이 >= 18) {
  console.log('성인입니다')
} else {
  console.log('미성년자입니다')
}

// 반복문
과일.forEach((f) => console.log(f))  // 각 과일 출력
과일.map((f) => f + '맛있다')         // 새 배열 만들기
```

### 비동기 처리 — 기다리는 동안 멈추지 않기

- 서버에서 데이터를 불러올 때 기다려야 함 → `async/await` 사용

```js
// 나쁜 예 — 결과를 기다리지 않음
const 데이터 = fetch('/api/maps')  // 아직 안 왔는데 다음 줄 실행

// 좋은 예 — 올 때까지 기다리기
const 데이터 = await fetch('/api/maps')
```

---

## [4페이지] React — 화면을 "컴포넌트" 단위로 만들기

### React가 나온 이유

- 옛날 방식: JavaScript로 직접 HTML을 찾아서 바꿈 → 복잡해질수록 힘듦
- React 방식: 화면을 작은 조각(컴포넌트)으로 나누고, **데이터가 바뀌면 자동으로 화면이 바뀜**

### 컴포넌트 = 재사용 가능한 화면 조각

- 레고 블록처럼 작은 조각을 만들어서 조립하는 방식
- 함수 하나가 컴포넌트 하나

```jsx
// 버튼 컴포넌트 만들기
function 내버튼({ 문구, 클릭시 }) {
  return (
    <button onClick={클릭시} className="bg-blue-500 text-white px-4 py-2 rounded">
      {문구}
    </button>
  )
}

// 다른 곳에서 재사용하기
<내버튼 문구="저장하기" 클릭시={() => 저장()} />
<내버튼 문구="삭제하기" 클릭시={() => 삭제()} />
```

### State — 컴포넌트가 기억하는 값

- `useState`로 만든 값이 바뀌면 → 화면이 자동으로 다시 그려짐

```jsx
import { useState } from 'react'

function 카운터() {
  const [숫자, 숫자변경] = useState(0)  // 초기값 0

  return (
    <div>
      <p>현재 숫자: {숫자}</p>
      <button onClick={() => 숫자변경(숫자 + 1)}>+1</button>
    </div>
  )
}
```

- 비유: 칠판에 적힌 숫자를 지우고 새로 쓰면 → 보고 있던 모든 사람이 바뀐 숫자를 봄

### Props — 부모가 자식에게 데이터 전달하기

```jsx
// 부모 컴포넌트
function 교실() {
  return <학생카드 이름="김민준" 점수={95} />
}

// 자식 컴포넌트 — props로 받음
function 학생카드({ 이름, 점수 }) {
  return <div>{이름}: {점수}점</div>
}
```

- Props는 읽기 전용 — 자식이 직접 바꿀 수 없음
- 자식이 부모 데이터를 바꾸려면 → 함수를 props로 전달

### useEffect — "이럴 때 이것을 실행해"

```jsx
useEffect(() => {
  // 컴포넌트가 처음 화면에 나타날 때 실행
  데이터불러오기()
}, [])  // ← 빈 배열 = 처음 한 번만

useEffect(() => {
  // 노드 목록이 바뀔 때마다 실행
  localStorage.setItem('nodes', JSON.stringify(노드목록))
}, [노드목록])  // ← 노드목록이 바뀔 때마다
```

---

## [5페이지] Zustand — 앱 전체에서 데이터 공유하기

### 왜 필요한가 — "Prop Drilling" 문제

```
앱 전체
 └─ 교사화면
     └─ 캔버스
         └─ 툴바
             └─ 저장버튼  ← 여기서 teacherNodes가 필요한데...
```

- teacherNodes를 쓰려면 앱 → 교사화면 → 캔버스 → 툴바 → 저장버튼으로 계속 전달해야 함
- 중간 컴포넌트들은 쓰지도 않는데 받아서 또 전달만 해야 함 → 번거롭고 유지보수 어려움

### Zustand 해결책 — "중앙 저장소"

- 모든 데이터를 한 곳(Store)에 보관
- 어느 컴포넌트에서든 직접 꺼내 씀 → 전달 없이도 접근 가능

```
중앙 저장소 (useMapStore)
     ↑ 직접 접근
저장버튼  학생화면  채점결과  어디서든 OK
```

### Store 만드는 방법

```js
// store/useMapStore.js
import { create } from 'zustand'

const useMapStore = create((set, get) => ({
  // ① 저장할 데이터 (초기값)
  nodes: [],
  점수: 0,

  // ② 데이터를 바꾸는 함수
  노드추가: (새노드) => set((현재) => ({
    nodes: [...현재.nodes, 새노드]
  })),

  점수계산: () => {
    const { nodes } = get()  // 현재 저장된 값 읽기
    set({ 점수: nodes.length * 10 })
  },
}))

export default useMapStore
```

### Store 사용하는 방법

```jsx
// 어느 컴포넌트에서든
function 저장버튼() {
  const { nodes, 노드추가 } = useMapStore()  // 필요한 것만 꺼내기

  return (
    <button onClick={() => 노드추가({ id: 'n1', label: '새노드' })}>
      추가 (현재 {nodes.length}개)
    </button>
  )
}
```

### persist — 새로고침해도 데이터 유지하기

```js
import { persist } from 'zustand/middleware'

const useMapStore = create(
  persist(
    (set) => ({
      nodes: [],
      setNodes: (n) => set({ nodes: n }),
    }),
    { name: 'kit-build-data' }  // localStorage에 저장될 이름
  )
)
```

- 이것만 추가하면 새로고침해도 데이터가 사라지지 않음

---

## [6페이지] localStorage — 브라우저 안의 작은 메모장

### localStorage가 뭔가요

- 브라우저 안에 작은 메모장이 있다고 상상하세요
- 거기에 메모를 남기면 → 탭을 닫아도, 브라우저를 껐다 켜도 남아 있음
- 인터넷이 없어도 됨 — 내 컴퓨터에만 저장되는 것

### 직접 사용해보기

```js
// 메모장에 쓰기 (문자열만 저장 가능)
localStorage.setItem('이름', '김철수')

// 메모장에서 읽기
const 이름 = localStorage.getItem('이름')  // '김철수'

// 지우기
localStorage.removeItem('이름')
```

### 배열이나 객체는 어떻게 저장하나요

- localStorage는 문자열만 저장 가능 → 변환이 필요함
- `JSON.stringify`: 객체 → 문자열로 변환
- `JSON.parse`: 문자열 → 객체로 복원

```js
const 노드들 = [{ id: 'n1', label: '광합성' }, { id: 'n2', label: '엽록체' }]

// 저장
localStorage.setItem('nodes', JSON.stringify(노드들))

// 불러오기
const 저장된것 = localStorage.getItem('nodes')
const 노드들 = JSON.parse(저장된것)
```

### 언제 쓰고, 언제 안 쓰나요

- ✅ 혼자 쓰는 간단한 앱, 설정 저장, 임시 작업 내용
- ❌ 다른 사람과 데이터를 공유해야 할 때 → Supabase 필요
- ❌ 비밀번호나 중요한 정보 → 절대 금지
- ❌ 5MB(약 글자 500만 자) 이상 저장 → 안 됨

---

## [7페이지] ShadCN — 예쁜 컴포넌트 가져다 쓰기

### UI 컴포넌트 라이브러리란

- 버튼, 팝업창, 슬라이더 같은 것을 직접 만들면 시간이 많이 걸림
- 미리 잘 만들어진 것을 가져다 쓰면 빠르고 예쁘게 완성 가능
- ShadCN = 접근성(장애인도 쓸 수 있게)까지 고려한 고품질 컴포넌트 모음

### 일반 라이브러리와 ShadCN의 차이

| 일반 UI 라이브러리 | ShadCN |
|---|---|
| npm으로 설치해서 사용 | 소스 코드를 내 프로젝트에 복사 |
| 스타일 수정이 어려움 | 내 코드이므로 마음대로 수정 가능 |
| 업데이트 의존성 생김 | 내가 직접 관리 |

### 자주 쓰는 컴포넌트

```jsx
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'

// 사용 예
<Button variant="outline" size="sm">저장</Button>
<Badge variant="success">정답</Badge>
<Progress value={75} />  {/* 75% */}
<Slider min={0} max={100} value={[50]} />
```

### `@/` 경로가 뭔가요

- `../../../components/ui/button` 처럼 길게 쓰는 대신
- `@/components/ui/button` 으로 짧게 쓸 수 있게 해주는 별명(alias)
- `vite.config.js`에서 설정: `@` = `src` 폴더

---

## [8페이지] Next.js — React보다 한 단계 위의 프레임워크

### React와 Next.js의 차이

- **React** : UI를 만드는 도구 — "어떻게 화면을 그릴까"
- **Next.js** : React를 포함한 풀스택 프레임워크 — "라우팅, 서버, API까지 전부"

### 가장 큰 차이: 페이지 이동 방식

- **React(Vite)** : 페이지 이동을 직접 코드로 관리해야 함
- **Next.js** : 폴더/파일 이름이 곧 URL 주소

```
app/
  page.jsx         → 주소: /
  teacher/
    page.jsx       → 주소: /teacher
  student/
    page.jsx       → 주소: /student
```

- `teacher` 폴더 만들고 `page.jsx` 파일 만들면 → `/teacher` 주소가 자동으로 생김

### 서버 컴포넌트 vs 클라이언트 컴포넌트

- **서버 컴포넌트** (기본): 서버에서 HTML을 만들어서 보내줌 → SEO에 좋음
- **클라이언트 컴포넌트**: 브라우저에서 실행 → 버튼 클릭, 입력 등 상호작용 가능

```jsx
// 파일 맨 위에 이 한 줄을 쓰면 클라이언트 컴포넌트
'use client'

import { useState } from 'react'
// 이제 useState, 이벤트 핸들러 등 사용 가능
```

- Zustand, React Flow처럼 브라우저 기능을 쓰는 것들은 반드시 `'use client'` 필요

### API Routes — 간단한 백엔드 코드를 같은 프로젝트에

```js
// app/api/save-map/route.js
export async function POST(request) {
  const body = await request.json()       // 프론트에서 보낸 데이터 받기
  // 여기서 DB에 저장하는 코드 작성
  return Response.json({ success: true }) // 결과 돌려주기
}
```

- 별도 서버 없이 Next.js 프로젝트 안에서 API 만들기 가능
- 소규모 앱에서는 FastAPI 없이도 이걸로 해결 가능

---

## [9페이지] FastAPI — Python으로 만드는 백엔드 서버

### 언제 FastAPI가 필요한가요

- 복잡한 계산을 서버에서 처리해야 할 때 (채점, 분석, AI 등)
- 많은 사용자가 동시에 접속하는 서비스
- Python의 다양한 라이브러리(데이터 분석, 머신러닝)를 써야 할 때
- Kit-Build처럼 교사-학생 간 데이터를 실시간으로 공유해야 할 때

### 기본 구조 — 아주 간단합니다

```python
from fastapi import FastAPI

app = FastAPI()

# GET 요청 — 데이터를 "가져올 때"
@app.get("/maps")
def 지도목록가져오기():
    return [{"id": 1, "title": "광합성 지도"}]

# POST 요청 — 데이터를 "보낼 때"
@app.post("/maps")
def 지도저장하기(data: dict):
    print("받은 데이터:", data)
    return {"success": True, "id": 1}
```

- `@app.get("/maps")` : `/maps` 주소로 GET 요청이 오면 이 함수 실행
- 실행하면 `/docs` 주소에서 자동으로 테스트 화면이 생김 (매우 편리!)

### 프론트엔드와 연결하기

```js
// React에서 FastAPI 호출
async function 지도저장(nodes, edges) {
  const response = await fetch('http://localhost:8000/maps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges })
  })
  const result = await response.json()
  console.log(result)  // { success: true, id: 1 }
}
```

### 자주 겪는 CORS 오류 해결

```
오류: "blocked by CORS policy"
→ 브라우저가 다른 주소의 서버 요청을 막는 보안 기능
→ FastAPI에서 허용 주소 등록하면 해결
```

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React 개발 서버 주소
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## [10페이지] Supabase — 서버 없이 쓰는 데이터베이스

### Supabase가 뭔가요

- 데이터베이스(DB)를 내 컴퓨터에 직접 설치하지 않아도 됨
- 웹사이트에서 테이블 만들고 → 코드에서 바로 데이터 저장·조회
- 로그인 기능, 파일 저장, 실시간 동기화까지 같이 제공

### 데이터베이스를 "엑셀 표"로 생각하기

```
concept_maps 테이블
┌────┬──────────┬──────────┬────────────┐
│ id │ title    │ nodes    │ teacher_id │
├────┼──────────┼──────────┼────────────┤
│  1 │ 광합성   │ [...]    │ user-001   │
│  2 │ 민주주의 │ [...]    │ user-002   │
└────┴──────────┴──────────┴────────────┘
```

- 각 행(Row) = 개념 지도 하나
- 각 열(Column) = 지도의 속성 (제목, 노드 목록 등)

### 기본 코드 — 읽고, 쓰고, 삭제하기

```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  '내-supabase-주소',
  '내-supabase-키'
)

// 전체 조회
const { data, error } = await supabase
  .from('concept_maps')      // 테이블 이름
  .select('*')               // 모든 열 가져오기

// 조건부 조회
const { data } = await supabase
  .from('concept_maps')
  .select('*')
  .eq('teacher_id', '나의ID')  // teacher_id가 '나의ID'인 것만

// 저장
const { data } = await supabase
  .from('concept_maps')
  .insert({ title: '광합성', nodes: [...], teacher_id: '나의ID' })

// 삭제
await supabase.from('concept_maps').delete().eq('id', 1)
```

### localStorage와 Supabase 언제 바꿔야 하나요

- localStorage로 시작 → "혼자 쓰는 앱"은 충분
- 이런 상황이 생기면 Supabase로 전환:
  - "집에서 만들었는데 학교 컴퓨터에서 내 지도가 없어요" → 기기 간 공유 필요
  - "학생들 결과를 교사가 모아서 보고 싶어요" → 여러 사람 데이터 공유 필요
  - "로그인 기능이 필요해요" → 계정별 데이터 분리 필요

---

## [11페이지] 내 앱을 인터넷에 올리기 — 배포

### 배포가 뭔가요

- 지금은 내 컴퓨터에서만 `http://localhost:5173` 으로 접속 가능
- 배포 = 인터넷에 올려서 누구나 접속할 수 있게 만드는 것
- 배포 후에는 `https://내앱이름.netlify.app` 같은 주소로 접속

### Netlify — React 앱 배포하기 (무료, 5분이면 끝)

**방법 1: 드래그앤드롭 (가장 쉬움)**
1. `npm run build` 실행 → `dist` 폴더 생성
2. [app.netlify.com](https://app.netlify.com) 접속 → 로그인
3. `dist` 폴더를 화면에 드래그앤드롭
4. 끝 — 주소가 생김

**방법 2: GitHub 연동 (자동 배포)**
1. GitHub에 코드 올리기
2. Netlify에서 GitHub 저장소 선택
3. 이후 코드 push하면 자동으로 배포됨

### netlify.toml — 배포 설정 파일

```toml
[build]
  command = "npm run build"   ← 빌드 명령어
  publish = "dist"            ← 빌드 결과물 폴더

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  ← React는 이 설정 없으면 새로고침 시 오류 남
```

### Vercel — Next.js 앱 배포하기

- Next.js를 만든 회사가 운영 → 가장 잘 맞음
- GitHub 연동 후 클릭 몇 번으로 완료

---

## [12페이지] Git과 GitHub — 코드 관리와 협업

### Git이 뭔가요

- 코드의 "변경 기록"을 남기는 도구
- "저장 + 메모" 기능 = 언제든지 이전 버전으로 돌아갈 수 있음
- 혼자 개발할 때도 습관 들이면 매우 유용

### 가장 많이 쓰는 명령어

```bash
git init                      # 새 저장소 시작
git add .                     # 변경한 파일 전부 준비
git commit -m "버튼 색 변경"  # 저장 + 메모 남기기
git push                      # GitHub에 올리기
git pull                      # GitHub에서 최신 내용 받아오기
```

### GitHub가 뭔가요

- Git으로 관리한 코드를 **인터넷에 올려두는 곳**
- 코드 공유, 협업, 배포 연동 모두 가능
- Netlify/Vercel과 연결하면 push만 해도 자동으로 배포됨

### 커밋 메시지를 잘 쓰는 방법

```bash
# 나쁜 예
git commit -m "수정"
git commit -m "작업중"

# 좋은 예
git commit -m "feat: 학생 피드백 Sheet 컴포넌트 추가"
git commit -m "fix: 노드 클릭 시 dialog가 열리지 않는 버그 수정"
git commit -m "docs: README에 설치 방법 추가"
```

- `feat:` 새 기능 추가
- `fix:` 버그 수정
- `docs:` 문서 수정
- `style:` 스타일만 변경

---

## [부록 A] 자주 나오는 오류 메시지 해석

### "Cannot read properties of undefined (reading 'map')"

```
→ 아직 데이터가 없는데 map()을 쓰려고 해서 발생
```

```jsx
// 오류 나는 코드
nodes.map((n) => <div>{n.label}</div>)

// 해결: 데이터가 있을 때만 실행
nodes?.map((n) => <div>{n.label}</div>)
// 또는
(nodes || []).map((n) => <div>{n.label}</div>)
```

### "Each child in a list should have a unique key prop"

```
→ 목록을 map()으로 렌더링할 때 각 항목에 고유한 key가 없음
```

```jsx
// 오류
nodes.map((n) => <div>{n.label}</div>)

// 해결
nodes.map((n) => <div key={n.id}>{n.label}</div>)
```

### "Too many re-renders"

```
→ 무한 루프 발생 — setState를 렌더링 중에 직접 호출함
```

```jsx
// 오류 — 렌더링될 때마다 setState 호출 → 또 렌더링 → 무한 반복
function 컴포넌트() {
  const [값, 값변경] = useState(0)
  값변경(1)  // ← 이게 문제
}

// 해결 — useEffect 안에서 호출
useEffect(() => {
  값변경(1)
}, [])  // 처음 한 번만
```

### "Module not found"

```
→ import 경로가 잘못됨
```

```jsx
// 오류
import Button from '@/components/Button'

// 해결 — 실제 파일 위치와 이름 확인
import { Button } from '@/components/ui/button'
```

---

## [부록 B] 개발 환경 세팅 순서 (처음 시작할 때)

### 필요한 프로그램 설치

- **Node.js** : JavaScript 실행 환경 (nodejs.org 에서 LTS 버전 다운로드)
- **VS Code** : 코드 에디터 (code.visualstudio.com)
- **Git** : 코드 관리 (git-scm.com)

### 추천 VS Code 확장 프로그램

- `ESLint` — 코드 오류 실시간 표시
- `Prettier` — 코드 자동 정렬
- `Tailwind CSS IntelliSense` — Tailwind 클래스 자동완성
- `ES7+ React Snippets` — React 코드 단축키

### 새 프로젝트 만들기

```bash
# 1. Vite + React 프로젝트 생성
npm create vite@latest 내프로젝트 -- --template react

# 2. 폴더 이동
cd 내프로젝트

# 3. 패키지 설치
npm install

# 4. 개발 서버 실행
npm run dev
# → http://localhost:5173 에서 확인
```

### 프로젝트 폴더 구조 이해하기

```
내프로젝트/
  src/              ← 내가 작성하는 코드
    App.jsx         ← 앱의 시작점
    main.jsx        ← HTML과 React를 연결
    components/     ← 화면 조각들
    store/          ← Zustand 상태 관리
    utils/          ← 유틸리티 함수들
  public/           ← 이미지, 아이콘 등 정적 파일
  index.html        ← HTML 껍데기
  package.json      ← 프로젝트 정보와 라이브러리 목록
  vite.config.js    ← 빌드 설정
```
