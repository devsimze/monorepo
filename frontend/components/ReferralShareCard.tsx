'use client'

import { MessageCircle, Link2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface ReferralShareCardProps {
  referralCode: string
  referralLink: string
}

export function ReferralShareCard({ referralCode, referralLink }: ReferralShareCardProps) {
  const handleShareWhatsApp = () => {
    const text = `Join Shelterflex and get amazing rental deals! Use my referral code: ${referralCode}\n\n${referralLink}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      toast.success('Link copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  return (
    <Card className="border-2 border-border p-6">
      <h2 className="text-xl font-bold text-foreground mb-6">Share Your Referral</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {/* WhatsApp Share */}
        <Button
          onClick={handleShareWhatsApp}
          size="lg"
          className="gap-2 bg-green-600 text-white hover:bg-green-700 border-2 border-green-600 h-14 font-bold"
        >
          <MessageCircle className="h-5 w-5" />
          Share on WhatsApp
        </Button>

        {/* Copy Link */}
        <Button
          onClick={handleCopyLink}
          variant="outline"
          size="lg"
          className="gap-2 border-2 border-border h-14 font-bold"
        >
          <Copy className="h-5 w-5" />
          Copy Link
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Share the link above to help your friends find the best rental deals on Shelterflex. You'll
        earn ₦5,000 credit when they activate their first deal.
      </p>
    </Card>
  )
}
