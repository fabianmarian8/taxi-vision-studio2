/**
 * GitHub API Helper
 *
 * Provides functions to read and write files in GitHub repository.
 * Used for storing cities data in production (Vercel) environment.
 */

interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

interface GitHubFileContent {
  content: string;
  sha: string;
}

/**
 * Get GitHub configuration from environment variables
 */
function getGitHubConfig(): GitHubConfig {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    throw new Error(
      'Missing GitHub configuration. Please set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO environment variables.'
    );
  }

  return { token, owner, repo };
}

/**
 * Read a file from GitHub repository
 *
 * @param filePath - Path to the file in the repository (e.g., "src/data/cities.json")
 * @returns File content as string
 */
export async function readFileFromGitHub(filePath: string): Promise<string> {
  const config = getGitHubConfig();
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;

  console.log('[GitHub] Reading file:', filePath);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to read file from GitHub: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  // GitHub returns content as base64 encoded string
  const content = Buffer.from(data.content, 'base64').toString('utf-8');

  console.log('[GitHub] File read successfully');
  return content;
}

/**
 * Get file content and SHA from GitHub
 * SHA is required for updating files
 */
async function getFileContentAndSha(filePath: string): Promise<GitHubFileContent> {
  const config = getGitHubConfig();
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get file SHA from GitHub: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');

  return {
    content,
    sha: data.sha,
  };
}

/**
 * Write a file to GitHub repository
 *
 * @param filePath - Path to the file in the repository (e.g., "src/data/cities.json")
 * @param content - File content as string
 * @param commitMessage - Commit message for the update
 */
export async function writeFileToGitHub(
  filePath: string,
  content: string,
  commitMessage: string
): Promise<void> {
  const config = getGitHubConfig();
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;

  console.log('[GitHub] Writing file:', filePath);

  // Get current file SHA (required for update)
  const { sha } = await getFileContentAndSha(filePath);

  // Encode content to base64
  const contentBase64 = Buffer.from(content, 'utf-8').toString('base64');

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: commitMessage,
      content: contentBase64,
      sha,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to write file to GitHub: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
    );
  }

  console.log('[GitHub] File written successfully');
}

/**
 * Check if GitHub is configured
 * Returns true if all required environment variables are set
 */
export function isGitHubConfigured(): boolean {
  return !!(
    process.env.GITHUB_TOKEN &&
    process.env.GITHUB_OWNER &&
    process.env.GITHUB_REPO
  );
}
