import multer from "multer";
import { saveFiles } from "../utils.js";
import db from "../db.js";

const renderIndex = async (req, res) => {
  const { id, rootFolderId } = req.session.passport.user;
  const user = await db.user.findUnique({
    where: {
      id,
    },
    include: {
      folders: {
        where: {
          NOT: {
            id: rootFolderId,
          },
        },
      },
    },
  });
  res.render("index", {
    username: user.username,
    folders: user.folders,
    parentId: rootFolderId,
  });
};

const renderNonRootFolderPage = async (req, res) => {
  const { id } = req.params;
  const [{ username }, folder] = await Promise.all([
    db.user.findUnique({
      where: {
        id: req.session.passport.user.id,
      },
    }),
    db.folder.findUnique({ where: { id } }),
  ]);
  console.log(username);
  console.log(folder);
  res.render("index", { username, folder });
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
    const newFolder = await db.folder.create({
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
    res.json(newFolder);
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
