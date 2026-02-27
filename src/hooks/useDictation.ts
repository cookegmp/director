import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  const w = window as unknown as Record<string, unknown>
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as SpeechRecognitionConstructor | null
}

interface UseDictationOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
}

interface UseDictationReturn {
  transcript: string
  interimText: string
  isListening: boolean
  isSupported: boolean
  error: string | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

function useDictation(options: UseDictationOptions = {}): UseDictationReturn {
  const { language = 'en-US', continuous = true, interimResults = true } = options

  const [transcript, setTranscript] = useState('')
  const [interimText, setInterimText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  // Tracks whether the user *wants* to be listening — used to auto-restart
  // when Chrome kills the session (silence timeout, network hiccup, etc.)
  const wantListeningRef = useRef(false)
  const restartTimerRef = useRef<number | null>(null)
  const createRecognitionRef = useRef<() => SpeechRecognitionInstance | null>(null)
  const isSupported = getSpeechRecognition() !== null

  const createRecognition = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()
    recognition.lang = language
    recognition.continuous = continuous
    recognition.interimResults = interimResults

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = ''
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result?.[0]) {
          if (result.isFinal) {
            finalText += result[0].transcript
          } else {
            interim += result[0].transcript
          }
        }
      }

      if (finalText) {
        setTranscript((prev) => prev + finalText)
        setInterimText('')
      } else {
        setInterimText(interim)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // 'aborted' fires when we call .abort() ourselves — not a real error
      if (event.error === 'aborted') return

      // 'no-speech' is not fatal in continuous mode — let onend restart
      if (event.error === 'no-speech') return

      const messages: Record<string, string> = {
        'not-allowed': 'Microphone access was denied',
        network: 'Network error during recognition',
      }
      setError(messages[event.error] ?? `Speech error: ${event.error}`)
      wantListeningRef.current = false
      setIsListening(false)
    }

    recognition.onend = () => {
      recognitionRef.current = null

      // Auto-restart if the user hasn't explicitly stopped.
      // Small delay prevents tight restart loops if the engine keeps dying.
      if (wantListeningRef.current) {
        restartTimerRef.current = window.setTimeout(() => {
          if (!wantListeningRef.current) return
          try {
            const next = createRecognitionRef.current?.()
            if (next) {
              recognitionRef.current = next
              next.start()
              return // stay in listening state
            }
          } catch {
            // Fall through to stop
          }
          setIsListening(false)
          setInterimText('')
        }, 100)
        return
      }

      setIsListening(false)
      setInterimText('')
    }

    return recognition
  }, [language, continuous, interimResults])

  useLayoutEffect(() => {
    createRecognitionRef.current = createRecognition
  })

  const startListening = useCallback(() => {
    if (!getSpeechRecognition()) {
      setError('Speech recognition is not supported in this browser')
      return
    }

    // Stop any existing session
    if (recognitionRef.current) {
      recognitionRef.current.abort()
      recognitionRef.current = null
    }

    setError(null)
    setInterimText('')
    wantListeningRef.current = true

    const recognition = createRecognition()
    if (!recognition) return

    recognitionRef.current = recognition

    try {
      recognition.start()
      setIsListening(true)
    } catch {
      wantListeningRef.current = false
      setError('Failed to start speech recognition')
      setIsListening(false)
    }
  }, [createRecognition])

  const stopListening = useCallback(() => {
    wantListeningRef.current = false
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimText('')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wantListeningRef.current = false
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  return {
    transcript,
    interimText,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}

export default useDictation
