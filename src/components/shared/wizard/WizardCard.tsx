import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface WizardCardProps {
  children: ReactNode
  className?: string
}

function WizardCard({ children, className }: WizardCardProps) {
  return (
    <section
      className={cn(
        'min-h-[calc(100vh-4rem)] flex flex-col justify-center px-4 sm:px-8 py-8 sm:py-16 max-w-3xl mx-auto w-full -mt-8',
        className,
      )}
    >
      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6 sm:p-10">
        {children}
      </div>
    </section>
  )
}

export default WizardCard
