import { hostname } from "os";


const nextConfig = {
  images: {
    remotePatterns: [
      {hostname:'image.clerk.com'},
      {hostname:'res.cloudinary.com'},
    ],
},
}

export default nextConfig
