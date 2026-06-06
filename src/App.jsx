import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSessionStore, { PHASES } from './engine/sessionStore'
import PhaseBar from './components/PhaseBar'

// Phase components
import WonderPhase from './phases/Wonder/WonderPhase'
import StoryPhase from './phases/Story/StoryPhase'
import SimulatePhase from './phases/Simulate/SimulatePhase'
import PlayPhase from './phases/Play/PlayPhase'
import MasteryCheckPhase from './phases/MasteryCheck/MasteryCheckPhase'
import WorksheetPhase from './phases/Worksheet/WorksheetPhase'
import ReflectPhase from './phases/Reflect/ReflectPhase'
import ProgressPhase from './phases/Progress/ProgressPhase'

const MODULE_GRADIENTS = {
  A: 'var(--hero-gradient)',
  B: 'var(--reward-chest)',
  C: 'var(--success-gradient)',
  D: 'var(--boss-gradient)',
}

const PHASE_COMPONENTS = {
  [PHASES.WONDER]:        WonderPhase,
  [PHASES.STORY]:         StoryPhase,
  [PHASES.SIMULATE]:      SimulatePhase,
  [PHASES.PLAY]:          PlayPhase,
  [PHASES.MASTERY_CHECK]: MasteryCheckPhase,
  [PHASES.WORKSHEET]:     WorksheetPhase,
  [PHASES.REFLECT]:       ReflectPhase,
  [PHASES.PROGRESS]:      ProgressPhase,
}

const MODULE_NAMES = {
  A: 'Multi-digit Multiplication',
  B: 'Long Division',
  C: 'Order of Operations',
  D: 'Patterns & Expressions',
}
const MODULE_ICONS = { A: '✖️', B: '➗', C: '🔢', D: '📊' }
// We will use the gradients for styling instead of solid colors where appropriate
const MODULE_DESC = {
  A: 'Master 2×3 and 4×3 digit multiplication using the standard algorithm and area models.',
  B: 'Conquer long division up to 4-digit ÷ 2-digit with animated step-by-step breakdown.',
  C: 'Unlock the secret order of PEMDAS/BODMAS with nested brackets and expression trees.',
  D: 'Decode algebraic patterns, write expressions, and graph ordered pairs.',
}
const MODULES = ['A', 'B', 'C', 'D']

