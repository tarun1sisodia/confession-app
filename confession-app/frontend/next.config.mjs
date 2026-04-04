import path from "path";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

export default (phase) => {
  const nextConfig = {
    outputFileTracingRoot: path.join(import.meta.dirname, "..", ".."),
    images: {
      unoptimized: true
    }
  };

  if (phase !== PHASE_DEVELOPMENT_SERVER) {
    nextConfig.output = "export";
  }

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    nextConfig.rewrites = async () => [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*"
      }
    ];
  }

  return nextConfig;
};
