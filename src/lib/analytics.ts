"use client";

const UMAMI_URL = process.env.NEXT_PUBLIC_UMAMI_URL;
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

type UmamiPayload = Record<string, string | number | boolean>;

function send(payload: UmamiPayload): void {
  if (!UMAMI_URL || !UMAMI_WEBSITE_ID) return;
  try {
    navigator.sendBeacon(`${UMAMI_URL}/api/send`, JSON.stringify(payload));
  } catch {
    // silent
  }
}

export function trackPageView(url?: string): void {
  send({
    website: UMAMI_WEBSITE_ID!,
    url: url || window.location.pathname,
  });
}

export function trackEvent(name: string, data?: Record<string, string>): void {
  send({
    website: UMAMI_WEBSITE_ID!,
    event: name,
    ...(data || {}),
  });
}

export function trackSearch(query: string, resultsCount: number): void {
  trackEvent("search", { query, results: String(resultsCount) });
}

export function trackWorkflowView(slug: string, title: string): void {
  trackEvent("workflow_view", { slug, title });
}

export function trackGenerate(slug: string): void {
  trackEvent("generate", { slug });
}

export function trackSubmission(): void {
  trackEvent("submission");
}