// ── Module Select Screen ─────────────────────────────────────────────────────
function ModuleSelectScreen({ onSelect }) {
  return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-grid"
        style={{ background: 'var(--bg-primary)' }}
      >
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.1), transparent)', top: '5%', left: '10%' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.08), transparent)', bottom: '10%', right: '10%' }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, delay: 1.5 }}
          />
          <motion.div
            className="absolute w-64 h-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,217,61,0.08), transparent)', top: '40%', right: '5%' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 7, repeat: Infinity, delay: 3 }}
          />
        </div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Logo / Hero */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="mb-8 flex justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div 
              className="p-4 md:p-6 rounded-[2rem] backdrop-blur-md relative overflow-hidden group logo-container"
              style={{ 
                background: 'var(--glass-bg)', 
                border: '1px solid var(--glass-border)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
              }}
            >
              {/* Optional animated sheen */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
              />
              <img 
                src="/logo-360.png" 
                alt="Intellia 360 Logo" 
                className="h-28 md:h-36 object-contain relative z-10 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
              />
            </div>
          </motion.div>
          <h1
            className="text-5xl md:text-6xl font-black mb-4 leading-tight"
            style={{ fontFamily: 'Space Grotesk' }}
          >
            <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Intellia 360</span>
            <span className="text-[var(--text-primary)]">: </span>
            <span style={{ color: 'var(--warning)' }}>Operation</span>
            <span className="text-[var(--text-primary)]"> Infinity</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-xl max-w-2xl mx-auto leading-relaxed">
            A fully gamified Grade 5 math adventure — earn XP, unlock badges, and master arithmetic across kingdoms!
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {[
              { icon: '🌍', label: 'Global Curriculum (CCSS, CBSE, Singapore MOE…)' },
              { icon: '🔬', label: 'Simulation-Based Learning' },
              { icon: '🏆', label: 'XP & Badge System' },
              { icon: '📋', label: 'Adaptive Worksheets' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-bold"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <span>{item.icon}</span> {item.label}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Module cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-center text-[var(--text-secondary)] mb-6 font-semibold text-lg">
            ⚔️ Choose your adventure module:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {MODULES.map((mod, i) => {
              const grad = MODULE_GRADIENTS[mod];
              return (
                <motion.div
                  key={mod}
                  className="p-6 cursor-pointer rounded-2xl relative overflow-hidden"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  whileHover={{
                    y: -4,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                    borderColor: 'transparent'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(mod)}
                >
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ background: grad }} />
                  <div className="flex items-start gap-4">
                    <div className="text-5xl flex-shrink-0">{MODULE_ICONS[mod]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ background: grad }}
                        >
                          Module {mod}
                        </span>
                        <span className="text-xs text-[var(--text-secondary)]">8 Phases · 20 Questions</span>
                      </div>
                      <h3
                        className="text-lg font-bold mb-1"
                        style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}
                      >
                        {MODULE_NAMES[mod]}
                      </h3>
                      <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                        {MODULE_DESC[mod]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5">
                    <div className="flex gap-4 text-xs text-[var(--text-secondary)]">
                      <span>⚡ Up to 170 XP</span>
                      <span>🏅 4 badge tiers</span>
                    </div>
                    <motion.span
                      className="text-sm font-bold"
                      style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Start →
                    </motion.span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Standards footer */}
        <motion.p
          className="text-center text-[var(--text-secondary)] text-xs mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          🌍 Aligned to CCSS · CBSE · Singapore MOE · UK KS2 · Australian F-10 · Brazilian BNCC · Kenya CBC
        </motion.p>
      </div>
    </div>
  )
}


// ── Audio Controls ───────────────────────────────────────────────────────────
function AudioControls() {
  const { audioEnabled, toggleAudio } = useSessionStore()
  return (
    <motion.button
      onClick={toggleAudio}
      className="fixed bottom-5 right-5 w-11 h-11 rounded-full flex items-center justify-center text-xl z-50"
      style={{
        background: audioEnabled ? 'var(--success)' : 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        color: audioEnabled ? 'white' : 'var(--text-primary)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={audioEnabled ? 'Mute narration' : 'Unmute narration'}
    >
      {audioEnabled ? '🔊' : '🔇'}
    </motion.button>
  )
}

// ── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const { moduleId, currentPhase, setModule } = useSessionStore()
  const [screen, setScreen] = useState('select') // 'select' | 'game'

  const handleModuleSelect = (mod) => {
    setModule(mod)
    setScreen('game')
  }

  const handleBackToSelect = () => {
    setScreen('select')
  }

  const PhaseComponent = PHASE_COMPONENTS[currentPhase]
  const bgGradient = MODULE_GRADIENTS[moduleId] || MODULE_GRADIENTS.A

  if (screen === 'select') {
    return (
      <>
        <ModuleSelectScreen onSelect={handleModuleSelect} />
        <AudioControls />
      </>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient background with grid and animated particles */}
      <div className="fixed inset-0 pointer-events-none bg-grid stars-bg" style={{ zIndex: 0 }} />

      {/* Top bar */}
      <div className="relative z-20">
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--glass-border)' }}
        >
          <button
            onClick={handleBackToSelect}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 font-medium"
          >
            ← All Modules
          </button>
          <div className="flex items-center gap-2 text-xs text-[var(--text-primary)] font-bold">
            <span>{MODULE_ICONS[moduleId]}</span>
            <span>Module {moduleId}: {MODULE_NAMES[moduleId]}</span>
          </div>
          <div className="w-20" />
        </div>

        {/* Phase progress bar */}
        <PhaseBar currentPhase={currentPhase} />
      </div>

      {/* Phase content */}
      <div className="flex-1 relative z-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {PhaseComponent && (
            <motion.div
              key={`${moduleId}-${currentPhase}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <PhaseComponent />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AudioControls />
    </div>
  )
}

export default App
