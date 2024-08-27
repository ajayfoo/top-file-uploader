const addFilesButton = document.getElementById("add-files-button");
const addFileDialog = document.getElementById("add-files-dialog");
const addFolderButton = document.getElementById("add-folder-button");
const addFolderDialog = document.getElementById("add-folder-dialog");
const renameFolderButton = document.getElementById("rename-folder-button");
const renameCurrentFolderDialog = document.getElementById(
  "rename-current-folder-dialog",
);
const deleteFolderButton = document.getElementById("delete-folder-button");
const deleteFolderDialog = document.getElementById("delete-folder-dialog");
const durationSubfieldsObject = {
  minutes: document.getElementById("share-minutes"),
  hours: document.getElementById("share-hours"),
  days: document.getElementById("share-days"),
  months: document.getElementById("share-months"),
  years: document.getElementById("share-years"),
};
const durationSubfields = Object.values(durationSubfieldsObject);
const sharingCheckbox = document.getElementById("share-folder-checkbox");
const shareFolderDialog = document.getElementById("share-folder-dialog");
const sharingForm = shareFolderDialog.querySelector("form");
const sharingFolderBtn = document.getElementById("sharing-folder-button");
const copySharedUrlBtn = document.getElementById("copy-shared-url-button");

export {
  addFilesButton,
  addFileDialog,
  addFolderButton,
  addFolderDialog,
  renameFolderButton,
  renameCurrentFolderDialog,
  deleteFolderButton,
  deleteFolderDialog,
  durationSubfieldsObject,
  durationSubfields,
  sharingCheckbox,
  shareFolderDialog,
  sharingForm,
  sharingFolderBtn,
  copySharedUrlBtn,
};
