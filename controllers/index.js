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
    parentFolder: { id: parentId, name: parentFolder.name },
  });
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

const fileUploadMiddlewares = [
  upload.array("files"),
  async (req, res) => {
    await saveFiles(req.files);
    res.status(200).end();
  },
];

const createFolder = async (req, res) => {
  const { id } = req.session.passport.user;
  const { name, parentId } = req.body;
  console.log("Owner ID: " + id + ", Parent ID: " + parentId);
  try {
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
