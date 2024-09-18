import {
  confirmDeleteFileDialog,
  copyLinkButton,
  durationSubfieldsObject,
  renameFileDialog,
  sharingCheckbox,
  sharingDialog,
} from "./globals.js";
import {
  closeProgressDialog,
  setCustomValidityForDurationField,
  showFailedMessage,
  showProgressDialog,
} from "../functions.js";

import { updateSharing } from "./functions.js";

const showConfirmDeleteModal = () => {
  confirmDeleteFileDialog.showModal();
};

const onConfirmDeleteSubmit = async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  const failedMessage = "Failed to delete file!";
  const controller = new AbortController();
  showProgressDialog(controller);
  try {
    const response = await fetch(location.href, {
      method: "DELETE",
      signal: controller.signal,
    });
    if (response.ok && response.redirected) {
      location.assign(response.url);
    } else {
      showFailedMessage(failedMessage);
    }
  } catch {
    showFailedMessage(failedMessage);
  } finally {
    confirmDeleteFileDialog.close();
    closeProgressDialog();
  }
};

const showRenameDialog = () => {
  renameFileDialog.showModal();
};

const onRenameSubmit = async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  const failedMessage = "Failed to rename the file";
  const name = document.getElementById("current-file-name").value;
  const controller = new AbortController();
  showProgressDialog(controller);
  try {
    const response = await fetch(location.href, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
      signal: controller.signal,
    });
    if (response.ok) {
      location.reload();
    } else {
      const msg = await response.text();
      showFailedMessage(msg || "Something went wrong");
    }
  } catch {
    showFailedMessage(failedMessage);
  } finally {
    closeProgressDialog();
    renameFileDialog.close();
  }
};

const showSharingModal = () => {
  sharingDialog.showModal();
};

const onSharingSubmit = async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  if (
    !setCustomValidityForDurationField(durationSubfieldsObject, sharingCheckbox)
  )
    return;
  const controller = new AbortController();
  showProgressDialog(controller);
  try {
    const done = await updateSharing(controller.signal);
    if (done) {
      location.reload();
    } else {
      showFailedMessage("Failed to add shared url");
    }
  } catch (err) {
    console.error(err);
    showFailedMessage("Failed to add shared url");
  } finally {
    closeProgressDialog();
    sharingDialog.close();
  }
};

const writeSharedUrlToClipboard = async () => {
  const url = location.origin + copyLinkButton.dataset.sharedUrl;
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    showFailedMessage("Failed to copy link to clipboard");
  }
};

export {
  showConfirmDeleteModal,
  onConfirmDeleteSubmit,
  showRenameDialog,
  onRenameSubmit,
  showSharingModal,
  onSharingSubmit,
  writeSharedUrlToClipboard,
};
