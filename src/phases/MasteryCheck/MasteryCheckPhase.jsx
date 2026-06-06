import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSessionStore, { PHASE_XP } from '../../engine/sessionStore'
import useAudio from '../../hooks/useAudio'
import generateQuestions from '../../engine/questionGen'

const MODULE_THEMES = {
  A: { icon: '✖️', color: '#E94560', name: 'Multiplication' },
  B: { icon: '➗', color: '#00D4AA', name: 'Division' },
  C: { icon: '🔢', color: '#FFD700', name: 'Order of Operations' },
  D: { icon: '📊', color: '#9B59B6', name: 'Patterns & Expressions' },
}

export default function MasteryCheckPhase() {
  const { moduleId, advancePhase, awardXP, setMasteryScore, seed } = useSessionStore()
  const { speak, playSFX } = useAudio()
  const [questions] = useState(() => generateQuestions(moduleId, 10, seed + 1))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [userFill, setUserFill] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const theme = MODULE_THEMES[moduleId] || MODULE_THEMES.A
  const q = questions[currentIdx]

  useEffect(() => {
    if (q) speak(q.question, { rate: 0.9 })
  }, [currentIdx])

  const handleAnswer = async (answer) => {
    if (answered) return
    setAnswered(true)
    setSelected(answer)
    const isCorrect = String(answer).trim() === String(q.answer).trim()

    if (isCorrect) {
      playSFX('correct')
      await speak('Correct!')
    } else {
      playSFX('wrong')
      await speak(`The answer is ${q.answer}.`)
    }

    const newAnswers = [...answers, { question: q, correct: isCorrect, selected: answer }]
    setAnswers(newAnswers)

    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(i => i + 1)
        setSelected(null)
        setAnswered(false)
        setUserFill('')
      } else {
        const score = Math.round((newAnswers.filter(a => a.correct).length / questions.length) * 100)
        setFinalScore(score)
        setMasteryScore(score)
        const xp = score >= 90 ? PHASE_XP.MASTERY_90 : score >= 70 ? PHASE_XP.MASTERY_70 : 0
        if (xp > 0) awardXP(xp)
        setShowResult(true)
      }
    }, 1500)
  }

  const handleRetry = () => {
    setCurrentIdx(0)
    setAnswers([])
    setSelected(null)
    setAnswered(false)
    setUserFill('')
    setShowResult(false)
    setRetrying(true)
  }

  const handleContinue = () => {
    playSFX('levelup')
    advancePhase()
  }

  if (showResult) {
    const pass = finalScore >= 70
    const correct = answers.filter(a => a.correct).length

    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <motion.div className="max-w-2xl w-full glass-card p-10"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ borderColor: pass ? '#00D4AA50' : '#E9456050' }}>

          <div className="text-center mb-8">
            <motion.div className="text-7xl mb-4"
              animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.8 }}>
              {finalScore >= 90 ? '🏆' : finalScore >= 70 ? '✅' : '💪'}
            </motion.div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: pass ? '#00D4AA' : '#E94560', fontFamily: 'Space Grotesk' }}>
              {finalScore >= 90 ? 'Outstanding!' : finalScore >= 70 ? 'Mastered!' : 'Keep Practicing!'}
            </h2>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl font-bold font-mono" style={{ color: pass ? '#00D4AA' : '#E94560' }}>
                {finalScore}%
              </span>
              <span className="text-text-secondary">({correct}/{questions.length} correct)</span>
            </div>
            {pass && (
              <p className="text-accent-yellow font-bold">
                +{finalScore >= 90 ? PHASE_XP.MASTERY_90 : PHASE_XP.MASTERY_70} XP earned!
              </p>
            )}
          </div>

          {/* Question review */}
          <div className="space-y-2 mb-8 max-h-64 overflow-y-auto">
            {answers.map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl p-3 text-sm"
                style={{ background: a.correct ? '#00D4AA10' : '#E9456010', border: `1px solid ${a.correct ? '#00D4AA30' : '#E9456030'}` }}>
                <span>{a.correct ? '✅' : '❌'}</span>
                <div>
                  <p className="text-white">{a.question.question}</p>
                  {!a.correct && (
                    <p className="text-text-secondary text-xs mt-0.5">
                      Your answer: <span className="text-accent-red">{a.selected}</span> · Correct: <span className="text-accent-cyan">{a.question.answer}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {!pass && (
              <button className="btn-secondary flex-1" onClick={handleRetry}>
                🔄 Try Again, Hero!
              </button>
            )}
            <motion.button
              className="btn-primary flex-1"
              onClick={handleContinue}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              {pass ? 'Get My Worksheet 📋' : 'Continue Anyway →'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!q) return null

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <div className="max-w-2xl mx-auto w-full">
        <motion.div className="flex items-center justify-center mb-5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
            style={{ background: `${theme.color}15`, border: `1px solid ${theme.color}50`, color: theme.color }}>
            ✅ Phase 5 · Mastery Check {retrying ? '(Retry)' : ''} — Q{currentIdx + 1}/10
          </span>
        </motion.div>

        {/* Progress */}
        <div className="glass-card px-5 py-3 flex items-center gap-4 mb-5">
          <div className="flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', height: 6 }}>
            <motion.div className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${theme.color}, ${theme.color}99)` }}
              animate={{ width: `${(currentIdx / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }} />
          </div>
          <span className="text-text-secondary text-xs">{currentIdx}/{questions.length} done</span>
          <span className="text-accent-cyan text-xs font-bold">
            {answers.filter(a => a.correct).length} ✓
          </span>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div key={currentIdx} className="question-card mb-5"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold" style={{ color: theme.color }}>
                {theme.icon} Question {currentIdx + 1}
              </span>
              <span className="text-xs text-text-secondary">No time pressure — think carefully!</span>
            </div>

            <p className="text-white text-xl font-medium mb-6 leading-relaxed">{q.question}</p>

            {q.type === 'mcq' && q.options && (
              <div className="grid grid-cols-2 gap-3">
                {q.options.map((opt, i) => {
                  let borderCol = 'rgba(255,255,255,0.08)'
                  let bgCol = 'rgba(255,255,255,0.04)'
                  let textCol = 'white'
                  if (answered) {
                    if (String(opt) === String(q.answer)) { borderCol = '#00D4AA'; bgCol = '#00D4AA20'; textCol = '#00D4AA' }
                    else if (String(opt) === String(selected)) { borderCol = '#E94560'; bgCol = '#E9456020'; textCol = '#E94560' }
                  }
                  return (
                    <motion.button key={i}
                      onClick={() => !answered && handleAnswer(opt)}
                      className="p-4 rounded-xl text-left font-medium"
                      style={{ background: bgCol, border: `2px solid ${borderCol}`, color: textCol }}
                      whileHover={!answered ? { scale: 1.02, background: `${theme.color}15` } : {}}
                      whileTap={!answered ? { scale: 0.98 } : {}}>
                      <span className="text-xs text-text-secondary mr-2">{['A','B','C','D'][i]}.</span>
                      {opt}
                    </motion.button>
                  )
                })}
              </div>
            )}

            {q.type === 'fill' && (
              <div className="flex gap-3">
                <input type="text" value={userFill}
                  onChange={e => setUserFill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && userFill && handleAnswer(userFill)}
                  placeholder="Your answer..."
                  className="flex-1 px-4 py-3 rounded-xl text-center text-xl font-mono focus:outline-none"
                  style={{ background: '#0F3460', border: `2px solid ${theme.color}40`, color: 'white' }}
                  disabled={answered} />
                <motion.button className="btn-primary"
                  onClick={() => userFill && handleAnswer(userFill)}
                  disabled={!userFill || answered}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  Submit ✓
                </motion.button>
              </div>
            )}

            {answered && (
              <motion.div className="mt-4 rounded-xl p-3 text-sm"
                style={{ background: '#9B59B610', border: '1px solid #9B59B630' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-text-secondary">💡 {q.explanation}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
