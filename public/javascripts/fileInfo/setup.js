import {
  deleteFileBtn,
  confirmDeleteFileDialog,
  renameFileBtn,
  renameFileDialog,
  sharingButton,
  sharingDialog,
  copyLinkButton,
} from "./globals.js";

import {
  showConfirmDeleteModal,
  onConfirmDeleteSubmit,
  showRenameDialog,
  onRenameSubmit,
  showSharingModal,
  onSharingSubmit,
  writeSharedUrlToClipboard,
} from "./evenListeners.js";

const attachEventListeners = () => {
  deleteFileBtn.addEventListener("click", showConfirmDeleteModal);
  confirmDeleteFileDialog.addEventListener("submit", onConfirmDeleteSubmit);

  renameFileBtn.addEventListener("click", showRenameDialog);
  renameFileDialog.addEventListener("submit", onRenameSubmit);

  sharingButton.addEventListener("click", showSharingModal);
  sharingDialog.addEventListener("submit", onSharingSubmit);

  copyLinkButton?.addEventListener("click", writeSharedUrlToClipboard);
};

attachEventListeners();
