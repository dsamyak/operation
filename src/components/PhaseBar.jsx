import React from 'react'
import { motion } from 'framer-motion'
import { PHASE_ORDER, PHASES } from '../engine/sessionStore'

const PHASE_LABELS = {
  WONDER: '🌟 Wonder',
  STORY: '📖 Story',
  SIMULATE: '🔬 Simulate',
  PLAY: '🎮 Play',
  MASTERY_CHECK: '✅ Mastery',
  WORKSHEET: '📋 Worksheet',
  REFLECT: '🪞 Reflect',
  PROGRESS: '🏆 Progress',
}

const PHASE_COLORS = {
  completed: '#00D4AA',
  current: '#E94560',
  upcoming: '#2A3A5C',
}

function PhaseBar({ currentPhase }) {
  const currentIdx = PHASE_ORDER.indexOf(currentPhase)

  return (
    <div className="w-full flex items-center justify-center py-3 px-4" style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-1 max-w-5xl w-full overflow-x-auto">
        {PHASE_ORDER.map((phase, idx) => {
          const status = idx < currentIdx ? 'completed' : idx === currentIdx ? 'current' : 'upcoming'
          const color = PHASE_COLORS[status]
          const label = PHASE_LABELS[phase]

          return (
            <React.Fragment key={phase}>
              {idx > 0 && (
                <div
                  className="flex-1 h-px min-w-4"
                  style={{ background: idx <= currentIdx ? 'linear-gradient(90deg, #00D4AA, #E94560)' : '#2A3A5C' }}
                />
              )}
              <motion.div
                className="flex flex-col items-center gap-1 flex-shrink-0"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <motion.div
                  className="rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    width: status === 'current' ? 36 : 28,
                    height: status === 'current' ? 36 : 28,
                    background: status === 'completed' ? color : status === 'current' ? `${color}20` : `${color}20`,
                    border: `2px solid ${color}`,
                    boxShadow: status === 'current' ? `0 0 12px ${color}60` : 'none',
                    color: status === 'upcoming' ? '#4A5A7C' : color,
                  }}
                  animate={status === 'current' ? { boxShadow: ['0 0 8px #E9456040', '0 0 20px #E9456080', '0 0 8px #E9456040'] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {status === 'completed' ? '✓' : idx + 1}
                </motion.div>
                <span className="text-xs hidden md:block" style={{ color: status === 'upcoming' ? '#4A5A7C' : color, fontSize: '0.6rem', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </motion.div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default PhaseBar
