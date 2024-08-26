import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import duration from "dayjs/plugin/duration.js";
import db from "../db.js";

const getRootFolderId = async (req, res) => {
  const { rootFolderId: id } = req.session.passport.user;
  if (id) {
    res.json({ id });
  } else {
    res.status(404).end();
  }
};

const getDurations = (endDate) => {
  if (!endDate) return null;
  dayjs.extend(utc);
  dayjs.extend(duration);
  const today = dayjs().utc();
  const sharingTill = dayjs(endDate).utc();
  const timeLeft = dayjs.duration(sharingTill.diff(today));
  return {
    hours: timeLeft.hours(),
    days: timeLeft.days(),
    months: timeLeft.months(),
    years: timeLeft.years(),
  };
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
            parentId: folderId,
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
  const sharing = getDurations(folder.sharedUrl?.expiresOn);
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

const createFolder = async (req, res) => {
  const { id } = req.session.passport.user;
  const parentId = parseInt(
    req.params.id ?? req.session.passport.user.rootFolderId,
  );
  const { name } = req.body;
  try {
    const duplicateFolder = await db.folder.findFirst({
      where: {
        parentId,
        name,
        ownerId: id,
      },
    });
    if (duplicateFolder) {
      return res.status(403).json({ duplicateName: duplicateFolder.name });
    }
    await db.folder.create({
      data: {
        name,
        parent: {
          connect: {
            id: parentId,
          },
        },
        owner: {
          connect: {
            id: id,
          },
        },
      },
    });
    res.redirect("../");
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const renameFolder = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const id = parseInt(req.params.id);
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
        parentId: id,
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
    await recursivelyCUDSharedUrl(id, null, "delete", ownerId);
    await recursivelyDeleteFolder(id, ownerId);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const recursivelyCUDSharedUrl = async (folderId, expiresOn, op, ownerId) => {
  const childFolders = await db.folder.findMany({
    where: { ownerId, parentId: folderId },
  });
  for (const folder of childFolders) {
    await recursivelyCUDSharedUrl(folder.id, expiresOn, op);
  }
  switch (op.toLowerCase()) {
    case "create":
    case "update": {
      await db.sharedUrl.upsert({
        create: {
          folderId,
          expiresOn,
        },
        update: {
          expiresOn,
        },
        where: {
          folderId,
        },
      });
      break;
    }
    case "delete": {
      await db.sharedUrl.deleteMany({
        where: {
          folder: {
            ownerId,
            id: {
              in: [folderId],
            },
          },
        },
      });
      break;
    }
    default: {
      throw new Error("Invalid operation on SharedUrl");
    }
  }
};

const createSharedUrl = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const folderId = parseInt(
    req.params.id ?? req.session.passport.user.rootFolderId,
  );
  const { id, enableSharing, hours, days, months, years } = req.body;
  const sharingDuration = dayjs
    .extend(duration)
    .duration({ hours, days, months, years });
  const expiresOn = dayjs.extend(utc).utc().add(sharingDuration).format();
  try {
    if (!enableSharing && !id) {
      res.status(400).end();
      return;
    }
    if (!enableSharing) {
      await recursivelyCUDSharedUrl(folderId, null, "delete", ownerId);
    } else if (id) {
      await recursivelyCUDSharedUrl(folderId, expiresOn, "update", ownerId);
    } else {
      await recursivelyCUDSharedUrl(folderId, expiresOn, "create", ownerId);
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
