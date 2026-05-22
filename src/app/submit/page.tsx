import type { Metadata } from "next";
import { loadAllSettings } from "@/lib/settings";
import SubmitWizard from "@/components/submit-wizard";

const settings = loadAllSettings();

export const metadata: Metadata = {
  title: `Submit Workflow — ${settings.seo.titleSuffix || "1page"}`,
  description: "Share your AI workflow with the community. Turn your idea into a reusable workflow in under 2 minutes.",
};

export default function SubmitPage() {
  return <SubmitWizard />;
}
