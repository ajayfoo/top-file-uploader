import {
  addFilesButton,
  addFileDialog,
  addFolderButton,
  addFolderDialog,
  renameCurrentFolderDialog,
  renameFolderButton,
  durationSubfields,
  sharingCheckbox,
  sharingFolderDialog,
  sharingFolderBtn,
  copySharedUrlBtn,
} from "./globals.js";
import {
  validateSharingDurationSubfields,
  validateSharingCheckbox,
} from "./functions.js";
import {
  onAddFilesSubmit,
  onAddFolderSubmit,
  onRenameCurrentFolderSubmit,
  onSharingFolderSubmit,
  showAddFilesModal,
  showAddFolderModal,
  showRenameFolderModal,
  showSharingFolderModal,
  writeSharedUrlToClipboard,
} from "./eventListeners.js";
import { setupAddMenu, setupDeleteFolderButton } from "./functions.js";

const attachEventListeners = () => {
  addFilesButton.addEventListener("click", showAddFilesModal);
  addFileDialog.addEventListener("submit", onAddFilesSubmit);

  addFolderButton.addEventListener("click", showAddFolderModal);
  addFolderDialog.addEventListener("submit", onAddFolderSubmit);

  renameFolderButton.addEventListener("click", showRenameFolderModal);
  renameCurrentFolderDialog.addEventListener(
    "submit",
    onRenameCurrentFolderSubmit,
  );

  sharingFolderBtn.addEventListener("click", showSharingFolderModal);
  sharingCheckbox.addEventListener("input", validateSharingCheckbox);
  durationSubfields.forEach((d) => {
    d.addEventListener("input", validateSharingDurationSubfields);
  });
  sharingFolderDialog.addEventListener("submit", onSharingFolderSubmit);

  copySharedUrlBtn?.addEventListener("click", writeSharedUrlToClipboard);
};

attachEventListeners();
setupAddMenu();
setupDeleteFolderButton();
