import React from "react";
import { CheckCircle, ShieldCheck, Flag, AlertTriangle, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface TrustIndicatorBarProps {
  landlordKyc: boolean;
  inspectionPass: { date: string; inspectorName: string } | null;
  whistleblowerCleared: boolean;
  verificationStatus?: "VERIFIED" | "PENDING" | "REJECTED"; // Added to align with existing data
}

export function TrustIndicatorBar({
  landlordKyc,
  inspectionPass,
  whistleblowerCleared,
  verificationStatus = "VERIFIED",
}: TrustIndicatorBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-4 border-y-2 border-foreground/10 my-6">
      <span className="font-mono text-sm font-bold mr-2 text-foreground/70">Trust Signals:</span>
      
      {/* KYC Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground bg-card shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
        {landlordKyc ? (
          <>
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span className="text-xs font-bold">KYC Verified</span>
          </>
        ) : verificationStatus === "REJECTED" ? (
          <>
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-red-600">KYC Flagged</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-600">KYC Pending</span>
          </>
        )}
      </div>

      {/* Inspection Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground bg-card shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
        {inspectionPass ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-600" />
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-tight">Inspected Pass</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{inspectionPass.date} • {inspectionPass.inspectorName}</span>
            </div>
          </>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-600">No Inspection Yet</span>
          </>
        )}
      </div>

      {/* Whistleblower Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground bg-card shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
        {whistleblowerCleared ? (
          <>
            <Flag className="w-4 h-4 text-green-600 fill-green-600/20" />
            <span className="text-xs font-bold">Community Cleared</span>
          </>
        ) : verificationStatus === "REJECTED" ? (
          <>
            <Flag className="w-4 h-4 text-red-600 fill-red-600/20" />
            <span className="text-xs font-bold text-red-600">Community Flagged</span>
          </>
        ) : (
          <>
            <Flag className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-600">Unverified Community</span>
          </>
        )}
      </div>
    </div>
  );
}
