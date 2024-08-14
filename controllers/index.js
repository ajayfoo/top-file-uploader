import multer from "multer";
import { saveFiles } from "../utils.js";
import db from "../db.js";

const renderIndex = async (req, res) => {
  const { username } = await db.user.findUnique({
    where: {
      id: req.session.passport.user.id,
    },
  });
  console.log(username);
  res.render("index", { username, folderName: "Root" });
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

export { renderIndex, fileUploadMiddlewares };
