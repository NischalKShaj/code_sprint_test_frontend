// utils/compressVideo.ts
import imageCompression from "browser-image-compression";

export const compressVideo = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 10, // Maximum size in MB
    maxWidthOrHeight: 1920, // Maximum width or height
    useWebWorker: true, // Use web worker for faster compression
    fileType: "video/mp4", // Output file type
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Error compressing video:", error);
    throw error;
  }
};
