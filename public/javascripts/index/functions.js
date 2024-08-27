import {
  durationSubfields,
  durationSubfieldsObject,
  sharingCheckbox,
  sharingForm,
} from "./globals.js";

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
  const urlPart1 =
    location.pathname === "/" ? "/folders/root" : location.pathname;
  const url = urlPart1 + "/files";
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

const sendCreateFolderPostRequest = async () => {
  const name = document.getElementById("folder-name").value;
  const url = location.pathname === "/" ? "/folders/root" : location.pathname;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      name,
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

const sendRenameFolderPutRequest = async (container) => {
  const form = container.querySelector("form");
  const parentId = form.elements.parentId.value;
  const newName = document.getElementById("current-folder-name").value;
  const url = location.pathname === "/" ? "/folders/root" : location.pathname;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parentId, newName }),
  });
  return response;
};

const setupDeleteFolderButton = () => {
  const deleteFolderButton = document.getElementById("delete-folder-button");
  const deleteFolderDialog = document.getElementById("delete-folder-dialog");
  if (deleteFolderButton) {
    const sendDeleteFolderRequest = async () => {
      const response = await fetch(location.href, {
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
};

const updateSharing = async () => {
  const minutes = document.getElementById("share-minutes").value;
  const hours = document.getElementById("share-hours").value;
  const days = document.getElementById("share-days").value;
  const months = document.getElementById("share-months").value;
  const years = document.getElementById("share-years").value;
  const id = document.getElementById("shared-url-id")?.value;
  const enableSharing = document.getElementById(
    "share-folder-checkbox",
  ).checked;
  const response = await fetch("/sharedUrls", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      enableSharing,
      minutes,
      hours,
      days,
      months,
      years,
    }),
  });
  return response.ok;
};

const getSumOfAllDurationSubfields = () =>
  durationSubfields
    .map((e) => parseInt(e.value))
    .reduce((acc, curr) => acc + curr, 0);

const validateSharingDurationSubfields = () => {
  const minutesSubfield = durationSubfieldsObject.minutes;
  if (!sharingCheckbox.checked) {
    minutesSubfield.setCustomValidity("");
    return true;
  }
  const sum = getSumOfAllDurationSubfields();
  if (sum <= 0) {
    minutesSubfield.setCustomValidity("Duration must be at least one minute");
    sharingForm.reportValidity();
    return false;
  } else {
    minutesSubfield.setCustomValidity("");
    return true;
  }
};

const validateSharingCheckbox = () => {
  const id = document.getElementById("shared-url-id")?.value;
  const sharingCheckbox = document.getElementById("share-folder-checkbox");
  const enableSharing = sharingCheckbox.checked;
  if (!id && !enableSharing) {
    sharingCheckbox.setCustomValidity("Must enable sharing");
    sharingForm.reportValidity();
    return false;
  } else {
    sharingCheckbox.setCustomValidity("");
    return true;
  }
};

export {
  setupAddMenu,
  setupDeleteFolderButton,
  uploadFiles,
  sendCreateFolderPostRequest,
  showFailedResponseMessage,
  sendRenameFolderPutRequest,
  validateSharingDurationSubfields,
  validateSharingCheckbox,
  updateSharing,
};
