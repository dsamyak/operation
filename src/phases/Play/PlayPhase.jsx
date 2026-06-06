import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSessionStore, { PHASE_XP } from '../../engine/sessionStore'
import useAudio from '../../hooks/useAudio'
import generateQuestions from '../../engine/questionGen'

const DIFFICULTY_COLORS = {
  novice: '#00D4AA',
  explorer: '#FFD700',
  champion: '#E94560',
}

const MODULE_THEMES = {
  A: { icon: '✖️', color: '#E94560', name: 'Multiplication Arena' },
  B: { icon: '➗', color: '#00D4AA', name: 'Division Dungeon' },
  C: { icon: '🔢', color: '#FFD700', name: 'BODMAS Battleground' },
  D: { icon: '📊', color: '#9B59B6', name: 'Pattern Palace' },
}

function ProgressBar({ value, max, color }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', height: 8 }}>
      <motion.div className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}

export default function PlayPhase() {
  const { moduleId, advancePhase, awardXP, seed } = useSessionStore()
  const { speak, playSFX } = useAudio()
  const [questions] = useState(() => generateQuestions(moduleId, 10, seed))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [stars, setStars] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [userFill, setUserFill] = useState('')
  const [showExplanation, setShowExplanation] = useState(false)
  const theme = MODULE_THEMES[moduleId] || MODULE_THEMES.A
  const q = questions[currentIdx]

  useEffect(() => {
    if (q) speak(q.question, { rate: 0.9 })
  }, [currentIdx])

  const handleAnswer = async (answer) => {
    if (answered) return
    setAnswered(true)
    setSelected(answer)
    const isCorrect = String(answer) === String(q.answer)

    if (isCorrect) {
      playSFX('correct')
      setScore(s => s + 1)
      setStreak(s => s + 1)
      await speak('Correct! Great job!')
    } else {
      playSFX('wrong')
      setStreak(0)
      await speak(`Not quite. The answer is ${q.answer}. ${q.explanation}`)
    }

    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(i => i + 1)
        setSelected(null)
        setAnswered(false)
        setUserFill('')
        setShowExplanation(false)
      } else {
        // Game over
        const finalScore = isCorrect ? score + 1 : score
        const s = finalScore >= 9 ? 3 : finalScore >= 7 ? 2 : finalScore >= 5 ? 1 : 0
        setStars(s)
        const xp = s === 3 ? PHASE_XP.PLAY_3STAR : PHASE_XP.PLAY_1STAR
        awardXP(xp)
        setShowResult(true)
      }
    }, 1800)
  }

  const handleContinue = () => {
    playSFX('levelup')
    advancePhase()
  }

  if (showResult) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div className="max-w-md w-full glass-card p-10 text-center"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ borderColor: `${theme.color}30` }}>
          <motion.div className="text-6xl mb-4"
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8 }}>
            {stars === 3 ? '🏆' : stars === 2 ? '🥈' : stars === 1 ? '🥉' : '💪'}
          </motion.div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: theme.color, fontFamily: 'Space Grotesk' }}>
            {stars === 3 ? 'CHAMPION!' : stars === 2 ? 'Explorer!' : stars === 1 ? 'Apprentice!' : 'Keep Going!'}
          </h2>
          <div className="flex justify-center gap-2 mb-4">
            {[1,2,3].map(i => (
              <motion.span key={i} className="text-3xl"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: i <= stars ? 1 : 0.2, scale: 1 }}
                transition={{ delay: i * 0.2, type: 'spring' }}>
                ⭐
              </motion.span>
            ))}
          </div>
          <p className="text-text-secondary mb-2">{score} / {questions.length} correct</p>
          <p className="text-accent-yellow font-bold mb-6">
            +{stars === 3 ? PHASE_XP.PLAY_3STAR : PHASE_XP.PLAY_1STAR} XP earned!
          </p>
          <motion.button className="btn-primary w-full" onClick={handleContinue}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            Mastery Check ✅
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (!q) return null

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <motion.div className="flex items-center justify-center mb-5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
            style={{ background: `${theme.color}15`, border: `1px solid ${theme.color}50`, color: theme.color }}>
            🎮 Phase 4 · Play — {theme.name}
          </span>
        </motion.div>

        {/* Stats bar */}
        <div className="glass-card px-5 py-3 flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-accent-yellow text-lg">⭐</span>
            <span className="font-bold text-white">{score}/{questions.length}</span>
          </div>
          <div className="flex-1">
            <ProgressBar value={currentIdx} max={questions.length} color={theme.color} />
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span>🔥</span>
            <span className="font-bold text-accent-red">{streak}</span>
          </div>
          <div className="text-xs text-text-secondary">
            Q {currentIdx + 1}/{questions.length}
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div key={currentIdx}
            className="question-card mb-5"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

            {/* Difficulty badge */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background: `${DIFFICULTY_COLORS[q.difficulty]}15`,
                  color: DIFFICULTY_COLORS[q.difficulty],
                  border: `1px solid ${DIFFICULTY_COLORS[q.difficulty]}40`
                }}>
                {q.difficulty === 'novice' ? '🟢 Novice' : q.difficulty === 'explorer' ? '🟡 Explorer' : '🔴 Champion'}
              </span>
              <span className="text-xs text-text-secondary">{theme.icon} Module {moduleId}</span>
            </div>

            <p className="text-white text-lg md:text-xl font-medium mb-6 leading-relaxed">
              {q.question}
            </p>

            {/* MCQ options */}
            {q.type === 'mcq' && q.options && (
              <div className="grid grid-cols-2 gap-3">
                {q.options.map((opt, i) => {
                  let bg = 'rgba(255,255,255,0.04)'
                  let border = 'rgba(255,255,255,0.08)'
                  let textColor = 'white'
                  if (answered) {
                    if (String(opt) === String(q.answer)) { bg = '#00D4AA20'; border = '#00D4AA'; textColor = '#00D4AA' }
                    else if (String(opt) === String(selected)) { bg = '#E9456020'; border = '#E94560'; textColor = '#E94560' }
                  } else if (String(opt) === String(selected)) {
                    bg = `${theme.color}20`; border = theme.color
                  }
                  return (
                    <motion.button key={i}
                      onClick={() => !answered && handleAnswer(opt)}
                      className="p-4 rounded-xl text-left font-medium transition-all"
                      style={{ background: bg, border: `2px solid ${border}`, color: textColor }}
                      whileHover={!answered ? { scale: 1.02, background: `${theme.color}15` } : {}}
                      whileTap={!answered ? { scale: 0.98 } : {}}
                      animate={answered && String(opt) === String(selected) && String(opt) !== String(q.answer)
                        ? { x: [-4, 4, -4, 4, 0] } : {}}>
                      <span className="text-xs text-text-secondary mr-2">{['A','B','C','D'][i]}.</span>
                      {opt}
                    </motion.button>
                  )
                })}
              </div>
            )}

            {/* Fill in answer */}
            {q.type === 'fill' && (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={userFill}
                  onChange={e => setUserFill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && userFill && handleAnswer(userFill)}
                  placeholder="Type your answer..."
                  className="flex-1 px-4 py-3 rounded-xl text-center text-xl font-mono focus:outline-none"
                  style={{ background: '#0F3460', border: `2px solid ${theme.color}40`, color: 'white' }}
                  disabled={answered}
                />
                <motion.button className="btn-primary" onClick={() => userFill && handleAnswer(userFill)}
                  disabled={!userFill || answered}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  Submit ✓
                </motion.button>
              </div>
            )}

            {/* Hint button */}
            <div className="mt-4 flex justify-between items-center">
              <button onClick={() => setShowExplanation(e => !e)}
                className="text-xs text-text-secondary hover:text-accent-yellow transition-colors">
                💡 Show hint
              </button>
              {answered && <p className="text-xs" style={{ color: String(selected) === String(q.answer) ? '#00D4AA' : '#E94560' }}>
                {String(selected) === String(q.answer) ? '✅ Correct!' : `❌ Answer: ${q.answer}`}
              </p>}
            </div>

            <AnimatePresence>
              {showExplanation && (
                <motion.div className="mt-3 rounded-xl p-3 text-sm text-text-secondary"
                  style={{ background: '#FFD70010', border: '1px solid #FFD70030' }}
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  💡 {q.hint}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
