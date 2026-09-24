const backend=process.env.BACKEND_URL||"http://localhost:4000";
/** @type {import('next').NextConfig} */
const nextConfig={reactStrictMode:true,async rewrites(){return[{source:"/api/backend/:path*",destination:backend+"/:path*"}]}};export default nextConfig;