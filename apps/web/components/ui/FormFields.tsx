import { useId, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import styles from './TextField.module.css'

type FieldBase = {
  label: string
  hint?: ReactNode
  error?: string | null
}

function describedBy(id: string, hint: unknown, error: unknown): string | undefined {
  return [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined
}

function FieldFooter({ id, hint, error }: { id: string; hint?: ReactNode; error?: string | null }) {
  return (
    <>
      {hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </>
  )
}

export type SelectOption = { value: string; label: string }

type SelectFieldProps = FieldBase &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & { options: readonly SelectOption[] }

export function SelectField({ label, hint, error, options, className, ...rest }: SelectFieldProps) {
  const id = useId()
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <select
        id={id}
        className={`${styles.input} ${styles.select}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldFooter id={id} hint={hint} error={error} />
    </div>
  )
}

type TextAreaFieldProps = FieldBase & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>

export function TextAreaField({ label, hint, error, className, ...rest }: TextAreaFieldProps) {
  const id = useId()
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <textarea
        id={id}
        className={`${styles.input} ${styles.textarea}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...rest}
      />
      <FieldFooter id={id} hint={hint} error={error} />
    </div>
  )
}
