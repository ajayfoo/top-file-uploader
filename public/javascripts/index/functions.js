import {
  showFailedMessage,
  getDurationValues,
  showProgressDialog,
  closeProgressDialog,
} from "../functions.js";
import { durationSubfieldsObject, sharingCheckbox } from "./globals.js";

const addFilesToFormData = (formData) => {
  const files = document.getElementById("files-to-upload").files;
  for (const file of files) {
    formData.append("files", file, file.name);
  }
};

const uploadFiles = () => {
  const formData = new FormData();
  addFilesToFormData(formData);
  const urlPart1 =
    location.pathname === "/" ? "/folders/root" : location.pathname;
  const url = urlPart1 + "/files";
  return fetch(url, {
    method: "POST",
    body: formData,
  });
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

const sendCreateFolderPostRequest = async () => {
  const name = document.getElementById("folder-name").value;
  const url = location.pathname === "/" ? "/folders/root" : location.pathname;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      name,
    }),
  });
  return response;
};

const sendRenameFolderPutRequest = async (container) => {
  const form = container.querySelector("form");
  const parentId = form.elements.parentId.value;
  const newName = document.getElementById("current-folder-name").value;
  const url = location.pathname === "/" ? "/folders/root" : location.pathname;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parentId, newName }),
  });
  return response;
};

const setupDeleteFolderButton = () => {
  const deleteFolderButton = document.getElementById("delete-folder-button");
  const deleteFolderDialog = document.getElementById("delete-folder-dialog");
  if (deleteFolderButton) {
    const sendDeleteFolderRequest = async () => {
      const response = await fetch(location.href, {
        method: "DELETE",
      });
      return response.ok;
    };
    deleteFolderButton.addEventListener("click", () => {
      deleteFolderDialog.showModal();
    });
    deleteFolderDialog.addEventListener("submit", async (e) => {
      if (document.activeElement.hasAttribute("formnovalidate")) return;
      e.preventDefault();
      try {
        showProgressDialog();
        const done = await sendDeleteFolderRequest();
        if (done) {
          location.replace(location.origin);
        } else {
          showFailedMessage("Something went wrong");
        }
      } catch (err) {
        console.error(err);
        showFailedMessage("Something went wrong");
      } finally {
        closeProgressDialog();
      }
    });
  }
};

const updateSharing = async () => {
  const folderId = location.pathname.substring(
    location.pathname.lastIndexOf("/") + 1,
  );
  const enableSharing = sharingCheckbox.checked;
  const url = "/sharedFolderUrls";
  if (!enableSharing) {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        folderId,
      }),
    });
    return response.ok;
  }
  const durationValues = getDurationValues(durationSubfieldsObject);
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      folderId,
      enableSharing,
      ...durationValues,
    }),
  });
  return response.ok;
};

export {
  setupAddMenu,
  setupDeleteFolderButton,
  uploadFiles,
  sendCreateFolderPostRequest,
  updateSharing,
  sendRenameFolderPutRequest,
};
