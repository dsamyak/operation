import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSessionStore, { PHASE_XP } from '../../engine/sessionStore'
import useAudio from '../../hooks/useAudio'

const BADGE_DATA = {
  bronze: { label: 'Bronze Apprentice', emoji: '🥉', color: '#CD7F32', desc: 'Score ≥ 70%' },
  silver: { label: 'Silver Scholar', emoji: '🥈', color: '#C0C0C0', desc: 'Score ≥ 85% + Worksheet' },
  gold:   { label: 'Gold Champion', emoji: '🥇', color: '#FFD700', desc: 'Score ≥ 90% + Reflect + 3★ Play' },
  platinum: { label: 'Platinum Legend', emoji: '💎', color: '#E0E0FF', desc: 'Completed in single session' },
}

const MODULE_INFO = {
  A: { name: 'Multi-digit Multiplication', icon: '✖️', color: '#E94560' },
  B: { name: 'Long Division', icon: '➗', color: '#00D4AA' },
  C: { name: 'Order of Operations', icon: '🔢', color: '#FFD700' },
  D: { name: 'Patterns & Expressions', icon: '📊', color: '#9B59B6' },
}

const MODULES = ['A','B','C','D','E','F']
const MODULE_NAMES = { A:'Multiplication', B:'Division', C:'Order of Ops', D:'Patterns', E:'Sequences', F:'Coordinates' }

function Confetti() {
  const colors = ['#E94560','#00D4AA','#FFD700','#9B59B6','#4FC3F7']
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {[...Array(40)].map((_, i) => (
        <motion.div key={i}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            background: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: '-20px',
          }}
          animate={{ y: '110vh', rotate: Math.random() * 720, opacity: [1, 1, 0] }}
          transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 1.5, ease: 'linear' }}
        />
      ))}
    </div>
  )
}

