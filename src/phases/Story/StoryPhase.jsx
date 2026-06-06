import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSessionStore from '../../engine/sessionStore'
import useAudio from '../../hooks/useAudio'
import CharacterAvatar from '../../components/CharacterAvatar'

const MODULE_STORIES = {
  A: [
    {
      title: 'The Treasure Map Mystery',
      character: 'john',
      text: "John unrolled the ancient map. \"I need to count EVERY step,\" he said. The treasure was 1,234 steps north — but he had to go that distance 4 times in different directions!",
      narration: "John unrolled the ancient map. I need to count every step, he said. The treasure was 1,234 steps north — but he had to go that distance 4 times in different directions!",
      keyTerm: 'multiplication',
      visual: '🗺️',
      color: '#E94560',
    },
    {
      title: 'The Standard Algorithm Weapon',
      character: 'sarah',
      text: "\"I know a superpower called the Standard Algorithm!\" Sarah explained. \"Break the bigger number apart. Multiply each digit separately, then add the results together.\"",
      narration: "Sarah explained — I know a superpower called the Standard Algorithm! Break the bigger number apart. Multiply each digit separately, then add the results together.",
      keyTerm: 'standard algorithm',
      visual: '⚡',
      color: '#00D4AA',
    },
    {
      title: 'Partial Products Power',
      character: 'mike',
      text: "Mike drew it out: \"Think of 1,234 × 4 as: 1000×4 + 200×4 + 30×4 + 4×4. That's 4,000 + 800 + 120 + 16 = 4,936!\" The team cheered!",
      narration: "Mike drew it out. Think of 1,234 times 4 as 1000 times 4, plus 200 times 4, plus 30 times 4, plus 4 times 4. That's 4,000 plus 800 plus 120 plus 16, which equals 4,936! The team cheered!",
      keyTerm: 'partial products',
      visual: '🧮',
      color: '#FFD700',
    },
    {
      title: 'Carrying the Numbers',
      character: 'john',
      text: "\"When digits add up to 10 or more, we CARRY,\" John explained. He wrote the carry numbers above each column. \"This is why we never lose a single step of the treasure path!\"",
      narration: "When digits add up to 10 or more, we carry, John explained. He wrote the carry numbers above each column. This is why we never lose a single step of the treasure path!",
      keyTerm: 'carrying',
      visual: '🎒',
      color: '#E94560',
    },
    {
      title: 'The Treasure Revealed!',
      character: 'sarah',
      text: "After multiplying 1,234 × 4 using the standard algorithm, they got 4,936. They walked exactly 4,936 steps — and found the chest! \"Math WORKS!\" Sarah shouted, arms raised!",
      narration: "After multiplying 1,234 times 4 using the standard algorithm, they got 4,936. They walked exactly 4,936 steps — and found the chest! Math works! Sarah shouted, arms raised!",
      keyTerm: 'product',
      visual: '🏆',
      color: '#FFD700',
    },
  ],
  B: [
    {
      title: "Sarah's Robot Factory",
      character: 'sarah',
      text: "Sarah had 2,496 circuits and 12 robots. \"Each robot needs the EXACT same number,\" she said. \"If I get it wrong, the whole factory explodes!\" She needed division.",
      narration: "Sarah had 2,496 circuits and 12 robots. Each robot needs the exact same number, she said. If I get it wrong, the whole factory explodes! She needed division.",
      keyTerm: 'division',
      visual: '🤖',
      color: '#00D4AA',
    },
    {
      title: 'The Long Division Blueprint',
      character: 'mike',
      text: "Mike drew the long division frame: dividend inside, divisor outside. \"Divide → Multiply → Subtract → Bring Down. DMSB — Don't Make Silly Blunders!\" he joked.",
      narration: "Mike drew the long division frame. Dividend inside, divisor outside. Divide, Multiply, Subtract, Bring Down. D-M-S-B — Don't Make Silly Blunders! he joked.",
      keyTerm: 'long division',
      visual: '📐',
      color: '#E94560',
    },
    {
      title: 'Step by Step',
      character: 'john',
      text: "2,496 ÷ 12: How many times does 12 go into 24? Twice! 2 × 12 = 24. Subtract: 24 − 24 = 0. Bring down 9. How many times does 12 go into 9? Zero!",
      narration: "2,496 divided by 12. How many times does 12 go into 24? Twice! 2 times 12 equals 24. Subtract: 24 minus 24 equals 0. Bring down 9. How many times does 12 go into 9? Zero!",
      keyTerm: 'quotient',
      visual: '🔢',
      color: '#FFD700',
    },
    {
      title: 'Remainders Are Clues',
      character: 'sarah',
      text: "\"Sometimes numbers don't divide perfectly,\" Sarah said. \"The remainder is what's LEFT OVER — it's not a mistake, it's part of the answer!\" She showed 13 ÷ 4 = 3 R1.",
      narration: "Sometimes numbers don't divide perfectly, Sarah said. The remainder is what's left over — it's not a mistake, it's part of the answer! She showed 13 divided by 4 equals 3 remainder 1.",
      keyTerm: 'remainder',
      visual: '🎁',
      color: '#00D4AA',
    },
    {
      title: 'Factory Saved!',
      character: 'mike',
      text: "2,496 ÷ 12 = 208. Each robot gets exactly 208 circuits. \"The factory is running perfectly!\" Mike high-fived Sarah. Division had saved the day!",
      narration: "2,496 divided by 12 equals 208. Each robot gets exactly 208 circuits. The factory is running perfectly! Mike high-fived Sarah. Division had saved the day!",
      keyTerm: 'dividend',
      visual: '🏭',
      color: '#E94560',
    },
  ],
  C: [
    {
      title: "Mike's Score Confusion",
      character: 'mike',
      text: "The scoreboard showed: (3 + 5) × 4 − 2. Three calculators gave three answers: 28, 30, and 26! \"Which is RIGHT?\" Mike was confused. \"Math can't have three answers!\"",
      narration: "The scoreboard showed 3 plus 5, times 4, minus 2. Three calculators gave three answers: 28, 30, and 26! Which is RIGHT? Mike was confused. Math can't have three answers!",
      keyTerm: 'order of operations',
      visual: '😵',
      color: '#FFD700',
    },
    {
      title: 'BODMAS to the Rescue',
      character: 'sarah',
      text: "\"There's a rule everyone follows!\" Sarah said. \"BODMAS: Brackets, Orders, Division, Multiplication, Addition, Subtraction. In America it's PEMDAS — same idea, different name!\"",
      narration: "There's a rule everyone follows! Sarah said. BODMAS: Brackets, Orders, Division, Multiplication, Addition, Subtraction. In America it's PEMDAS — same idea, different name!",
      keyTerm: 'BODMAS / PEMDAS',
      visual: '📋',
      color: '#00D4AA',
    },
    {
      title: 'Brackets Rule the World',
      character: 'john',
      text: "\"Brackets go FIRST — always!\" John highlighted (3 + 5). \"So 3 + 5 = 8. Now the expression becomes 8 × 4 − 2. Next: multiplication!\"",
      narration: "Brackets go first — always! John highlighted 3 plus 5. So 3 plus 5 equals 8. Now the expression becomes 8 times 4 minus 2. Next: multiplication!",
      keyTerm: 'brackets',
      visual: '🔍',
      color: '#E94560',
    },
    {
      title: 'Multiply Before Add',
      character: 'mike',
      text: "\"8 × 4 = 32. Now: 32 − 2 = 30!\" Mike declared. The correct answer was 30! \"One calculator was RIGHT. The others skipped the order!\" Mike's score was confirmed.",
      narration: "8 times 4 equals 32. Now: 32 minus 2 equals 30! Mike declared. The correct answer was 30! One calculator was right. The others skipped the order! Mike's score was confirmed.",
      keyTerm: 'multiplication',
      visual: '✅',
      color: '#FFD700',
    },
    {
      title: 'Nested Brackets Unlocked',
      character: 'sarah',
      text: "\"Ready for the next level?\" Sarah showed: [{(2+3) × 4} − 6]. \"Inner brackets first, then middle, then outer. Like peeling an onion!\" The champions unlocked level 2!",
      narration: "Ready for the next level? Sarah showed a complex nested expression. Inner brackets first, then middle, then outer. Like peeling an onion! The champions unlocked level 2!",
      keyTerm: 'nested brackets',
      visual: '🧅',
      color: '#00D4AA',
    },
  ],
  D: [
    {
      title: 'The Pattern Kingdom Gates',
      character: 'john',
      text: "John stood before the castle gates. A message appeared: \"The gate opens only if you can WRITE the rule AND predict what comes next: 3, 7, 11, 15...\"",
      narration: "John stood before the castle gates. A message appeared: The gate opens only if you can write the rule AND predict what comes next: 3, 7, 11, 15...",
      keyTerm: 'pattern',
      visual: '🏰',
      color: '#9B59B6',
    },
    {
      title: 'Arithmetic Sequences',
      character: 'sarah',
      text: "\"Each number increases by 4!\" Sarah spotted it. \"The RULE is +4. We can WRITE it as: start at 3, add 4 each time. So the next number is 15 + 4 = 19!\"",
      narration: "Each number increases by 4! Sarah spotted it. The rule is plus 4. We can write it as: start at 3, add 4 each time. So the next number is 15 plus 4, which equals 19!",
      keyTerm: 'arithmetic sequence',
      visual: '📈',
      color: '#00D4AA',
    },
    {
      title: 'Writing Expressions',
      character: 'mike',
      text: "\"Expressions turn WORDS into MATH,\" Mike explained. '\"John has x stickers, gets 5 more\" → x + 5. \"Triple the score\" → 3 × s. The castle doors began to glow!",
      narration: "Expressions turn words into math, Mike explained. John has x stickers, gets 5 more, becomes x plus 5. Triple the score becomes 3 times s. The castle doors began to glow!",
      keyTerm: 'expression',
      visual: '📝',
      color: '#E94560',
    },
    {
      title: 'Two Patterns, One Graph',
      character: 'john',
      text: "Inside the castle, two sequences appeared side by side: (0,0), (1,2), (2,4), (3,6)... \"Plot these as ordered pairs on a graph!\" The pattern formed a straight line.",
      narration: "Inside the castle, two sequences appeared side by side: 0,0 then 1,2 then 2,4 then 3,6. Plot these as ordered pairs on a graph! The pattern formed a straight line.",
      keyTerm: 'ordered pairs',
      visual: '📊',
      color: '#FFD700',
    },
    {
      title: 'The Kingdom Unlocked!',
      character: 'sarah',
      text: "The gate swung open! \"You identified the rule, wrote the expression, and graphed the pattern!\" Sarah cheered. \"You are now official Pattern Knights of the Kingdom!\"",
      narration: "The gate swung open! You identified the rule, wrote the expression, and graphed the pattern! Sarah cheered. You are now official Pattern Knights of the Kingdom!",
      keyTerm: 'pattern rule',
      visual: '⚔️',
      color: '#9B59B6',
    },
  ],
}

