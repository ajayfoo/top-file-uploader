const createFolder = (req, res) => {
  const { name } = req.body;
  console.log("Folder name: " + name);
  res.redirect("../");
};

export { createFolder };
