import { create } from 'zustand'

const useMapStore = create((set, get) => ({
  // ─── Teacher slice ───────────────────────────────────────────────────
  teacherNodes: [],
  teacherEdges: [],
  setTeacherNodes: (nodes) => set({ teacherNodes: nodes }),
  setTeacherEdges: (edges) => set({ teacherEdges: edges }),
  saveTeacherMap: () => {
    const { teacherNodes, teacherEdges } = get()
    set({ teacherNodes: [...teacherNodes], teacherEdges: [...teacherEdges] })
  },

  // ─── Kit slice ───────────────────────────────────────────────────────
  kit: {
    conceptNodes: [],
    linkLabels: [],
    frozenEdges: [],
  },
  decompositionMode: 'full',
  decompositionRatio: 50,
  kitActivated: false,
  setDecompositionMode: (mode) => set({ decompositionMode: mode }),
  setDecompositionRatio: (ratio) => set({ decompositionRatio: ratio }),

  generateKit: () => {
    const { teacherNodes, teacherEdges, decompositionMode, decompositionRatio } = get()

    // Scatter concept nodes with random positions
    const conceptNodes = teacherNodes.map((node, i) => ({
      ...node,
      position: {
        x: 80 + (i % 4) * 200 + Math.random() * 60,
        y: 80 + Math.floor(i / 4) * 180 + Math.random() * 60,
      },
    }))

    // Collect unique link labels
    const linkLabels = [...new Set(teacherEdges.map((e) => e.label).filter(Boolean))]

    let frozenEdges = []
    if (decompositionMode === 'partial') {
      const keepCount = Math.round((decompositionRatio / 100) * teacherEdges.length)
      const shuffled = [...teacherEdges].sort(() => Math.random() - 0.5)
      frozenEdges = shuffled.slice(0, keepCount)
    }

    set({ kit: { conceptNodes, linkLabels, frozenEdges } })
  },

  activateKit: () => {
    const { kit } = get()
    // Initialize student state from kit
    set({
      kitActivated: true,
      studentNodes: kit.conceptNodes.map((n) => ({ ...n })),
      studentEdges: kit.frozenEdges.map((e) => ({ ...e })),
      feedbackEdges: [],
      score: { correct: 0, missing: 0, excessive: 0, total: 0, percentage: 0 },
      history: [],
      future: [],
    })
  },

  // ─── Student slice ───────────────────────────────────────────────────
  studentNodes: [],
  studentEdges: [],
  setStudentNodes: (nodes) => set({ studentNodes: nodes }),
  setStudentEdges: (edges) => set({ studentEdges: edges }),
  resetStudentMap: () => {
    const { kit } = get()
    set({
      studentNodes: kit.conceptNodes.map((n) => ({ ...n })),
      studentEdges: kit.frozenEdges.map((e) => ({ ...e })),
      feedbackEdges: [],
      score: { correct: 0, missing: 0, excessive: 0, total: 0, percentage: 0 },
      history: [],
      future: [],
    })
  },

  // ─── Feedback slice ──────────────────────────────────────────────────
  feedbackEdges: [],
  score: { correct: 0, missing: 0, excessive: 0, total: 0, percentage: 0 },

  checkStudentMap: () => {
    const { teacherEdges, studentEdges } = get()
    const feedbackEdges = []
    const matched = new Set()

    for (const te of teacherEdges) {
      const match = studentEdges.find(
        (se) => se.source === te.source && se.label === te.label && se.target === te.target
      )
      if (match) {
        feedbackEdges.push({ ...match, feedbackType: 'correct' })
        matched.add(match.id)
      } else {
        feedbackEdges.push({ ...te, id: `missing-${te.id}`, feedbackType: 'missing' })
      }
    }

    for (const se of studentEdges) {
      if (!matched.has(se.id)) {
        feedbackEdges.push({ ...se, feedbackType: 'excessive' })
      }
    }

    const correct = feedbackEdges.filter((e) => e.feedbackType === 'correct').length
    const missing = feedbackEdges.filter((e) => e.feedbackType === 'missing').length
    const excessive = feedbackEdges.filter((e) => e.feedbackType === 'excessive').length
    const total = teacherEdges.length

    set({
      feedbackEdges,
      score: {
        correct,
        missing,
        excessive,
        total,
        percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
      },
    })
  },

  clearFeedback: () =>
    set({
      feedbackEdges: [],
      score: { correct: 0, missing: 0, excessive: 0, total: 0, percentage: 0 },
    }),

  // ─── History slice (undo/redo) ───────────────────────────────────────
  history: [],
  future: [],

  pushHistory: (snapshot) => {
    const { history } = get()
    set({ history: [...history, snapshot], future: [] })
  },

  undo: () => {
    const { history, future, teacherNodes, teacherEdges } = get()
    if (history.length === 0) return
    const prev = history[history.length - 1]
    set({
      history: history.slice(0, -1),
      future: [{ teacherNodes, teacherEdges }, ...future],
      teacherNodes: prev.teacherNodes,
      teacherEdges: prev.teacherEdges,
    })
  },

  redo: () => {
    const { history, future, teacherNodes, teacherEdges } = get()
    if (future.length === 0) return
    const next = future[0]
    set({
      history: [...history, { teacherNodes, teacherEdges }],
      future: future.slice(1),
      teacherNodes: next.teacherNodes,
      teacherEdges: next.teacherEdges,
    })
  },
}))

export default useMapStore
