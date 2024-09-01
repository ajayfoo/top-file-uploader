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

const upsertSharedUrlForFilesInFolder = async (
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
  const upserts = sharedUrls.map((url) =>
    db.sharedFileUrl.upsert({
      create: url,
      where: {
        fileId: url.fileId,
      },
      update: {
        expiresOn: url.expiresOn,
      },
    }),
  );
  await db.$transaction(upserts);
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

const recursivelyUpsertSharedFolderUrl = async (
  folderId,
  expiresOn,
  ownerId,
) => {
  const childFolders = await db.folder.findMany({
    where: { ownerId, parentId: folderId },
  });
  for (const folder of childFolders) {
    await recursivelyUpsertSharedFolderUrl(folder.id, expiresOn, ownerId);
  }
  await db.sharedFolderUrl.upsert({
    create: {
      folderId,
      expiresOn,
    },
    where: {
      folderId,
    },
    update: {
      expiresOn,
    },
  });
  await upsertSharedUrlForFilesInFolder(folderId, ownerId, expiresOn);
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

const deleteSharedUrl = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const folderId = parseInt(
    req.params.id ?? req.session.passport.user.rootFolderId,
  );
  try {
    await recursivelyDeleteSharedFolderUrl(folderId, ownerId);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const upsertSharedUrl = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const { minutes, hours, days, months, years } = req.body;
  const folderId = parseInt(
    req.body.folderId || req.session.passport.user.rootFolderId,
  );
  const sharingDuration = dayjs
    .extend(duration)
    .duration({ minutes, hours, days, months, years });
  const expiresOn = dayjs.extend(utc).utc().add(sharingDuration).format();
  try {
    await recursivelyUpsertSharedFolderUrl(folderId, expiresOn, ownerId);
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
  upsertSharedUrl,
  deleteSharedUrl,
};
