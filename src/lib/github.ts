const GITHUB_API = "https://api.github.com";
const DEDUP_WINDOW_MS = 30_000;

type GitHubConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
};

type QueuedCommit = {
  path: string;
  content: string;
  message: string;
};

function getConfig(): GitHubConfig | null {
  if (typeof process === "undefined") return null;
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !owner || !repo) return null;
  return { token, owner, repo, branch };
}

async function getSha(path: string, config: GitHubConfig): Promise<string | null> {
  try {
    const url = `${GITHUB_API}/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${config.token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha || null;
  } catch {
    return null;
  }
}

const recentlyCommitted = new Map<string, number>();
const commitQueue = new Map<string, QueuedCommit>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushPromise: Promise<void> | null = null;

function cleanupExpired(): void {
  const now = Date.now();
  for (const [key, ts] of recentlyCommitted) {
    if (now - ts > DEDUP_WINDOW_MS * 6) {
      recentlyCommitted.delete(key);
    }
  }
}

function shouldSkip(path: string, config: GitHubConfig): boolean {
  const key = `${config.owner}/${config.repo}/${path}`;
  const lastCommit = recentlyCommitted.get(key);
  if (lastCommit && Date.now() - lastCommit < DEDUP_WINDOW_MS) {
    return true;
  }
  recentlyCommitted.set(key, Date.now());
  return false;
}

function enqueueCommit(path: string, content: string, message: string): void {
  if (commitQueue.has(path)) {
    const existing = commitQueue.get(path)!;
    existing.content = content;
    existing.message = message;
    return;
  }
  commitQueue.set(path, { path, content, message });
  if (flushTimer) clearTimeout(flushTimer);
  if (commitQueue.size >= 5) {
    flush();
  } else {
    flushTimer = setTimeout(() => flush(), 2000);
  }
}

async function flush(): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (flushPromise) return flushPromise;
  if (commitQueue.size === 0) return;

  const batch = [...commitQueue.values()];
  commitQueue.clear();
  const config = getConfig();
  if (!config) return;

  flushPromise = (async () => {
    for (const item of batch) {
      if (shouldSkip(item.path, config)) {
        continue;
      }
      try {
        const sha = await getSha(item.path, config);
        const body: Record<string, unknown> = {
          message: item.message,
          content: Buffer.from(item.content, "utf-8").toString("base64"),
          branch: config.branch,
        };
        if (sha) body.sha = sha;

        const url = `${GITHUB_API}/repos/${config.owner}/${config.repo}/contents/${item.path}`;
        const res = await fetch(url, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${config.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errBody = await res.text();
          console.error(`GitHub commit failed (${res.status}): ${errBody}`);
        }
      } catch (err) {
        console.error("GitHub commit error:", err);
      }
    }
  })();

  try {
    await flushPromise;
  } finally {
    flushPromise = null;
    cleanupExpired();
  }
}

export function commitFile(path: string, content: string, message: string): void {
  enqueueCommit(path, content, message);
}

export async function deleteFile(path: string, message: string): Promise<boolean> {
  const config = getConfig();
  if (!config) return false;

  try {
    const sha = await getSha(path, config);
    if (!sha) return false;

    const url = `${GITHUB_API}/repos/${config.owner}/${config.repo}/contents/${path}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        sha,
        branch: config.branch,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`GitHub delete failed (${res.status}): ${errBody}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("GitHub delete error:", err);
    return false;
  }
}

export function moveSubmissionToContent(
  filename: string,
  content: string,
  category: string
): void {
  const targetPath = `content/workflows/${category}/${filename}`;
  commitFile(targetPath, content, `Add workflow: ${filename}`);
}
