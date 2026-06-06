import { Howl, Howler } from 'howler'

class AudioManager {
  constructor() {
    this.enabled = true
    this.musicEnabled = true
    this.currentMusic = null
    this.voices = {}
    this.sfx = {}
    this._initSFX()
  }

  _initSFX() {
    // Sound effects via Web Audio API oscillators (no external files needed)
    this.sfxDefs = {
      correct: { freq: [523, 659, 784], type: 'sine', duration: 0.4 },
      wrong:   { freq: [300, 200],      type: 'sawtooth', duration: 0.3 },
      levelup: { freq: [523, 659, 784, 1047], type: 'sine', duration: 0.6 },
      badge:   { freq: [784, 1047, 1319], type: 'sine', duration: 0.8 },
      click:   { freq: [600], type: 'sine', duration: 0.08 },
      tick:    { freq: [800], type: 'sine', duration: 0.05 },
      whoosh:  { freq: [400, 200], type: 'sine', duration: 0.2 },
    }
  }

  _getAudioContext() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)()
    }
    return this._ctx
  }

  playSFX(name) {
    if (!this.enabled) return
    try {
      const ctx = this._getAudioContext()
      const def = this.sfxDefs[name]
      if (!def) return

      def.freq.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = def.type
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + def.duration)
        osc.start(ctx.currentTime + i * 0.1)
        osc.stop(ctx.currentTime + i * 0.1 + def.duration)
      })
    } catch (e) {
      console.warn('Audio playback failed:', e)
    }
  }

  speak(text, options = {}) {
    if (!this.enabled) return Promise.resolve()
    return new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return }
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = options.rate || 0.95
      utterance.pitch = options.pitch || 1.0
      utterance.volume = options.volume || 0.9
      utterance.onend = resolve
      utterance.onerror = resolve
      // Pick a nice voice if available
      const voices = window.speechSynthesis.getVoices()
      const preferred = voices.find(v => v.name.includes('Google') && v.lang === 'en-US')
        || voices.find(v => v.lang === 'en-US')
        || voices[0]
      if (preferred) utterance.voice = preferred
      window.speechSynthesis.speak(utterance)
    })
  }

  stopSpeech() {
    if (window.speechSynthesis) window.speechSynthesis.cancel()
  }

  setEnabled(val) { this.enabled = val }
  setMusicEnabled(val) { this.musicEnabled = val }
}

// Singleton
const audioManager = new AudioManager()

// Load voices async
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices()
  }
}

export default audioManager
