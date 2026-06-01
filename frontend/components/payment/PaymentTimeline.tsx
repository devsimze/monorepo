"use client";

import { PaymentHistoryItem } from "@/lib/tenantApi";
import { PaymentTimelineNode } from "@/components/payment/PaymentTimelineNode";
import { Button } from "@/components/ui/button";

interface PaymentTimelineProps {
  payments: PaymentHistoryItem[];
  onDownloadReceipt: (reference: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export function PaymentTimeline({
  payments,
  onDownloadReceipt,
  onLoadMore,
  hasMore,
  isLoading,
}: PaymentTimelineProps) {
  return (
    <div className="space-y-6">
      {payments.map((payment) => (
        <PaymentTimelineNode
          key={payment.id}
          date={payment.transactionDate}
          amount={payment.amount}
          status={payment.status}
          reference={payment.reference}
          isOverdue={payment.isOverdue}
          daysOverdue={payment.daysOverdue}
          onDownloadReceipt={() => onDownloadReceipt(payment.reference)}
        />
      ))}

      {payments.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-foreground/20 bg-muted p-10 text-center text-muted-foreground">
          <p className="text-lg font-bold text-foreground">No payment records yet</p>
          <p className="mt-2">Once your installments begin, each payment will be tracked here.</p>
        </div>
      )}

      {hasMore ? (
        <div className="flex justify-center">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            className="border-2 border-foreground bg-primary font-bold shadow-[4px_4px_0_rgba(26,26,26,1)]"
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
