/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;