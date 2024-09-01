import {
  durationSubfields,
  durationSubfieldsObject,
  sharingCheckbox,
} from "./globals.js";

const addFilesToFormData = (formData) => {
  const files = document.getElementById("files-to-upload").files;
  let numOfFilesAdded = 0;
  for (const file of files) {
    formData.append("files", file, file.name);
    ++numOfFilesAdded;
  }
  return numOfFilesAdded;
};

const uploadFiles = async () => {
  const form = document.querySelector("#add-files-dialog>form");
  const formData = new FormData();
  const numOfFilesAdded = addFilesToFormData(formData);
  if (numOfFilesAdded < 1) {
    form.reportValidity();
    return;
  }
  const urlPart1 =
    location.pathname === "/" ? "/folders/root" : location.pathname;
  const url = urlPart1 + "/files";
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      location.reload();
      return;
    }
  } catch {
    showFailedResponseMessage("Something went wrong");
  }
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

const showFailedResponseMessage = (msg) => {
  const dialog = document.getElementById("create-folder-post-reponse");
  const msgEle = dialog.querySelector("form>p.message");
  msgEle.textContent = msg;
  dialog.showModal();
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
        const done = await sendDeleteFolderRequest();
        if (done) {
          location.replace(location.origin);
        } else {
          showFailedResponseMessage("Something went wrong");
        }
      } catch (err) {
        console.error(err);
        showFailedResponseMessage("Something went wrong");
      }
    });
  }
};

const updateSharing = async () => {
  const folderId = location.pathname.substring(
    location.pathname.lastIndexOf("/") + 1,
  );
  const enableSharing = document.getElementById(
    "share-folder-checkbox",
  ).checked;
  if (!enableSharing) {
    const response = await fetch("/sharedFolderUrls", {
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
  const minutes = document.getElementById("share-minutes").value;
  const hours = document.getElementById("share-hours").value;
  const days = document.getElementById("share-days").value;
  const months = document.getElementById("share-months").value;
  const years = document.getElementById("share-years").value;
  const response = await fetch("/sharedFolderUrls", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      folderId,
      enableSharing,
      minutes,
      hours,
      days,
      months,
      years,
    }),
  });
  return response.ok;
};

const getSumOfAllDurationSubfields = () =>
  durationSubfields
    .map((e) => parseInt(e.value))
    .reduce((acc, curr) => acc + curr, 0);

const setCustomValidityForDurationField = () => {
  const minutesSubfield = durationSubfieldsObject.minutes;
  if (!sharingCheckbox.checked) {
    minutesSubfield.setCustomValidity("");
    return true;
  }
  const sum = getSumOfAllDurationSubfields();
  if (sum <= 0) {
    minutesSubfield.setCustomValidity("Duration must be at least one minute");
    return false;
  } else {
    minutesSubfield.setCustomValidity("");
    return true;
  }
};

export {
  setupAddMenu,
  setupDeleteFolderButton,
  uploadFiles,
  sendCreateFolderPostRequest,
  showFailedResponseMessage,
  sendRenameFolderPutRequest,
  setCustomValidityForDurationField,
  updateSharing,
};
