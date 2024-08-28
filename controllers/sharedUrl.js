import db from "../db.js";

const render = async (req, res, next) => {
  const id = parseInt(req.params.id);
  try {
    const sharedUrl = await db.sharedUrl.findUnique({
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
            files: true,
          },
        },
      },
    });
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

const renderFileInfo = async (req, res, next) => {
  const sharedUrlId = parseInt(req.params.sharedUrlId);
  const id = parseInt(req.params.id);
  const sharedUrl = await db.sharedUrl.findUnique({
    where: {
      id: sharedUrlId,
    },
    include: {
      folder: {
        include: {
          files: {
            where: { id },
          },
        },
      },
    },
  });
  if (!sharedUrl) {
    next(new Error("Not found"));
    return;
  }
  res.render("shared_file_info", {
    file: sharedUrl.folder.files[0],
    folderId: sharedUrl.folder.id,
  });
};

export { render, renderFileInfo };
