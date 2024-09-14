import db from "../db.js";
import multer from "multer";
import path from "node:path";
import { saveFiles, getDurations } from "../utils.js";
import { deleteSharedFileUrlHavingFileId } from "./sharedUrls.js";
import createHttpError from "http-errors";

const renderFileInfo = async (req, res, next) => {
  const { id: ownerId } = req.session.passport.user;
  const folderId = parseInt(req.params.folderId);
  const id = parseInt(req.params.id);
  try {
    const file = await db.file.findUnique({
      where: {
        ownerId,
        folderId,
        id,
      },
      include: {
        sharedUrl: true,
      },
    });
    if (!file) {
      next(createHttpError(404, "File not found"));
      return;
    }
    const sharing = file.sharedUrl
      ? getDurations(file.sharedUrl.expiresOn)
      : null;
    if (sharing) {
      sharing.id = file.sharedUrl.id;
    }
    res.render("file_info", { file, folderId, sharing });
  } catch (err) {
    next(err);
  }
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

const fileUploadMiddlewares = [
  upload.array("files"),
  async (req, res) => {
    const { id: ownerId } = req.session.passport.user;
    let folderId = null;
    if (req.params.folderId === "root") {
      folderId = req.session.passport.user.rootFolderId;
    } else {
      folderId = parseInt(req.params.folderId);
    }
    try {
      await saveFiles(req.files, ownerId, folderId);
      res.status(200).end();
    } catch {
      res.status(500).end();
    }
  },
];

const removeFile = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const { rootFolderId } = req.session.passport;
  const id = parseInt(req.params.id);
  const folderId = parseInt(req.params.folderId);
  try {
    await deleteSharedFileUrlHavingFileId(id, ownerId);
    await db.file.delete({
      where: {
        id,
        ownerId,
        folderId,
      },
    });
    if (folderId === rootFolderId) {
      res.redirect(303, "/");
    } else {
      res.redirect(303, "/folders/" + folderId);
    }
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const renameFile = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const folderId = parseInt(req.params.folderId);
  const id = parseInt(req.params.id);
  const { name } = req.body;
  try {
    await db.file.update({
      where: {
        id,
        ownerId,
        folderId,
      },
      data: {
        name,
      },
    });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const getFile = async (req, res, next) => {
  const { id: ownerId } = req.session.passport.user;
  const folderId = parseInt(req.params.folderId);
  const id = parseInt(req.params.id);
  try {
    const fileInfo = await db.file.findUnique({
      where: {
        id,
        ownerId,
        folderId,
      },
      select: {
        name: true,
      },
    });
    res.download(path.join("uploads", id.toString()), fileInfo.name, (err) => {
      if (!err) return;
      next(err);
    });
  } catch (err) {
    next(err);
  }
};

export {
  renderFileInfo,
  fileUploadMiddlewares,
  removeFile,
  renameFile,
  getFile,
};
