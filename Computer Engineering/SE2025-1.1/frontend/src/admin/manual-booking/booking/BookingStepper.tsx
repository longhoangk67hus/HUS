import React from 'react'
import type { BookingStep } from './bookingConstants'
import './BookingStepper.css'

interface BookingStepperProps {
  currentStep: BookingStep
  onStepClick?: (step: BookingStep) => void
}

const STEP_ORDER: BookingStep[] = [
  'select-movie',
  'select-date',
  'select-theater',
  'select-showtime',
  'select-seats',
  'customer-info',
  'confirm',
  'payment',
]

const STEP_LABELS: Record<BookingStep, string> = {
  'select-movie': '1. Phim',
  'select-date': '2. Ngày',
  'select-theater': '3. Rạp',
  'select-showtime': '4. Suất Chiếu',
  'select-seats': '5. Ghế',
  'customer-info': '6. Khách Hàng',
  'confirm': '7. Xác Nhận',
  'payment': '8. Thanh Toán',
}

const BookingStepper: React.FC<BookingStepperProps> = ({ currentStep, onStepClick }) => {
  const currentStepIndex = STEP_ORDER.indexOf(currentStep)

  return (
    <div className="booking-stepper">
      <div className="stepper-container">
        {STEP_ORDER.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isUpcoming = index > currentStepIndex

          return (
            <React.Fragment key={step}>
              {/* Step Circle */}
              <div
                className={`stepper-step ${isCurrent ? 'current' : ''} ${
                  isCompleted ? 'completed' : ''
                } ${isUpcoming ? 'upcoming' : ''}`}
                onClick={() => onStepClick?.(step)}
                title={STEP_LABELS[step]}
              >
                {isCompleted ? (
                  <span className="stepper-icon">✓</span>
                ) : (
                  <span className="stepper-number">{index + 1}</span>
                )}
              </div>

              {/* Connector Line (except for last step) */}
              {index < STEP_ORDER.length - 1 && (
                <div
                  className={`stepper-connector ${
                    isCompleted ? 'completed' : ''
                  }`}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Step Name */}
      <div className="stepper-label">{STEP_LABELS[currentStep]}</div>
    </div>
  )
}

export default BookingStepper
