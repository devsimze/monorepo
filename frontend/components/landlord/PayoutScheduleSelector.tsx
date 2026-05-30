"use client";

import { useState } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export type PayoutSchedule = "activation" | "weekly" | "monthly";

interface PayoutScheduleSelectorProps {
  initialSchedule?: PayoutSchedule;
}

export function PayoutScheduleSelector({
  initialSchedule = "monthly",
}: PayoutScheduleSelectorProps) {
  const [schedule, setSchedule] = useState<PayoutSchedule>(initialSchedule);
  const [isSaving, setIsSaving] = useState(false);

  const handleScheduleChange = async (value: string) => {
    const newSchedule = value as PayoutSchedule;
    setSchedule(newSchedule);
    setIsSaving(true);

    try {
      const response = await fetch("/api/landlord/payout/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ schedule: newSchedule }),
      });

      if (!response.ok) throw new Error("Failed to update preferences");
      
      toast.success("Payout schedule updated successfully");
    } catch (error) {
      toast.error("Failed to update payout schedule. Please try again.");
      // Optionally revert to original state
      setSchedule(initialSchedule);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Payout Schedule
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose when you want to receive your payouts.
          </p>
        </div>
        {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      <RadioGroup.Root
        className="flex flex-col space-y-3"
        value={schedule}
        onValueChange={handleScheduleChange}
        disabled={isSaving}
      >
        <div className="flex items-center space-x-2">
          <RadioGroup.Item
            value="activation"
            id="activation"
            className="peer h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary"
          >
            <RadioGroup.Indicator className="flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
            </RadioGroup.Indicator>
          </RadioGroup.Item>
          <label
            htmlFor="activation"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            On Deal Activation
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroup.Item
            value="weekly"
            id="weekly"
            className="peer h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary"
          >
            <RadioGroup.Indicator className="flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
            </RadioGroup.Indicator>
          </RadioGroup.Item>
          <label
            htmlFor="weekly"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Weekly
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroup.Item
            value="monthly"
            id="monthly"
            className="peer h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary"
          >
            <RadioGroup.Indicator className="flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
            </RadioGroup.Indicator>
          </RadioGroup.Item>
          <label
            htmlFor="monthly"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Monthly
          </label>
        </div>
      </RadioGroup.Root>
    </div>
  );
}
