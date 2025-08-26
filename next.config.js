/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "export",
	compiler: {
		styledComponents: {
			ssr: true,
			displayName: true
		}
	},
	images: {
		unoptimized: true
	}
}

export default nextConfig
