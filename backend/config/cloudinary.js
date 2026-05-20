import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";

config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME ?? process.env.cloud_name,
  api_key: process.env.API_KEY ?? process.env.api_key,
  api_secret: process.env.API_SECRET ?? process.env.api_secret,
});

export default cloudinary;
