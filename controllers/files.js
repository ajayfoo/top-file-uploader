import db from "../db.js";
import multer from "multer";
import { saveFiles, getDurations } from "../utils.js";
import { deleteSharedFileUrlHavingFileId } from "./sharedUrls.js";

const renderFileInfo = async (req, res, next) => {
  const { id: ownerId } = req.session.passport.user;
  const folderId = parseInt(req.params.folderId);
  const id = parseInt(req.params.id);
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
    next(new Error("File not found"));
    return;
  }
  const sharing = file.sharedUrl
    ? getDurations(file.sharedUrl.expiresOn)
    : null;
  if (sharing) {
    sharing.id = file.sharedUrl.id;
  }
  res.render("file_info", { file, folderId, sharing });
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
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const findFileInFolder = async (name, folderId, ownerId) => {
  return await db.file.findFirst({
    where: {
      name,
      ownerId,
      folderId,
    },
    include: {
      folder: {
        select: { name: true },
      },
    },
  });
};

const renameFile = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const folderId = parseInt(req.params.folderId);
  const id = parseInt(req.params.id);
  const { name } = req.body;
  const file = await findFileInFolder(name, folderId, ownerId);
  try {
    if (file) {
      return res.status(403).json({
        folderName: file.folder.name,
      });
    }
    await db.file.update({
      where: {
        id,
        ownerId,
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

export { renderFileInfo, fileUploadMiddlewares, removeFile, renameFile };
