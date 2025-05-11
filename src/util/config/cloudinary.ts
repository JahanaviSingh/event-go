import { v2 as cloudinary } from 'cloudinary'
import { ConfigOptions } from 'cloudinary'

const config: ConfigOptions = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
}

cloudinary.config(config)

export default cloudinary
