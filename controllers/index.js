import multer from "multer";
import { saveFile } from "../utils.js";

const renderIndex = (req, res) => {
  res.render("index");
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

const fileUploadMiddlewares = [
  upload.single("file"),
  async (req, res) => {
    await saveFile(req.file);
    res.status(200).end();
  },
];

export { renderIndex, fileUploadMiddlewares };
