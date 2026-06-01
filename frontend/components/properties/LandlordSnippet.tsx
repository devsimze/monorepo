import React from "react";
import { Clock, CalendarDays } from "lucide-react";
import Link from "next/link";
import { LandlordVerificationBadge, type LandlordVerificationLevel } from "@/components/LandlordVerificationBadge";

export interface LandlordProfile {
  name: string;
  verified: boolean;
  verificationLevel?: LandlordVerificationLevel;
  listings: number;
  responseTime: string;
  listedSince?: string;
}

export interface LandlordSnippetProps {
  landlord: LandlordProfile;
}

export function LandlordSnippet({ landlord }: LandlordSnippetProps) {
  const initials = landlord.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="border-3 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
      <h3 className="font-mono font-bold mb-4">Listed By</h3>
      
      <div className="flex items-center gap-4 mb-5">
        <div className="flex h-14 w-14 items-center justify-center border-2 border-foreground bg-muted font-mono text-xl font-bold">
          {initials}
        </div>
        <div>
          <p className="font-bold text-lg leading-tight">{landlord.name}</p>
          <div className="mt-2">
            <LandlordVerificationBadge
              level={
                landlord.verificationLevel ??
                (landlord.verified ? 'id_verified' : 'unverified')
              }
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center pb-2 border-b border-foreground/10">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" /> Listed Since
          </span>
          <span className="font-bold font-mono">{landlord.listedSince || "2023"}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-foreground/10">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Response Rate
          </span>
          <span className="font-bold font-mono">{landlord.responseTime}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Active Listings</span>
          <span className="font-bold font-mono">{landlord.listings}</span>
        </div>
      </div>

      <Link href={`/landlords/${encodeURIComponent(landlord.name.toLowerCase().replace(/\s+/g, '-'))}`} className="block mt-6">
        <button className="w-full border-2 border-foreground bg-background py-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_0px_rgba(26,26,26,1)]">
          View Full Profile
        </button>
      </Link>
    </div>
  );
}
