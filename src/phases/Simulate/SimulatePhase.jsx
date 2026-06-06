import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSessionStore from '../../engine/sessionStore'
import useAudio from '../../hooks/useAudio'
import MultiplicationSim from './MultiplicationSim'
import DivisionSim from './DivisionSim'
import OrderOpsSim from './OrderOpsSim'
import ExpressionsSim from './ExpressionsSim'

const SIM_MAP = { A: MultiplicationSim, B: DivisionSim, C: OrderOpsSim, D: ExpressionsSim }

const MODULE_INFO = {
  A: { title: 'Multiplication Explorer', desc: 'Build partial products and master the standard algorithm', color: '#E94560', icon: '✖️' },
  B: { title: 'Division Lab', desc: 'Step through long division and understand remainders', color: '#00D4AA', icon: '➗' },
  C: { title: 'BODMAS Workshop', desc: 'Click through operations in the correct order', color: '#FFD700', icon: '🔢' },
  D: { title: 'Pattern Studio', desc: 'Explore expressions and number sequences', color: '#9B59B6', icon: '📊' },
}

function SimulatePhase() {
  const { moduleId, advancePhase, awardXP } = useSessionStore()
  const { playSFX } = useAudio()
  const [simReady, setSimReady] = useState(false)
  const [simDone, setSimDone] = useState(false)
  const info = MODULE_INFO[moduleId] || MODULE_INFO.A
  const SimComponent = SIM_MAP[moduleId] || MultiplicationSim

  const handleSimDone = () => {
    setSimDone(true)
    awardXP(25)
    playSFX('levelup')
  }

  const handleContinue = () => {
    playSFX('whoosh')
    advancePhase()
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full mb-6">
        <motion.div className="flex items-center justify-center mb-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
            style={{ background: `${info.color}15`, border: `1px solid ${info.color}50`, color: info.color }}>
            🔬 Phase 3 · Simulate
          </span>
        </motion.div>

        <motion.div className="glass-card p-5 flex items-center gap-4 mb-4"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-4xl">{info.icon}</span>
          <div>
            <h2 className="text-xl font-bold" style={{ color: info.color, fontFamily: 'Space Grotesk' }}>
              {info.title}
            </h2>
            <p className="text-text-secondary text-sm">{info.desc}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-text-secondary">No wrong answers here!</p>
            <p className="text-xs" style={{ color: info.color }}>Explore freely 🚀</p>
          </div>
        </motion.div>
      </div>

      {/* Simulation area */}
      <div className="max-w-4xl mx-auto w-full flex-1">
        <AnimatePresence mode="wait">
          {!simReady ? (
            <motion.div
              key="intro"
              className="glass-card p-10 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <motion.div className="text-7xl mb-6"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}>
                {info.icon}
              </motion.div>
              <h3 className="text-2xl font-bold mb-3 text-white" style={{ fontFamily: 'Space Grotesk' }}>
                Ready to Explore?
              </h3>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                This is a <strong style={{ color: info.color }}>no-penalty zone</strong> — play freely, make mistakes, and discover how it works.
                There's no time limit. Explore until you feel ready!
              </p>
              <motion.button
                className="btn-primary text-lg px-10 py-4"
                onClick={() => setSimReady(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                style={{ background: `linear-gradient(135deg, ${info.color}, ${info.color}99)` }}
              >
                Launch Simulation →
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="sim"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SimComponent onComplete={handleSimDone} />

              <AnimatePresence>
                {simDone && (
                  <motion.div
                    className="mt-6 glass-card p-6 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ borderColor: '#00D4AA50' }}
                  >
                    <p className="text-2xl mb-2">🎉</p>
                    <h3 className="text-xl font-bold text-accent-cyan mb-2">Simulation Complete!</h3>
                    <p className="text-text-secondary mb-4">
                      You've earned <span className="text-accent-yellow font-bold">+25 XP</span>. Now let's put it to the test!
                    </p>
                    <motion.button
                      className="btn-primary"
                      onClick={handleContinue}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      I'm Ready! Let's Play 🎮
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!simDone && (
                <div className="mt-4 text-center">
                  <button
                    className="text-text-secondary text-sm hover:text-white transition-colors underline"
                    onClick={handleSimDone}
                  >
                    I understand this concept → Continue to Play
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default SimulatePhase
