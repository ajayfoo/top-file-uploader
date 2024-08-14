const addFilesButton = document.getElementById("add-files-button");
const addFileDialog = document.getElementById("add-files-dialog");
addFilesButton.addEventListener("click", () => {
  addFileDialog.showModal();
});

const setupAddMenu = () => {
  const menuHeader = document.getElementById("add-menu-header");
  const itemsEle = document.querySelector("#add-menu>.items");
  const firstItem = document.querySelector("#add-menu>.items>:first-child");
  console.log(firstItem);
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

setupAddMenu();

const addFolderButton = document.getElementById("add-folder-button");
const addFolderDialog = document.getElementById("add-folder-dialog");
addFolderButton.addEventListener("click", () => {
  addFolderDialog.showModal();
});

// addFolderDialog.addEventListener("submit", (e) => {
//   e.preventDefault();
//   console.log("submit");
// });
