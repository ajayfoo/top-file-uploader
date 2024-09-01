import {
  deleteFileBtn,
  confirmDeleteFileDialog,
  renameFileBtn,
  renameFileDialog,
  sharingButton,
  sharingDialog,
  copyLinkButton,
  durationSubfields,
  sharingCheckbox,
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
import { setCustomValidityForDurationField } from "./functions.js";

const attachEventListeners = () => {
  deleteFileBtn.addEventListener("click", showConfirmDeleteModal);
  confirmDeleteFileDialog.addEventListener("submit", onConfirmDeleteSubmit);

  renameFileBtn.addEventListener("click", showRenameDialog);
  renameFileDialog.addEventListener("submit", onRenameSubmit);

  sharingButton.addEventListener("click", showSharingModal);
  sharingDialog.addEventListener("submit", onSharingSubmit);
  sharingCheckbox.addEventListener("input", setCustomValidityForDurationField);
  durationSubfields.forEach((f) => {
    f.addEventListener("input", setCustomValidityForDurationField);
  });

  copyLinkButton?.addEventListener("click", writeSharedUrlToClipboard);
};

attachEventListeners();
