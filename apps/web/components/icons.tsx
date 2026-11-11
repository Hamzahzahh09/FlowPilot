import type { ReactNode, SVGProps } from 'react'

// Inline SVG icons: 24px grid, 1.75 stroke, round caps and joins.
// Decorative by default (aria-hidden); the surrounding element carries the name.

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number }

function Svg({ size = 24, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export function LogoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
      <path d="M10 6.5h2.5a4 4 0 0 1 4 4V14" />
    </Svg>
  )
}

export function PlayIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 5.5v13l10-6.5z" />
    </Svg>
  )
}

export function ResetIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 12a8 8 0 1 0 2.4-5.7" />
      <path d="M4 4v4h4" />
    </Svg>
  )
}

/* App and navigation icons */

export function WorkflowsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="4" width="6" height="6" rx="2" />
      <rect x="15" y="4" width="6" height="6" rx="2" />
      <rect x="9" y="15" width="6" height="6" rx="2" />
      <path d="M9 7h6" />
      <path d="M6 10v2a3 3 0 0 0 3 3" />
      <path d="M18 10v2a3 3 0 0 1-3 3" />
    </Svg>
  )
}

export function RunsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Svg>
  )
}

export function RunnerIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
      <path d="m8 10 2.5 2L8 14" />
      <path d="M13 14h3" />
    </Svg>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h9" />
      <path d="M17 7h3" />
      <circle cx="15" cy="7" r="2" />
      <path d="M4 17h3" />
      <path d="M11 17h9" />
      <circle cx="9" cy="17" r="2" />
    </Svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Svg>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  )
}

export function CopyIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </Svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Svg>
  )
}

/* Node icons */

export function SparkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13 3 5.5 13.5H11L10 21l7.5-10.5H12z" />
    </Svg>
  )
}

export function BrainIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5.5A3 3 0 0 0 6.5 7a3 3 0 0 0-2 4.6 3 3 0 0 0 1.2 4.8A3 3 0 0 0 12 18.5z" />
      <path d="M12 5.5A3 3 0 0 1 17.5 7a3 3 0 0 1 2 4.6 3 3 0 0 1-1.2 4.8A3 3 0 0 1 12 18.5" />
      <path d="M12 5.5v13" />
      <path d="M8.5 10.5a2 2 0 0 0 2 1.5" />
      <path d="M15.5 13.5a2 2 0 0 0-2-1.5" />
    </Svg>
  )
}

export function ScalpelIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 20l6.5-6.5" />
      <path d="M10.5 13.5 18 6a2 2 0 0 1 2.5 2.5L13.5 16z" />
    </Svg>
  )
}

export function HeartIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 20s-7.5-4.5-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.5 12 20 12 20z" />
      <path d="M7.5 12.5h2.5l1-2 2 4 1-2h2.5" />
    </Svg>
  )
}

export function LeverIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="15" width="14" height="5" rx="2.5" />
      <path d="M12 15 15.5 6.5" />
      <circle cx="16" cy="5" r="1.75" />
    </Svg>
  )
}

export function ReportIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="4" width="14" height="17" rx="3" />
      <path d="M9.5 4V3h5v1" />
      <path d="M9 10h6" />
      <path d="M9 13.5h6" />
      <path d="M9 17h3.5" />
    </Svg>
  )
}
