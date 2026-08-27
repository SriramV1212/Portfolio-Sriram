import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Local, trusted SVG logo assets (public/education/*.svg) — safe to
    // let next/image optimize since these aren't user- or remote-supplied.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
