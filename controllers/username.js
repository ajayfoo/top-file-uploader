import db from "../db.js";

const checkUsernameAvailability = async (req, res) => {
  const isAvailable = await usernameIsAvailable(req.params.username);
  if (isAvailable) {
    res.status(200).end();
  } else {
    res.status(404).end();
  }
};

const usernameIsAvailable = async (username) => {
  const exists = await db.user.findUnique({
    where: { username },
  });
  return exists ? false : true;
};

export { checkUsernameAvailability, usernameIsAvailable };
