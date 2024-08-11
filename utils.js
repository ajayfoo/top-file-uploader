import { fileTypeFromBuffer } from "file-type";
import fs from "node:fs/promises";
import mime from "mime/lite";

const getExt = (fileName) => {
  const extIndex = fileName.lastIndexOf(".");
  if (extIndex === -1) return "";
  return fileName.slice(extIndex + 1);
};
const getFileName = async (file) => {
  const originalname = file.originalname;
  const result = await fileTypeFromBuffer(file.buffer);
  const ext = result.ext;
  const possibleExts = mime.getAllExtensions(result.mime);
  if (possibleExts.has(getExt(originalname))) {
    return originalname;
  }
  return originalname + "." + ext;
};
const saveFile = async (file) => {
  const fileName = await getFileName(file);
  await fs.writeFile("uploads/" + fileName, file.buffer);
};
const saveFiles = async (files) => {
  await Promise.all(files.map(saveFile));
};

export { saveFiles };
