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

export {
  renderIndex,
  renderNonRootFolderPage,
  fileUploadMiddlewares,
  createFolder,
};
