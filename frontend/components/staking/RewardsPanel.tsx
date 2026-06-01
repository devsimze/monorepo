"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Gift, TrendingUp, AlertCircle } from "lucide-react";
import { formatUsdc } from "./PositionCard";
import { HistoryTable } from "./HistoryTable";

interface RewardsPanelProps {
  claimable: string | number;
  walletAddress?: string | null;
  isClaiming: boolean;
  onClaim: () => Promise<void>;
  currentApy?: number;
}

export function RewardsPanel({
  claimable,
  walletAddress,
  isClaiming,
  onClaim,
  currentApy = 0,
}: RewardsPanelProps) {
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const claimableAmount = formatUsdc(claimable);
  const hasClaimableRewards = Number(claimable) > 0;

  const handleClaimRewards = async () => {
    setClaimError(null);
    setClaimSuccess(false);

    try {
      await onClaim();
      setClaimSuccess(true);
      // Clear success message after 5 seconds
      setTimeout(() => setClaimSuccess(false), 5000);
    } catch (err: any) {
      setClaimError(err.message || "Failed to claim rewards");
    }
  };

  return (
    <div className="space-y-6">
      {/* Rewards Summary Card */}
      <Card className="border-3 border-foreground shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
        <CardHeader className="bg-accent/10 border-b-3 border-foreground">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            Accrued Rewards
          </CardTitle>
          <CardDescription className="text-foreground/70 font-medium">
            Claim your accumulated staking rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Rewards Amount */}
          <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-3 border-primary/30 rounded-lg shadow-[4px_4px_0px_0px_rgba(26,26,26,0.1)]">
            <div className="space-y-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                Claimable Rewards
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-black text-4xl text-foreground">
                  {claimableAmount}
                </span>
                <span className="text-lg font-bold text-muted-foreground">USDC</span>
              </div>
            </div>
          </div>

          {/* APY Info */}
          {currentApy > 0 && (
            <div className="p-4 bg-card border-2 border-foreground rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="font-bold">Current APY</span>
              </div>
              <span className="font-mono font-bold text-lg text-primary">{currentApy.toFixed(2)}%</span>
            </div>
          )}

          {/* Status Messages */}
          {!hasClaimableRewards && (
            <div className="flex items-start gap-3 p-4 bg-blue-50/50 border-2 border-blue-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-blue-800">No Claimable Rewards</p>
                <p className="text-sm text-blue-700">
                  Your rewards will appear here as they accumulate. Keep your tokens staked to earn rewards!
                </p>
              </div>
            </div>
          )}

          {claimSuccess && (
            <div className="flex items-start gap-3 p-4 bg-green-50/50 border-2 border-green-200 rounded-md">
              <TrendingUp className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-green-800">Rewards Claimed Successfully</p>
                <p className="text-sm text-green-700">
                  Your rewards have been transferred to your wallet
                </p>
              </div>
            </div>
          )}

          {claimError && (
            <div className="flex items-start gap-3 p-4 bg-red-50/50 border-2 border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-red-800">Claim Failed</p>
                <p className="text-sm text-red-700">{claimError}</p>
              </div>
            </div>
          )}

          {/* Claim Button */}
          <Button
            onClick={handleClaimRewards}
            disabled={!hasClaimableRewards || isClaiming}
            className="w-full border-3 border-foreground bg-primary text-primary-foreground font-bold py-6 text-lg shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClaiming ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Claiming Rewards...
              </>
            ) : (
              <>
                <Gift className="mr-2 h-5 w-5" />
                Claim Rewards
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Rewards History Table */}
      <HistoryTable walletAddress={walletAddress} />
    </div>
  );
}
