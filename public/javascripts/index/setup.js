import {
  addFilesButton,
  addFileDialog,
  addFolderButton,
  addFolderDialog,
  renameCurrentFolderDialog,
  renameFolderButton,
  durationSubfields,
  sharingFolderDialog,
  sharingFolderBtn,
  copySharedUrlBtn,
} from "./globals.js";
import { validateSharingDurationSubfields } from "./functions.js";
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
  durationSubfields.forEach((d) => {
    d.addEventListener("input", validateSharingDurationSubfields);
  });
  sharingFolderDialog.addEventListener("submit", onSharingFolderSubmit);

  copySharedUrlBtn?.addEventListener("click", writeSharedUrlToClipboard);
};

attachEventListeners();
setupAddMenu();
setupDeleteFolderButton();
