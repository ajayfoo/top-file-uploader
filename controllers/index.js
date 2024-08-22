import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import duration from "dayjs/plugin/duration.js";
import db from "../db.js";

const renderIndex = async (req, res) => {
  const { id, rootFolderId } = req.session.passport.user;
  const [user, parentFolder] = await Promise.all([
    db.user.findUnique({
      where: {
        id,
      },
      include: {
        folders: {
          where: {
            parentId: rootFolderId,
          },
        },
        files: {
          where: {
            parentId: rootFolderId,
          },
        },
      },
    }),
    db.folder.findUnique({
      where: {
        id: rootFolderId,
      },
      include: {
        sharedUrl: true,
      },
    }),
  ]);
  dayjs.extend(utc);
  let sharing = null;
  if (parentFolder.sharedUrl) {
    dayjs.extend(utc);
    dayjs.extend(duration);
    const today = dayjs().utc();
    const sharingTill = dayjs(parentFolder.sharedUrl.expiresOn).utc();
    const timeLeft = dayjs.duration(sharingTill.diff(today));
    sharing = {
      hours: timeLeft.hours(),
      days: timeLeft.days(),
      months: timeLeft.months(),
      years: timeLeft.years(),
    };
  }
  res.render("index", {
    username: user.username,
    folders: user.folders,
    files: user.files,
    parentFolder: { id: rootFolderId, name: parentFolder.name },
    isRoot: true,
    sharing,
  });
};

const renderNonRootFolderPage = async (req, res) => {
  const parentId = parseInt(req.params.id);
  const { id } = req.session.passport.user;
  const [user, parentFolder] = await Promise.all([
    db.user.findUnique({
      where: {
        id,
      },
      include: {
        folders: {
          where: {
            parentId,
          },
        },
        files: {
          where: {
            parentId,
          },
        },
      },
    }),
    db.folder.findUnique({
      where: {
        id: parentId,
      },
      include: {
        sharedUrl: true,
      },
    }),
  ]);
  let sharing = null;
  if (parentFolder.sharedUrl) {
    dayjs.extend(utc);
    dayjs.extend(duration);
    const today = dayjs().utc();
    const sharingTill = dayjs(parentFolder.sharedUrl.expiresOn).utc();
    const timeLeft = dayjs.duration(sharingTill.diff(today));
    sharing = {
      hours: timeLeft.hours(),
      days: timeLeft.days(),
      months: timeLeft.months(),
      years: timeLeft.years(),
    };
  }
  res.render("index", {
    username: user.username,
    folders: user.folders,
    files: user.files,
    parentFolder: { id: parentId, name: parentFolder.name },
    isRoot: false,
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
  const { hours, days, months, years } = req.body;
  console.log(
    `hrs: ${hours}, days: ${days}, months: ${months}, years: ${years}`,
  );
  const sharingDuration = dayjs
    .extend(duration)
    .duration({ hours, days, months, years });
  const expiresOn = dayjs.extend(utc).utc().add(sharingDuration).format();
  try {
    await db.sharedUrl.create({
      data: {
        folderId,
        expiresOn,
      },
    });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

export {
  renderIndex,
  renderNonRootFolderPage,
  createFolder,
  renameFolder,
  removeFolder,
  createSharedUrl,
};
