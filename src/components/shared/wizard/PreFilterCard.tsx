import { Lightbulb, MessageCircleWarning } from 'lucide-react'
import WizardCard from './WizardCard'

interface PreFilterCardProps {
  onSelectIdea: () => void
  onSelectIssue: () => void
}

function PreFilterCard({ onSelectIdea, onSelectIssue }: PreFilterCardProps) {
  return (
    <WizardCard>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-foreground leading-relaxed mb-8 text-center">
        What would you like to do?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={onSelectIdea}
          className="group flex flex-col items-center gap-4 p-8 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Lightbulb className="w-7 h-7 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-lg font-light text-foreground mb-1">I have an idea</p>
            <p className="text-sm text-muted-foreground">
              Propose a new application or process improvement
            </p>
          </div>
        </button>

        <button
          onClick={onSelectIssue}
          className="group flex flex-col items-center gap-4 p-8 rounded-xl border border-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <MessageCircleWarning className="w-7 h-7 text-amber-400" />
          </div>
          <div className="text-center">
            <p className="text-lg font-light text-foreground mb-1">I want to report an issue</p>
            <p className="text-sm text-muted-foreground">
              Report a bug or request a feature for an existing application
            </p>
          </div>
        </button>
      </div>
    </WizardCard>
  )
}

export default PreFilterCard
