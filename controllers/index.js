import multer from "multer";
import { saveFiles } from "../utils.js";
import db from "../db.js";

const renderIndex = async (req, res) => {
  const user = await db.user.findUnique({
    where: {
      id: req.session.passport.user.id,
    },
    include: {
      rootFolder: true,
    },
  });
  res.render("index", {
    username: user.username,
    folder: user.rootFolder,
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

const createFolder = (req, res) => {
  const { name } = req.body;
  console.log("Folder name: " + name);
  res.redirect("../");
};

export {
  renderIndex,
  renderNonRootFolderPage,
  fileUploadMiddlewares,
  createFolder,
};
