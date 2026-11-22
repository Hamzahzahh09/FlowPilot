'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import styles from './FeatureTour.module.css'

export interface TourStep {
  target: string // CSS selector (e.g. '[data-tour="node-picker"]')
  title: string
  content: ReactNode
  placement?: 'bottom' | 'top' | 'left' | 'right' | 'auto'
}

interface FeatureTourProps {
  steps: TourStep[]
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
  bottom: number
  right: number
}

export function FeatureTour({ steps, isOpen, onClose, onComplete }: FeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<Rect | null>(null)
  const [cardPos, setCardPos] = useState<{ top: number; left: number }>({ top: 100, left: 100 })

  const step = steps[currentStep]

  const updatePosition = useCallback(() => {
    if (!step) return
    const el = document.querySelector(step.target)
    if (!el) {
      // Fallback if target element is not found on screen: center in viewport
      const vw = typeof window !== 'undefined' ? window.innerWidth : 800
      const vh = typeof window !== 'undefined' ? window.innerHeight : 600
      setTargetRect({
        top: vh / 2 - 50,
        left: vw / 2 - 100,
        width: 200,
        height: 100,
        bottom: vh / 2 + 50,
        right: vw / 2 + 100,
      })
      setCardPos({
        top: Math.max(20, vh / 2 - 120),
        left: Math.max(20, vw / 2 - 220),
      })
      return
    }

    const rect = el.getBoundingClientRect()
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
      right: rect.right,
    })

    const cardWidth = 440
    const cardHeight = 220
    const padding = 16
    const vw = window.innerWidth
    const vh = window.innerHeight

    let top = 0
    let left = 0
    const placement = step.placement ?? 'auto'

    if (placement === 'bottom' || (placement === 'auto' && rect.bottom + cardHeight + padding < vh)) {
      top = rect.bottom + padding
      left = rect.left + (rect.width - cardWidth) / 2
    } else if (placement === 'top' || (placement === 'auto' && rect.top - cardHeight - padding > 0)) {
      top = rect.top - cardHeight - padding
      left = rect.left + (rect.width - cardWidth) / 2
    } else if (placement === 'right' || (placement === 'auto' && rect.right + cardWidth + padding < vw)) {
      top = rect.top + (rect.height - cardHeight) / 2
      left = rect.right + padding
    } else {
      top = rect.top + (rect.height - cardHeight) / 2
      left = rect.left - cardWidth - padding
    }

    // Clamp inside viewport
    left = Math.max(padding, Math.min(vw - cardWidth - padding, left))
    top = Math.max(padding, Math.min(vh - cardHeight - padding, top))

    setCardPos({ top, left })
  }, [step])

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      return
    }

    const timer = setTimeout(() => {
      updatePosition()
    }, 60)

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, currentStep, updatePosition])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight') {
        if (currentStep < steps.length - 1) {
          setCurrentStep((c) => c + 1)
        } else {
          onComplete?.()
          onClose()
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStep > 0) {
          setCurrentStep((c) => c - 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentStep, steps.length, onClose, onComplete])

  if (!isOpen || !step) return null

  const isLast = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLast) {
      onComplete?.()
      onClose()
    } else {
      setCurrentStep((c) => c + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((c) => c - 1)
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Feature Tour Guide">
      {/* SVG Mask: dims background outside the cutout without any blur inside */}
      <svg className={styles.maskSvg} aria-hidden="true" onClick={onClose}>
        <defs>
          <mask id="feature-tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 6}
                y={targetRect.top - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="14"
                ry="14"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(10, 10, 14, 0.78)"
          mask="url(#feature-tour-mask)"
        />
      </svg>

      {/* Crisp glowing accent border directly around the clear target element */}
      {targetRect && (
        <div
          className={styles.spotlightBorder}
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Popover Card */}
      <div
        className={styles.card}
        style={{
          top: cardPos.top,
          left: cardPos.left,
        }}
      >
        <div className={styles.header}>
          <span className={styles.badge}>
            Step {currentStep + 1} of {steps.length}
          </span>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close guide"
            title="Close guide"
          >
            <XIcon size={16} />
          </button>
        </div>

        <h3 className={styles.title}>{step.title}</h3>
        <p className={styles.description}>{step.content}</p>

        <div className={styles.footer}>
          <div className={styles.dots} aria-hidden="true">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`${styles.dot} ${idx === currentStep ? styles.dotActive : ''}`}
              />
            ))}
          </div>

          <div className={styles.nav}>
            <button type="button" className={styles.skipButton} onClick={onClose}>
              Skip tour
            </button>
            {currentStep > 0 && (
              <Button size="md" variant="secondary" onClick={handlePrev} icon={<ChevronLeftIcon size={14} />}>
                Back
              </Button>
            )}
            <Button
              size="md"
              variant="primary"
              onClick={handleNext}
              icon={!isLast ? <ChevronRightIcon size={14} /> : undefined}
            >
              {isLast ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
