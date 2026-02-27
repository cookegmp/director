import { useState, useRef, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import type { RawOutputLine } from '@/types'

interface RawOutputPanelProps {
  lines: RawOutputLine[]
  highlightIndex?: number
}

function colorize(text: string): React.ReactElement {
  // Simple regex-based coloring
  if (/error|fail|ERR!/i.test(text)) {
    return <span className="text-red-400">{text}</span>
  }
  if (/pass|success|complete|resolved/i.test(text)) {
    return <span className="text-green-400">{text}</span>
  }
  if (/src\/|\.tsx?|\.jsx?|\/\w+\//i.test(text)) {
    return <span className="text-blue-400">{text}</span>
  }
  if (/warn/i.test(text)) {
    return <span className="text-amber-400">{text}</span>
  }
  return <span className="text-foreground/60">{text}</span>
}

function RawOutputPanel({ lines, highlightIndex }: RawOutputPanelProps) {
  const [collapsed, setCollapsed] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to highlighted line
  useEffect(() => {
    if (highlightIndex !== undefined && scrollRef.current && !collapsed) {
      const lineElement = scrollRef.current.children[highlightIndex] as HTMLElement | undefined
      lineElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlightIndex, collapsed])

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full px-5 py-3"
      >
        <ChevronRight
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            !collapsed ? 'rotate-90' : ''
          }`}
        />
        <span className="text-sm font-light text-foreground">Technical View</span>
        <span className="text-xs text-muted-foreground ml-auto">{lines.length} lines</span>
      </button>

      {!collapsed && (
        <div
          ref={scrollRef}
          className="max-h-[300px] overflow-y-auto feed-scroll px-5 pb-4 border-t border-border pt-3"
        >
          {lines.length === 0 ? (
            <p className="text-xs text-muted-foreground">No output yet.</p>
          ) : (
            lines.map((line) => (
              <div
                key={line.index}
                className={`raw-output-line px-2 py-0.5 rounded ${
                  line.index === highlightIndex ? 'bg-primary/10 border-l-2 border-primary' : ''
                }`}
              >
                <span className="text-muted-foreground/40 mr-3 select-none inline-block w-6 text-right">
                  {line.index + 1}
                </span>
                {colorize(line.content)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default RawOutputPanel
