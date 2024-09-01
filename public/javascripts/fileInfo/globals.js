const confirmDeleteFileDialog = document.getElementById(
  "confirm-delete-file-dialog",
);
const deleteFileBtn = document.getElementById("delete-file");
const renameFileDialog = document.getElementById("rename-file-dialog");
const renameFileBtn = document.getElementById("rename-file");
const sharingDialog = document.getElementById("share-file-dialog");
const sharingButton = document.getElementById("sharing-file-button");
const sharingForm = sharingDialog.querySelector("form");
const durationSubfieldsObject = {
  minutes: document.getElementById("share-minutes"),
  hours: document.getElementById("share-hours"),
  days: document.getElementById("share-days"),
  months: document.getElementById("share-months"),
  years: document.getElementById("share-years"),
};
const durationSubfields = Object.values(durationSubfieldsObject);
const sharingCheckbox = document.getElementById("share-file-checkbox");
const copyLinkButton = document.getElementById("copy-shared-url-button");

export {
  confirmDeleteFileDialog,
  deleteFileBtn,
  renameFileDialog,
  renameFileBtn,
  sharingDialog,
  sharingButton,
  sharingForm,
  copyLinkButton,
  durationSubfieldsObject,
  durationSubfields,
  sharingCheckbox,
};
