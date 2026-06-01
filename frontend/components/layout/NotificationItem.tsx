"use client"

import { Bell, AlertCircle, CreditCard, FileText, ShieldAlert, RefreshCw } from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  deal_update: FileText,
  payment_due: CreditCard,
  kyc_update: ShieldAlert,
  dispute_update: AlertCircle,
  reward_validated: RefreshCw,
  inspection_assigned: Bell,
}

type NotificationItemProps = {
  id: string
  category: string
  title: string
  body: string
  createdAt: string
  read: boolean
}

export function NotificationItemRow({ category, title, body, createdAt, read }: NotificationItemProps) {
  const Icon = iconMap[category] ?? Bell
  const timeAgo = getTimeAgo(new Date(createdAt))

  return (
    <div className={`flex gap-3 p-3 border-b-2 border-foreground/10 transition-colors ${!read ? "bg-primary/5" : ""}`}>
      <div className="mt-0.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!read ? "font-bold" : "font-medium"} truncate`}>{title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{body}</p>
        <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo}</p>
      </div>
      {!read && <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
