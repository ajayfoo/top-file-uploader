const confirmDeleteFileDialog = document.getElementById(
  "confirm-delete-file-dialog",
);
const deleteFileBtn = document.getElementById("delete-file");
deleteFileBtn.addEventListener("click", () => {
  confirmDeleteFileDialog.showModal();
});

const showFailedToDeleteFileDialog = () => {
  const dialog = document.getElementById("failed-to-delete-file-dialog");
  dialog.showModal();
};

confirmDeleteFileDialog.addEventListener("submit", async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  try {
    const response = await fetch(location.href, {
      method: "DELETE",
    });
    if (response.ok) {
      location.assign(location.origin);
    } else {
      showFailedToDeleteFileDialog();
    }
  } catch {
    showFailedToDeleteFileDialog();
  } finally {
    confirmDeleteFileDialog.close();
  }
});
