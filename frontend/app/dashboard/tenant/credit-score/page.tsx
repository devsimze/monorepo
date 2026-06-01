"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Home,
  Building2,
  CreditCard,
  MessageSquare,
  Settings,
  FileText,
  ShieldCheck,
  Gauge,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreditScoreGauge } from "@/components/tenant/CreditScoreGauge";
import { ScoreFactorList } from "@/components/tenant/ScoreFactorList";
import { ScoreHistoryChart } from "@/components/tenant/ScoreHistoryChart";
import { ScoreImprovementTips } from "@/components/tenant/ScoreImprovementTips";
import { getMockCreditScoreProfile } from "@/lib/mockCreditScoreData";

function CreditScoreContent() {
  const searchParams = useSearchParams();
  const isPending = searchParams.get("pending") === "1";
  const profile = isPending ? null : getMockCreditScoreProfile();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r-3 border-foreground bg-card pt-20 lg:block">
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
              href="/dashboard/tenant/credit-score"
              className="flex items-center gap-3 border-3 border-foreground bg-primary p-3 font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <Gauge className="h-5 w-5" />
              Credit Score
            </Link>
            <Link
              href="/dashboard/tenant/payments"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
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
              href="/dashboard/tenant/vault"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <ShieldCheck className="h-5 w-5" />
              Document Vault
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

      <main className="min-h-screen pt-20 lg:ml-64">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
              Credit Score Profile
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Understand your tenant risk score and how to improve it.
            </p>
          </div>

          {!profile ? (
            <Card className="border-3 border-foreground p-8 text-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-12">
              <Clock className="mx-auto h-16 w-16 text-muted-foreground" />
              <h2 className="mt-4 font-mono text-xl font-bold">
                Assessment in progress
              </h2>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                Your underwriting review has not completed yet. We will notify
                you once your credit score is ready.
              </p>
              <Link href="/onboarding">
                <Button className="mt-6 border-3 border-foreground bg-primary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                  Complete onboarding
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <h2 className="mb-6 font-mono text-lg font-bold">
                  Current Score
                </h2>
                <CreditScoreGauge score={profile.score} band={profile.band} />
              </Card>

              <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <h2 className="mb-4 font-mono text-lg font-bold">
                  Score History
                </h2>
                <ScoreHistoryChart history={profile.history} />
              </Card>

              <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] lg:col-span-0">
                <h2 className="mb-4 font-mono text-lg font-bold">
                  Contributing Factors
                </h2>
                <ScoreFactorList factors={profile.factors} />
              </Card>

              <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <h2 className="mb-4 font-mono text-lg font-bold">
                  How to Improve
                </h2>
                <ScoreImprovementTips tips={profile.tips} />
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function TenantCreditScorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="font-mono text-muted-foreground">Loading score...</p>
        </div>
      }
    >
      <CreditScoreContent />
    </Suspense>
  );
}
