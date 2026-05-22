export interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  creator: { name: string; username: string; url: string };
  website: string;
  sponsor: { name: string; url: string };
  favicon: string;
  language: string;
}

export interface SocialSettings {
  github: string;
  githubSponsors: string;
  telegram: string;
  telegramChannel: string;
  facebook: string;
  twitter: string;
  discord: string;
  youtube: string;
  website: string;
}

export interface HomepageSettings {
  heroTitle: string;
  heroTagline: string;
  heroSubtitle: string;
  heroTagline2: string;
  searchPlaceholder: string;
  quickTags: string[];
  directoryCategories: string[];
  ctaTitle: string;
  ctaSubtitle: string;
}

export interface SEOSettings {
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  titleSuffix: string;
  twitterHandle: string;
  ogImage: string;
}

export interface BannerSettings {
  enabled: boolean;
  message: string;
  link: string;
  linkText: string;
  type: string;
  dismissible: boolean;
}

export interface FooterLink {
  label: string;
  url: string;
  external: boolean;
}

export interface FooterSettings {
  showTagline: boolean;
  links: FooterLink[];
  showCreator: boolean;
  showSponsor: boolean;
}

export interface CommunitySettings {
  githubRepo: string;
  issuesUrl: string;
  discussionsUrl: string;
  contributingUrl: string;
  telegramPromo: {
    enabled: boolean;
    title: string;
    message: string;
    link: string;
    linkText: string;
  };
  defaultMessages: {
    ctaTitle: string;
    ctaSubtitle: string;
    workflowRequest: string;
  };
}

export interface DonationSettings {
  enabled: boolean;
  title: string;
  description: string;
  message: string;
  supportMessage: string;
  reassurance: string;
  uses: string[];
  githubSponsorsUrl: string;
  stripeDonationUrl: string;
  customLinksEnabled: boolean;
  customLinks: { label: string; url: string }[];
}

export interface FeatureFlags {
  donation: boolean;
  shareUnlock: boolean;
  workflowGenerator: boolean;
  telegramPromo: boolean;
  banner: boolean;
  search: boolean;
  trending: boolean;
  featured: boolean;
  communityCta: boolean;
  statsDisplay: boolean;
}

export interface AllSettings {
  site: SiteSettings;
  social: SocialSettings;
  homepage: HomepageSettings;
  seo: SEOSettings;
  banner: BannerSettings;
  footer: FooterSettings;
  community: CommunitySettings;
  donation: DonationSettings;
  features: FeatureFlags;
}

const DEFAULTS: AllSettings = {
  site: {
    siteName: "Prompt Flow",
    tagline: "AI Workflows",
    description: "AI workflow library powered by the community.",
    creator: { name: "Creator", username: "@creator", url: "#" },
    website: "#",
    sponsor: { name: "Sponsor", url: "#" },
    favicon: "/favicon.ico",
    language: "en",
  },
  social: {
    github: "", githubSponsors: "", telegram: "", telegramChannel: "",
    facebook: "", twitter: "", discord: "", youtube: "", website: "",
  },
  homepage: {
    heroTitle: "Prompt Flow", heroTagline: "AI Workflows",
    heroSubtitle: "AI workflow library.", heroTagline2: "Discover. Copy. Run.",
    searchPlaceholder: "Search workflows...", quickTags: ["ai"],
    directoryCategories: ["other"],
    ctaTitle: "Like this project?", ctaSubtitle: "Help it grow.",
  },
  seo: {
    defaultTitle: "Prompt Flow",
    defaultDescription: "AI workflow library powered by the community.",
    defaultKeywords: ["AI", "workflows", "prompts"],
    titleSuffix: "Prompt Flow", twitterHandle: "", ogImage: "/og-image.png",
  },
  banner: { enabled: false, message: "", link: "", linkText: "", type: "info", dismissible: true },
  footer: { showTagline: true, links: [], showCreator: true, showSponsor: true },
  community: {
    githubRepo: "", issuesUrl: "", discussionsUrl: "", contributingUrl: "",
    telegramPromo: { enabled: false, title: "Join our Telegram", message: "Connect with the community.", link: "", linkText: "Join" },
    defaultMessages: { ctaTitle: "Help grow the community.", ctaSubtitle: "Star, share, submit, and contribute.", workflowRequest: "Can't find what you're looking for? Submit a workflow request." },
  },
  donation: {
    enabled: false, title: "Support", description: "Help keep the project running.",
    message: "This is a free open-source project.", supportMessage: "Consider supporting:",
    reassurance: "No pressure.", uses: ["Hosting", "Maintenance", "Features"],
    githubSponsorsUrl: "", stripeDonationUrl: "", customLinksEnabled: false, customLinks: [],
  },
  features: {
    donation: false, shareUnlock: true, workflowGenerator: true, telegramPromo: false,
    banner: false, search: true, trending: true, featured: true, communityCta: true, statsDisplay: true,
  },
};

import fs from "fs";
import path from "path";

const SETTINGS_DIR = "content/settings";
const FILE_MAP: Record<string, string> = {
  site: "site.json", social: "social.json", homepage: "homepage.json",
  seo: "seo.json", banner: "banner.json", footer: "footer.json",
  community: "community.json", donation: "donation.json", features: "features.json",
};

function readJsonSafe<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

let cached: AllSettings | null = null;

export function loadAllSettings(): AllSettings {
  if (cached) return cached;
  const settingsDir = path.join(process.cwd(), SETTINGS_DIR);
  const settings: Record<string, unknown> = {};
  for (const key of Object.keys(FILE_MAP)) {
    const filePath = path.join(settingsDir, FILE_MAP[key]);
    settings[key] = readJsonSafe(filePath, DEFAULTS[key as keyof AllSettings]);
  }
  cached = settings as unknown as AllSettings;
  return cached;
}

export function invalidateCache(): void {
  cached = null;
}

export async function fetchSettings(): Promise<AllSettings> {
  const res = await fetch("/settings.json");
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json() as Promise<AllSettings>;
}

export function getSettingFilePath(sectionKey: string): string {
  return `content/settings/${FILE_MAP[sectionKey] || ""}`;
}
