import db from "../db.js";
import multer from "multer";
import { saveFiles } from "../utils.js";

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
  });
  console.log(file);
  if (!file) {
    next(new Error("File not found"));
    return;
  }
  res.render("file_info", { file, folderId });
};

const storage = multer.memoryStorage();
const upload = multer({ storage });
const getIdsOfFileToReplace = (req) => {
  const idsOfFilesToReplace = req.body.idsOfFilesToReplace ?? [];
  if (!Array.isArray(idsOfFilesToReplace)) {
    return [idsOfFilesToReplace].map(parseInt);
  }
  return idsOfFilesToReplace.map(parseInt);
};

const removeToBeReplacedFiles = async (req, res, next) => {
  const { id: ownerId } = req.session.passport.user;
  const idsOfFilesToReplace = getIdsOfFileToReplace(req);
  try {
    await db.file.deleteMany({
      where: {
        ownerId,
        id: {
          in: idsOfFilesToReplace,
        },
      },
    });
    next();
  } catch (err) {
    next(err);
  }
};

const areEqualArrays = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  for (const e1 of arr1) {
    if (!arr2.includes(e1)) return false;
  }
  return true;
};

const sendDuplicateFileNamesIfAny = async (req, res, next) => {
  if (req.files.length === 0) return res.status(200).end();
  const idsOfFilesToReplace = getIdsOfFileToReplace(req);
  const { id: ownerId } = req.session.passport.user;
  const folderId = parseInt(req.params.folderId);
  try {
    const duplicateFiles = await db.file.findMany({
      where: {
        ownerId,
        folderId,
        name: {
          in: req.files.map((f) => f.originalname),
        },
      },
      select: {
        name: true,
        id: true,
      },
    });
    if (
      areEqualArrays(
        duplicateFiles.map((f) => f.id),
        idsOfFilesToReplace,
      )
    ) {
      return next();
    }
    res.status(409).json(duplicateFiles);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};
const fileUploadMiddlewares = [
  upload.array("files"),
  sendDuplicateFileNamesIfAny,
  removeToBeReplacedFiles,
  async (req, res) => {
    const { id: ownerId } = req.session.passport.user;
    const folderId = parseInt(req.params.folderId);
    await saveFiles(req.files, ownerId, folderId);
    res.status(200).end();
  },
];

const removeFile = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const id = parseInt(req.params.id);
  try {
    await db.file.delete({
      where: {
        id,
        ownerId,
      },
    });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const renameFile = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const id = parseInt(req.params.id);
  const { name } = req.body;
  try {
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
