elevant failures: the install step failed (line 221) and the pnpm process was killed (line 222). There are repeated pnpm warnings about failing to create bin links (line 49, line 124-L128). The immediate failure is "pnpm install ... Killed" (line 222) and "Failed to install dependencies" (line 224).
Error type and likely cause: dependency installation failed because the pnpm process was terminated (Killed) — most commonly this is an out-of-memory (OOM) kill in the CI environment while pnpm was installing many workspace packages / running many concurrent tasks. The "Failed to create bin" warnings are secondary symptoms of an interrupted/failed install.
Solution Try the low-friction fixes below (in order). The quickest and most reliable fix for Netlify is to reduce pnpm concurrency so the installer uses less memory.

Reduce pnpm concurrency (recommended)
In the Netlify site settings add an environment variable:
Key: PNPM_FLAGS
Value: --workspace-concurrency 1
Or override the build command to run install with lower concurrency. In netlify.toml (root of repo) add or update:
[build]
  command = "pnpm install --workspace-concurrency 1 && pnpm run build"
  publish = "dist" # update if your publish directory differs
This forces pnpm to install one workspace package at a time, reducing peak memory usage and preventing the OOM kill.

(Optional) Increase Node's memory limit if concurrency reduction alone isn't enough
Add an environment variable in Netlify:
Key: NODE_OPTIONS
Value: --max_old_space_size=4096 This raises Node's heap limit for the install/build processes. Note this only helps if the container has enough available memory.
If you still hit problems, try these troubleshooting steps:
Run pnpm install locally (or in a similar constrained environment) to reproduce the issue.
If your build does not need devDependencies to install (e.g., pure runtime install), consider installing only production deps on CI: use pnpm install --prod (but only if your build does not require devDependencies).
As a fallback, switch to npm or Yarn for the Netlify build (set build command to use npm ci or yarn install) if pnpm cannot complete within the environment constraints.
What to check if changes don’t help

Verify the repository contains package.json and the lockfile (pnpm-lock.yaml) at the root/workspace locations you expect and that they were committed. Run the install locally to confirm the lockfile is consistent.
If you suspect Node version mismatch, consider pinning Node via Netlify settings or an .nvmrc. See Netlify docs for changing Node versions: https://docs.netlify.com/configure-builds/manage-dependencies/#node-js-and-javascript
If you want, tell me whether you prefer to set PNPM_FLAGS in the Netlify UI or change netlify.toml and I can give the exact minimal change for your repo.

Fix with agent

Copy analysis
Need more help? Go to Ask Netlify

Retry diagnostics
Netlify uses AI to analyze and generate solutions to fix deploy failures. It may not always understand the full context or produce a reliable, accurate answer. To learn more, please refer to our docs.

Did you find this helpful? Your feedback helps improve this feature.



import { createApp } from "./app";

const app = createApp();
const PORT = Number(process.env.PORT || 10000);

if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KUWESA server listening on port ${PORT}`);
    const base =
      process.env.APP_BASE_URL ||
      `https://${(process.env.REPLIT_DOMAINS || "").split(",")[0]?.trim() || "localhost"}`;
    console.log(`Pesapal IPN will register against: ${base}/api/payments/ipn`);
  });
}

export default app;
