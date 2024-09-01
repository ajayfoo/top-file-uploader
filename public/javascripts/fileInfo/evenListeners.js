import {
  confirmDeleteFileDialog,
  renameFileDialog,
  sharingDialog,
} from "./globals.js";
import {
  showFailedMessage,
  updateSharing,
  validateSharingCheckbox,
  validateSharingDurationSubfields,
} from "./functions.js";

const showConfirmDeleteModal = () => {
  confirmDeleteFileDialog.showModal();
};

const onConfirmDeleteSubmit = async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  const failedMessage = "Failed to delete file!";
  try {
    const response = await fetch(location.href, {
      method: "DELETE",
    });
    if (response.ok) {
      location.assign(location.origin);
    } else {
      showFailedMessage(failedMessage);
    }
  } catch {
    showFailedMessage(failedMessage);
  } finally {
    confirmDeleteFileDialog.close();
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
  try {
    const response = await fetch(location.href, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    });
    if (response.ok) {
      location.reload();
    } else {
      const json = await response?.json();
      if (json) {
        showFailedMessage(
          `There is already a file named ${name} in folder ${json.folderName}`,
        );
      } else {
        showFailedMessage(failedMessage);
      }
    }
  } catch {
    showFailedMessage(failedMessage);
  } finally {
    renameFileDialog.close();
  }
};

const showSharingModal = () => {
  sharingDialog.showModal();
};

const onSharingSubmit = async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  if (!validateSharingCheckbox() || !validateSharingDurationSubfields()) return;
  try {
    const done = await updateSharing();
    if (done) {
      location.reload();
    } else {
      showFailedMessage("Failed to add shared url");
    }
  } catch {
    showFailedMessage("Failed to add shared url");
  } finally {
    sharingDialog.close();
  }
};

const writeSharedUrlToClipboard = async (e) => {
  const url = new URL("sharedFiles/" + e.target.dataset.id, location.origin)
    .href;
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
