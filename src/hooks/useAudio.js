import { useCallback, useRef } from 'react'
import audioManager from '../audio/AudioManager'
import useSessionStore from '../engine/sessionStore'

export function useAudio() {
  const audioEnabled = useSessionStore((s) => s.audioEnabled)
  const speakingRef = useRef(false)

  const speak = useCallback(async (text, options = {}) => {
    if (!audioEnabled) return
    speakingRef.current = true
    await audioManager.speak(text, options)
    speakingRef.current = false
  }, [audioEnabled])

  const stopSpeech = useCallback(() => {
    audioManager.stopSpeech()
    speakingRef.current = false
  }, [])

  const playSFX = useCallback((name) => {
    if (!audioEnabled) return
    audioManager.playSFX(name)
  }, [audioEnabled])

  return { speak, stopSpeech, playSFX, isSpeaking: speakingRef.current }
}

export default useAudio
