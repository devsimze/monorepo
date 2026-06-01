import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, CheckCircle, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export interface InspectionReport {
  overallGrade: string;
  roomConditions: {
    room: string;
    grade: string;
    notes: string;
  }[];
  photos?: string[];
}

export interface InspectionReportAccordionProps {
  report: InspectionReport | null;
}

export function InspectionReportAccordion({ report }: InspectionReportAccordionProps) {
  if (!report) return null;

  return (
    <div className="border-3 border-foreground bg-card p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
      <h2 className="font-mono text-xl font-bold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Inspection Report
      </h2>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-bold text-muted-foreground">Overall Grade:</span>
        <span className={`px-2 py-0.5 border-2 border-foreground font-mono font-bold text-sm ${
          report.overallGrade.startsWith("A") ? "bg-green-100 text-green-800" :
          report.overallGrade.startsWith("B") ? "bg-blue-100 text-blue-800" :
          "bg-yellow-100 text-yellow-800"
        }`}>
          {report.overallGrade}
        </span>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="report-details" className="border-2 border-foreground px-4 bg-background">
          <AccordionTrigger className="font-bold hover:no-underline font-mono">
            View Per-Room Breakdown
          </AccordionTrigger>
          <AccordionContent className="pt-4 border-t-2 border-foreground/10">
            <div className="space-y-4">
              {report.roomConditions.map((condition, index) => (
                <div key={index} className="flex flex-col gap-1 pb-3 border-b border-dashed border-foreground/20 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{condition.room}</span>
                    <span className="font-mono text-xs font-bold border border-foreground px-1.5 py-0.5 bg-muted">
                      {condition.grade}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{condition.notes}</p>
                </div>
              ))}
            </div>

            {report.photos && report.photos.length > 0 && (
              <div className="mt-6">
                <h4 className="font-bold text-sm mb-3 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  Inspector Photos
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {report.photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square border-2 border-foreground overflow-hidden">
                      <Image
                        src={photo}
                        alt={`Inspection photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
