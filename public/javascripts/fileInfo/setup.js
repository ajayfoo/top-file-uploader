import {
  deleteFileBtn,
  confirmDeleteFileDialog,
  renameFileBtn,
  renameFileDialog,
  sharingButton,
  copyLinkButton,
} from "./globals.js";

import {
  showConfirmDeleteModal,
  onConfirmDeleteSubmit,
  showRenameDialog,
  onRenameSubmit,
  showSharingModal,
  writeSharedUrlToClipboard,
} from "./evenListeners.js";

const attachEventListeners = () => {
  deleteFileBtn.addEventListener("click", showConfirmDeleteModal);
  confirmDeleteFileDialog.addEventListener("submit", onConfirmDeleteSubmit);

  renameFileBtn.addEventListener("click", showRenameDialog);
  renameFileDialog.addEventListener("submit", onRenameSubmit);

  sharingButton.addEventListener("click", showSharingModal);

  copyLinkButton?.addEventListener("click", writeSharedUrlToClipboard);
};

attachEventListeners();
