"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface ScheduleRow {
  period: number;
  month: string;
  amount: number;
  dueDate: string;
  status: "paid" | "upcoming" | "pending" | "overdue";
  isNextDue?: boolean;
}

interface UpcomingScheduleTableProps {
  schedule: ScheduleRow[];
  onPayNow: () => void;
}

export function UpcomingScheduleTable({ schedule, onPayNow }: UpcomingScheduleTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border-2 border-foreground/20 bg-card shadow-[4px_4px_0_rgba(26,26,26,0.05)]">
      <table className="w-full border-separate border-spacing-0 text-left">
        <thead className="bg-muted text-sm uppercase tracking-[0.25em] text-muted-foreground">
          <tr>
            <th className="px-6 py-4">Installment</th>
            <th className="px-6 py-4">Due Date</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4" />
          </tr>
        </thead>
        <tbody>
          {schedule.map((row) => (
            <tr
              key={`${row.period}-${row.month}`}
              className={`border-t border-foreground/10 ${
                row.status === "overdue" ? "bg-red-50" : "bg-background"
              }`}
            >
              <td className="px-6 py-4">
                <div className="font-bold">{row.month}</div>
                <div className="text-sm text-muted-foreground">Installment {row.period}</div>
              </td>
              <td className="px-6 py-4">{row.dueDate}</td>
              <td className="px-6 py-4 font-mono font-bold">₦{row.amount.toLocaleString("en-NG")}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${
                    row.status === "paid"
                      ? "border-emerald-200 bg-emerald-100 text-emerald-900"
                      : row.status === "overdue"
                      ? "border-red-200 bg-red-100 text-red-900"
                      : "border-primary/20 bg-primary/10 text-primary"
                  }`}
                >
                  {row.status === "paid" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                  {row.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {row.isNextDue ? (
                  <Button
                    onClick={onPayNow}
                    className="border-2 border-foreground bg-primary font-bold shadow-[4px_4px_0_rgba(26,26,26,1)]"
                  >
                    Pay Now
                  </Button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
