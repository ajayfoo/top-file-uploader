import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import duration from "dayjs/plugin/duration.js";
import db from "../db.js";

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
  const parentFolderId =
    parseInt(req.params.id) || req.session.passport.user.rootFolderId;
  const [user, parentFolder] = await Promise.all([
    db.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        folders: {
          where: {
            parentId: parentFolderId,
          },
        },
        files: {
          where: {
            parentId: parentFolderId,
          },
        },
      },
    }),
    db.folder.findUnique({
      where: {
        ownerId: userId,
        id: parentFolderId,
      },
      include: {
        sharedUrl: true,
      },
    }),
  ]);
  const sharing = getDurations(parentFolder.sharedUrl?.expiresOn);
  if (sharing) {
    sharing.id = parentFolder.sharedUrl.id;
  }
  res.render("index", {
    username: user.username,
    folders: user.folders,
    files: user.files,
    parentFolder: { id: parentFolderId, name: parentFolder.name },
    isRoot: true,
    sharing,
  });
};

const getDuplicateFolder = async (name, parentId, ownerId) => {
  const result = await db.$queryRaw`
    SELECT name FROM "Folder" WHERE "parentId" = ${parseInt(parentId)} AND LOWER(name) = LOWER(${name}) AND "ownerId" = ${parseInt(ownerId)}
    `;
  return result[0];
};

const createFolder = async (req, res) => {
  const { id } = req.session.passport.user;
  const { name, parentId } = req.body;
  try {
    const duplicateFolder = await getDuplicateFolder(name, parentId, id);
    if (duplicateFolder) {
      return res.status(403).json({ duplicateName: duplicateFolder.name });
    }
    await db.folder.create({
      data: {
        name,
        parent: {
          connect: {
            id: parseInt(parentId),
          },
        },
        owner: {
          connect: {
            id: parseInt(id),
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
  const id = parseInt(req.params.id) || req.session.passport.user.rootFolderId;
  const { newName: name } = req.body;
  try {
    await db.folder.update({
      where: {
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

const recursivelyDeleteFolder = async (id) => {
  const [childFolders, childFiles] = await Promise.all([
    db.folder.findMany({
      where: {
        parentId: id,
      },
    }),
    db.file.findMany({
      where: {
        parentId: id,
      },
    }),
  ]);
  for (const folder of childFolders) {
    await recursivelyDeleteFolder(folder.id);
  }
  await db.file.deleteMany({
    where: {
      id: {
        in: childFiles.map((f) => f.id),
      },
    },
  });
  await db.folder.delete({
    where: {
      id,
    },
  });
};

const removeFolder = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await recursivelyDeleteFolder(id);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const createSharedUrl = async (req, res) => {
  const folderId = parseInt(req.params.id);
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
      await db.sharedUrl.delete({
        where: {
          id: parseInt(id),
        },
      });
      res.status(204).end();
      return;
    }
    if (id) {
      await db.sharedUrl.update({
        update: {
          expiresOn,
        },
        where: {
          id: parseInt(id),
        },
      });
    } else {
      await db.sharedUrl.create({
        data: {
          folderId,
          expiresOn,
        },
      });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

export {
  renderFolderPage,
  createFolder,
  renameFolder,
  removeFolder,
  createSharedUrl,
};
