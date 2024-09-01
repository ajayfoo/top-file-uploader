import {
  addFileDialog,
  addFolderDialog,
  renameCurrentFolderDialog,
  sharingFolderDialog,
  copySharedUrlBtn,
  sharingCheckbox,
  durationSubfieldsObject,
} from "./globals.js";
import {
  uploadFiles,
  sendCreateFolderPostRequest,
  updateSharing,
  sendRenameFolderPutRequest,
} from "./functions.js";

import {
  setCustomValidityForDurationField,
  showFailedMessage,
} from "../functions.js";

const showAddFilesModal = () => {
  addFileDialog.showModal();
};

const onAddFilesSubmit = async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  await uploadFiles();
};

const showAddFolderModal = () => {
  addFolderDialog.showModal();
};

const onAddFolderSubmit = async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  try {
    const response = await sendCreateFolderPostRequest();
    if (response.ok) {
      location.reload();
    } else {
      showFailedMessage("Something went wrong");
    }
  } catch {
    showFailedMessage("Something went wrong");
  }
};

const showRenameFolderModal = () => {
  renameCurrentFolderDialog.showModal();
};

const onRenameCurrentFolderSubmit = async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  try {
    const response = await sendRenameFolderPutRequest(
      renameCurrentFolderDialog,
    );
    if (response.ok) {
      location.reload();
    } else {
      showFailedMessage("Something went wrong");
    }
  } catch {
    showFailedMessage("Something went wrong");
  }
};

const showSharingFolderModal = () => {
  sharingFolderDialog.showModal();
};

const onSharingFolderSubmit = async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  if (
    !setCustomValidityForDurationField(durationSubfieldsObject, sharingCheckbox)
  )
    return;
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
    sharingFolderDialog.close();
  }
};

const writeSharedUrlToClipboard = async () => {
  const url = new URL(
    "sharedFolders/" + copySharedUrlBtn.dataset.id,
    location.origin,
  ).href;
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    showFailedMessage("Failed to copy link to clipboard");
  }
};

export {
  showAddFilesModal,
  onAddFilesSubmit,
  showAddFolderModal,
  onAddFolderSubmit,
  showRenameFolderModal,
  onRenameCurrentFolderSubmit,
  showSharingFolderModal,
  onSharingFolderSubmit,
  writeSharedUrlToClipboard,
};
