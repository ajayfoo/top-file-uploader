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
  closeProgressDialog,
  setCustomValidityForDurationField,
  showFailedMessage,
  showProgressDialog,
} from "../functions.js";

const showAddFilesModal = () => {
  addFileDialog.showModal();
};

const onAddFilesSubmit = async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  const controller = new AbortController();
  showProgressDialog(controller);
  try {
    const response = await uploadFiles(controller.signal);
    if (response.ok) {
      location.reload();
    } else {
      showFailedMessage("Something went wrong");
    }
  } catch {
    showFailedMessage("Something went wrong");
  } finally {
    closeProgressDialog();
  }
};

const showAddFolderModal = () => {
  addFolderDialog.showModal();
};

const onAddFolderSubmit = async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  const controller = new AbortController();
  showProgressDialog(controller);
  try {
    const response = await sendCreateFolderPostRequest(controller.signal);
    if (response.ok) {
      location.reload();
    } else {
      showFailedMessage("Something went wrong");
    }
  } catch {
    showFailedMessage("Something went wrong");
  } finally {
    closeProgressDialog();
  }
};

const showRenameFolderModal = () => {
  renameCurrentFolderDialog.showModal();
};

const onRenameCurrentFolderSubmit = async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  const parentId =
    renameCurrentFolderDialog.querySelector("form").elements.parentId.value;
  const controller = new AbortController();
  showProgressDialog(controller);
  try {
    const response = await sendRenameFolderPutRequest(
      parentId,
      controller.signal,
    );
    if (response.ok) {
      location.reload();
    } else {
      showFailedMessage("Something went wrong");
    }
  } catch {
    showFailedMessage("Something went wrong");
  } finally {
    closeProgressDialog();
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
  const controller = new AbortController();
  showProgressDialog(controller);
  try {
    const done = await updateSharing(controller.signal);
    if (done) {
      location.reload();
    } else {
      showFailedMessage("Failed to add shared url");
    }
  } catch {
    showFailedMessage("Failed to add shared url");
  } finally {
    sharingFolderDialog.close();
    closeProgressDialog();
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
