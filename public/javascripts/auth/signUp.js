const form = document.getElementById("sign-up-form");
const allInputs = Array.from(form).filter((ele) => ele.tagName !== "BUTTON");

const validateInput = (input) => {
  const { showValidationMessage } = inputMap.get(input);
  const errorEle = input.parentElement.querySelector(".error");
  if (showValidationMessage) {
    errorEle.style.visibility = "visible";
  } else {
    errorEle.style.visibility = "hidden";
  }
};

const inputMap = new Map();
allInputs.forEach((i) => {
  let edited = false;
  const showValidationMessageObj = { showValidationMessage: false };
  inputMap.set(i, showValidationMessageObj);
  i.addEventListener("input", () => {
    edited = true;
    if (i.checkValidity()) {
      showValidationMessageObj.showValidationMessage = false;
    }
    validateInput(i);
  });
  i.addEventListener("blur", () => {
    if (!edited || i.checkValidity()) return;
    showValidationMessageObj.showValidationMessage = true;
    validateInput(i);
  });
});

const showValidationMessages = () => {
  for (const input of inputMap.keys()) {
    if (input.checkValidity()) return;
    const errorEle = input.parentElement.querySelector(".error");
    errorEle.style.visibility = "visible";
  }
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    showValidationMessages();
  }
});
