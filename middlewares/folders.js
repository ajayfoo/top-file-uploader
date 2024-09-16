import { db } from "../db.js";
import { deleteSharedFolderUrlAndItsChildrenIfTheyAreExpired } from "../controllers/sharedUrls.js";

import { isExpiredDate } from "../utils.js";

const recursivelyDeleteSharedFolderUrlIfExpiredMiddleware = async (
  req,
  res,
  next,
) => {
  const isRoot = req.params.id === undefined || req.params.id === "root";
  const folderId = isRoot
    ? req.session.passport.user.rootFolderId
    : parseInt(req.params.id);
  try {
    const sharedUrl = await db.sharedFolderUrl.findUnique({
      where: { folderId },
      include: { folder: true },
    });
    if (sharedUrl === null || !isExpiredDate(sharedUrl.expiresOn)) {
      next();
      return;
    }
    await deleteSharedFolderUrlAndItsChildrenIfTheyAreExpired(
      sharedUrl.folderId,
      sharedUrl.folder.ownerId,
    );
    next();
  } catch (err) {
    next(err);
  }
};

export { recursivelyDeleteSharedFolderUrlIfExpiredMiddleware };
