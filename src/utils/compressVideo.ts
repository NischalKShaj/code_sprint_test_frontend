export const compressVideo = async (file: File): Promise<File> => {
  const ffmpegModule: any = await import("@ffmpeg/ffmpeg");
  const createFFmpeg = ffmpegModule.createFFmpeg;
  const fetchFile = ffmpegModule.fetchFile;

  const ffmpeg = createFFmpeg({ log: true });

  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  const fileName = file.name;
  const outputFileName = `compressed_${fileName}`;

  ffmpeg.FS("writeFile", fileName, await fetchFile(file));

  await ffmpeg.run(
    "-i",
    fileName,
    "-vcodec",
    "libx264",
    "-crf",
    "28",
    outputFileName
  );

  const data = ffmpeg.FS("readFile", outputFileName);

  const compressedFile = new File([data.buffer], outputFileName, {
    type: "video/mp4",
  });

  ffmpeg.FS("unlink", fileName);
  ffmpeg.FS("unlink", outputFileName);

  return compressedFile;
};
