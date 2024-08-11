const addFilesButton = document.getElementById("add-files-button");
const addFileDialog = document.getElementById("add-files-dialog");
addFilesButton.addEventListener("click", () => {
  addFileDialog.showModal();
});
