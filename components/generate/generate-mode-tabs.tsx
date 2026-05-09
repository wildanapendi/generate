"use client";

import { Sparkles, PenLine } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GenerateForm } from "./generate-form";
import { ManualForm } from "./manual-form";

/**
 * Tab switcher antara mode AI Generate dan Input Manual.
 * Digunakan di halaman /generate sebagai entry point pembuatan modul.
 */
export function GenerateModeTabs() {
  return (
    <Tabs defaultValue="ai" className="w-full">
      <TabsList className="mb-4 w-full sm:w-auto">
        <TabsTrigger value="ai" className="gap-1.5">
          <Sparkles className="size-4" />
          AI Generate
        </TabsTrigger>
        <TabsTrigger value="manual" className="gap-1.5">
          <PenLine className="size-4" />
          Input Manual
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ai">
        <GenerateForm />
      </TabsContent>

      <TabsContent value="manual">
        <ManualForm />
      </TabsContent>
    </Tabs>
  );
}
