import { deleteSharedFileUrlHavingFileId } from "../controllers/sharedUrls.js";
import db from "../db.js";

import { isExpiredDate } from "../utils.js";
const deleteSharedFileUrlIfExpiredMiddleware = async (req, res, next) => {
  const fileId = parseInt(req.params.id);
  try {
    const sharedUrl = await db.sharedFileUrl.findUnique({
      where: { fileId },
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
  } catch (err) {
    next(err);
  }
};

export { deleteSharedFileUrlIfExpiredMiddleware };
