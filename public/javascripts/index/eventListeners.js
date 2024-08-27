import {
  addFileDialog,
  addFolderDialog,
  renameCurrentFolderDialog,
  sharingFolderDialog,
  copySharedUrlBtn,
} from "./globals.js";
import {
  uploadFiles,
  sendCreateFolderPostRequest,
  showFailedResponseMessage,
  sendRenameFolderPutRequest,
  validateSharingCheckbox,
  validateSharingDurationSubfields,
  updateSharing,
} from "./functions.js";

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
    } else if (response.status === 403) {
      const json = await response.json();
      showFailedResponseMessage(
        "There's already a folder named '" + json.duplicateName + "'",
      );
    } else {
      showFailedResponseMessage("Something went wrong");
    }
  } catch (err) {
    console.error(err);
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
    } else if (response.status === 403) {
      const json = await response.json();
      showFailedResponseMessage(
        `There's already a folder named '${json.duplicateName}' inside folder '${json.parentFolderName}'`,
      );
    } else {
      showFailedResponseMessage("Something went wrong");
    }
  } catch (err) {
    console.error(err);
    showFailedResponseMessage("Something went wrong");
  }
};

const showSharingFolderModal = () => {
  sharingFolderDialog.showModal();
};

const onSharingFolderSubmit = async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  if (!validateSharingCheckbox() || !validateSharingDurationSubfields()) return;
  try {
    const done = await updateSharing();
    if (done) {
      location.reload();
    } else {
      showFailedResponseMessage("Failed to add shared url");
    }
  } catch {
    showFailedResponseMessage("Failed to add shared url");
  } finally {
    sharingFolderDialog.close();
  }
};

const writeSharedUrlToClipboard = async () => {
  const url = new URL("shared/" + copySharedUrlBtn.dataset.id, location.origin)
    .href;
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    showFailedResponseMessage("Failed to copy link to clipboard");
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
