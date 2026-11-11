import styles from './TabPills.module.css'

export interface TabItem {
  id: string
  label: string
}

interface TabPillsProps {
  items: readonly TabItem[]
  selectedId: string
  onSelect: (id: string) => void
  label: string
}

// Workflow switcher. Buttons with aria-pressed: simple, keyboard operable with Tab/Enter/Space.
export function TabPills({ items, selectedId, onSelect, label }: TabPillsProps) {
  return (
    <div role="group" aria-label={label} className={styles.pills}>
      {items.map((item) => {
        const selected = item.id === selectedId
        return (
          <button
            key={item.id}
            type="button"
            className={selected ? `${styles.pill} ${styles.selected}` : styles.pill}
            aria-pressed={selected}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
