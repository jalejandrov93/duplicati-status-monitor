/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilitar output standalone para Docker
  output: 'standalone',
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  }
};

export default nextConfig;
