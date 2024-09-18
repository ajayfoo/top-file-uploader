import {
  filesToUploadInput,
  addFilesButton,
  addFileDialog,
  addFolderButton,
  addFolderDialog,
  renameCurrentFolderDialog,
  renameFolderButton,
  durationSubfields,
  sharingFolderDialog,
  sharingFolderBtn,
  copySharedUrlBtn,
  sharingCheckbox,
  durationSubfieldsObject,
  deleteFolderButton,
  deleteFolderDialog,
  currentFolderNameHeadingButton,
  logoutButton,
  logoutDialog,
  showFolderInfoButton,
} from "./globals.js";
import { setCustomValidityForDurationField } from "../functions.js";
import {
  showDeleteFolderModal,
  onSubmitDeleteFolderModal,
} from "./functions.js";
import {
  onAddFilesSubmit,
  onAddFolderSubmit,
  onLogoutFormSubmit,
  onRenameCurrentFolderSubmit,
  onSharingFolderSubmit,
  showAddFilesModal,
  showAddFolderModal,
  showFolderInfoModal,
  showLogoutDialog,
  showRenameFolderModal,
  showSharingFolderModal,
  toggleFolderLeftActionButtons,
  updateSelectedFilesCount,
  writeSharedUrlToClipboard,
} from "./eventListeners.js";

const attachEventListeners = () => {
  currentFolderNameHeadingButton.addEventListener(
    "click",
    toggleFolderLeftActionButtons,
  );
  addFilesButton.addEventListener("click", showAddFilesModal);
  addFileDialog.addEventListener("submit", onAddFilesSubmit);
  filesToUploadInput.addEventListener("input", updateSelectedFilesCount);
  filesToUploadInput.addEventListener("change", updateSelectedFilesCount);

  addFolderButton.addEventListener("click", showAddFolderModal);
  addFolderDialog.addEventListener("submit", onAddFolderSubmit);

  showFolderInfoButton.addEventListener("click", showFolderInfoModal);
  renameFolderButton.addEventListener("click", showRenameFolderModal);
  renameCurrentFolderDialog.addEventListener(
    "submit",
    onRenameCurrentFolderSubmit,
  );

  sharingFolderBtn.addEventListener("click", showSharingFolderModal);
  sharingCheckbox.addEventListener("input", () =>
    setCustomValidityForDurationField(durationSubfieldsObject, sharingCheckbox),
  );
  durationSubfields.forEach((d) => {
    d.addEventListener("input", () =>
      setCustomValidityForDurationField(
        durationSubfieldsObject,
        sharingCheckbox,
      ),
    );
  });
  sharingFolderDialog.addEventListener("submit", onSharingFolderSubmit);

  copySharedUrlBtn?.addEventListener("click", writeSharedUrlToClipboard);
  logoutButton.addEventListener("click", showLogoutDialog);
  logoutDialog.addEventListener("submit", onLogoutFormSubmit);
};

const setupAddMenu = () => {
  const menuHeader = document.getElementById("add-menu-header");
  const addMenu = document.getElementById("add-menu");
  const firstItem = document.querySelector("#add-menu>.items>:first-child");
  menuHeader.addEventListener("click", () => {
    addMenu.classList.toggle("open");
    firstItem.focus();
  });
};

const setupDeleteFolderButton = () => {
  deleteFolderButton?.addEventListener("click", showDeleteFolderModal);
  deleteFolderDialog?.addEventListener("submit", onSubmitDeleteFolderModal);
};

attachEventListeners();
setupAddMenu();
setupDeleteFolderButton();
