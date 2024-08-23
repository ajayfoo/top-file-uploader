const getNewCheckbox = (id, name, group) => {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = id;
  checkbox.name = group;
  checkbox.value = id;
  checkbox.setAttribute("data-name", name);
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
    duplicateFilesContainer.appendChild(
      getNewCheckbox(file.id, file.name, "filesToReplace"),
    );
  }
};

const clearDuplicateFilesContainer = () => {
  const duplicateFilesContainer = document.getElementById("duplicate-files");
  duplicateFilesContainer.textContent = "";
  const resolveUploadFileConflictContainer = document.getElementById(
    "resolve-upload-file-conflict",
  );
  resolveUploadFileConflictContainer.classList.add("none");
};
const addIdsOfFilesToReplaceToFormData = (
  formData,
  duplicateFileCheckBoxes,
) => {
  const idsOfFilesToReplace = duplicateFileCheckBoxes
    .filter((i) => i.checked)
    .map((i) => i.value);
  for (const fileId of idsOfFilesToReplace) {
    formData.append("idsOfFilesToReplace", fileId);
  }
};

const removeUnselectedFilesFromInput = (unselectedFileNames) => {
  const dt = new DataTransfer();
  const filesInput = document.getElementById("files-to-upload");
  const { files } = filesInput;
  for (const file of files) {
    if (unselectedFileNames.includes(file.name)) continue;
    dt.items.add(file);
  }
  filesInput.files = dt.files;
};

const addSelectedFilesToFormData = (formData, unselectedFileNames) => {
  const files = document.getElementById("files-to-upload").files;
  let numOfFilesAdded = 0;
  for (const file of files) {
    if (unselectedFileNames.includes(file.name)) continue;
    formData.append("files", file, file.name);
    ++numOfFilesAdded;
  }
  return numOfFilesAdded;
};

const getDuplicateFileCheckBoxes = (form) => {
  const duplicateFileCheckBoxes = [];
  const checkboxElements = form.querySelectorAll(
    'input[name="filesToReplace"]',
  );
  for (const checkbox of checkboxElements) {
    duplicateFileCheckBoxes.push(checkbox);
  }
  return duplicateFileCheckBoxes;
};

const uploadFiles = async () => {
  const parentId = document.getElementById("current-folder-id").value;
  const form = document.querySelector("#add-files-dialog>form");
  const duplicateFileCheckBoxes = getDuplicateFileCheckBoxes(form);
  const formData = new FormData();
  addIdsOfFilesToReplaceToFormData(formData, duplicateFileCheckBoxes);
  const unselectedFileNames = duplicateFileCheckBoxes
    .filter((i) => !i.checked)
    .map((i) => i.dataset["name"]);
  removeUnselectedFilesFromInput(unselectedFileNames);
  const numOfFilesAdded = addSelectedFilesToFormData(
    formData,
    unselectedFileNames,
  );
  if (numOfFilesAdded < 1) {
    clearDuplicateFilesContainer();
    form.reportValidity();
    return;
  }
  formData.append("parentId", parentId);
  const url = document.activeElement.getAttribute("formaction");
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });
  if (response.ok) {
    location.reload();
    return;
  }
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
  const url = document.activeElement.getAttribute("formaction");
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
  }
});

const renameFolderButton = document.getElementById("rename-folder-button");
const renameCurrentFolderDialog = document.getElementById(
  "rename-current-folder-dialog",
);
const sendRenameFolderPutRequest = async () => {
  const newName = document.getElementById("current-folder-name").value;
  const response = await fetch(location.href, {
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
    console.error(err);
    showFailedResponseMessage("Something went wrong");
  }
});

const deleteFolderButton = document.getElementById("delete-folder-button");
const deleteFolderDialog = document.getElementById("delete-folder-dialog");
if (deleteFolderButton) {
  const sendDeleteFolderRequest = async () => {
    const response = await fetch(location.origin, {
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
      console.error(err);
      showFailedResponseMessage("Something went wrong");
    }
  });
}

const isHomePage = () =>
  location.href.substring(location.href.lastIndexOf("/") + 1) === "";

const updateSharing = async () => {
  const hours = document.getElementById("share-hours").value;
  const days = document.getElementById("share-days").value;
  const months = document.getElementById("share-months").value;
  const years = document.getElementById("share-years").value;
  const id = document.getElementById("shared-url-id")?.value;
  const enableSharing = document.getElementById(
    "share-folder-checkbox",
  ).checked;
  let url = location.href + "/sharedUrl";
  if (isHomePage()) {
    url = location.href + "sharedUrl";
  }
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      enableSharing,
      hours,
      days,
      months,
      years,
    }),
  });
  return response.ok;
};

const validateSharingForm = () => {
  const form = shareFolderDialog.querySelector("form");
  const id = document.getElementById("shared-url-id")?.value;
  const sharingCheckbox = document.getElementById("share-folder-checkbox");
  const enableSharing = sharingCheckbox.checked;
  if (!id && !enableSharing) {
    sharingCheckbox.setCustomValidity("Must enable sharing");
    form.reportValidity();
    return false;
  } else {
    sharingCheckbox.setCustomValidity("");
    return true;
  }
};
const sharingCheckbox = document.getElementById("share-folder-checkbox");
sharingCheckbox.addEventListener("input", () => {
  validateSharingForm();
});
const shareFolderDialog = document.getElementById("share-folder-dialog");
const sharingFolderBtn = document.getElementById("sharing-folder-button");
sharingFolderBtn.addEventListener("click", () => {
  shareFolderDialog.showModal();
});
shareFolderDialog.addEventListener("submit", async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  if (!validateSharingForm()) return;
  try {
    const done = await updateSharing();
    if (done) {
      location.reload();
    } else {
      showFailedResponseMessage("Failed to add shared url");
    }
  } catch {
    showFailedResponseMessage("Failed to add shared url");
  } finally {
    shareFolderDialog.close();
  }
});
