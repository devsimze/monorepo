import { AdminAnalyticsClient } from "./AdminAnalyticsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Platform Analytics | ShelterFlex Dashboard",
  description: "Monitor real-time platform KPIs, user distribution, active deals, settlement revenue, and listing quality grades.",
};

export default function AdminAnalyticsPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <AdminAnalyticsClient />
    </div>
  );
}
