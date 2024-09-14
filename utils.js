import { fileTypeFromBuffer } from "file-type";
import fs from "node:fs/promises";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import duration from "dayjs/plugin/duration.js";
import mime from "mime/lite";
import db from "./db.js";
import { Prisma } from "@prisma/client";
import path from "node:path";

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
  const valueArray = await Promise.all(
    files.map(async (f) => {
      console.log(Object.keys(f));
      const i = await getFormattedFileInfo(f);
      return [i.name, i.mimeType, i.size, i.displaySize, ownerId, folderId];
    }),
  );
  const fileIds = await db.$queryRaw`
  INSERT INTO "File" (name,"mimeType",size,"displaySize","ownerId","folderId") VALUES ${Prisma.join(
    valueArray.map((row) => Prisma.sql`(${Prisma.join(row)})`),
  )} RETURNING id`;
  await Promise.all(
    valueArray.map(async (f, i) => {
      const id = fileIds[i].id;
      const buffer = files[i].buffer;
      fs.writeFile(path.join("uploads", id.toString()), buffer);
    }),
  );
  console.log(fileIds);
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

const isExpiredDate = (expiresOn) => {
  const now = dayjs();
  const formattedExpiresOn = dayjs(expiresOn);
  const remainingTime = formattedExpiresOn.diff(now);
  return remainingTime <= 0;
};

const getDisplayDateTime = (dateTime) => {
  const displayDateTime = dayjs(dateTime).format("DD/MM/YYYY hh:mm:ss A");
  return displayDateTime;
};

export { saveFiles, getDurations, isExpiredDate, getDisplayDateTime };
