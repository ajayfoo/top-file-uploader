import {
  confirmDeleteFileDialog,
  renameFileDialog,
  sharingDialog,
} from "./globals.js";
import { showFailedMessage } from "./functions.js";

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
export {
  showConfirmDeleteModal,
  onConfirmDeleteSubmit,
  showRenameDialog,
  onRenameSubmit,
  showSharingModal,
};
