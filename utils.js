import { fileTypeFromBuffer } from "file-type";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import duration from "dayjs/plugin/duration.js";
import mime from "mime/lite";
import db from "./db.js";

const getSizeUnits = (e) => {
  switch (e) {
    case 1:
      return "KB";
    case 2:
      return "MB";
    case 3:
      return "GB";
    case 4:
      return "TB";
    default:
      return "??";
  }
};

const getDisplayFileSize = (sizeInBytes) => {
  for (let e = 4; e >= 1; --e) {
    const formattedFileSize = sizeInBytes / Math.pow(10, 3 * e);
    if (formattedFileSize >= 1)
      return formattedFileSize.toFixed(2) + " " + getSizeUnits(e);
  }
  return sizeInBytes + " Bytes";
};

const getFormattedFileInfo = async (file) => {
  const originalname = file.originalname;
  const formattedFileInfo = {
    name: originalname,
    mimeType: mime.getType(originalname),
    size: file.size,
    displaySize: getDisplayFileSize(file.size),
  };
  const result = await fileTypeFromBuffer(file.buffer);
  if (result) {
    formattedFileInfo.mimeType = result.mime;
  }
  return formattedFileInfo;
};

const saveFiles = async (files, ownerId, folderId) => {
  const formattedFiles = await Promise.all(
    files.map(async (f) => {
      const fileInfo = await getFormattedFileInfo(f);
      const formattedFile = {
        ...fileInfo,
        ownerId,
        folderId,
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

const getDurations = (endDate) => {
  dayjs.extend(utc);
  dayjs.extend(duration);
  const today = dayjs().utc();
  const sharingTill = dayjs(endDate).utc();
  const timeLeft = dayjs.duration(sharingTill.diff(today));
  return {
    minutes: timeLeft.minutes(),
    hours: timeLeft.hours(),
    days: timeLeft.days(),
    months: timeLeft.months(),
    years: timeLeft.years(),
  };
};

export { saveFiles, getDurations };
