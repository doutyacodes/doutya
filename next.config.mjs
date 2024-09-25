/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['images.pexels.com'],
      },
      experimental: {
        serverActions: true, // This could help in extending some of the request handling.
      },
      api: {
        bodyParser: false, // Disable body parsing for file uploads or other needs
        externalResolver: true, // External API resolution might give more control
      },
};

export default nextConfig;
