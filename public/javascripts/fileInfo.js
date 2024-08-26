const confirmDeleteFileDialog = document.getElementById(
  "confirm-delete-file-dialog",
);
const deleteFileBtn = document.getElementById("delete-file");
deleteFileBtn.addEventListener("click", () => {
  confirmDeleteFileDialog.showModal();
});
const showFailedMessage = (msg) => {
  const dialog = document.getElementById("failed-message-dialog");
  const p = document.getElementById("failed-message-text");
  p.textContent = msg;
  dialog.showModal();
};
confirmDeleteFileDialog.addEventListener("submit", async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  const failedMessage = "Failed to delete file!";
  try {
    const response = await fetch(location.href, {
      method: "DELETE",
    });
    if (response.ok) {
      location.assign(location.origin);
    } else {
      showFailedMessage(failedMessage);
    }
  } catch {
    showFailedMessage(failedMessage);
  } finally {
    confirmDeleteFileDialog.close();
  }
});

const renameFileDialog = document.getElementById("rename-file-dialog");
const renameFileBtn = document.getElementById("rename-file");
renameFileBtn.addEventListener("click", () => {
  renameFileDialog.showModal();
});
renameFileDialog.addEventListener("submit", async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  const failedMessage = "Failed to rename the file";
  const name = document.getElementById("current-file-name").value;
  try {
    const response = await fetch(location.href, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    });
    if (response.ok) {
      location.reload();
    } else {
      const json = await response?.json();
      if (json) {
        showFailedMessage(
          `There is already a file named ${name} in folder ${json.folderName}`,
        );
      } else {
        showFailedMessage(failedMessage);
      }
    }
  } catch {
    showFailedMessage(failedMessage);
  } finally {
    renameFileDialog.close();
  }
});
