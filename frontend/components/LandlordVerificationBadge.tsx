import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ShieldCheck, Sparkles, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export type LandlordVerificationLevel =
  | 'unverified'
  | 'id_verified'
  | 'id_and_property_verified'
  | 'premium'

interface LandlordVerificationBadgeProps {
  level: LandlordVerificationLevel
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const badgeConfig: Record<LandlordVerificationLevel, {
  label: string
  className: string
  icon: React.ElementType
}> = {
  unverified: {
    label: 'Unverified',
    className: 'border-muted-foreground bg-muted text-muted-foreground',
    icon: Shield,
  },
  id_verified: {
    label: 'ID Verified',
    className: 'border-blue-300 bg-blue-100 text-blue-800',
    icon: ShieldCheck,
  },
  id_and_property_verified: {
    label: 'Landlord Verified',
    className: 'border-green-300 bg-green-100 text-green-800',
    icon: CheckCircle2,
  },
  premium: {
    label: 'Premium Verified',
    className: 'border-purple-300 bg-purple-100 text-purple-800',
    icon: Sparkles,
  },
}

const sizeClasses: Record<NonNullable<LandlordVerificationBadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

export function LandlordVerificationBadge({
  level,
  size = 'md',
  showIcon = true,
  className,
}: LandlordVerificationBadgeProps) {
  const config = badgeConfig[level]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-2 font-semibold uppercase tracking-wide',
        sizeClasses[size],
        config.className,
        className,
      )}
    >
      {showIcon ? <Icon className="h-4 w-4" aria-hidden /> : null}
      <span>{config.label}</span>
    </Badge>
  )
}
