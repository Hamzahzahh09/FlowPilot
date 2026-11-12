import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import styles from './Button.module.css'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary'
export type ButtonSize = 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  /** Disables the button, sets aria-busy and shows a spinner. */
  pending?: boolean
  /** Label while pending, for example "Saving…". Defaults to the normal label. */
  pendingLabel?: ReactNode
}

/** Shared by Button and ButtonLink so both look identical. */
export function buttonClass(
  variant: ButtonVariant = 'secondary',
  size: ButtonSize = 'md',
  extra?: string,
): string {
  return [styles.button, styles[variant], size === 'lg' ? styles.lg : '', extra]
    .filter(Boolean)
    .join(' ')
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    icon,
    pending = false,
    pendingLabel,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass(variant, size, className)}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      {...rest}
    >
      {pending ? <Spinner /> : icon}
      <span>{pending && pendingLabel ? pendingLabel : children}</span>
    </button>
  )
})
