import multer from "multer";
import { saveFiles } from "../utils.js";
import db from "../db.js";

const renderIndex = async (req, res) => {
  const { id, rootFolderId } = req.session.passport.user;
  const [user, parentFolder] = await Promise.all([
    db.user.findUnique({
      where: {
        id,
      },
      include: {
        folders: {
          where: {
            parentId: rootFolderId,
          },
        },
        files: {
          where: {
            parentId: rootFolderId,
          },
        },
      },
    }),
    db.folder.findUnique({
      where: {
        id: rootFolderId,
      },
    }),
  ]);
  res.render("index", {
    username: user.username,
    folders: user.folders,
    files: user.files,
    parentFolder: { id: rootFolderId, name: parentFolder.name },
    isRoot: true,
  });
};

const renderNonRootFolderPage = async (req, res) => {
  const parentId = parseInt(req.params.id);
  const { id } = req.session.passport.user;
  const [user, parentFolder] = await Promise.all([
    db.user.findUnique({
      where: {
        id,
      },
      include: {
        folders: {
          where: {
            parentId,
          },
        },
        files: {
          where: {
            parentId,
          },
        },
      },
    }),
    db.folder.findUnique({
      where: {
        id: parentId,
      },
    }),
  ]);
  res.render("index", {
    username: user.username,
    folders: user.folders,
    files: user.files,
    parentFolder: { id: parentId, name: parentFolder.name },
    isRoot: false,
  });
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
  const idsOfFilesToReplace = getIdsOfFileToReplace(req);
  try {
    await db.file.deleteMany({
      where: {
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
  const parentId = parseInt(req.body.parentId);
  try {
    const duplicateFiles = await db.file.findMany({
      where: {
        ownerId,
        parentId,
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
    const parentId = parseInt(req.body.parentId);
    await saveFiles(req.files, ownerId, parentId);
    res.status(200).end();
  },
];

const removeFile = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await db.file.delete({
      where: {
        id,
      },
    });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const renameFile = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;
  try {
    await db.file.update({
      where: {
        id,
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

const getDuplicateFolder = async (name, parentId, ownerId) => {
  const result = await db.$queryRaw`
    SELECT name FROM "Folder" WHERE "parentId" = ${parseInt(parentId)} AND LOWER(name) = LOWER(${name}) AND "ownerId" = ${parseInt(ownerId)}
    `;
  return result[0];
};

const createFolder = async (req, res) => {
  const { id } = req.session.passport.user;
  const { name, parentId } = req.body;
  try {
    const duplicateFolder = await getDuplicateFolder(name, parentId, id);
    if (duplicateFolder) {
      return res.status(403).json({ duplicateName: duplicateFolder.name });
    }
    await db.folder.create({
      data: {
        name,
        parent: {
          connect: {
            id: parseInt(parentId),
          },
        },
        owner: {
          connect: {
            id: parseInt(id),
          },
        },
      },
    });
    res.redirect("../");
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const renderFileInfo = async (req, res, next) => {
  const id = parseInt(req.params.id);
  const file = await db.file.findUnique({
    where: {
      id,
    },
  });
  if (!file) {
    next(new Error("File not found"));
    return;
  }
  res.render("file_info", { file });
};

const renameFolder = async (req, res) => {
  const id = parseInt(req.params.id) || req.session.passport.user.rootFolderId;
  const { newName: name } = req.body;
  try {
    await db.folder.update({
      where: {
        id,
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

const recursivelyDeleteFolder = async (id) => {
  const [childFolders, childFiles] = await Promise.all([
    db.folder.findMany({
      where: {
        parentId: id,
      },
    }),
    db.file.findMany({
      where: {
        parentId: id,
      },
    }),
  ]);
  for (const folder of childFolders) {
    await recursivelyDeleteFolder(folder.id);
  }
  await db.file.deleteMany({
    where: {
      id: {
        in: childFiles.map((f) => f.id),
      },
    },
  });
  await db.folder.delete({
    where: {
      id,
    },
  });
};

const removeFolder = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await recursivelyDeleteFolder(id);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

export {
  renderIndex,
  renderNonRootFolderPage,
  fileUploadMiddlewares,
  removeFile,
  renameFile,
  createFolder,
  renderFileInfo,
  renameFolder,
  removeFolder,
};
