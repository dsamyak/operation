import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Phase enum
export const PHASES = {
  WONDER: 'WONDER',
  STORY: 'STORY',
  SIMULATE: 'SIMULATE',
  PLAY: 'PLAY',
  MASTERY_CHECK: 'MASTERY_CHECK',
  WORKSHEET: 'WORKSHEET',
  REFLECT: 'REFLECT',
  PROGRESS: 'PROGRESS',
}

export const PHASE_ORDER = [
  PHASES.WONDER,
  PHASES.STORY,
  PHASES.SIMULATE,
  PHASES.PLAY,
  PHASES.MASTERY_CHECK,
  PHASES.WORKSHEET,
  PHASES.REFLECT,
  PHASES.PROGRESS,
]

export const PHASE_XP = {
  WONDER: 10,
  STORY: 15,
  SIMULATE: 25,
  PLAY_1STAR: 10,
  PLAY_3STAR: 30,
  MASTERY_70: 40,
  MASTERY_90: 60,
  WORKSHEET: 20,
  REFLECT: 20,
  MODULE_COMPLETE: 50,
}

const generateStudentId = () => {
  const stored = localStorage.getItem('mathquest_student_id')
  if (stored) return stored
  const id = `mq_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  localStorage.setItem('mathquest_student_id', id)
  return id
}

const useSessionStore = create(
  persist(
    (set, get) => ({
      // ── Module & Phase ────────────────────────────────────────────────
      moduleId: 'A',
      currentPhase: PHASES.WORKSHEET,
      phaseHistory: [],

      // ── Questions ─────────────────────────────────────────────────────
      questions: [],
      currentQuestionIndex: 0,
      masteryScore: 0,
      masteryAnswers: [], // {questionId, correct, selectedAnswer}

      // ── Session ───────────────────────────────────────────────────────
      seed: Date.now(),
      studentId: generateStudentId(),
      audioEnabled: true,
      musicEnabled: true,

      // ── Gamification ─────────────────────────────────────────────────
      xpEarned: 0,          // this session
      totalXP: 0,           // all time
      streak: 0,
      badges: [],           // all time badge IDs
      newBadge: null,       // badge waiting for toast
      playStars: 0,         // 1-3 stars from play phase
      reflectText: '',
      worksheetDownloaded: false,

      // ── Module Progress ───────────────────────────────────────────────
      moduleProgress: {
        A: { completed: false, badge: null, bestScore: 0 },
        B: { completed: false, badge: null, bestScore: 0 },
        C: { completed: false, badge: null, bestScore: 0 },
        D: { completed: false, badge: null, bestScore: 0 },
        E: { completed: false, badge: null, bestScore: 0 },
        F: { completed: false, badge: null, bestScore: 0 },
      },

      // ── Actions ───────────────────────────────────────────────────────
      setModule: (moduleId) => set({
        moduleId,
        currentPhase: PHASES.WONDER,
        phaseHistory: [],
        questions: [],
        currentQuestionIndex: 0,
        masteryScore: 0,
        masteryAnswers: [],
        seed: Date.now(),
        xpEarned: 0,
        playStars: 0,
        reflectText: '',
        worksheetDownloaded: false,
        newBadge: null,
      }),

      advancePhase: () => {
        const { currentPhase, phaseHistory } = get()
        const idx = PHASE_ORDER.indexOf(currentPhase)
        if (idx < PHASE_ORDER.length - 1) {
          const nextPhase = PHASE_ORDER[idx + 1]
          set({ currentPhase: nextPhase, phaseHistory: [...phaseHistory, currentPhase] })
        }
      },

      jumpToPhase: (targetPhase) => {
        const { currentPhase, phaseHistory } = get()
        if (targetPhase !== currentPhase) {
          set({ currentPhase: targetPhase, phaseHistory: [...phaseHistory, currentPhase] })
        }
      },

      awardXP: (amount) => {
        set((s) => ({
          xpEarned: s.xpEarned + amount,
          totalXP: s.totalXP + amount,
        }))
      },

      setQuestions: (questions) => set({ questions, currentQuestionIndex: 0 }),

      answerMasteryQuestion: (questionId, correct, selectedAnswer) => {
        const { masteryAnswers, streak } = get()
        set({
          masteryAnswers: [...masteryAnswers, { questionId, correct, selectedAnswer }],
          streak: correct ? streak + 1 : 0,
        })
      },

      setMasteryScore: (score) => set({ masteryScore: score }),

      setPlayStars: (stars) => set({ playStars: stars }),

      setReflectText: (text) => set({ reflectText: text }),

      setWorksheetDownloaded: () => {
        set({ worksheetDownloaded: true })
        get().awardXP(PHASE_XP.WORKSHEET)
      },

      earnBadge: (badgeId) => {
        const { badges } = get()
        if (!badges.includes(badgeId)) {
          set({ badges: [...badges, badgeId], newBadge: badgeId })
        }
      },

      clearNewBadge: () => set({ newBadge: null }),

      toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
      toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),

      completeModule: () => {
        const { moduleId, masteryScore, moduleProgress, badges } = get()
        const badge = masteryScore >= 90 ? 'platinum' : masteryScore >= 85 ? 'gold' : masteryScore >= 70 ? 'silver' : 'bronze'
        const badgeId = `${moduleId.toLowerCase()}_${badge}`
        set({
          moduleProgress: {
            ...moduleProgress,
            [moduleId]: { completed: true, badge, bestScore: masteryScore },
          },
        })
        if (!badges.includes(badgeId)) {
          get().earnBadge(badgeId)
        }
        get().awardXP(PHASE_XP.MODULE_COMPLETE)
      },
    }),
    {
      name: 'mathquest-session',
      partialize: (state) => ({
        totalXP: state.totalXP,
        badges: state.badges,
        moduleProgress: state.moduleProgress,
        studentId: state.studentId,
        audioEnabled: state.audioEnabled,
        musicEnabled: state.musicEnabled,
      }),
    }
  )
)

export default useSessionStore
