import cloudinary from "./cloudinary";

export async function saveUploadedFile(
  file: File,
  folder = "calmly/therapist-docs"
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Cloudinary's upload_stream expects a stream, so we wrap it in a Promise
  const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder, // keeps uploads organized in your Cloudinary account
        resource_type: "auto", // handles PDFs, images, etc. automatically
      },
      (error, result) => {
        if (error || !result) {
          reject(error);
        } else {
          resolve(result as { secure_url: string });
        }
      }
    );

    uploadStream.end(buffer);
  });

  return uploadResult.secure_url;
}