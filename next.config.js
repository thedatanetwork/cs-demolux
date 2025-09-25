/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.contentstack.io',
      'eu-images.contentstack.io',
      'cdn.contentstack.io'
    ],
  },
  // Remove the env section - let Next.js handle environment variables automatically
  // This allows both build-time and runtime access to environment variables
}

module.exports = nextConfig
