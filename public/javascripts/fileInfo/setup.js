import {
  deleteFileBtn,
  confirmDeleteFileDialog,
  renameFileBtn,
  renameFileDialog,
  sharingButton,
} from "./globals.js";

import {
  showConfirmDeleteModal,
  onConfirmDeleteSubmit,
  showRenameDialog,
  onRenameSubmit,
  showSharingModal,
} from "./evenListeners.js";

const attachEventListeners = () => {
  deleteFileBtn.addEventListener("click", showConfirmDeleteModal);
  confirmDeleteFileDialog.addEventListener("submit", onConfirmDeleteSubmit);

  renameFileBtn.addEventListener("click", showRenameDialog);
  renameFileDialog.addEventListener("submit", onRenameSubmit);

  sharingButton.addEventListener("click", showSharingModal);
};

attachEventListeners();
