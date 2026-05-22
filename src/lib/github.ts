export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
}

export interface CommitResult {
  success: boolean;
  sha?: string;
  error?: string;
}

export function getGitHubConfig(): GitHubConfig | null {
  const owner = typeof process !== "undefined"
    ? (process.env.NEXT_PUBLIC_GITHUB_OWNER || "")
    : "";
  const repo = typeof process !== "undefined"
    ? (process.env.NEXT_PUBLIC_GITHUB_REPO || "")
    : "";
  const branch = typeof process !== "undefined"
    ? (process.env.NEXT_PUBLIC_GITHUB_BRANCH || "main")
    : "main";
  if (!owner || !repo) return null;
  return { owner, repo, branch };
}

async function getFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string,
  branch: string = "main"
): Promise<{ content: string; sha: string } | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`GitHub API error: ${res.status}`);
    }
    const data = await res.json();
    if (data.type !== "file") throw new Error("Path is not a file");
    return {
      content: atob(data.content),
      sha: data.sha,
    };
  } catch {
    return null;
  }
}

export async function commitFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string = "main"
): Promise<CommitResult> {
  try {
    let sha: string | undefined;
    const existing = await getFileContent(token, owner, repo, path, branch);
    if (existing) {
      sha = existing.sha;
    }
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          content: btoa(content),
          sha,
          branch,
        }),
      }
    );
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData?.message || `GitHub API error: ${res.status}`,
      };
    }
    const data = await res.json();
    return { success: true, sha: data.content?.sha };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export const SETTINGS_FILE_MAP: Record<string, string> = {
  site: "site.json",
  social: "social.json",
  homepage: "homepage.json",
  seo: "seo.json",
  banner: "banner.json",
  footer: "footer.json",
  community: "community.json",
  donation: "donation.json",
  features: "features.json",
};

export async function commitSettingsFile(
  token: string,
  config: GitHubConfig,
  sectionKey: string,
  content: string,
  commitMessage?: string
): Promise<CommitResult> {
  const fileName = SETTINGS_FILE_MAP[sectionKey];
  if (!fileName) return { success: false, error: `Unknown section: ${sectionKey}` };
  const path = `content/settings/${fileName}`;
  const message = commitMessage || `Update settings: ${fileName}`;
  return commitFile(token, config.owner, config.repo, path, content, message, config.branch);
}
