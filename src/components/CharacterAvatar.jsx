import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CHARACTERS = {
  john: { emoji: '🧑‍🚀', name: 'John', color: '#E94560', bg: '#E9456020' },
  sarah: { emoji: '👩‍💻', name: 'Sarah', color: '#00D4AA', bg: '#00D4AA20' },
  mike: { emoji: '🏃‍♂️', name: 'Mike', color: '#FFD700', bg: '#FFD70020' },
}

const MOODS = {
  idle:      { scale: [1, 1.03, 1],      rotate: [0, 1, -1, 0],  y: [0, -4, 0] },
  happy:     { scale: [1, 1.15, 1],      rotate: [0, -5, 5, 0],  y: [0, -10, 0] },
  thinking:  { scale: [1, 1, 1],         rotate: [0, -3, 0],      y: [0, -2, 0] },
  celebrate: { scale: [1, 1.2, 0.9, 1.1, 1], rotate: [0, -8, 8, -4, 0], y: [0, -15, 0, -10, 0] },
  sad:       { scale: [1, 0.95, 1],      rotate: [0, 2, -2, 0],   y: [0, 2, 0] },
}

function CharacterAvatar({ character = 'john', mood = 'idle', size = 'md', showName = true, speaking = false }) {
  const char = CHARACTERS[character] || CHARACTERS.john
  const anim = MOODS[mood] || MOODS.idle
  const sizes = { sm: 48, md: 72, lg: 96, xl: 128 }
  const px = sizes[size] || 72
  const fontSize = px * 0.5

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div className="relative">
        {/* Speaking indicator */}
        <AnimatePresence>
          {speaking && (
            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
            >
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-full"
                  style={{ background: char.color, height: 8 }}
                  animate={{ height: [8, 18, 8] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar circle */}
        <motion.div
          className="rounded-full flex items-center justify-center cursor-default"
          style={{
            width: px, height: px,
            background: `radial-gradient(circle at 30% 30%, ${char.bg}, ${char.bg.replace('20', '40')})`,
            border: `3px solid ${char.color}`,
            boxShadow: `0 0 20px ${char.color}40`,
            fontSize: fontSize,
          }}
          animate={anim}
          transition={{ duration: mood === 'celebrate' ? 0.8 : 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {char.emoji}
        </motion.div>

        {/* Glow ring when celebrating */}
        {mood === 'celebrate' && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `3px solid ${char.color}` }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>

      {showName && (
        <span className="text-xs font-semibold" style={{ color: char.color, fontFamily: 'Space Grotesk' }}>
          {char.name}
        </span>
      )}
    </div>
  )
}

export default CharacterAvatar
