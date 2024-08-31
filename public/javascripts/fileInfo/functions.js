const showFailedMessage = (msg) => {
  const dialog = document.getElementById("failed-message-dialog");
  const p = document.getElementById("failed-message-text");
  p.textContent = msg;
  dialog.showModal();
};

export { showFailedMessage };
