import type { ComponentType } from 'react'
import {
  BrainIcon,
  ForkIcon,
  HeartIcon,
  LeverIcon,
  ReportIcon,
  ScalpelIcon,
  SparkIcon,
  type IconProps,
} from '@/components/icons'
import type { NodeKind } from '@/lib/workflow/types'

/** One icon per node kind, shared by FlowNode, the node picker and the report. */
export const NODE_ICONS: Record<NodeKind, ComponentType<IconProps>> = {
  spark: SparkIcon,
  brain: BrainIcon,
  scalpel: ScalpelIcon,
  heart: HeartIcon,
  fork: ForkIcon,
  lever: LeverIcon,
  autopsy: ReportIcon,
}
