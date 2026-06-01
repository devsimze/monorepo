'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Share2, Users, Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DashboardHeader } from '@/components/dashboard-header'
import { ReferralShareCard } from '@/components/ReferralShareCard'
import { apiGet } from '@/lib/apiClient'
import { toast } from 'sonner'

interface ReferralStats {
  code: string
  referralLink: string
  totalReferred: number
  pendingRewards: number
  appliedRewards: number
  totalRewardAmountNgn: number
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiGet<{ success: boolean; data: ReferralStats }>(
          '/api/v1/tenant/referral',
        )
        setStats(response.data)
      } catch (error) {
        toast.error('Failed to load referral stats')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleCopyCode = async () => {
    if (!stats) return

    try {
      await navigator.clipboard.writeText(stats.code)
      setCopied(true)
      toast.success('Code copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

  const handleCopyLink = async () => {
    if (!stats) return

    try {
      await navigator.clipboard.writeText(stats.referralLink)
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-foreground" />
          </div>
        </main>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container max-w-4xl mx-auto px-4 py-8">
          <Card className="border-2 border-border p-8 text-center">
            <p className="text-muted-foreground">Failed to load referral program</p>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Referral Programme</h1>
          <p className="text-muted-foreground mt-2">
            Invite friends and earn ₦5,000 per successful referral
          </p>
        </div>

        {/* Your Referral Code */}
        <Card className="border-2 border-foreground p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Your Referral Code</h2>

          <div className="space-y-4">
            {/* Code Display */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="bg-muted border-2 border-border rounded-lg p-4 font-mono text-lg font-bold text-foreground">
                  {stats.code}
                </div>
              </div>
              <Button
                onClick={handleCopyCode}
                variant="outline"
                size="lg"
                className="border-2 border-border h-16 w-16"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>

            {/* Shareable Link */}
            <div>
              <p className="text-sm font-bold text-muted-foreground mb-2">Shareable Link</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={stats.referralLink}
                    readOnly
                    className="w-full bg-muted border-2 border-border rounded-lg p-3 font-mono text-sm text-foreground focus:outline-none"
                  />
                </div>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="lg"
                  className="border-2 border-border h-12 px-4"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Share Card */}
        <ReferralShareCard referralCode={stats.code} referralLink={stats.referralLink} />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="border-2 border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-foreground" />
              <span className="text-xs font-bold text-muted-foreground">Total Referred</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalReferred}</p>
          </Card>

          <Card className="border-2 border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="text-xs font-bold text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.pendingRewards}</p>
          </Card>

          <Card className="border-2 border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-xs font-bold text-muted-foreground">Applied</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.appliedRewards}</p>
          </Card>

          <Card className="border-2 border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-muted-foreground">Total Earned</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ₦{(stats.totalRewardAmountNgn / 1000).toFixed(0)}k
            </p>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="border-2 border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">How It Works</h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-foreground font-bold text-foreground">
                  1
                </div>
              </div>
              <div>
                <p className="font-bold text-foreground">Share your code or link</p>
                <p className="text-sm text-muted-foreground">
                  Send your referral code or link to friends via WhatsApp, email, or any channel
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-foreground font-bold text-foreground">
                  2
                </div>
              </div>
              <div>
                <p className="font-bold text-foreground">Friend registers with your code</p>
                <p className="text-sm text-muted-foreground">
                  They complete registration on Shelterflex using your referral code
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-foreground font-bold text-foreground">
                  3
                </div>
              </div>
              <div>
                <p className="font-bold text-foreground">Their first deal activates</p>
                <p className="text-sm text-muted-foreground">
                  When they activate their first rental deal, you get ₦5,000 credit
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-foreground font-bold text-foreground">
                  4
                </div>
              </div>
              <div>
                <p className="font-bold text-foreground">Credit applied automatically</p>
                <p className="text-sm text-muted-foreground">
                  The reward is automatically applied as a credit to your next payment
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
