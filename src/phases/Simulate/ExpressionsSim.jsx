import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAudio from '../../hooks/useAudio'

function r(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }

function generatePattern() {
  const start = r(1, 10)
  const step = r(2, 8)
  const seq = Array.from({ length: 5 }, (_, i) => start + i * step)
  return { seq, step, next: seq[4] + step, type: 'arithmetic' }
}

export default function ExpressionsSim({ onComplete }) {
  const { speak, playSFX } = useAudio()
  const [pattern, setPattern] = useState(generatePattern)
  const [userGuess, setUserGuess] = useState('')
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [tries, setTries] = useState(0)
  const [showRule, setShowRule] = useState(false)
  const [done, setDone] = useState(false)
  const [round, setRound] = useState(1)

  const { seq, step, next } = pattern

  const handleCheck = async () => {
    const val = parseInt(userGuess)
    setChecked(true)
    if (val === next) {
      setCorrect(true)
      playSFX('correct')
      await speak(`Correct! The rule is plus ${step}. ${seq[seq.length-1]} plus ${step} equals ${next}!`)
      if (round >= 3) {
        setTimeout(() => setDone(true), 800)
      }
    } else {
      setTries(t => t + 1)
      playSFX('wrong')
      await speak(`Not quite. Look at the differences between terms. What's the pattern?`)
      setChecked(false)
      setUserGuess('')
      if (tries >= 1) setShowRule(true)
    }
  }

  const handleNextRound = () => {
    setPattern(generatePattern())
    setUserGuess('')
    setChecked(false)
    setCorrect(false)
    setTries(0)
    setShowRule(false)
    setRound(r => r + 1)
  }

  // Expression builder scenario
  const [exprMode, setExprMode] = useState(false)
  const scenarios = [
    { text: 'John has 3 times as many stickers as Sarah. Sarah has s stickers.', answer: '3 × s', hint: '"Times as many" = multiply' },
    { text: 'Mike scored 12 more points than Emma. Emma scored e points.', answer: 'e + 12', hint: '"More than" = addition' },
    { text: 'The class has 5 groups with equal students. Total is t.', answer: 't ÷ 5', hint: '"Equal groups" = division' },
  ]
  const [scenIdx, setScenIdx] = useState(0)
  const [exprInput, setExprInput] = useState('')
  const [exprChecked, setExprChecked] = useState(false)

  return (
    <div className="glass-card p-6 md:p-8 space-y-6" style={{ borderColor: '#9B59B630' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
          📊 Patterns & Expressions Studio
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setExprMode(m => !m)}
            className="text-xs px-3 py-1.5 rounded-full border transition-all"
            style={{
              background: exprMode ? '#9B59B620' : 'transparent',
              borderColor: '#9B59B660', color: '#9B59B6'
            }}>
            {exprMode ? '📈 Patterns' : '📝 Expressions'}
          </button>
        </div>
      </div>

      {!exprMode ? (
        /* ── Pattern Mode ── */
        <div>
          <div className="text-center mb-2">
            <span className="text-xs text-text-secondary">Round {round} of 3 — Find the next number</span>
          </div>

          {/* Sequence display */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
            {seq.map((n, i) => (
              <motion.div key={i}
                className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold font-mono text-white"
                style={{ background: '#0F3460', border: '2px solid #9B59B660' }}
                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}>
                {n}
              </motion.div>
            ))}
            <span className="text-2xl text-text-secondary">→</span>
            {!correct ? (
              <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: '#9B59B620', border: '2px dashed #9B59B660' }}>
                <span className="text-text-secondary text-2xl">?</span>
              </div>
            ) : (
              <motion.div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold font-mono"
                style={{ background: '#9B59B640', border: '2px solid #9B59B6', color: '#D4A4F5' }}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                {next}
              </motion.div>
            )}
          </div>

          {/* Difference arrows */}
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            {seq.slice(0, -1).map((_, i) => (
              <AnimatePresence key={i}>
                {(showRule || correct) && (
                  <motion.div key={i} className="text-xs text-center"
                    style={{ color: '#9B59B6' }}
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                    +{step}
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>

          {/* Input */}
          {!correct && (
            <div className="flex items-center gap-3 justify-center mb-4">
              <input
                type="number"
                value={userGuess}
                onChange={e => setUserGuess(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && userGuess && handleCheck()}
                placeholder="Your answer..."
                className="w-32 px-4 py-3 rounded-xl text-center text-xl font-bold font-mono focus:outline-none"
                style={{ background: '#0F3460', border: '2px solid #9B59B650', color: 'white' }}
              />
              <motion.button className="btn-primary" onClick={handleCheck} disabled={!userGuess}
                style={{ background: 'linear-gradient(135deg, #9B59B6, #7D3C98)' }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                Check ✓
              </motion.button>
            </div>
          )}

          {showRule && !correct && (
            <motion.div className="rounded-xl p-3 text-center mb-4"
              style={{ background: '#FFD70010', border: '1px solid #FFD70030' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-accent-yellow text-sm">💡 Hint: The rule is <strong>+{step}</strong> each time!</p>
            </motion.div>
          )}

          {correct && (
            <motion.div className="text-center space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-accent-cyan font-bold">🎉 Correct! Rule: +{step}</p>
              {round < 3 ? (
                <button className="btn-secondary" onClick={handleNextRound}>Next Pattern →</button>
              ) : (
                <button className="btn-primary" onClick={() => setExprMode(true)}>Try Expressions Next →</button>
              )}
            </motion.div>
          )}
        </div>
      ) : (
        /* ── Expression Mode ── */
        <div>
          <div className="rounded-xl p-5 mb-5"
            style={{ background: '#9B59B615', border: '1px solid #9B59B640' }}>
            <p className="text-text-secondary text-sm mb-2 uppercase tracking-wider font-semibold">Word Problem:</p>
            <p className="text-white text-lg leading-relaxed">{scenarios[scenIdx].text}</p>
          </div>

          <p className="text-text-secondary text-sm mb-3">Write the expression using math symbols (×, ÷, +, −):</p>

          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              value={exprInput}
              onChange={e => setExprInput(e.target.value)}
              placeholder="e.g. 3 × s"
              className="flex-1 px-4 py-3 rounded-xl text-center text-lg font-mono focus:outline-none"
              style={{ background: '#0F3460', border: '2px solid #9B59B650', color: 'white' }}
            />
            <button className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #9B59B6, #7D3C98)' }}
              onClick={() => {
                const correct = exprInput.replace(/\s/g,'').toLowerCase() === scenarios[scenIdx].answer.replace(/\s/g,'').toLowerCase()
                setExprChecked(true)
                if (correct) { playSFX('correct') } else { playSFX('wrong') }
              }}>
              Check
            </button>
          </div>

          {exprChecked && (
            <motion.div className="rounded-xl p-4 mb-4"
              style={{
                background: exprInput.replace(/\s/g,'').toLowerCase() === scenarios[scenIdx].answer.replace(/\s/g,'').toLowerCase()
                  ? '#00D4AA15' : '#E9456015',
                border: `1px solid ${exprInput.replace(/\s/g,'').toLowerCase() === scenarios[scenIdx].answer.replace(/\s/g,'').toLowerCase() ? '#00D4AA50' : '#E9456050'}`,
              }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {exprInput.replace(/\s/g,'').toLowerCase() === scenarios[scenIdx].answer.replace(/\s/g,'').toLowerCase() ? (
                <p className="text-accent-cyan font-bold">✅ Correct! <span className="text-white">{scenarios[scenIdx].answer}</span></p>
              ) : (
                <div>
                  <p className="text-accent-red font-bold">Not quite!</p>
                  <p className="text-text-secondary text-sm">Hint: {scenarios[scenIdx].hint}</p>
                  <p className="text-text-secondary text-sm">Answer: <strong className="text-white">{scenarios[scenIdx].answer}</strong></p>
                </div>
              )}
            </motion.div>
          )}

          <div className="flex gap-3 justify-center">
            {scenIdx < scenarios.length - 1 ? (
              <button className="btn-secondary" onClick={() => { setScenIdx(i => i+1); setExprInput(''); setExprChecked(false) }}>
                Next Scenario →
              </button>
            ) : (
              <motion.button className="btn-primary" onClick={onComplete}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                I've Got It! Continue →
              </motion.button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
