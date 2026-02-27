// ============================================================================
// Issue Reporter — Annotation Canvas
// ============================================================================
// Drawing tools on cropped screenshot: freehand, arrows, rectangles, text.
// ============================================================================

import { useState, useRef, useCallback, useEffect } from 'react'
import { Pencil, Square, Type, Undo2, Check, X } from 'lucide-react'

interface AnnotationCanvasProps {
  imageBase64: string
  onComplete: (base64: string) => void
  onCancel: () => void
}

type Tool = 'draw' | 'rectangle' | 'text'

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ffffff']
const STROKE_WIDTHS = [2, 4, 6]

interface DrawPath {
  type: 'path'
  points: { x: number; y: number }[]
  color: string
  width: number
}

interface DrawRect {
  type: 'rect'
  x: number
  y: number
  w: number
  h: number
  color: string
  width: number
}

interface DrawText {
  type: 'text'
  x: number
  y: number
  text: string
  color: string
}

type DrawAction = DrawPath | DrawRect | DrawText

function AnnotationCanvas({ imageBase64, onComplete, onCancel }: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const [tool, setTool] = useState<Tool>('draw')
  const [color, setColor] = useState(COLORS[0]!)
  const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTHS[1]!)
  const [actions, setActions] = useState<DrawAction[]>([])
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[] | null>(null)
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null)
  const [rectCurrent, setRectCurrent] = useState<{ x: number; y: number } | null>(null)
  const [textInput, setTextInput] = useState<{ x: number; y: number; text: string } | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  // Load image and set canvas size
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      imageRef.current = img

      // Fit image within viewport
      const maxW = window.innerWidth - 100
      const maxH = window.innerHeight - 160
      const scale = Math.min(maxW / img.width, maxH / img.height, 1)
      setCanvasSize({
        width: img.width * scale,
        height: img.height * scale,
      })
    }
    img.src = imageBase64
  }, [imageBase64])

  const drawAction = useCallback((ctx: CanvasRenderingContext2D, action: DrawAction) => {
    if (action.type === 'path' && action.points.length > 1) {
      ctx.strokeStyle = action.color
      ctx.lineWidth = action.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(action.points[0]!.x, action.points[0]!.y)
      for (let i = 1; i < action.points.length; i++) {
        ctx.lineTo(action.points[i]!.x, action.points[i]!.y)
      }
      ctx.stroke()
    } else if (action.type === 'rect') {
      ctx.strokeStyle = action.color
      ctx.lineWidth = action.width
      ctx.strokeRect(action.x, action.y, action.w, action.h)
    } else if (action.type === 'text') {
      ctx.fillStyle = action.color
      ctx.font = 'bold 16px Inter, sans-serif'
      ctx.fillText(action.text, action.x, action.y)
    }
  }, [])

  // Render canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // Draw saved actions
    for (const action of actions) {
      drawAction(ctx, action)
    }

    // Draw current freehand path
    if (currentPath && currentPath.length > 1) {
      ctx.strokeStyle = color
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(currentPath[0]!.x, currentPath[0]!.y)
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i]!.x, currentPath[i]!.y)
      }
      ctx.stroke()
    }

    // Draw current rectangle
    if (rectStart && rectCurrent) {
      ctx.strokeStyle = color
      ctx.lineWidth = strokeWidth
      ctx.strokeRect(
        rectStart.x,
        rectStart.y,
        rectCurrent.x - rectStart.x,
        rectCurrent.y - rectStart.y,
      )
    }
  }, [actions, currentPath, rectStart, rectCurrent, color, strokeWidth, drawAction])

  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  const getCanvasCoords = (e: React.PointerEvent): { x: number; y: number } => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    const coords = getCanvasCoords(e)
    setIsDrawing(true)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

    if (tool === 'draw') {
      setCurrentPath([coords])
    } else if (tool === 'rectangle') {
      setRectStart(coords)
      setRectCurrent(coords)
    } else if (tool === 'text') {
      setTextInput({ x: coords.x, y: coords.y, text: '' })
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return
    const coords = getCanvasCoords(e)

    if (tool === 'draw' && currentPath) {
      setCurrentPath([...currentPath, coords])
    } else if (tool === 'rectangle') {
      setRectCurrent(coords)
    }
  }

  const handlePointerUp = () => {
    setIsDrawing(false)

    if (tool === 'draw' && currentPath && currentPath.length > 1) {
      setActions([...actions, { type: 'path', points: currentPath, color, width: strokeWidth }])
      setCurrentPath(null)
    } else if (tool === 'rectangle' && rectStart && rectCurrent) {
      setActions([
        ...actions,
        {
          type: 'rect',
          x: rectStart.x,
          y: rectStart.y,
          w: rectCurrent.x - rectStart.x,
          h: rectCurrent.y - rectStart.y,
          color,
          width: strokeWidth,
        },
      ])
      setRectStart(null)
      setRectCurrent(null)
    }
  }

  const handleTextSubmit = () => {
    if (textInput && textInput.text.trim()) {
      setActions([
        ...actions,
        { type: 'text', x: textInput.x, y: textInput.y, text: textInput.text, color },
      ])
    }
    setTextInput(null)
  }

  const handleUndo = () => {
    setActions(actions.slice(0, -1))
  }

  const handleComplete = () => {
    renderCanvas()
    const canvas = canvasRef.current
    if (!canvas) return
    const base64 = canvas.toDataURL('image/png')
    onComplete(base64)
  }

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  if (canvasSize.width === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 bg-card/90 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
        {/* Tools */}
        <div className="flex items-center gap-1">
          {(
            [
              { id: 'draw', icon: Pencil, label: 'Draw' },
              { id: 'rectangle', icon: Square, label: 'Rectangle' },
              { id: 'text', icon: Type, label: 'Text' },
            ] as const
          ).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              className={`p-2 rounded-lg transition-colors ${
                tool === id
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={label}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Colors */}
        <div className="flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                color === c ? 'border-white scale-125' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Stroke widths */}
        <div className="flex items-center gap-1">
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w}
              onClick={() => setStrokeWidth(w)}
              className={`p-1.5 rounded-lg transition-colors ${
                strokeWidth === w ? 'bg-primary/20' : 'hover:bg-muted'
              }`}
            >
              <div
                className="rounded-full bg-foreground"
                style={{ width: w * 2 + 4, height: w * 2 + 4 }}
              />
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Actions */}
        <button
          onClick={handleUndo}
          disabled={actions.length === 0}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border" />

        <button
          onClick={handleComplete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm"
        >
          <Check className="w-3.5 h-3.5" />
          Use Screenshot
        </button>
        <button
          onClick={onCancel}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="rounded-lg cursor-crosshair"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        {/* Text input overlay */}
        {textInput && (
          <input
            autoFocus
            value={textInput.text}
            onChange={(e) => setTextInput({ ...textInput, text: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTextSubmit()
              if (e.key === 'Escape') setTextInput(null)
            }}
            onBlur={handleTextSubmit}
            className="absolute bg-transparent text-foreground font-bold text-base outline-none border-b-2 border-primary"
            style={{
              left: textInput.x,
              top: textInput.y - 20,
              color: color,
              minWidth: 100,
            }}
          />
        )}
      </div>
    </div>
  )
}

export default AnnotationCanvas
