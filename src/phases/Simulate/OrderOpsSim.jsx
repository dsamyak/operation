import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAudio from '../../hooks/useAudio'

// Color codes by operator type
const OP_COLORS = {
  '(': '#FFD700', ')': '#FFD700',
  '[': '#00D4AA', ']': '#00D4AA',
  '+': '#4FC3F7', '-': '#4FC3F7',
  '×': '#E94560', '÷': '#E94560',
}

function generateExpression() {
  const templates = [
    () => {
      const a = r(2,15), b = r(2,10), c = r(2,8)
      return { expr: `(${a} + ${b}) × ${c}`, answer: (a+b)*c, steps: [
        { action: `Brackets first: ${a} + ${b} = ${a+b}`, result: `${a+b} × ${c}`, color: '#FFD700' },
        { action: `Multiply: ${a+b} × ${c} = ${(a+b)*c}`, result: String((a+b)*c), color: '#E94560' },
      ]}
    },
    () => {
      const a = r(2,20), b = r(2,12), c = r(2,8), d = r(2,5)
      return { expr: `${a} + (${b} - ${c}) × ${d}`, answer: a+(b-c)*d, steps: [
        { action: `Brackets: ${b} - ${c} = ${b-c}`, result: `${a} + ${b-c} × ${d}`, color: '#FFD700' },
        { action: `Multiply (before add): ${b-c} × ${d} = ${(b-c)*d}`, result: `${a} + ${(b-c)*d}`, color: '#E94560' },
        { action: `Add: ${a} + ${(b-c)*d} = ${a+(b-c)*d}`, result: String(a+(b-c)*d), color: '#4FC3F7' },
      ]}
    },
    () => {
      const a = r(2,8), b = r(2,6), c = r(2,5), d = r(2,4)
      const inner = a * b
      const answer = inner + c - d
      return { expr: `[${a} × ${b}] + ${c} - ${d}`, answer, steps: [
        { action: `Brackets: ${a} × ${b} = ${inner}`, result: `${inner} + ${c} - ${d}`, color: '#00D4AA' },
        { action: `Left to right — Add: ${inner} + ${c} = ${inner+c}`, result: `${inner+c} - ${d}`, color: '#4FC3F7' },
        { action: `Subtract: ${inner+c} - ${d} = ${answer}`, result: String(answer), color: '#4FC3F7' },
      ]}
    },
  ]
  const fn = templates[Math.floor(Math.random() * templates.length)]
  return fn()
}

function r(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }

export default function OrderOpsSim({ onComplete }) {
  const { speak, playSFX } = useAudio()
  const [problem, setProblem] = useState(generateExpression)
  const [currentStep, setCurrentStep] = useState(0)
  const [done, setDone] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const { expr, answer, steps } = problem

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        const s = steps[currentStep]
        playSFX('tick')
        speak(s.action, { rate: 0.93 })
        setCurrentStep(c => c + 1)
      }, 1500)
      return () => clearTimeout(timer)
    } else if (currentStep === steps.length && !done) {
      const timer = setTimeout(() => {
        playSFX('correct')
        setDone(true)
        speak(`The final answer is ${answer}!`)
        setIsPlaying(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, currentStep, steps, answer, speak, playSFX, done])

  const handleReset = () => {
    setProblem(generateExpression())
    setCurrentStep(0)
    setDone(false)
    setIsPlaying(false)
  }

  return (
    <div className="glass-card p-6 md:p-8" style={{ borderColor: '#FFD70030' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
          🔢 BODMAS / PEMDAS Explorer
        </h3>
        <button onClick={handleReset}
          className="text-xs px-3 py-1.5 rounded-full text-text-secondary hover:text-white border border-white/10 hover:border-white/30 transition-all">
          🔄 New
        </button>
      </div>

      {/* BODMAS legend */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {[
          { label: 'Brackets ( )', color: '#FFD700' },
          { label: 'Orders ²', color: '#A855F7' },
          { label: 'Division ÷', color: '#E94560' },
          { label: 'Multiply ×', color: '#E94560' },
          { label: 'Add +', color: '#4FC3F7' },
          { label: 'Subtract −', color: '#4FC3F7' },
        ].map(item => (
          <span key={item.label} className="text-xs px-2 py-1 rounded-full font-semibold"
            style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}40` }}>
            {item.label}
          </span>
        ))}
      </div>

      {/* Expression display */}
      <div className="text-center mb-8">
        <p className="text-text-secondary text-sm mb-2">Evaluate step by step:</p>
        <motion.div className="text-4xl font-bold font-mono text-white py-4 px-6 rounded-2xl inline-block"
          style={{ background: '#0F3460', border: '1px solid rgba(255,255,255,0.1)' }}>
          {expr}
        </motion.div>
      </div>

      {/* Steps walkthrough */}
      <div className="space-y-3 mb-6 min-h-[160px]">
        <AnimatePresence>
          {steps.slice(0, currentStep).map((s, i) => (
            <motion.div key={i} className="rounded-xl p-4"
              style={{ background: `${s.color}10`, border: `1px solid ${s.color}30` }}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-start gap-3">
                <span className="text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0"
                  style={{ background: s.color, color: '#000' }}>{i + 1}</span>
                <div>
                  <p className="text-white text-sm font-medium">{s.action}</p>
                  <p className="text-text-secondary text-xs mt-1">Expression becomes: <span className="font-mono font-bold" style={{ color: s.color }}>{s.result}</span></p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Final answer */}
        <AnimatePresence>
          {done && (
            <motion.div className="rounded-xl p-4 text-center"
              style={{ background: '#00D4AA15', border: '2px solid #00D4AA50' }}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <p className="text-accent-cyan font-bold text-xl">
                ✅ {expr} = <span className="text-white">{answer}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {currentStep === 0 && (
          <div className="text-center text-text-secondary py-8">
            <p className="text-4xl mb-3">🤔</p>
            <p>Click the button below to start evaluating step by step!</p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-center">
        {!done && !isPlaying ? (
          <motion.button className="btn-primary" onClick={() => setIsPlaying(true)}
            style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000' }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            Start Evaluating ▶
          </motion.button>
        ) : isPlaying ? (
          <div className="text-accent-yellow font-bold animate-pulse px-4 py-2">Running Simulation...</div>
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
