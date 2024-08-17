import { fileTypeFromBuffer } from "file-type";
import mime from "mime/lite";
import db from "./db.js";

const getFormattedFileInfo = async (file) => {
  const originalname = file.originalname;
  const result = await fileTypeFromBuffer(file.buffer);
  if (!result) {
    return { name: originalname, mimeType: mime.getType(originalname) };
  }
  const ext = result.ext;
  console.log(ext);
  console.log(mime.getType(ext));
  return { name: originalname, mimeType: mime.getType(ext) };
};

const saveFiles = async (files, ownerId, parentId) => {
  const formattedFiles = await Promise.all(
    files.map(async (f) => {
      const fileInfo = await getFormattedFileInfo(f);
      const formattedFile = {
        ...fileInfo,
        ownerId,
        parentId,
      };
      return formattedFile;
    }),
  );
  console.log(formattedFiles);
  const result = await db.file.createMany({
    data: formattedFiles,
  });
  console.log(result);
};

export { saveFiles };
