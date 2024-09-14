import createHttpError from "http-errors";
import path from "node:path";
import { getDisplayDateTime } from "../utils.js";
import db from "../db.js";

const renderFolderPage = async (req, res, next) => {
  const id = parseInt(req.params.id);
  try {
    const sharedUrl = await db.sharedFolderUrl.findUnique({
      where: {
        id,
      },
      include: {
        folder: {
          include: {
            childrenFolder: {
              include: {
                sharedUrl: true,
              },
            },
            files: {
              include: {
                sharedUrl: true,
              },
            },
          },
        },
      },
    });
    if (!sharedUrl) {
      next(createHttpError(404, "Folder doesn't exists or it's not shared"));
      return;
    }
    res.render("shared_url", {
      id: sharedUrl.id,
      currentFolder: sharedUrl.folder,
      folders: sharedUrl.folder.childrenFolder,
      files: sharedUrl.folder.files,
      name: sharedUrl.folder.name,
    });
  } catch (err) {
    next(err);
  }
};

const renderFileInfoPage = async (req, res, next) => {
  const id = parseInt(req.params.id);
  try {
    const sharedUrl = await db.sharedFileUrl.findUnique({
      where: {
        id,
      },
      include: {
        file: true,
      },
    });
    if (!sharedUrl) {
      next(createHttpError(404, "File doesn't exists or it's not shared"));
      return;
    }
    const uploadedAt = getDisplayDateTime(sharedUrl.file.uploadedAt);
    res.render("shared_file_info", {
      id: id,
      file: sharedUrl.file,
      uploadedAt,
    });
  } catch (err) {
    next(err);
  }
};

const getFile = async (req, res, next) => {
  const id = parseInt(req.params.id);
  try {
    const sharedUrl = await db.sharedFileUrl.findUnique({
      where: {
        id,
      },
      include: {
        file: true,
      },
    });
    if (!sharedUrl) {
      next(createHttpError(404, "File doesn't exists or it's not shared"));
      return;
    }
    res.download(
      path.join("uploads", sharedUrl.file.id.toString()),
      sharedUrl.file.name,
      (err) => {
        if (!err) return;
        next(err);
      },
    );
  } catch (err) {
    next(err);
  }
};

export { renderFolderPage, renderFileInfoPage, getFile };
