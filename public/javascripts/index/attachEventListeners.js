import {
  addFilesButton,
  addFileDialog,
  addFolderButton,
  addFolderDialog,
  renameCurrentFolderDialog,
  renameFolderButton,
  durationSubfields,
  sharingCheckbox,
  shareFolderDialog,
  sharingFolderBtn,
  copySharedUrlBtn,
} from "./globals.js";
import {
  uploadFiles,
  showFailedResponseMessage,
  sendCreateFolderPostRequest,
  sendRenameFolderPutRequest,
  validateSharingDurationSubfields,
  validateSharingCheckbox,
  updateSharing,
  writeSharedUrlToClipboard,
} from "./functions.js";

const attachEventListeners = () => {
  addFilesButton.addEventListener("click", () => {
    addFileDialog.showModal();
  });

  addFileDialog.addEventListener("submit", async (e) => {
    if (document.activeElement.hasAttribute("formnovalidate")) return;
    e.preventDefault();
    await uploadFiles();
  });

  addFolderButton.addEventListener("click", () => {
    addFolderDialog.showModal();
  });

  addFolderDialog.addEventListener("submit", async (e) => {
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
  });

  renameFolderButton.addEventListener("click", () => {
    renameCurrentFolderDialog.showModal();
  });
  renameCurrentFolderDialog.addEventListener("submit", async (e) => {
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
  });

  durationSubfields.forEach((d) => {
    d.addEventListener("input", validateSharingDurationSubfields);
  });

  sharingCheckbox.addEventListener("input", validateSharingCheckbox);
  sharingFolderBtn.addEventListener("click", () => {
    shareFolderDialog.showModal();
  });
  shareFolderDialog.addEventListener("submit", async (e) => {
    if (document.activeElement.hasAttribute("formnovalidate")) return;
    e.preventDefault();
    validateSharingDurationSubfields();
    if (!validateSharingCheckbox() && !validateSharingDurationSubfields())
      return;
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
      shareFolderDialog.close();
    }
  });

  copySharedUrlBtn?.addEventListener("click", async () => {
    await writeSharedUrlToClipboard();
  });
};

export default attachEventListeners;
