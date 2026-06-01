"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Home,
  Building2,
  CreditCard,
  MessageSquare,
  Settings,
  Calendar,
  Clock,
  AlertCircle,
  FileText,
  Wallet,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { DashboardHeader } from "@/components/dashboard-header"
import {
  getPaymentSchedule,
  getWalletBalance,
  initiateQuickPay,
  type PaymentScheduleItem,
  type TenantDeal,
} from "@/lib/tenantApi"
import { showErrorToast, showSuccessToast } from "@/lib/toast"
import { usePaymentHistory } from "@/hooks/usePaymentHistory"
import { PaymentTimeline } from "@/components/payment/PaymentTimeline"
import { UpcomingScheduleTable } from "@/components/payment/UpcomingScheduleTable"

export default function TenantPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"schedule" | "history">("schedule")
  const [walletBalance, setWalletBalance] = useState(0)
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleItem[]>([])
  const [nextPayment, setNextPayment] = useState<PaymentScheduleItem | null>(null)
  const [deals, setDeals] = useState<TenantDeal[]>([])
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    payments,
    loadMore,
    hasMore,
    isLoading: isHistoryLoading,
  } = usePaymentHistory({
    dealId: selectedDeal,
    limit: 10,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const loadData = async () => {
    setIsLoading(true)

    try {
      const [scheduleRes, walletRes] = await Promise.all([
        getPaymentSchedule(),
        getWalletBalance(),
      ])

      if (scheduleRes.success) {
        setPaymentSchedule(scheduleRes.data.schedule)
        setNextPayment(scheduleRes.data.nextPayment)
        setDeals(scheduleRes.data.deals ?? [])
        setSelectedDeal(
          scheduleRes.data.dealId || scheduleRes.data.deals?.[0]?.dealId || null,
        )
      }

      if (walletRes.success) {
        setWalletBalance(walletRes.data.balance)
      }
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to load payment data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handleQuickPay = async (method: "wallet" | "card") => {
    if (!selectedDeal || !nextPayment) {
      showErrorToast("No active payment found")
      return
    }

    setIsProcessing(true)
    try {
      const response = await initiateQuickPay({
        dealId: selectedDeal,
        amount: nextPayment.amount,
        paymentMethod: method,
      })

      if (response.success) {
        if (response.data.redirectUrl) {
          window.location.href = response.data.redirectUrl
        } else {
          showSuccessToast(response.data.message)
          await loadData()
        }
      }
    } catch (error: any) {
      showErrorToast(error?.message || "Payment failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReceiptDownload = (reference: string) => {
    window.open(`/api/v1/tenant/payments/receipt/${reference}`, "_blank")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="ml-64 min-h-screen pt-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 rounded-3xl border-3 border-foreground bg-card p-10 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <Loader2 className="h-10 w-10 animate-spin text-foreground" />
            <p className="text-sm font-bold text-foreground">Loading payment details...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r-3 border-foreground bg-card pt-20">
        <div className="flex h-full flex-col px-4 py-6">
          <div className="mb-8 border-3 border-foreground bg-secondary p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <p className="text-sm font-medium text-foreground">Logged in as</p>
            <p className="text-lg font-bold text-foreground">Ngozi Adekunle</p>
            <p className="text-sm text-muted-foreground">Tenant</p>
          </div>

          <nav className="flex-1 space-y-2">
            <Link
              href="/dashboard/tenant"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/tenant/payments"
              className="flex items-center gap-3 border-3 border-foreground bg-primary p-3 font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <CreditCard className="h-5 w-5" />
              Payments
            </Link>
            <Link
              href="/dashboard/tenant/lease"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <FileText className="h-5 w-5" />
              My Lease
            </Link>
            <Link
              href="/properties"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <Building2 className="h-5 w-5" />
              Browse Properties
            </Link>
            <Link
              href="/messages"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <MessageSquare className="h-5 w-5" />
              Messages
              <span className="ml-auto flex h-6 w-6 items-center justify-center border-2 border-foreground bg-destructive text-xs font-bold text-destructive-foreground">
                2
              </span>
            </Link>
            <Link
              href="/dashboard/tenant/settings"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen pt-20">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Payments</h1>
            <p className="mt-1 text-muted-foreground">Manage your rent payments and wallet</p>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            <Card className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border-3 border-foreground bg-primary">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="text-xl font-bold">{formatCurrency(walletBalance)}</p>
                </div>
              </div>
            </Card>
            <Card className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border-3 border-foreground bg-secondary">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Payment</p>
                  <p className="text-xl font-bold">{nextPayment ? formatCurrency(nextPayment.amount) : "N/A"}</p>
                </div>
              </div>
            </Card>
            <Card className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border-3 border-foreground bg-accent">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="text-xl font-bold">{nextPayment ? nextPayment.dueDate : "N/A"}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-4">
              {[
                { id: "schedule", label: "Schedule" },
                { id: "history", label: "History" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`border-3 border-foreground px-6 py-3 font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                      : "bg-card hover:bg-muted"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {deals.length > 1 ? (
              <div className="flex flex-col gap-2 rounded-3xl border-2 border-foreground/10 bg-muted p-4">
                <Label htmlFor="deal-select" className="text-sm font-bold">
                  Select deal
                </Label>
                <select
                  id="deal-select"
                  value={selectedDeal ?? ""}
                  onChange={(event) => setSelectedDeal(event.target.value)}
                  className="rounded-2xl border-2 border-foreground/20 bg-background px-4 py-3 text-foreground"
                >
                  {deals.map((deal) => (
                    <option key={deal.dealId} value={deal.dealId}>
                      {deal.leaseName}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          {/* Schedule Tab */}
          {activeTab === "schedule" && (
            <div className="space-y-6">
              <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Payment Schedule</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Track upcoming installments and pay the next due item from one place.
                    </p>
                  </div>
                  {nextPayment ? (
                    <div className="rounded-3xl border-2 border-foreground/20 bg-muted p-4">
                      <p className="text-sm text-muted-foreground">Next due installment</p>
                      <p className="text-2xl font-bold">{formatCurrency(nextPayment.amount)}</p>
                      <p className="text-sm text-muted-foreground">Due {nextPayment.dueDate}</p>
                    </div>
                  ) : null}
                </div>

                {paymentSchedule.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <Calendar className="h-16 w-16 text-muted-foreground" />
                    <h3 className="mt-4 font-bold">No upcoming installments</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Your future repayment schedule will appear here when available.
                    </p>
                  </div>
                ) : (
                  <UpcomingScheduleTable
                    schedule={paymentSchedule.map((payment) => ({
                      period: payment.period,
                      month: payment.month,
                      amount: payment.amount,
                      dueDate: payment.dueDate,
                      status: payment.status,
                      isNextDue: payment.isNextDue,
                    }))}
                    onPayNow={() => handleQuickPay("card")}
                  />
                )}
              </Card>
            </div>
          )}

          {/* Payment History Tab */}
          {activeTab === "history" && (
            <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-bold">Payment History</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Review completed installments, download receipts, and confirm payment status.
                  </p>
                </div>
                <div className="rounded-3xl border-2 border-foreground/20 bg-muted p-4 text-sm">
                  {payments.length} payment{payments.length === 1 ? "" : "s"} recorded
                </div>
              </div>

              <PaymentTimeline
                payments={payments}
                onDownloadReceipt={handleReceiptDownload}
                onLoadMore={loadMore}
                hasMore={hasMore}
                isLoading={isHistoryLoading}
              />
            </Card>
          )}

        </div>
      </main>
    </div>
  )
}
