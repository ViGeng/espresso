/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable server actions
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000'],
        },
    },
    output: 'standalone',
};

export default nextConfig;
