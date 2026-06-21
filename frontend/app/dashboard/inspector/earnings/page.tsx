"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Home,
  DollarSign,
  Menu,
  X,
  Building2,
  CheckCircle,
  Clock,
  RefreshCw,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/dashboard-header";
import { getInspectorJobs, type InspectorJob } from "@/lib/inspectorApi";
import { useFeatureFlag } from "@/lib/featureFlags";

export default function EarningsPage() {
  const isEnabled = useFeatureFlag("INSPECTOR_DASHBOARD_ENABLED");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<InspectorJob[]>([]);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInspectorJobs();
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load earnings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const completedJobs = jobs.filter(
    (j) => j.status === "completed",
  );
  const earnings = completedJobs.map((j, idx) => ({
    id: `earn-${idx}`,
    jobId: j.id,
    propertyTitle: j.propertyTitle,
    address: j.address,
    inspectionType: j.inspectionType,
    fee: j.offeredFee,
    status: "paid",
    completedAt: j.completedAt || j.createdAt,
    paidAt: undefined,
  }));

  const totalEarned = earnings.reduce((sum, e) => sum + e.fee, 0);
  const paidAmount = earnings
    .filter((e) => e.status === "paid")
    .reduce((sum, e) => sum + e.fee, 0);
  const pendingAmount = earnings
    .filter((e) => e.status === "pending")
    .reduce((sum, e) => sum + e.fee, 0);

  if (!isEnabled) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="lg:pl-64">
          <div className="p-6 lg:p-8">
            <Card className="border-3 border-foreground p-12 text-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <DollarSign className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-bold text-foreground">
                Inspector Dashboard Not Available
              </h3>
              <p className="mt-2 text-muted-foreground">
                The inspector dashboard feature is currently disabled.
              </p>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center border-3 border-foreground bg-primary shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] lg:hidden"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r-3 border-foreground bg-card pt-20 transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-full flex-col px-4 py-6">
          <div className="mb-8 border-3 border-foreground bg-accent p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <p className="text-sm font-medium text-foreground">Logged in as</p>
            <p className="text-lg font-bold text-foreground">Inspector Chidi</p>
            <p className="text-sm text-muted-foreground">Property Inspector</p>
          </div>

          <nav className="flex-1 space-y-2">
            <Link
              href="/dashboard/inspector"
              className="flex items-center gap-3 rounded-lg border-2 border-transparent px-4 py-3 text-muted-foreground transition-colors hover:border-foreground hover:bg-muted"
            >
              <Building2 className="h-5 w-5" />
              Job Board
            </Link>
            <Link
              href="/dashboard/inspector/earnings"
              className="flex items-center gap-3 rounded-lg border-2 border-foreground bg-primary px-4 py-3 font-bold text-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
            >
              <DollarSign className="h-5 w-5" />
              Earnings
            </Link>
          </nav>

          <div className="mt-auto pt-6">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg border-2 border-transparent px-4 py-3 text-muted-foreground transition-colors hover:border-foreground hover:bg-muted"
            >
              <Home className="h-5 w-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Earnings</h1>
            <p className="mt-2 text-muted-foreground">
              Track your completed jobs and payment history
            </p>
          </div>

          {/* Error */}
          {error && !isLoading && (
            <Card className="mb-8 border-3 border-foreground p-6 text-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <p className="text-destructive">{error}</p>
              <Button
                onClick={fetchJobs}
                className="mt-4 border-3 border-foreground bg-primary shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </Card>
          )}

          {/* Stats */}
          {isLoading ? (
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 border-3 border-foreground" />
              ))}
            </div>
          ) : (
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Earned
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      ₦{totalEarned.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                    <DollarSign className="h-6 w-6 text-foreground" />
                  </div>
                </div>
              </Card>

              <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Paid
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      ₦{paidAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500">
                    <CheckCircle className="h-6 w-6 text-foreground" />
                  </div>
                </div>
              </Card>

              <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Pending
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      ₦{pendingAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                    <Clock className="h-6 w-6 text-foreground" />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Earnings History */}
          <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <h3 className="mb-4 text-lg font-bold text-foreground">
              Earnings History
            </h3>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 border-3 border-foreground" />
                ))}
              </div>
            ) : earnings.length === 0 ? (
              <div className="py-12 text-center">
                <DollarSign className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-bold text-foreground">
                  No earnings yet
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Complete inspection jobs to start earning.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {earnings.map((earning) => (
                  <div
                    key={earning.id}
                    className="flex items-center justify-between rounded-lg border-2 border-foreground bg-card p-4"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground">
                        {earning.propertyTitle}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {earning.address}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {earning.inspectionType === "new_listing"
                            ? "New Listing"
                            : "Re-Inspection"}
                        </span>
                        <span className="text-muted-foreground">
                          Completed: {new Date(earning.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          ₦{earning.fee.toLocaleString()}
                        </p>
                        <Badge
                          className={`border-2 border-foreground ${
                            earning.status === "paid"
                              ? "bg-green-500"
                              : "bg-accent"
                          }`}
                        >
                          {earning.status === "paid" ? "Paid" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
