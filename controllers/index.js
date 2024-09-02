import { getDurations } from "../utils.js";
import db from "../db.js";
import { recursivelyDeleteSharedFolderUrl } from "./sharedUrls.js";
import createHttpError from "http-errors";

const getRootFolderId = async (req, res) => {
  const { rootFolderId: id } = req.session.passport.user;
  if (id) {
    res.json({ id });
  } else {
    res.status(404).end();
  }
};

const renderFolderPage = async (req, res, next) => {
  const { id: userId } = req.session.passport.user;
  const isRoot = req.params.id === undefined;
  const folderId = isRoot
    ? req.session.passport.user.rootFolderId
    : parseInt(req.params.id);
  try {
    const [user, folder, parentFolder] = await Promise.all([
      db.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          folders: {
            where: {
              parentId: folderId,
            },
          },
          files: {
            where: {
              folderId,
            },
          },
        },
      }),
      db.folder.findUnique({
        where: {
          ownerId: userId,
          id: folderId,
        },
        include: {
          sharedUrl: true,
        },
      }),
      db.folder.findFirst({
        where: {
          ownerId: userId,
          childrenFolder: {
            some: {
              id: folderId,
            },
          },
        },
        select: {
          id: true,
        },
      }),
    ]);
    if (!folder) {
      return next(createHttpError(404, "The folder doesn't exist"));
    }
    const sharing = folder.sharedUrl
      ? getDurations(folder.sharedUrl.expiresOn)
      : null;
    if (sharing) {
      sharing.id = folder.sharedUrl.id;
    }
    res.render("index", {
      username: user.username,
      folders: user.folders,
      files: user.files,
      currentFolder: { id: folderId, name: folder.name },
      isRoot,
      sharing,
      parentId: parentFolder ? parentFolder.id : null,
    });
  } catch (err) {
    next(err);
  }
};

const createFolderWith = (name, parentFolder, ownerId) =>
  db.folder.create({
    data: {
      name,
      parent: {
        connect: {
          id: parentFolder.id,
        },
      },
      owner: {
        connect: {
          id: ownerId,
        },
      },
      ...(parentFolder.sharedUrl && {
        sharedUrl: {
          create: {
            expiresOn: parentFolder.sharedUrl.expiresOn,
          },
        },
      }),
    },
  });

const createFolder = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  let parentId = null;
  if (req.params.id === "root") {
    parentId = req.session.passport.user.rootFolderId;
  } else {
    parentId = parseInt(req.params.id);
  }
  const { name } = req.body;
  try {
    const parentFolder = await db.folder.findUnique({
      where: { id: parentId },
      include: { sharedUrl: true },
    });
    await createFolderWith(name, parentFolder, ownerId);
    res.redirect("../");
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const renameFolder = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  let id = null;
  if (req.params.id === "root") {
    id = req.session.passport.user.rootFolderId;
  } else {
    id = parseInt(req.params.id);
  }
  const { newName: name } = req.body;
  try {
    await db.folder.update({
      where: {
        ownerId,
        id,
      },
      data: {
        name,
      },
    });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const recursivelyDeleteFolder = async (id, ownerId) => {
  const [childFolders, childFiles] = await Promise.all([
    db.folder.findMany({
      where: {
        ownerId,
        parentId: id,
      },
    }),
    db.file.findMany({
      where: {
        ownerId,
        folderId: id,
      },
    }),
  ]);
  for (const folder of childFolders) {
    await recursivelyDeleteFolder(folder.id, ownerId);
  }
  await db.file.deleteMany({
    where: {
      ownerId,
      id: {
        in: childFiles.map((f) => f.id),
      },
    },
  });
  await db.folder.delete({
    where: {
      ownerId,
      id,
    },
  });
};

const removeFolder = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const { rootFolderId } = req.session.passport;
  const id = parseInt(req.params.id);
  try {
    const folderToRemove = await db.folder.findUnique({
      where: {
        id,
        ownerId,
      },
      select: {
        parentId: true,
      },
    });
    if (!folderToRemove) {
      return res.status(404).end();
    }
    await recursivelyDeleteSharedFolderUrl(id, ownerId);
    await recursivelyDeleteFolder(id, ownerId);
    console.log("user id " + id + " was deleted");
    if (folderToRemove.parentId === rootFolderId) {
      res.redirect(303, "/");
    } else {
      res.redirect(303, "/folders/" + folderToRemove.parentId);
    }
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

export {
  getRootFolderId,
  renderFolderPage,
  createFolder,
  renameFolder,
  removeFolder,
};
