'use client';

/**
 * Onboarding Progress Indicator
 *
 * Shows the current step in the onboarding process
 */

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedSteps?: number[];
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  completedSteps = [],
}: ProgressIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full mb-8">
      {/* Step counter */}
      <div className="text-sm text-gray-600 mb-2 text-center">
        Step {currentStep} of {totalSteps}
      </div>

      {/* Progress bar */}
      <div className="relative">
        {/* Background bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          {/* Progress fill */}
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-1">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step) || step < currentStep;
            const isCurrent = step === currentStep;

            return (
              <div
                key={step}
                className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium
                  transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isCurrent
                      ? 'bg-white border-blue-600 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-400'
                  }
                `}
              >
                {isCompleted && step !== currentStep ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step labels (optional) */}
      <div className="flex justify-between mt-4 text-xs text-gray-500">
        <span className={currentStep === 1 ? 'text-blue-600 font-medium' : ''}>
          Organization
        </span>
        <span className={currentStep === 2 ? 'text-blue-600 font-medium' : ''}>
          Profile
        </span>
        <span className={currentStep === 3 ? 'text-blue-600 font-medium' : ''}>
          KYC
        </span>
        <span className={currentStep === 4 ? 'text-blue-600 font-medium' : ''}>
          Payout
        </span>
      </div>
    </div>
  );
}
