import {
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
} from "./globals.js";
import { setCustomValidityForDurationField } from "../functions.js";
import {
  showDeleteFolderModal,
  onSubmitDeleteFolderModal,
} from "./functions.js";
import {
  onAddFilesSubmit,
  onAddFolderSubmit,
  onRenameCurrentFolderSubmit,
  onSharingFolderSubmit,
  showAddFilesModal,
  showAddFolderModal,
  showRenameFolderModal,
  showSharingFolderModal,
  toggleFolderLeftActionButtons,
  writeSharedUrlToClipboard,
} from "./eventListeners.js";

const attachEventListeners = () => {
  currentFolderNameHeadingButton.addEventListener(
    "click",
    toggleFolderLeftActionButtons,
  );
  addFilesButton.addEventListener("click", showAddFilesModal);
  addFileDialog.addEventListener("submit", onAddFilesSubmit);

  addFolderButton.addEventListener("click", showAddFolderModal);
  addFolderDialog.addEventListener("submit", onAddFolderSubmit);

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
};

const setupAddMenu = () => {
  const menuHeader = document.getElementById("add-menu-header");
  const itemsEle = document.querySelector("#add-menu>.items");
  const firstItem = document.querySelector("#add-menu>.items>:first-child");
  let open = false;
  menuHeader.addEventListener("click", () => {
    if (open) {
      itemsEle.classList.remove("visible");
    } else {
      itemsEle.classList.add("visible");
      firstItem.focus();
    }
    open = !open;
  });
};

const setupDeleteFolderButton = () => {
  deleteFolderButton?.addEventListener("click", showDeleteFolderModal);
  deleteFolderDialog?.addEventListener("submit", onSubmitDeleteFolderModal);
};

attachEventListeners();
setupAddMenu();
setupDeleteFolderButton();
