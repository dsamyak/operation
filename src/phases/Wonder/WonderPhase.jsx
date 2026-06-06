import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSessionStore, { PHASES } from '../../engine/sessionStore'
import useAudio from '../../hooks/useAudio'
import CharacterAvatar from '../../components/CharacterAvatar'

const MODULE_WONDER = {
  A: {
    character: 'john',
    hook: '🗺️ The Lost Treasure Map',
    narrative: 'John discovered an ancient treasure map. The chest is buried exactly 3,456 steps away — but he needs to multiply the distance by 4 different directions. Can you help him crack the code?',
    question: 'If each direction requires 1,234 steps, how many total steps does John need across all 4 directions?',
    visual: '🗺️',
    bgColor: '#E9456015',
    accentColor: '#E94560',
    narration: "John just found an ancient treasure map! The treasure is hidden exactly 3,456 steps away... but wait — he needs to travel in 4 different directions. That means he'll need to MULTIPLY! Can you help him figure out the total steps? Let's find out how powerful multiplication really is!",
  },
  B: {
    character: 'sarah',
    hook: '🤖 Sarah\'s Robot Factory',
    narrative: 'Sarah is programming robots at her factory. She has 2,496 circuits to distribute equally among 12 robots. Each robot must get the exact same number — or they malfunction!',
    question: 'How many circuits does each robot get if Sarah divides 2,496 equally among 12 robots?',
    visual: '🤖',
    bgColor: '#00D4AA15',
    accentColor: '#00D4AA',
    narration: "Sarah is running a robot factory! She has 2,496 electronic circuits, and she needs to share them equally among 12 robots. But wait — if even one robot gets more or less, the whole factory breaks down! Division to the rescue! Are you ready to help Sarah save her factory?",
  },
  C: {
    character: 'mike',
    hook: '⚽ Mike\'s Game Score Mystery',
    narrative: 'Mike scored points in a championship game, but the scoreboard shows: (3 + 5) × 4 − 2. Different calculators give different answers! Which one is right?',
    question: 'What is the correct value of (3 + 5) × 4 − 2?',
    visual: '⚽',
    bgColor: '#FFD70015',
    accentColor: '#FFD700',
    narration: "Mike just won a championship game! But there's a problem — the scoreboard equation shows 3 plus 5 times 4 minus 2... and three different calculators give three different answers! How can math give different results?! There must be a secret ORDER of operations... Let's crack the code!",
  },
  D: {
    character: 'john',
    hook: '📊 The Pattern Kingdom',
    narrative: 'John discovered a magical kingdom where everything follows secret patterns. The castle doors only open when you can predict the next number in the sequence!',
    question: 'If the pattern is 3, 7, 11, 15, 19... what is the next number?',
    visual: '🏰',
    bgColor: '#9B59B615',
    accentColor: '#9B59B6',
    narration: "John has entered the Pattern Kingdom — a magical land where castle doors only open if you can predict what comes next! Numbers here follow secret rules. Can you crack the pattern? Once you learn to read sequences and write expressions, the whole kingdom unlocks for you!",
  },
}

function WonderPhase() {
  const { moduleId, advancePhase, awardXP } = useSessionStore()
  const { speak, stopSpeech, playSFX } = useAudio()
  const [stage, setStage] = useState('intro') // intro | animating | ready
  const [charMood, setCharMood] = useState('idle')
  const data = MODULE_WONDER[moduleId] || MODULE_WONDER.A
  const timerRef = useRef(null)

  useEffect(() => {
    playSFX('whoosh')
    setStage('animating')
    setCharMood('thinking')

    // Minimum time before showing Start button (so narration has time to begin)
    const minTimer = setTimeout(() => {
      setCharMood('happy')
      setStage('ready')
    }, 1500)

    // Start narration (non-blocking)
    speak(data.narration, { rate: 0.92 }).then(() => {
      clearTimeout(minTimer)
      setCharMood('happy')
      setStage('ready')
    }).catch(() => {
      clearTimeout(minTimer)
      setStage('ready')
    })

    // Auto-advance fallback after 120s
    timerRef.current = setTimeout(() => {
      handleContinue()
    }, 120000)

    return () => {
      clearTimeout(minTimer)
      clearTimeout(timerRef.current)
      stopSpeech()
    }
  }, [])

  const handleContinue = () => {
    clearTimeout(timerRef.current)
    stopSpeech()
    awardXP(10)
    playSFX('levelup')
    advancePhase()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              background: data.accentColor,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3,
            }}
            animate={{ y: [-20, 20, -20], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Header badge */}
        <motion.div
          className="flex items-center justify-center gap-2 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
            style={{ background: `${data.accentColor}20`, border: `1px solid ${data.accentColor}50`, color: data.accentColor }}>
            🌟 Phase 1 · Wonder
          </span>
        </motion.div>

        {/* Main card */}
        <motion.div
          className="glass-card p-8 md:p-12 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{ borderColor: `${data.accentColor}30` }}
        >
          {/* Visual emoji */}
          <motion.div
            className="text-7xl mb-6"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {data.visual}
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'Space Grotesk', color: data.accentColor }}>
            {data.hook}
          </h1>

          <p className="text-text-secondary text-lg mb-6 leading-relaxed">
            {data.narrative}
          </p>

          {/* Wonder question card */}
          <motion.div
            className="rounded-xl p-5 mb-8 text-left"
            style={{ background: `${data.accentColor}10`, border: `1px solid ${data.accentColor}30` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: stage !== 'intro' ? 1 : 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: data.accentColor }}>
              🤔 Wonder Question
            </p>
            <p className="text-white text-lg font-medium">{data.question}</p>
          </motion.div>

          {/* Character */}
          <div className="flex items-end justify-center gap-6 mb-8">
            <CharacterAvatar character={data.character} mood={charMood} size="lg" speaking={stage === 'animating'} />
          </div>

          {/* CTA */}
          <AnimatePresence>
            {stage === 'ready' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.button
                  className="btn-primary text-lg px-10 py-4"
                  onClick={handleContinue}
                  animate={{ boxShadow: ['0 4px 20px rgba(233,69,96,0.4)', '0 4px 40px rgba(233,69,96,0.7)', '0 4px 20px rgba(233,69,96,0.4)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Start the Adventure →
                </motion.button>
                <button
                  className="text-text-secondary text-sm hover:text-white transition-colors"
                  onClick={handleContinue}
                >
                  Skip intro
                </button>
              </motion.div>
            )}
            {stage !== 'ready' && (
              <motion.div className="flex items-center justify-center gap-2 text-text-secondary">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-accent-red"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
                <span className="text-sm ml-2">Loading adventure...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* XP preview */}
        <motion.p className="text-center text-text-secondary text-sm mt-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          ✨ Complete this phase to earn <span className="text-accent-yellow font-bold">+10 XP</span>
        </motion.p>
      </div>
    </div>
  )
}

export default WonderPhase
