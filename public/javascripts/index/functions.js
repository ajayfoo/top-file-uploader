import { showFailedMessage, getDurationValues } from "../functions.js";
import {
  durationSubfieldsObject,
  sharingCheckbox,
  deleteFolderDialog,
} from "./globals.js";

const addFilesToFormData = (formData) => {
  const files = document.getElementById("files-to-upload").files;
  for (const file of files) {
    formData.append("files", file, file.name);
  }
};

const uploadFiles = (signal) => {
  const formData = new FormData();
  addFilesToFormData(formData);
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

const sendDeleteFolderRequest = () => {
  return fetch(location.href, {
    method: "DELETE",
  });
};

const showDeleteFolderModal = () => {
  deleteFolderDialog.showModal();
};

const onSubmitDeleteFolderModal = async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  try {
    const response = await sendDeleteFolderRequest();
    if (response.ok && response.redirected) {
      location.assign(response.url);
    } else {
      showFailedMessage("Something went wrong");
    }
  } catch (err) {
    console.error(err);
    showFailedMessage("Something went wrong");
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
  uploadFiles,
  sendCreateFolderPostRequest,
  updateSharing,
  sendRenameFolderPutRequest,
  showDeleteFolderModal,
  onSubmitDeleteFolderModal,
};
