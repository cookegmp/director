interface WizardStepDotsProps {
  totalSteps: number
  currentStep: number
}

function WizardStepDots({ totalSteps, currentStep }: WizardStepDotsProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i <= currentStep ? 'bg-primary' : 'bg-muted'
          } ${i === currentStep ? 'scale-125' : ''}`}
        />
      ))}
    </div>
  )
}

export default WizardStepDots
