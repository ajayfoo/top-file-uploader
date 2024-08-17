const getNewCheckbox = (id, name) => {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = id;
  const label = document.createElement("label");
  label.textContent = name;
  label.setAttribute("for", checkbox.id);

  const container = document.createElement("section");
  container.classList.add("field");
  container.append(checkbox, label);
  return container;
};

const showDuplicateFilesContainer = (duplicateFiles) => {
  const resolveUploadFileConflictContainer = document.getElementById(
    "resolve-upload-file-conflict",
  );
  resolveUploadFileConflictContainer.classList.remove("none");
  const duplicateFilesContainer = document.getElementById("duplicate-files");
  duplicateFilesContainer.textContent = "";
  for (const file of duplicateFiles) {
    duplicateFilesContainer.appendChild(getNewCheckbox(file.id, file.name));
  }
};

const uploadFiles = async () => {
  const parentId = document.getElementById("current-folder-id").value;
  const files = document.getElementById("files-to-upload").files;
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file, file.name);
  }
  formData.append("parentId", parentId);
  const url = document.activeElement.getAttribute("formaction");
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });
  const duplicateFiles = await response.json();
  showDuplicateFilesContainer(duplicateFiles);
};
const addFilesButton = document.getElementById("add-files-button");
const addFileDialog = document.getElementById("add-files-dialog");
addFilesButton.addEventListener("click", () => {
  addFileDialog.showModal();
});
addFileDialog.addEventListener("submit", async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  await uploadFiles();
});

const setupAddMenu = () => {
  const menuHeader = document.getElementById("add-menu-header");
  const itemsEle = document.querySelector("#add-menu>.items");
  const firstItem = document.querySelector("#add-menu>.items>:first-child");
  console.log(firstItem);
  let open = false;
  menuHeader.addEventListener("click", () => {
    if (open) {
      itemsEle.classList.remove("visible");
    } else {
      itemsEle.classList.add("visible");
      firstItem.focus();
    }
    open = !open;
  });
};

setupAddMenu();

const addFolderButton = document.getElementById("add-folder-button");
const addFolderDialog = document.getElementById("add-folder-dialog");
addFolderButton.addEventListener("click", () => {
  addFolderDialog.showModal();
});

const sendCreateFolderPostRequest = async () => {
  const parentId = parseInt(document.getElementById("parent-id").value);
  const name = document.getElementById("folder-name").value;
  console.log(parentId);
  console.log(name);
  const url = document.activeElement.getAttribute("formaction");
  console.log(url);
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      name,
      parentId,
    }),
  });
  return response;
};

const showFailedResponseMessage = (msg) => {
  const dialog = document.getElementById("create-folder-post-reponse");
  const msgEle = dialog.querySelector("form>p.message");
  msgEle.textContent = msg;
  dialog.showModal();
};

addFolderDialog.addEventListener("submit", async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  try {
    const response = await sendCreateFolderPostRequest();
    if (response.ok) {
      location.reload();
    } else {
      const json = await response.json();
      showFailedResponseMessage(
        "There's already a folder named '" + json.duplicateName + "'",
      );
    }
  } catch (err) {
    console.error(err);
    console.log("failed");
  }
});

const renameFolderButton = document.getElementById("rename-folder-button");
const renameCurrentFolderDialog = document.getElementById(
  "rename-current-folder-dialog",
);
const sendRenameFolderPutRequest = async () => {
  const newName = document.getElementById("current-folder-name").value;
  const url =
    location.origin + document.activeElement.getAttribute("formaction");
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newName }),
  });
  return response.ok;
};
renameFolderButton.addEventListener("click", () => {
  renameCurrentFolderDialog.showModal();
});
renameCurrentFolderDialog.addEventListener("submit", async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  try {
    const done = await sendRenameFolderPutRequest();
    if (done) {
      location.reload();
    } else {
      showFailedResponseMessage("Something went wrong");
    }
  } catch (err) {
    console.log(err);
    showFailedResponseMessage("Something went wrong");
  }
});

const deleteFolderButton = document.getElementById("delete-folder-button");
const deleteFolderDialog = document.getElementById("delete-folder-dialog");
if (deleteFolderButton) {
  const sendDeleteFolderRequest = async () => {
    const url =
      location.origin + document.activeElement.getAttribute("formaction");
    const response = await fetch(url, {
      method: "DELETE",
    });
    return response.ok;
  };
  deleteFolderButton.addEventListener("click", () => {
    deleteFolderDialog.showModal();
  });
  deleteFolderDialog.addEventListener("submit", async (e) => {
    if (document.activeElement.hasAttribute("formnovalidate")) return;
    e.preventDefault();
    try {
      const done = await sendDeleteFolderRequest();
      if (done) {
        location.replace(location.origin);
      } else {
        showFailedResponseMessage("Something went wrong");
      }
    } catch (err) {
      console.log(err);
      showFailedResponseMessage("Something went wrong");
    }
  });
}
