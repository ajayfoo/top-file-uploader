const confirmDeleteFileDialog = document.getElementById(
  "confirm-delete-file-dialog",
);
const deleteFileBtn = document.getElementById("delete-file");
deleteFileBtn.addEventListener("click", () => {
  confirmDeleteFileDialog.showModal();
});

confirmDeleteFileDialog.addEventListener("submit", async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  const response = await fetch(location.href, {
    method: "DELETE",
  });
  if (response.ok) {
    console.log("successfully deleted");
    location.assign(location.origin);
  } else {
    console.log("failed to delete");
  }
});
