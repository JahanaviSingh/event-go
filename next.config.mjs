import { hostname } from "os";


const nextConfig = {
  images: {
    remotePatterns: [
      {hostname:'image.clerk.com'},
      {hostname:'res.cloudinary.com'},
      {hostname: '*'},
    ],
},
}

export default nextConfig
