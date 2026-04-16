/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
};
export default nextConfig;
