import multer from "multer";
import { saveFiles } from "../utils.js";
import db from "../db.js";

const renderIndex = async (req, res) => {
  const { id, rootFolderId } = req.session.passport.user;
  console.log(rootFolderId);
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

const fileUploadMiddlewares = [
  upload.array("files"),
  async (req, res) => {
    const { id: ownerId } = req.session.passport.user;
    const parentId = parseInt(req.body.parentId);
    console.log(req.body);
    console.log("Owner ID: " + ownerId + ", Parent ID: " + parentId);
    await saveFiles(req.files, ownerId, parentId);
    res.redirect("/" + parentId);
  },
];

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
    console.log(duplicateFolder);
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
  if (req.method !== "PATCH" && req.body._method !== "PATCH") {
    return res.status(403).end();
  }
  const id = parseInt(req.params.id);
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
  } catch {
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
  createFolder,
  renderFileInfo,
  renameFolder,
  removeFolder,
};
