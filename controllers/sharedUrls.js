import db from "../db.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import duration from "dayjs/plugin/duration.js";

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

const deleteSharedFolderUrl = async (req, res) => {
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

const getSharingDuration = (req) => {
  const { minutes, hours, days, months, years } = req.body;
  const sharingDuration = dayjs
    .extend(duration)
    .duration({ minutes, hours, days, months, years });
  return sharingDuration;
};

const upsertSharedFolderUrl = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const folderId = parseInt(
    req.body.folderId || req.session.passport.user.rootFolderId,
  );
  const sharingDuration = getSharingDuration(req);
  const expiresOn = dayjs.extend(utc).utc().add(sharingDuration).format();
  try {
    await recursivelyUpsertSharedFolderUrl(folderId, expiresOn, ownerId);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const upsertSharedFileUrl = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const fileId = parseInt(req.body.fileId);
  const sharingDuration = getSharingDuration(req);
  const expiresOn = dayjs.extend(utc).utc().add(sharingDuration).format();
  try {
    await db.sharedFileUrl.upsert({
      create: {
        file: {
          connect: {
            id: fileId,
            ownerId,
          },
        },
        expiresOn,
      },
      where: {
        fileId,
      },
      update: {
        expiresOn,
      },
    });
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const deleteSharedFileUrlHavingFileId = (fileId, ownerId) => {
  return db.sharedFileUrl.deleteMany({
    where: {
      file: {
        ownerId,
        id: {
          in: [fileId],
        },
      },
    },
  });
};

const deleteSharedFileUrl = async (req, res) => {
  const { id: ownerId } = req.session.passport.user;
  const fileId = parseInt(req.body.fileId);
  try {
    await deleteSharedFileUrlHavingFileId(fileId, ownerId);
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

export {
  recursivelyDeleteSharedFolderUrl,
  upsertSharedFolderUrl,
  deleteSharedFolderUrl,
  upsertSharedFileUrl,
  deleteSharedFileUrl,
  deleteSharedFileUrlHavingFileId,
};
