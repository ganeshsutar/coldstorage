import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  label: string
  description?: string
}

interface WizardStepIndicatorProps {
  currentStep: number
  steps: Step[]
}

export function WizardStepIndicator({
  currentStep,
  steps,
}: WizardStepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < currentStep
        const isCurrent = stepNumber === currentStep

        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex items-center justify-center size-10 rounded-full border-2 transition-colors",
                  isCompleted &&
                    "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isCompleted && !isCurrent && "border-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="size-5" />
                ) : (
                  <span className="text-sm font-semibold">{stepNumber}</span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-sm font-medium text-center",
                  isCurrent && "text-foreground",
                  !isCurrent && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
              {step.description && (
                <span className="text-xs text-muted-foreground text-center max-w-[100px]">
                  {step.description}
                </span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4 min-w-[60px]",
                  isCompleted ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
