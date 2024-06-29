/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ['firebasestorage.googleapis.com'],
    }
};


export default nextConfig;
