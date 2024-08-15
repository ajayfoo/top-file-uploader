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

const sendCreateFolderPostRequest = async () => {
  const parentId = parseInt(document.getElementById("parent-id").value);
  const name = document.getElementById("folder-name").value;
  console.log(parentId);
  console.log(name);
  const url = location.origin + "/folders";
  console.log(url);
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      name,
      parentId,
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

addFolderDialog.addEventListener("submit", async (e) => {
  if (document.activeElement.hasAttribute("formnovalidate")) return;
  e.preventDefault();
  try {
    const response = await sendCreateFolderPostRequest();
    if (response.ok) {
      location.reload();
    } else {
      const json = await response.json();
      showFailedResponseMessage(
        "There's already a folder named '" + json.duplicateName + "'",
      );
    }
  } catch (err) {
    console.error(err);
    console.log("failed");
  }
});
