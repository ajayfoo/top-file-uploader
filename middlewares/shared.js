import db from "../db.js";
import {
  deleteSharedFileUrlHavingFileId,
  recursivelyDeleteSharedFolderUrl,
} from "../controllers/sharedUrls.js";

import { isExpiredDate } from "../utils.js";

const deleteSharedFileUrlIfExpiredMiddleware = async (req, res, next) => {
  const id = req.params.id;
  const sharedUrl = await db.sharedFileUrl.findUnique({
    where: { id },
    include: { file: true },
  });
  if (sharedUrl === null || !isExpiredDate(sharedUrl.expiresOn)) {
    next();
    return;
  }
  await deleteSharedFileUrlHavingFileId(
    sharedUrl.fileId,
    sharedUrl.file.ownerId,
  );
  next();
};

const recursivelyDeleteSharedFolderUrlIfExpiredMiddleware = async (
  req,
  res,
  next,
) => {
  const id = parseInt(req.params.id);
  const sharedUrl = await db.sharedFolderUrl.findUnique({
    where: { id },
    include: { folder: true },
  });
  if (sharedUrl === null || !isExpiredDate(sharedUrl.expiresOn)) {
    next();
    return;
  }
  await recursivelyDeleteSharedFolderUrl(
    sharedUrl.folderId,
    sharedUrl.folder.ownerId,
  );
  next();
};

export {
  deleteSharedFileUrlIfExpiredMiddleware,
  recursivelyDeleteSharedFolderUrlIfExpiredMiddleware,
};
