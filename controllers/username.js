import db from "../db.js";

const checkUsernameExistance = async (req, res) => {
  const exists = await db.user.findUnique({
    where: { username: req.params.username },
  });
  console.log(exists);
  console.log(req.params.username);
  if (exists) {
    res.status(200).end();
  } else {
    res.status(404).end();
  }
};

export { checkUsernameExistance };
