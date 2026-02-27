import { WebSocketServer, WebSocket } from 'ws'
import { buildSession } from './build-session.js'
import type { BuildEvent } from './build-session.js'

const PORT = 4100

const wss = new WebSocketServer({ port: PORT })

console.log(`Mock agent server listening on ws://localhost:${PORT}`)

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected')
  let buildTimer: ReturnType<typeof setTimeout> | null = null
  let eventIndex = 0
  let paused = false
  let stopped = false

  function send(data: Record<string, unknown>) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
    }
  }

  function playNextEvent() {
    if (stopped || eventIndex >= buildSession.length) return
    if (paused) return

    const event: BuildEvent = buildSession[eventIndex]!
    eventIndex++

    buildTimer = setTimeout(() => {
      if (stopped) return
      if (paused) {
        // Will resume from current index
        eventIndex--
        return
      }

      const timestamp = new Date().toISOString()

      if (event.status) {
        send({ type: 'status', status: event.status })
      }

      if (event.line) {
        send({ type: 'output', line: event.line, timestamp })
      }

      if (event.error) {
        send({ type: 'error', message: event.error.message, recoverable: event.error.recoverable })
      }

      if (event.complete) {
        send({ type: 'complete' })
        console.log('Build session complete')
        return
      }

      playNextEvent()
    }, event.delay)
  }

  ws.on('message', (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString()) as { type: string }

      switch (message.type) {
        case 'start-build':
          console.log('Build started')
          eventIndex = 0
          paused = false
          stopped = false
          playNextEvent()
          break

        case 'pause-build':
          console.log('Build paused')
          paused = true
          if (buildTimer) clearTimeout(buildTimer)
          send({ type: 'status', status: 'paused' })
          break

        case 'resume-build':
          console.log('Build resumed')
          paused = false
          send({ type: 'status', status: 'building' })
          playNextEvent()
          break

        case 'stop-build':
          console.log('Build stopped')
          stopped = true
          if (buildTimer) clearTimeout(buildTimer)
          send({ type: 'status', status: 'stopped' })
          break
      }
    } catch {
      // Ignore malformed messages
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected')
    stopped = true
    if (buildTimer) clearTimeout(buildTimer)
  })
})
