import {
  showFailedMessage,
  getDurationValues,
  showProgressDialog,
  closeProgressDialog,
} from "../functions.js";
import {
  durationSubfieldsObject,
  sharingCheckbox,
  deleteFolderDialog,
  filesToUploadInput,
} from "./globals.js";

const hasFilesAbove50MB = () => {
  const files = filesToUploadInput.files;
  for (const file of files) {
    if (file.size > 52_428_800) {
      return true;
    }
  }
  return false;
};

const getPopulatedFormData = () => {
  const formData = new FormData();
  const files = filesToUploadInput.files;
  for (const file of files) {
    formData.append("files", file, file.name);
  }
  return formData;
};

const uploadFiles = (signal) => {
  const formData = getPopulatedFormData();
  const urlPart1 =
    location.pathname === "/" ? "/folders/root" : location.pathname;
  const url = urlPart1 + "/files";
  return fetch(url, {
    method: "POST",
    body: formData,
    signal,
  });
};

const sendCreateFolderPostRequest = (signal) => {
  const name = document.getElementById("folder-name").value;
  const url = location.pathname === "/" ? "/folders/root" : location.pathname;

  return fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      name,
    }),
    signal,
  });
};

const sendRenameFolderPutRequest = async (parentId, signal) => {
  const newName = document.getElementById("current-folder-name").value;
  const url = location.pathname === "/" ? "/folders/root" : location.pathname;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parentId, newName }),
    signal,
  });
  return response;
};

const sendDeleteFolderRequest = (signal) => {
  return fetch(location.href, {
    method: "DELETE",
    signal,
  });
};

const showDeleteFolderModal = () => {
  deleteFolderDialog.showModal();
};

const onSubmitDeleteFolderModal = async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  try {
    const controller = new AbortController();
    showProgressDialog(controller);
    const response = await sendDeleteFolderRequest(controller.signal);
    if (response.ok && response.redirected) {
      location.assign(response.url);
    } else {
      showFailedMessage("Something went wrong");
    }
  } catch (err) {
    console.error(err);
    showFailedMessage("Something went wrong");
  } finally {
    closeProgressDialog();
  }
};

const updateSharing = async (signal) => {
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
      signal,
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
    signal,
  });
  return response.ok;
};

export {
  hasFilesAbove50MB,
  uploadFiles,
  sendCreateFolderPostRequest,
  updateSharing,
  sendRenameFolderPutRequest,
  showDeleteFolderModal,
  onSubmitDeleteFolderModal,
};
