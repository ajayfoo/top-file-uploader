import { db, fileDb } from "../db.js";
import multer from "multer";
import { saveFiles, getDurations, getDisplayDateTime } from "../utils.js";
import { deleteSharedFileUrlHavingFileId } from "./sharedUrls.js";
import createHttpError from "http-errors";
import { body, validationResult } from "express-validator";

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
    const uploadedAt = getDisplayDateTime(file.uploadedAt);
    res.render("file_info", { file, folderId, sharing, uploadedAt });
  } catch (err) {
    next(err);
  }
};

const hasFilesAbove50MB = (files) => {
  for (const file of files) {
    if (file.size > 52_428_800) {
      return true;
    }
  }
  return false;
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

const fileUploadMiddlewares = [
  upload.array("files"),
  async (req, res, next) => {
    if (hasFilesAbove50MB(req.files)) {
      next(createHttpError(403, "File size cannot exceed 50MB"));
      return;
    }
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
    await fileDb.storage.from("main").remove([id.toString()]);
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

const fileNameValidationMiddlewares = [
  body("name").trim().notEmpty().withMessage("File name must not be empty"),
];

const sendValdationErrorsIfAny = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }
  const firstErrorMsg = result.array()[0].msg;
  res.status(400).send(firstErrorMsg);
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

const renameFileAndValidationMiddlewares = [
  ...fileNameValidationMiddlewares,
  sendValdationErrorsIfAny,
  renameFile,
];

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
    const { data, error } = await fileDb.storage
      .from("main")
      .download(id.toString());
    if (error) {
      throw error;
    }
    res.set({
      "Cache-Control": "no-cache",
      "Content-Type": data.type,
      "Content-Length": data.size,
      "Content-Disposition": "attachment; filename=" + fileInfo.name,
    });
    const arrayBuffer = await data.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    next(err);
  }
};

export {
  renderFileInfo,
  fileUploadMiddlewares,
  removeFile,
  renameFileAndValidationMiddlewares,
  getFile,
};
