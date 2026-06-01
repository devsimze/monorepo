"use client";

import { ArrowRight, Download, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PaymentTimelineNodeProps {
  date: string;
  amount: number;
  status: "Paid" | "Overdue" | "Upcoming" | "Processing";
  reference: string;
  isOverdue?: boolean;
  daysOverdue?: number;
  onDownloadReceipt?: () => void;
}

const statusStyles: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Overdue: "bg-red-100 text-red-900 border-red-200",
  Upcoming: "bg-primary/10 text-primary border-primary/20",
  Processing: "bg-amber-100 text-amber-900 border-amber-200",
};

export function PaymentTimelineNode({
  date,
  amount,
  status,
  reference,
  isOverdue = false,
  daysOverdue,
  onDownloadReceipt,
}: PaymentTimelineNodeProps) {
  return (
    <div className="group relative flex gap-4 rounded-3xl border-2 border-foreground/10 bg-card p-5 shadow-[4px_4px_0_rgba(26,26,26,0.1)] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(26,26,26,0.1)]">
      <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full border-2 border-foreground/20 bg-muted text-foreground">
        <CircleDot className="h-5 w-5" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{date}</p>
            <p className="mt-1 text-xl font-bold">₦{amount.toLocaleString("en-NG")}</p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[status]}`}>
            {status}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>Reference: {reference}</span>
          {isOverdue && daysOverdue ? (
            <span className="rounded-full bg-red-50 px-2 py-1 text-red-700">
              {daysOverdue} day{daysOverdue === 1 ? "" : "s"} overdue
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadReceipt}
            className="border-2 border-foreground bg-background text-foreground hover:bg-muted"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowRight className="h-3 w-3" />
            View payment details
          </span>
        </div>
      </div>
    </div>
  );
}
