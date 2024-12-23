/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	// Enable if you're using images from external domains
	images: {
		domains: ['your-domain.com'],
	},
};

module.exports = nextConfig;
