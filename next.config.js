/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // therapist/patient avatars and verification documents are uploaded
      // to this Cloudinary cloud (see src/lib/uploadFile.ts)
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};
module.exports = nextConfig;
