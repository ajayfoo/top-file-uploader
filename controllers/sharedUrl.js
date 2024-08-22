import db from "../db.js";

const render = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const sharedUrl = await db.sharedUrl.findUnique({
      where: {
        id,
      },
      include: {
        folder: {
          include: {
            childrenFolder: true,
            files: true,
          },
        },
      },
    });
    res.render("shared_url", {
      folders: sharedUrl.folder.childrenFolder,
      files: sharedUrl.folder.files,
      name: sharedUrl.folder.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

export { render };
