import { buildInfo } from '../build-info';

export interface BuildMetadata {
  appName: string;
  gitCommit: string;
  buildTimestamp: string;
  nodeEnv: string;
  versionSourceStatus: string;
}

export function getBuildMetadata(): BuildMetadata {
  const envs = [
    { name: 'RENDER_GIT_COMMIT', val: process.env.RENDER_GIT_COMMIT },
    { name: 'GIT_COMMIT', val: process.env.GIT_COMMIT },
    { name: 'GIT_SHA', val: process.env.GIT_SHA },
    { name: 'COMMIT_SHA', val: process.env.COMMIT_SHA },
    { name: 'VERCEL_GIT_COMMIT_SHA', val: process.env.VERCEL_GIT_COMMIT_SHA },
    { name: 'SOURCE_VERSION', val: process.env.SOURCE_VERSION },
    { name: 'npm_package_version', val: process.env.npm_package_version },
  ];

  const activeEnv = envs.find(e => e.val && e.val.trim().length > 0);

  const gitCommit = activeEnv?.val || buildInfo.gitCommit || "unknown";
  const versionSourceStatus = activeEnv?.name || (buildInfo.gitCommit ? "BUILD_FALLBACK" : "unknown");

  return {
    appName: "safety-insite-backend",
    gitCommit,
    buildTimestamp: buildInfo.buildTimestamp || "unknown",
    nodeEnv: process.env.NODE_ENV || "development",
    versionSourceStatus,
  };
}
