import {
  addFileDialog,
  addFolderDialog,
  renameCurrentFolderDialog,
  sharingFolderDialog,
  copySharedUrlBtn,
  sharingCheckbox,
  durationSubfieldsObject,
  logoutDialog,
  filesToUploadInput,
  folderInfoDialog,
} from "./globals.js";
import {
  uploadFiles,
  sendCreateFolderPostRequest,
  updateSharing,
  sendRenameFolderPutRequest,
  hasFilesAbove50MB,
} from "./functions.js";

import {
  closeProgressDialog,
  setCustomValidityForDurationField,
  showFailedMessage,
  showProgressDialog,
} from "../functions.js";

const toggleFolderLeftActionButtons = () => {
  const leftActionButtons = document.getElementById(
    "folder-left-action-buttons",
  );
  const isVisible =
    getComputedStyle(leftActionButtons).visibility === "visible";
  if (isVisible) {
    leftActionButtons.style.visibility = "hidden";
    leftActionButtons.classList.remove("open");
  } else {
    leftActionButtons.style.visibility = "visible";
    leftActionButtons.classList.add("open");
  }
};

const showAddFilesModal = () => {
  addFileDialog.showModal();
};

const onAddFilesSubmit = async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  if (hasFilesAbove50MB()) {
    filesToUploadInput.value = "";
    const changeEvent = new Event("change");
    filesToUploadInput.dispatchEvent(changeEvent);
    showFailedMessage("File size cannot exceed 50MB");
    return;
  }
  const controller = new AbortController();
  showProgressDialog(controller);
  try {
    const response = await uploadFiles(controller.signal);
    if (response.ok) {
      location.reload();
    } else {
      showFailedMessage("Something went wrong");
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      showFailedMessage("Something went wrong");
    }
  } finally {
    closeProgressDialog();
  }
};

const showFolderInfoModal = () => {
  folderInfoDialog.showModal();
};

const updateSelectedFilesCount = (e) => {
  const filesCountEle = document.getElementById(
    "number-of-files-ready-to-upload",
  );
  filesCountEle.textContent = e.target.files.length;
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
      const msg = await response.text();
      showFailedMessage(msg || "Something went wrong");
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      showFailedMessage("Something went wrong");
    }
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
      const msg = await response.text();
      showFailedMessage(msg || "Something went wrong");
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      showFailedMessage("Something went wrong");
    }
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
    const response = await updateSharing(controller.signal);
    if (response.ok) {
      location.reload();
      sharingFolderDialog.close();
    } else {
      const errorMsg = await response.text();
      showFailedMessage(errorMsg || "Failed to update sharing");
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      showFailedMessage("Something went wrong");
    }
  } finally {
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

const showLogoutDialog = () => {
  logoutDialog.showModal();
};

const onLogoutFormSubmit = async (e) => {
  const logoutUrl = "/auth/logout";
  if (document.activeElement.getAttribute("formaction") !== logoutUrl) return;
  e.preventDefault();
  try {
    const response = await fetch(logoutUrl, {
      method: "POST",
    });
    if (response.ok && response.redirected) {
      location.replace("/");
    } else {
      showFailedMessage("Failed to logout");
    }
  } catch {
    showFailedMessage("Failed to logout");
  }
};

export {
  updateSelectedFilesCount,
  toggleFolderLeftActionButtons,
  showAddFilesModal,
  onAddFilesSubmit,
  showAddFolderModal,
  onAddFolderSubmit,
  showFolderInfoModal,
  showRenameFolderModal,
  onRenameCurrentFolderSubmit,
  showSharingFolderModal,
  onSharingFolderSubmit,
  writeSharedUrlToClipboard,
  showLogoutDialog,
  onLogoutFormSubmit,
};