export default function ProgressPhase() {
  const {
    moduleId, xpEarned, totalXP, masteryScore, playStars,
    badges, newBadge, clearNewBadge, completeModule, moduleProgress, setModule
  } = useSessionStore()
  const { speak, playSFX } = useAudio()
  const [showConfetti, setShowConfetti] = useState(true)
  const [badgeEarned, setBadgeEarned] = useState(null)
  const [view, setView] = useState('summary') // summary | world-map
  const info = MODULE_INFO[moduleId] || MODULE_INFO.A

  // Determine badge
  const earnedBadge = masteryScore >= 90 ? 'platinum' : masteryScore >= 85 ? 'gold' : masteryScore >= 70 ? 'silver' : 'bronze'
  const badgeInfo = BADGE_DATA[earnedBadge]

  useEffect(() => {
    completeModule()
    playSFX('badge')
    setBadgeEarned(earnedBadge)
    speak(`Congratulations! You've completed Module ${moduleId} and earned the ${BADGE_DATA[earnedBadge].label} badge! Total XP this session: ${xpEarned}!`)
    const t = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (newBadge) {
      const t = setTimeout(clearNewBadge, 3000)
      return () => clearTimeout(t)
    }
  }, [newBadge])

  const handleNewModule = (mod) => {
    playSFX('whoosh')
    setModule(mod)
    // App will re-render to Wonder phase automatically
  }

  // XP breakdown
  const xpItems = [
    { label: 'Wonder Phase', xp: PHASE_XP.WONDER, icon: '🌟' },
    { label: 'Story Phase', xp: PHASE_XP.STORY, icon: '📖' },
    { label: 'Simulation', xp: PHASE_XP.SIMULATE, icon: '🔬' },
    { label: `Play Phase (${playStars}★)`, xp: playStars === 3 ? PHASE_XP.PLAY_3STAR : PHASE_XP.PLAY_1STAR, icon: '🎮' },
    { label: `Mastery Check (${masteryScore}%)`, xp: masteryScore >= 90 ? PHASE_XP.MASTERY_90 : masteryScore >= 70 ? PHASE_XP.MASTERY_70 : 0, icon: '✅' },
    { label: 'Worksheet', xp: PHASE_XP.WORKSHEET, icon: '📋' },
    { label: 'Reflection', xp: PHASE_XP.REFLECT, icon: '🪞' },
    { label: 'Module Complete Bonus', xp: PHASE_XP.MODULE_COMPLETE, icon: '🏆' },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">
      {showConfetti && <Confetti />}

      {/* Badge toast */}
      <AnimatePresence>
        {newBadge && (
          <motion.div
            className="fixed top-24 right-4 glass-card px-5 py-3 flex items-center gap-3 z-50"
            style={{ borderColor: BADGE_DATA[earnedBadge]?.color + '60' }}
            initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}>
            <span className="text-3xl">{badgeInfo?.emoji}</span>
            <div>
              <p className="text-xs text-text-secondary">Badge Unlocked!</p>
              <p className="font-bold text-white">{badgeInfo?.label}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl w-full">
        {/* Phase badge */}
        <motion.div className="flex items-center justify-center mb-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
            style={{ background: '#FFD70015', border: '1px solid #FFD70050', color: '#FFD700' }}>
            🏆 Phase 8 · Progress & Rewards
          </span>
        </motion.div>

        {/* Hero section */}
        <motion.div className="glass-card p-8 md:p-10 text-center mb-6"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ borderColor: `${info.color}30` }}>
          <motion.div className="text-7xl mb-3"
            animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 1 }}>
            {badgeInfo?.emoji}
          </motion.div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: info.color, fontFamily: 'Space Grotesk' }}>
            Module {moduleId} Complete!
          </h1>
          <p className="text-text-secondary mb-6">
            {info.icon} {info.name} · {masteryScore}% Mastery
          </p>

          {/* Badge display */}
          <motion.div className="inline-block rounded-2xl px-8 py-5 mb-6"
            style={{
              background: `${badgeInfo?.color}15`,
              border: `2px solid ${badgeInfo?.color}60`,
              boxShadow: `0 0 30px ${badgeInfo?.color}30`,
            }}
            animate={{ boxShadow: [`0 0 20px ${badgeInfo?.color}20`, `0 0 40px ${badgeInfo?.color}50`, `0 0 20px ${badgeInfo?.color}20`] }}
            transition={{ duration: 2, repeat: Infinity }}>
            <div className="text-5xl mb-2">{badgeInfo?.emoji}</div>
            <p className="font-bold text-lg" style={{ color: badgeInfo?.color }}>{badgeInfo?.label}</p>
            <p className="text-text-secondary text-xs mt-1">{badgeInfo?.desc}</p>
          </motion.div>

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-4">
            {[1,2,3].map(i => (
              <motion.span key={i} className="text-3xl"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: i <= playStars ? 1 : 0.5, opacity: i <= playStars ? 1 : 0.2 }}
                transition={{ delay: 0.5 + i * 0.2, type: 'spring' }}>
                ⭐
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* XP Breakdown */}
        <motion.div className="glass-card p-6 mb-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk' }}>
            ⚡ XP Breakdown — Session Total: <span className="text-accent-yellow">{xpEarned} XP</span>
          </h3>
          <div className="space-y-2">
            {xpItems.filter(x => x.xp > 0).map((item, i) => (
              <motion.div key={i}
                className="flex items-center justify-between rounded-lg px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.03)' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}>
                <span className="text-sm text-text-secondary">{item.icon} {item.label}</span>
                <span className="font-bold text-accent-yellow text-sm">+{item.xp} XP</span>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <span className="font-bold text-white">All-time Total XP</span>
            <span className="font-bold text-accent-yellow text-lg">{totalXP} XP</span>
          </div>
        </motion.div>

        {/* Module Progress Map */}
        <motion.div className="glass-card p-6 mb-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk' }}>
            🗺️ Your Progress Map
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {MODULES.map((mod) => {
              const prog = moduleProgress[mod]
              const isCurrentModule = mod === moduleId
              const modInfo = { A:'✖️',B:'➗',C:'🔢',D:'📊',E:'📈',F:'🗺️' }
              return (
                <motion.div key={mod}
                  className="rounded-xl p-3 text-center cursor-pointer"
                  style={{
                    background: prog.completed ? '#00D4AA15' : isCurrentModule ? `${info.color}15` : '#0F3460',
                    border: `2px solid ${prog.completed ? '#00D4AA60' : isCurrentModule ? `${info.color}60` : 'rgba(255,255,255,0.1)'}`,
                  }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => !prog.completed && mod !== moduleId && ['A','B','C','D'].includes(mod) && handleNewModule(mod)}>
                  <div className="text-2xl mb-1">{modInfo[mod]}</div>
                  <div className="text-xs font-bold text-white">Mod {mod}</div>
                  <div className="text-xs mt-1" style={{ color: prog.completed ? '#00D4AA' : isCurrentModule ? info.color : '#4A5A7C' }}>
                    {prog.completed ? `${prog.badge} ✓` : isCurrentModule ? 'Current' : 'Locked'}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div className="flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          {['A','B','C','D'].filter(m => m !== moduleId).slice(0, 2).map(mod => (
            <motion.button key={mod}
              className="btn-secondary flex-1"
              onClick={() => handleNewModule(mod)}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              Play Module {mod}: {MODULE_NAMES[mod]} →
            </motion.button>
          ))}
          <motion.button
            className="btn-primary flex-1"
            onClick={() => handleNewModule(moduleId)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            🔄 Replay Module {moduleId}
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
