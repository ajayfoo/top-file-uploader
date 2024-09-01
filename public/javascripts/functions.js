const showFailedMessage = (msg) => {
  const dialog = document.getElementById("failed-message-dialog");
  const p = document.getElementById("failed-message-text");
  p.textContent = msg;
  dialog.showModal();
};

const getDurationValues = (durationSubfieldsObject) => {
  const minutes = durationSubfieldsObject.minutes.value;
  const hours = durationSubfieldsObject.hours.value;
  const days = durationSubfieldsObject.days.value;
  const months = durationSubfieldsObject.months.value;
  const years = durationSubfieldsObject.years.value;
  return { minutes, hours, days, months, years };
};

const getSumOfAllDurationSubfields = (durationSubfieldsObject) =>
  Object.values(durationSubfieldsObject)
    .map((e) => parseInt(e.value))
    .reduce((acc, curr) => acc + curr, 0);

const setCustomValidityForDurationField = (
  durationSubfieldsObject,
  sharingCheckbox,
) => {
  const minutesSubfield = durationSubfieldsObject.minutes;
  if (!sharingCheckbox.checked) {
    minutesSubfield.setCustomValidity("");
    return true;
  }
  const sum = getSumOfAllDurationSubfields(durationSubfieldsObject);
  if (sum <= 0) {
    minutesSubfield.setCustomValidity("Duration must be at least one minute");
    return false;
  } else {
    minutesSubfield.setCustomValidity("");
    return true;
  }
};

export {
  showFailedMessage,
  getDurationValues,
  setCustomValidityForDurationField,
};
