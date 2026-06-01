"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { formatUsdc } from "./PositionCard";
import { UnstakeModal } from "./unstake-modal";

interface UnstakeFormProps {
  staked: string | number;
  warming: string | number;
  lockExpiry?: string;
  isLocked: boolean;
  isUnstaking: boolean;
  onUnstake: (amount: string) => Promise<void>;
  timeRemainingText?: string;
}

export function UnstakeForm({
  staked,
  warming,
  lockExpiry,
  isLocked,
  isUnstaking,
  onUnstake,
  timeRemainingText = "",
}: UnstakeFormProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stakedAmount = formatUsdc(staked);
  const warmingAmount = formatUsdc(warming);
  const totalUnstakeable = (Number(staked) - Number(warming)).toFixed(6);

  const handleOpenModal = () => {
    if (!isLocked && !isUnstaking) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Card className="border-3 border-foreground shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
        <CardHeader className="bg-accent/10 border-b-3 border-foreground">
          <CardTitle className="text-xl font-bold">Unstake Tokens</CardTitle>
          <CardDescription className="text-foreground/70 font-medium">
            Withdraw your staked USDC from the pool
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Balance Info */}
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-card border-2 border-foreground">
              <span className="font-bold">Total Staked:</span>
              <span className="font-mono font-bold text-lg">{stakedAmount} USDC</span>
            </div>

            {Number(warming) > 0 && (
              <div className="flex justify-between items-center p-4 bg-amber-50/50 border-2 border-amber-200">
                <span className="font-bold">Warming Up:</span>
                <span className="font-mono font-bold text-lg text-amber-600">{warmingAmount} USDC</span>
              </div>
            )}

            <div className="flex justify-between items-center p-4 bg-green-50/50 border-2 border-green-200">
              <span className="font-bold">Available to Unstake:</span>
              <span className="font-mono font-bold text-lg text-green-600">{totalUnstakeable} USDC</span>
            </div>
          </div>

          {/* Lock Status */}
          {isLocked && (
            <div className="flex items-start gap-3 p-4 bg-red-50/50 border-2 border-red-200 rounded-md">
              <Lock className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-red-800">Position is Locked</p>
                <p className="text-sm text-red-700">
                  {timeRemainingText || "Your position will be unlocked at the scheduled time"}
                </p>
              </div>
            </div>
          )}

          {!isLocked && Number(totalUnstakeable) === 0 && (
            <div className="flex items-start gap-3 p-4 bg-amber-50/50 border-2 border-amber-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-800">All tokens are warming</p>
                <p className="text-sm text-amber-700">
                  No tokens are currently available to unstake
                </p>
              </div>
            </div>
          )}

          {/* Unstake Button */}
          <Button
            onClick={handleOpenModal}
            disabled={isLocked || isUnstaking || Number(totalUnstakeable) === 0}
            className="w-full border-3 border-foreground bg-destructive text-destructive-foreground font-bold py-6 text-lg shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUnstaking ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Unstaking...
              </>
            ) : isLocked ? (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Locked
              </>
            ) : Number(totalUnstakeable) === 0 ? (
              "No Available Tokens"
            ) : (
              "Unstake Tokens"
            )}
          </Button>
        </CardContent>
      </Card>

      <UnstakeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={onUnstake}
        maxAmount={totalUnstakeable}
        warmingAmount={warmingAmount}
      />
    </>
  );
}
