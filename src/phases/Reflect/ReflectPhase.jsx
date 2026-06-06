import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSessionStore, { PHASE_XP } from '../../engine/sessionStore'
import useAudio from '../../hooks/useAudio'

const PROMPTS = [
  'What was the hardest part of this module, and what strategy helped you the most?',
  'What surprised you about how this math concept works in the real world?',
  'If you had to explain this concept to a friend, what would you say?',
  'What do you want to remember about this topic when you come back to it?',
]

const EMOJIS = ['😄', '🤔', '😤', '🤩', '😅', '💪', '🧠', '⭐']

export default function ReflectPhase() {
  const { advancePhase, awardXP, setReflectText, moduleId } = useSessionStore()
  const { speak, playSFX } = useAudio()
  const [text, setText] = useState('')
  const [emoji, setEmoji] = useState(null)
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
  const [submitted, setSubmitted] = useState(false)

  const canSubmit = text.trim().length >= 20 && emoji !== null

  const handleSubmit = async () => {
    if (!canSubmit) return
    setReflectText(text)
    awardXP(PHASE_XP.REFLECT)
    playSFX('levelup')
    setSubmitted(true)
    await speak('Amazing reflection! You\'ve earned your final XP batch. Time to see your rewards!')
    setTimeout(() => advancePhase(), 2500)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <motion.div className="flex items-center justify-center mb-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
            style={{ background: '#9B59B615', border: '1px solid #9B59B650', color: '#D4A4F5' }}>
            🪞 Phase 7 · Reflect
          </span>
        </motion.div>

        <AnimatePresence>
          {!submitted ? (
            <motion.div className="glass-card p-8 md:p-10"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ borderColor: '#9B59B630' }}>

              <div className="text-center mb-8">
                <motion.div className="text-6xl mb-4"
                  animate={{ scale: [1, 1.05, 1], rotate: [0, -3, 3, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}>
                  🪞
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk' }}>
                  Time to Reflect
                </h2>
                <p className="text-text-secondary">
                  Thinking about what you learned helps your brain lock it in forever! ✨
                </p>
              </div>

              {/* Emoji mood picker */}
              <div className="mb-6">
                <p className="text-text-secondary text-sm mb-3">How do you feel about this module?</p>
                <div className="flex gap-3 flex-wrap">
                  {EMOJIS.map(e => (
                    <motion.button key={e}
                      onClick={() => setEmoji(e)}
                      className="text-3xl p-2 rounded-xl transition-all"
                      style={{
                        background: emoji === e ? 'rgba(155,89,182,0.3)' : 'rgba(255,255,255,0.05)',
                        border: `2px solid ${emoji === e ? '#9B59B6' : 'rgba(255,255,255,0.1)'}`,
                        boxShadow: emoji === e ? '0 0 15px #9B59B650' : 'none',
                      }}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}>
                      {e}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Journal prompt */}
              <div className="mb-2">
                <label className="text-text-secondary text-sm block mb-2">
                  📝 Journal Prompt:
                </label>
                <div className="rounded-xl p-4 mb-4"
                  style={{ background: '#9B59B615', border: '1px solid #9B59B640' }}>
                  <p className="text-white italic">"{prompt}"</p>
                </div>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Write your thoughts here... (at least 20 characters)"
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl resize-none focus:outline-none text-white placeholder:text-white/30"
                  style={{
                    background: '#0F3460',
                    border: `2px solid ${text.length >= 20 ? '#9B59B6' : 'rgba(155,89,182,0.3)'}`,
                    transition: 'border-color 0.3s',
                  }}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-text-secondary">{text.length} characters {text.length < 20 ? `(need ${20 - text.length} more)` : '✓'}</p>
                  {!emoji && <p className="text-xs text-accent-red">Please select an emoji too!</p>}
                </div>
              </div>

              <motion.button
                className="btn-primary w-full mt-6"
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{ opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
                whileHover={canSubmit ? { scale: 1.02 } : {}}
                whileTap={canSubmit ? { scale: 0.98 } : {}}>
                Submit Reflection & Collect XP 🏆
              </motion.button>

              <p className="text-center text-text-secondary text-sm mt-3">
                Complete this to unlock <span className="text-accent-yellow font-bold">+{PHASE_XP.REFLECT} XP</span>
              </p>
            </motion.div>
          ) : (
            <motion.div className="glass-card p-10 text-center"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ borderColor: '#00D4AA50' }}>
              <motion.div className="text-7xl mb-4"
                animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.8 }}>
                🎉
              </motion.div>
              <h2 className="text-2xl font-bold text-accent-cyan mb-2" style={{ fontFamily: 'Space Grotesk' }}>
                Brilliant Reflection!
              </h2>
              <p className="text-text-secondary mb-2">You earned <span className="text-accent-yellow font-bold">+{PHASE_XP.REFLECT} XP</span></p>
              <p className="text-text-secondary text-sm">Loading your rewards dashboard...</p>
              <motion.div className="flex justify-center gap-1 mt-4">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-accent-cyan"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
