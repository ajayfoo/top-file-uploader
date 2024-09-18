import { db } from "../db.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import duration from "dayjs/plugin/duration.js";
import { isExpiredDate } from "../utils.js";
import { body, validationResult } from "express-validator";

const folderIdValidationMiddlwares = [
  body("folderId").notEmpty().withMessage("Folder ID must not be empty"),
];
const sharedUrlValidationMiddlwares = [
  body("minutes")
    .trim()
    .notEmpty()
    .withMessage("Minutes cannot be empty")
    .isInt({ min: 0 })
    .withMessage("Minutes must be a non -ve integer"),
  body("hours")
    .trim()
    .notEmpty()
    .withMessage("Hours cannot be empty")
    .isInt({ min: 0 })
    .withMessage("Minutes must be a non -ve integer"),
  body("days")
    .trim()
    .notEmpty()
    .withMessage("Days cannot be empty")
    .isInt({ min: 0 })
    .withMessage("Minutes must be a non -ve integer"),
  body("months")
    .trim()
    .notEmpty()
    .withMessage("Months cannot be empty")
    .isInt({ min: 0 })
    .withMessage("Minutes must be a non -ve integer"),
  body("years")
    .trim()
    .notEmpty()
    .withMessage("Years cannot be empty")
    .isInt({ min: 0 })
    .withMessage("Minutes must be a non -ve integer"),
  body()
    .custom((name, { req }) => {
      const { minutes, hours, days, months, years } = req.body;
      const totalDuration = [minutes, hours, days, months, years]
        .map((e) => parseInt(e))
        .reduce((acc, curr) => acc + curr, 0);
      console.log(totalDuration);
      return totalDuration > 0;
    })
    .withMessage("Sharing duration must be at least one minute"),
];

const sendValdationErrorsIfAny = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }
  const errorMsg = result
    .array()
    .reduce((acc, curr) => acc + ", " + curr.msg, "");
  res.status(400).send(errorMsg);
};

