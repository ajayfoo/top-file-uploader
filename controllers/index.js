import multer from "multer";
import { saveFiles } from "../utils.js";

const renderIndex = (req, res) => {
  res.render("index");
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
