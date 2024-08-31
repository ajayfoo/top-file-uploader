import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import duration from "dayjs/plugin/duration.js";
import { getDurations } from "../utils.js";
import db from "../db.js";

const getRootFolderId = async (req, res) => {
  const { rootFolderId: id } = req.session.passport.user;
  if (id) {
    res.json({ id });
  } else {
    res.status(404).end();
  }
};

const renderFolderPage = async (req, res) => {
  const { id: userId } = req.session.passport.user;
  const isRoot = req.params.id === undefined;
  const folderId = isRoot
    ? req.session.passport.user.rootFolderId
    : parseInt(req.params.id);
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
};

const createFolderWith = async (name, parentFolder, ownerId) => {
  await db.folder.create({
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
};

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
    const duplicateFolder = await db.folder.findFirst({
      where: {
        parentId,
        name,
        ownerId,
      },
    });
    if (duplicateFolder) {
      return res.status(403).json({ duplicateName: duplicateFolder.name });
    }
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
  const parentId = parseInt(req.body.parentId);
  try {
    if (id !== req.session.passport.user.rootFolderId) {
      const [duplicateFolder, parentFolder] = await Promise.all([
        db.folder.findFirst({
          where: {
            parentId,
            name,
            ownerId,
          },
        }),
        db.folder.findUnique({
          where: {
            id: parentId,
          },
        }),
      ]);
      if (duplicateFolder) {
        return res.status(403).json({
          duplicateName: duplicateFolder.name,
          parentFolderName: parentFolder.name,
        });
      }
    }
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
  const id = parseInt(req.params.id);
  try {
    await recursivelyDeleteSharedFolderUrl(id, ownerId);
    await recursivelyDeleteFolder(id, ownerId);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const createSharedUrlForFilesInFolder = async (
  folderId,
  ownerId,
  expiresOn,
) => {
  const filesWithId = await db.file.findMany({
    where: {
      folderId,
      ownerId,
    },
  });
  const sharedUrls = filesWithId.map((file) => ({
    fileId: file.id,
    expiresOn,
  }));
  await db.sharedFileUrl.createMany({
    data: sharedUrls,
  });
};

const deleteSharedUrlForFilesInFolder = async (folderId, ownerId) => {
  await db.sharedFileUrl.deleteMany({
    where: {
      file: {
        folderId,
        ownerId,
      },
    },
  });
};

const recursivelyCreateSharedFolderUrl = async (
  folderId,
  expiresOn,
  ownerId,
) => {
  const childFolders = await db.folder.findMany({
    where: { ownerId, parentId: folderId },
  });
  for (const folder of childFolders) {
    await recursivelyCreateSharedFolderUrl(folder.id, expiresOn, ownerId);
  }
  await db.sharedFolderUrl.create({
    data: {
      folderId,
      expiresOn,
    },
  });
  await createSharedUrlForFilesInFolder(folderId, ownerId, expiresOn);
};

const recursivelyUpdateSharedFolderUrl = async (
  folderId,
  expiresOn,
  ownerId,
) => {
  const childFolders = await db.folder.findMany({
    where: { ownerId, parentId: folderId },
  });
  for (const folder of childFolders) {
    await recursivelyUpdateSharedFolderUrl(folder.id, expiresOn, ownerId);
  }
  await db.sharedFolderUrl.update({
    where: {
      folderId,
    },
    data: {
      expiresOn,
    },
  });
};

const recursivelyDeleteSharedFolderUrl = async (folderId, ownerId) => {
  const childFolders = await db.folder.findMany({
    where: { ownerId, parentId: folderId },
  });
  for (const folder of childFolders) {
    await recursivelyDeleteSharedFolderUrl(folder.id, ownerId);
  }
  await db.sharedFolderUrl.deleteMany({
    where: {
      folder: {
        ownerId,
        id: {
          in: [folderId],
        },
      },
    },
  });
  await deleteSharedUrlForFilesInFolder(folderId, ownerId);
};

const createSharedUrl = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const folderId = parseInt(
    req.params.id ?? req.session.passport.user.rootFolderId,
  );
  const { id, enableSharing, minutes, hours, days, months, years } = req.body;
  const sharingDuration = dayjs
    .extend(duration)
    .duration({ minutes, hours, days, months, years });
  const expiresOn = dayjs.extend(utc).utc().add(sharingDuration).format();
  try {
    if (!enableSharing && !id) {
      res.status(400).end();
      return;
    }
    if (!enableSharing) {
      await recursivelyDeleteSharedFolderUrl(folderId, ownerId);
    } else if (id) {
      await recursivelyUpdateSharedFolderUrl(folderId, expiresOn, ownerId);
    } else {
      await recursivelyCreateSharedFolderUrl(folderId, expiresOn, ownerId);
    }
    res.status(204).end();
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
  createSharedUrl,
};
