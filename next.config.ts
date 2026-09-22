import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    serverActions: {
      // Resume PDFs arrive through a server action; the default is 1MB,
      // which some resumes exceed. The upload itself is capped at 4MB in
      // code, and this leaves room for the form's own overhead.
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;