const upsertSharedFolderUrl = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const folderId = parseInt(
    req.body.folderId || req.session.passport.user.rootFolderId,
  );
  const sharingDuration = getSharingDuration(req);
  const expiresOn = dayjs.extend(utc).utc().add(sharingDuration).format();
  try {
    await recursivelyUpsertSharedFolderUrl(folderId, expiresOn, ownerId);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const upsertSharedFolderUrlAndValidationMiddlewares = [
  ...sharedUrlValidationMiddlwares,
  sendValdationErrorsIfAny,
  upsertSharedFolderUrl,
];

const upsertSharedUrlForFilesInFolder = async (
  folderId,
  ownerId,
  expiresOn,
) => {
  const filesWithId = await db.file.findMany({
    where: {
      folderId,
      ownerId,
    },
  });
  const sharedUrls = filesWithId.map((file) => ({
    fileId: file.id,
    expiresOn,
  }));
  const upserts = sharedUrls.map((url) =>
    db.sharedFileUrl.upsert({
      create: url,
      where: {
        fileId: url.fileId,
      },
      update: {
        expiresOn: url.expiresOn,
      },
    }),
  );
  await db.$transaction(upserts);
};

const deleteSharedUrlForFilesInFolder = (folderId, ownerId) => {
  return db.sharedFileUrl.deleteMany({
    where: {
      file: {
        folderId,
        ownerId,
      },
    },
  });
};

const recursivelyUpsertSharedFolderUrl = async (
  folderId,
  expiresOn,
  ownerId,
) => {
  const childFolders = await db.folder.findMany({
    where: { ownerId, parentId: folderId },
  });
  for (const folder of childFolders) {
    await recursivelyUpsertSharedFolderUrl(folder.id, expiresOn, ownerId);
  }
  await db.sharedFolderUrl.upsert({
    create: {
      folderId,
      expiresOn,
    },
    where: {
      folderId,
    },
    update: {
      expiresOn,
    },
  });
  await upsertSharedUrlForFilesInFolder(folderId, ownerId, expiresOn);
};

const recursivelyDeleteSharedFolderUrl = async (folderId, ownerId) => {
  const childFolders = await db.folder.findMany({
    where: { ownerId, parentId: folderId },
  });
  for (const folder of childFolders) {
    await recursivelyDeleteSharedFolderUrl(folder.id, ownerId);
  }
  await db.sharedFolderUrl.deleteMany({
    where: {
      folder: {
        ownerId,
        id: {
          in: [folderId],
        },
      },
    },
  });
  await deleteSharedUrlForFilesInFolder(folderId, ownerId);
};

const deleteSharedFolderUrlAndItsChildrenIfTheyAreExpired = async (
  folderId,
  ownerId,
) => {
  const folder = await db.folder.findUnique({
    where: { id: folderId, ownerId },
    include: {
      childrenFolder: { include: { sharedUrl: true } },
      files: { include: { sharedUrl: true } },
    },
  });
  for (const childFolder of folder.childrenFolder) {
    if (
      childFolder.sharedUrl === null ||
      !isExpiredDate(childFolder.sharedUrl.expiresOn)
    )
      continue;
    await deleteSharedFolderUrlAndItsChildrenIfTheyAreExpired(
      childFolder.id,
      ownerId,
    );
  }
  for (const file of folder.files) {
    if (file.sharedUrl === null || !isExpiredDate(file.sharedUrl.expiresOn))
      continue;
    await db.sharedFileUrl.delete({ where: { id: file.sharedUrl.id } });
  }
  await db.sharedFolderUrl.deleteMany({
    where: {
      folder: {
        ownerId,
        id: {
          in: [folderId],
        },
      },
    },
  });
};

const deleteSharedFolderUrl = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const folderId = parseInt(
    req.body.folderId || req.session.passport.user.rootFolderId,
  );
  try {
    await recursivelyDeleteSharedFolderUrl(folderId, ownerId);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const deleteSharedFolderUrlAndValidationMiddlewares = [
  ...folderIdValidationMiddlwares,
  sendValdationErrorsIfAny,
  deleteSharedFolderUrl,
];

const getSharingDuration = (req) => {
  const { minutes, hours, days, months, years } = req.body;
  const sharingDuration = dayjs
    .extend(duration)
    .duration({ minutes, hours, days, months, years });
  return sharingDuration;
};

const upsertSharedFileUrl = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const fileId = parseInt(req.body.fileId);
  const sharingDuration = getSharingDuration(req);
  const expiresOn = dayjs.extend(utc).utc().add(sharingDuration).format();
  try {
    await db.sharedFileUrl.upsert({
      create: {
        file: {
          connect: {
            id: fileId,
            ownerId,
          },
        },
        expiresOn,
      },
      where: {
        fileId,
      },
      update: {
        expiresOn,
      },
    });
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const upsertSharedFileUrlAndValidationMiddlewares = [
  ...sharedUrlValidationMiddlwares,
  sendValdationErrorsIfAny,
  upsertSharedFileUrl,
];

const deleteSharedFileUrlHavingFileId = (fileId, ownerId) =>
  db.sharedFileUrl.deleteMany({
    where: {
      file: {
        ownerId,
        id: {
          in: [fileId],
        },
      },
    },
  });

const fileIdValidationMiddlwares = [
  body("fileId").notEmpty().withMessage("File ID must not be empty"),
];

const deleteSharedFileUrl = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const fileId = parseInt(req.body.fileId);
  try {
    await deleteSharedFileUrlHavingFileId(fileId, ownerId);
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const deleteSharedFileUrlAndValidationMiddlewares = [
  ...fileIdValidationMiddlwares,
  sendValdationErrorsIfAny,
  deleteSharedFileUrl,
];

export {
  recursivelyDeleteSharedFolderUrl,
  upsertSharedFolderUrlAndValidationMiddlewares,
  deleteSharedFolderUrlAndValidationMiddlewares,
  upsertSharedFileUrlAndValidationMiddlewares,
  deleteSharedFileUrlAndValidationMiddlewares,
  deleteSharedFileUrlHavingFileId,
  deleteSharedFolderUrlAndItsChildrenIfTheyAreExpired,
};
