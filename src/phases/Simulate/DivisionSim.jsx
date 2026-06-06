import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAudio from '../../hooks/useAudio'

function generateProblem() {
  const divisor = Math.floor(Math.random() * 8) + 2 // 2–9
  const quotient = Math.floor(Math.random() * 90) + 10 // 10–99
  const remainder = Math.floor(Math.random() * divisor)
  const dividend = divisor * quotient + remainder
  return { dividend, divisor, quotient, remainder }
}

export default function DivisionSim({ onComplete }) {
  const { speak, playSFX } = useAudio()
  const [problem, setProblem] = useState(generateProblem)
  const [steps, setSteps] = useState([])
  const [done, setDone] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const { dividend, divisor, quotient, remainder } = problem
  const dividendDigits = String(dividend).split('').map(Number)

  // Build division steps
  const buildSteps = () => {
    const stepsArr = []
    let current = 0
    for (let i = 0; i < dividendDigits.length; i++) {
      current = current * 10 + dividendDigits[i]
      const q = Math.floor(current / divisor)
      const mult = q * divisor
      const sub = current - mult
      stepsArr.push({ bring: dividendDigits[i], running: current, q, mult, sub, idx: i })
      current = sub
    }
    return stepsArr
  }

  const allSteps = buildSteps()
  const [revealed, setReveal] = useState(0)

  const handleReveal = async () => {
    if (revealed < allSteps.length) {
      const s = allSteps[revealed]
      playSFX('tick')
      await speak(
        `Bring down ${s.bring}. We have ${s.running}. ${divisor} goes into ${s.running} ${s.q} time${s.q !== 1 ? 's' : ''}. ${s.q} times ${divisor} equals ${s.mult}. Subtract: ${s.running} minus ${s.mult} equals ${s.sub}.`,
        { rate: 0.9 }
      )
      setReveal(r => r + 1)
      if (revealed === allSteps.length - 1) {
        setTimeout(async () => {
          setDone(true)
          playSFX('correct')
          const msg = remainder > 0
            ? `Final answer: ${quotient} remainder ${remainder}!`
            : `Final answer: ${quotient}!`
          await speak(msg)
        }, 400)
      }
    }
  }

  const handleReset = () => {
    setProblem(generateProblem())
    setReveal(0)
    setDone(false)
    setShowHint(false)
  }

  return (
    <div className="glass-card p-6 md:p-8" style={{ borderColor: '#00D4AA30' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
          ➗ Long Division Step Builder
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setShowHint(h => !h)}
            className="text-xs px-3 py-1.5 rounded-full border border-accent-yellow/30 text-accent-yellow hover:bg-accent-yellow/10 transition-all">
            💡 Hint
          </button>
          <button onClick={handleReset}
            className="text-xs px-3 py-1.5 rounded-full text-text-secondary hover:text-white border border-white/10 hover:border-white/30 transition-all">
            🔄 New
          </button>
        </div>
      </div>

      {/* Hint panel */}
      <AnimatePresence>
        {showHint && (
          <motion.div className="rounded-xl p-4 mb-4 text-sm"
            style={{ background: '#FFD70010', border: '1px solid #FFD70030' }}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <p className="text-accent-yellow font-bold mb-1">📋 DMSB Method:</p>
            <p className="text-text-secondary">
              <strong className="text-white">D</strong>ivide → <strong className="text-white">M</strong>ultiply → <strong className="text-white">S</strong>ubtract → <strong className="text-white">B</strong>ring down
            </p>
            <p className="text-text-secondary mt-1">Repeat until no digits remain. Leftover = Remainder.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Division scaffold */}
      <div className="flex justify-center mb-8">
        <div className="font-mono text-lg">
          {/* Divisor and bracket */}
          <div className="flex items-start">
            <div className="pr-2 pt-6 text-accent-red font-bold text-2xl">{divisor}</div>
            <div className="border-l-2 border-t-2 border-white/30 pt-2 pl-4 pr-4">
              {/* Quotient line */}
              <div className="flex gap-1 mb-2 text-accent-cyan font-bold text-2xl min-h-[40px]">
                {allSteps.map((s, i) => (
                  <motion.span key={i}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: i < revealed ? 1 : 0.15, y: 0 }}
                    className="w-8 text-center">
                    {i < revealed ? s.q : '_'}
                  </motion.span>
                ))}
              </div>
              {/* Dividend */}
              <div className="flex gap-1 text-white font-bold text-2xl">
                {dividendDigits.map((d, i) => (
                  <span key={i} className="w-8 text-center"
                    style={{ color: i < revealed ? '#00D4AA' : 'white' }}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="pl-16 mt-2 space-y-2">
            {allSteps.slice(0, revealed).map((s, i) => (
              <motion.div key={i} className="text-sm space-y-0.5"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex gap-4">
                  <span className="text-text-secondary w-24 text-right">−</span>
                  <span className="text-accent-red">{s.mult}</span>
                  <span className="text-text-secondary text-xs">({s.q} × {divisor})</span>
                </div>
                <div className="flex gap-4 border-t border-white/10 pt-0.5">
                  <span className="text-text-secondary w-24 text-right"></span>
                  <span className="text-white font-bold">{s.sub}</span>
                  {i === allSteps.length - 1 && s.sub > 0 && (
                    <span className="text-accent-yellow text-xs">← remainder</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Final answer */}
      <AnimatePresence>
        {done && (
          <motion.div className="rounded-xl p-4 text-center mb-6"
            style={{ background: '#00D4AA15', border: '2px solid #00D4AA50' }}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="text-accent-cyan font-bold text-xl">
              {dividend} ÷ {divisor} = {quotient}{remainder > 0 ? ` R${remainder}` : ''}
            </p>
            {remainder > 0 && (
              <p className="text-text-secondary text-sm mt-1">Remainder of {remainder} — not enough for another full group!</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div className="flex gap-3 justify-center">
        {!done ? (
          <motion.button className="btn-primary" onClick={handleReveal}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ background: 'linear-gradient(135deg, #00D4AA, #00A88A)' }}>
            {revealed === 0 ? 'Start Division ▶' : 'Next Step ▶'}
          </motion.button>
        ) : (
          <div className="flex gap-3">
            <button onClick={handleReset} className="btn-secondary">Try Another</button>
            <motion.button className="btn-primary" onClick={onComplete}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              I've Got It! Continue →
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}
