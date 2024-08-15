import { fileTypeFromBuffer } from "file-type";
import mime from "mime/lite";
import db from "./db.js";

const getExt = (fileName) => {
  const extIndex = fileName.lastIndexOf(".");
  if (extIndex === -1) return "";
  return fileName.slice(extIndex + 1);
};

const getFileName = async (file) => {
  const originalname = file.originalname;
  const result = await fileTypeFromBuffer(file.buffer);
  if (!result) return originalname;
  const ext = result.ext;
  const possibleExts = mime.getAllExtensions(result.mime);
  if (possibleExts.has(getExt(originalname))) {
    return originalname;
  }
  return originalname + "." + ext;
};

const saveFiles = async (files, ownerId, parentId) => {
  const formattedFiles = await Promise.all(
    files.map(async (f) => ({
      name: await getFileName(f),
      mimeType: "txt",
      ownerId,
      parentId,
    })),
  );
  const result = await db.file.createMany({
    data: formattedFiles,
  });
  console.log(result);
};

export { saveFiles };
