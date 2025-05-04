/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["via.placeholder.com", "res.cloudinary.com"],
    // Alternatively, you can use remotePatterns for more security
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dnb5cxo2m/image/upload/**",
      },
    ],
  },
};

module.exports = nextConfig;