function StoryPhase() {
  const { moduleId, advancePhase, awardXP } = useSessionStore()
  const { speak, stopSpeech, playSFX } = useAudio()
  const [panelIndex, setPanelIndex] = useState(0)
  const [charMood, setCharMood] = useState('idle')
  const [canAdvance, setCanAdvance] = useState(false)
  const panels = MODULE_STORIES[moduleId] || MODULE_STORIES.A
  const panel = panels[panelIndex]

  const loadPanel = async (index) => {
    const p = panels[index]
    setCharMood('thinking')
    setCanAdvance(false)
    stopSpeech()
    playSFX('whoosh')

    // Safety: allow advance after 3s even if narration not done
    const timer = setTimeout(() => setCanAdvance(true), 3000)
    await speak(p.narration, { rate: 0.93 })
    clearTimeout(timer)
    setCharMood('happy')
    setCanAdvance(true)
  }

  useEffect(() => {
    loadPanel(0)
    return () => stopSpeech()
  }, [])

  const handleNext = () => {
    if (!canAdvance) return
    if (panelIndex < panels.length - 1) {
      const next = panelIndex + 1
      setPanelIndex(next)
      loadPanel(next)
    } else {
      stopSpeech()
      awardXP(15)
      playSFX('levelup')
      advancePhase()
    }
  }

  const handleBack = () => {
    if (panelIndex > 0) {
      const prev = panelIndex - 1
      setPanelIndex(prev)
      loadPanel(prev)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Phase badge */}
        <motion.div className="flex items-center justify-center mb-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
            style={{ background: '#00D4AA15', border: '1px solid #00D4AA50', color: '#00D4AA' }}>
            📖 Phase 2 · Story — Panel {panelIndex + 1} of {panels.length}
          </span>
        </motion.div>

        {/* Panel dots */}
        <div className="flex justify-center gap-2 mb-6">
          {panels.map((_, i) => (
            <motion.div key={i}
              className="rounded-full transition-all"
              style={{
                width: i === panelIndex ? 24 : 8,
                height: 8,
                background: i < panelIndex ? '#00D4AA' : i === panelIndex ? '#E94560' : '#2A3A5C',
              }}
              layout
            />
          ))}
        </div>

        {/* Story card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={panelIndex}
            className="glass-card p-8 md:p-10"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ borderColor: `${panel.color}30` }}
          >
            {/* Visual */}
            <motion.div className="text-6xl text-center mb-4"
              animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              {panel.visual}
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-4" style={{ color: panel.color, fontFamily: 'Space Grotesk' }}>
              {panel.title}
            </h2>

            {/* Key term chip */}
            <div className="flex justify-center mb-5">
              <span className="text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider"
                style={{ background: `${panel.color}20`, color: panel.color, border: `1px solid ${panel.color}40` }}>
                💡 Key Term: {panel.keyTerm}
              </span>
            </div>

            {/* Story text */}
            <p className="text-text-secondary text-lg leading-relaxed text-center mb-8">
              {panel.text}
            </p>

            {/* Character */}
            <div className="flex justify-center mb-6">
              <CharacterAvatar character={panel.character} mood={charMood} size="lg" speaking={!canAdvance} />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleBack}
                disabled={panelIndex === 0}
                className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Back
              </button>

              <span className="text-text-secondary text-sm">
                {panelIndex + 1} / {panels.length}
              </span>

              <motion.button
                onClick={handleNext}
                disabled={!canAdvance}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={canAdvance ? { scale: 1.03 } : {}}
                whileTap={canAdvance ? { scale: 0.97 } : {}}
              >
                {panelIndex === panels.length - 1 ? 'Start Simulating! 🔬' : 'Next →'}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.p className="text-center text-text-secondary text-sm mt-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          ✨ Complete all panels to earn <span className="text-accent-yellow font-bold">+15 XP</span>
        </motion.p>
      </div>
    </div>
  )
}

export default StoryPhase
