import {
  sharingForm,
  durationSubfields,
  durationSubfieldsObject,
  sharingCheckbox,
} from "./globals.js";

const showFailedMessage = (msg) => {
  const dialog = document.getElementById("failed-message-dialog");
  const p = document.getElementById("failed-message-text");
  p.textContent = msg;
  dialog.showModal();
};

const updateSharing = async () => {
  const minutes = document.getElementById("share-minutes").value;
  const hours = document.getElementById("share-hours").value;
  const days = document.getElementById("share-days").value;
  const months = document.getElementById("share-months").value;
  const years = document.getElementById("share-years").value;
  const fileId = document.getElementById("file-id").value;
  const enableSharing = document.getElementById("share-file-checkbox").checked;
  const response = await fetch("/sharedFileUrls", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileId,
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

const validateSharingCheckbox = () => {
  const id = document.getElementById("shared-url-id")?.value;
  const sharingCheckbox = document.getElementById("share-file-checkbox");
  const enableSharing = sharingCheckbox.checked;
  if (!id && !enableSharing) {
    sharingCheckbox.setCustomValidity("Must enable sharing");
    sharingForm.reportValidity();
    return false;
  } else {
    sharingCheckbox.setCustomValidity("");
    return true;
  }
};

const getSumOfAllDurationSubfields = () =>
  durationSubfields
    .map((e) => parseInt(e.value))
    .reduce((acc, curr) => acc + curr, 0);

const validateSharingDurationSubfields = () => {
  const minutesSubfield = durationSubfieldsObject.minutes;
  if (!sharingCheckbox.checked) {
    minutesSubfield.setCustomValidity("");
    return true;
  }
  const sum = getSumOfAllDurationSubfields();
  if (sum <= 0) {
    minutesSubfield.setCustomValidity("Duration must be at least one minute");
    sharingForm.reportValidity();
    return false;
  } else {
    minutesSubfield.setCustomValidity("");
    return true;
  }
};

export {
  showFailedMessage,
  updateSharing,
  validateSharingCheckbox,
  validateSharingDurationSubfields,
};
