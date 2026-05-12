import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function main() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  
  const owner = 'mohamedalib2001';
  const repo = 'INFERA-Finance-AI-Global-Cloud';
  
  console.log('Syncing with GitHub...');
  
  // Get the latest commit SHA
  const { data: ref } = await octokit.git.getRef({
    owner,
    repo,
    ref: 'heads/main'
  });
  const latestCommitSha = ref.object.sha;
  
  // Get the tree for the latest commit
  const { data: commit } = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: latestCommitSha
  });
  
  // Files to sync
  const filesToSync = [
    'client/src/App.tsx',
    'client/src/pages/Landing.tsx',
    'client/src/pages/Dashboard.tsx',
    'client/src/components/SubscriptionForm.tsx',
    'client/src/components/BackgroundEffect.tsx',
    'client/src/components/Loader.tsx',
    'client/src/lib/i18n.ts',
    'client/src/lib/i18n-context.tsx',
    'client/index.html',
    'shared/schema.ts',
    'tailwind.config.ts',
    'deploy.sh',
    'deploy/README-DEPLOY.md',
    'remote_setup.sh'
  ];
  
  const blobs = [];
  
  for (const filePath of filesToSync) {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const { data: blob } = await octokit.git.createBlob({
        owner,
        repo,
        content: Buffer.from(content).toString('base64'),
        encoding: 'base64'
      });
      blobs.push({
        path: filePath,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blob.sha
      });
      console.log(`Uploaded: ${filePath}`);
    }
  }
  
  // Create a new tree
  const { data: newTree } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: commit.tree.sha,
    tree: blobs
  });
  
  // Create a new commit
  const { data: newCommit } = await octokit.git.createCommit({
    owner,
    repo,
    message: 'INFERA Finance AI GlobalCloud MVP - Dashboard + i18n + Schema',
    tree: newTree.sha,
    parents: [latestCommitSha]
  });
  
  // Update the reference
  await octokit.git.updateRef({
    owner,
    repo,
    ref: 'heads/main',
    sha: newCommit.sha
  });
  
  console.log('Successfully synced to GitHub!');
  console.log(`Commit: ${newCommit.sha}`);
}

main().catch(console.error);
