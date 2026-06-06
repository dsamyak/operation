import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAudio from '../../hooks/useAudio'

function getDigits(n) {
  return String(n).split('').map(Number)
}

function generateProblem() {
  const a = Math.floor(Math.random() * 90 + 10)  // 2-digit
  const b = Math.floor(Math.random() * 900 + 100) // 3-digit
  return { a, b }
}

export default function MultiplicationSim({ onComplete }) {
  const { speak, playSFX } = useAudio()
  const [problem, setProblem] = useState(generateProblem)
  const [step, setStep] = useState(0) // which partial product we're showing
  const [partials, setPartials] = useState([])
  const [showFinal, setShowFinal] = useState(false)
  const [highlighted, setHighlighted] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const { a, b } = problem
  const bDigits = getDigits(b)  // e.g. [1,2,3] for 123
  const answer = a * b

  // Partial products: a × ones, a × tens, a × hundreds
  const partialValues = bDigits.slice().reverse().map((d, i) => ({
    digit: d,
    place: ['ones', 'tens', 'hundreds'][i],
    placeLabel: ['×1', '×10', '×100'][i],
    value: d * a * Math.pow(10, i),
    multiplier: Math.pow(10, i),
    shift: i,
  }))

  useEffect(() => {
    if (!isPlaying) return;
    if (step < partialValues.length) {
      const timer = setTimeout(() => {
        const p = partialValues[step]
        setHighlighted(step)
        setPartials(prev => [...prev, p])
        playSFX('tick')
        speak(`${a} times ${p.digit} ${p.place === 'ones' ? '' : p.placeLabel} equals ${p.value.toLocaleString()}`, { rate: 0.95 })
        setStep(s => s + 1)
      }, 1200) // Fast 1.2s intervals
      return () => clearTimeout(timer)
    } else if (step === partialValues.length && !showFinal) {
      const timer = setTimeout(() => {
        setShowFinal(true)
        playSFX('correct')
        speak(`Add all partial products: ${partialValues.map(p => p.value.toLocaleString()).join(' plus ')} equals ${answer.toLocaleString()}!`)
        setCompleted(true)
        setIsPlaying(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, step, partialValues, a, answer, speak, playSFX, showFinal])

  const handleReset = () => {
    setProblem(generateProblem())
    setStep(0)
    setPartials([])
    setShowFinal(false)
    setHighlighted(null)
    setCompleted(false)
    setIsPlaying(false)
  }

  return (
    <div className="glass-card p-6 md:p-8" style={{ borderColor: '#E9456030' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
          ✖️ Multiplication Area Explorer
        </h3>
        <button onClick={handleReset}
          className="text-xs px-3 py-1.5 rounded-full text-text-secondary hover:text-white border border-white/10 hover:border-white/30 transition-all">
          🔄 New Problem
        </button>
      </div>

      {/* Problem display */}
      <div className="flex flex-col items-center mb-8">
        <div className="glass-card px-8 py-5 text-center mb-2" style={{ borderColor: '#E9456030' }}>
          <p className="text-text-secondary text-sm mb-1">Calculate:</p>
          <p className="text-5xl font-bold font-mono" style={{ color: '#E94560' }}>
            {a} × {b}
          </p>
        </div>
      </div>

      {/* Grid visualization */}
      <div className="mb-6">
        <p className="text-text-secondary text-sm mb-3 text-center">Partial Products Method:</p>
        <div className="grid gap-2">
          {/* Header row: b broken into place values */}
          <div className="flex gap-2 justify-center">
            <div className="w-16" />
            {bDigits.map((d, i) => (
              <motion.div key={i}
                className="w-20 h-10 flex items-center justify-center rounded-lg text-sm font-bold"
                style={{ background: `hsl(${i * 40 + 200}, 70%, 30%)`, color: `hsl(${i * 40 + 200}, 100%, 80%)` }}
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                {d} × {['100', '10', '1'][i]}
              </motion.div>
            ))}
          </div>

          {/* Row for a */}
          <div className="flex gap-2 justify-center">
            <div className="w-16 h-12 flex items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ background: '#E9456030', border: '1px solid #E9456060' }}>
              {a}
            </div>
            {bDigits.map((d, i) => {
              const val = a * d
              const isRevealed = partials.length > bDigits.length - 1 - i
              return (
                <motion.div key={i}
                  className="w-20 h-12 flex items-center justify-center rounded-lg text-base font-bold"
                  style={{
                    background: isRevealed ? `hsl(${i * 40 + 200}, 60%, 25%)` : '#1A2A4A',
                    color: isRevealed ? `hsl(${i * 40 + 200}, 100%, 80%)` : '#4A5A7C',
                    border: `1px solid hsl(${i * 40 + 200}, 60%, 35%)`,
                  }}
                  animate={isRevealed ? { scale: [1, 1.1, 1] } : {}}>
                  {isRevealed ? val : '?'}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Partial products list */}
      <div className="space-y-2 mb-6 min-h-[100px]">
        <AnimatePresence>
          {partials.map((p, i) => (
            <motion.div key={i}
              className="flex items-center justify-between rounded-xl px-4 py-2"
              style={{ background: `hsl(${i * 40 + 200}, 60%, 20%)`, border: `1px solid hsl(${i * 40 + 200}, 60%, 35%)` }}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <span className="text-sm" style={{ color: `hsl(${i * 40 + 200}, 100%, 80%)` }}>
                {a} × {p.digit} ({p.place}) = {(a * p.digit).toLocaleString()} {p.shift > 0 ? `× ${p.multiplier} =` : ''}
              </span>
              <span className="font-bold font-mono text-white">{p.value.toLocaleString()}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Final sum */}
        <AnimatePresence>
          {showFinal && (
            <motion.div
              className="flex items-center justify-between rounded-xl px-4 py-3 mt-2"
              style={{ background: '#00D4AA15', border: '2px solid #00D4AA60' }}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <span className="font-bold text-accent-cyan">Total (Sum of partials)</span>
              <span className="text-2xl font-bold font-mono text-accent-cyan">{answer.toLocaleString()}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-center">
        {step === 0 && !isPlaying ? (
          <motion.button
            className="btn-primary"
            onClick={() => setIsPlaying(true)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            Start Simulation ▶
          </motion.button>
        ) : isPlaying ? (
          <div className="text-accent-cyan font-bold animate-pulse px-4 py-2">Running Simulation...</div>
        ) : showFinal ? (
          <div className="flex gap-3">
            <button onClick={handleReset} className="btn-secondary">Try Another</button>
            {completed && (
              <motion.button className="btn-primary" onClick={onComplete}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                I've Got It! Continue →
              </motion.button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
