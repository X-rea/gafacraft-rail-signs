import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      images: {
        unoptimized: true,
      },
      typescript: {
        tsconfigPath: "tsconfig.static.json",
      },
    }
  : {};

export default nextConfig;
