import type { NextConfig } from "next";

/**
 * `output: "standalone"` is a self-hosting feature. It resolves the build's
 * file traces into `.next/standalone` for the Docker image, and the trace
 * manifests it consumes (`.next/next-server.js.nft.json`) are not part of the
 * standalone tree it produces.
 *
 * Vercel's Next.js integration builds from the normal `.next` output and reads
 * those manifests itself, so standalone must stay off there. It is therefore
 * opt-in through `NEXT_OUTPUT`, which only the Dockerfile sets.
 */
const nextConfig: NextConfig = {
  ...(process.env.NEXT_OUTPUT === "standalone"
    ? { output: "standalone" as const }
    : {}),
};

export default nextConfig;
