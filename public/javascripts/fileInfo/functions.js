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
  const fileId = location.pathname.substring(
    location.pathname.lastIndexOf("/") + 1,
  );
  const enableSharing = document.getElementById("share-file-checkbox").checked;
  if (!enableSharing) {
    const response = await fetch("/sharedFileUrls", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileId,
      }),
    });
    return response.ok;
  }
  const minutes = document.getElementById("share-minutes").value;
  const hours = document.getElementById("share-hours").value;
  const days = document.getElementById("share-days").value;
  const months = document.getElementById("share-months").value;
  const years = document.getElementById("share-years").value;
  const response = await fetch("/sharedFileUrls", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileId,
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

export { showFailedMessage, updateSharing, setCustomValidityForDurationField };
