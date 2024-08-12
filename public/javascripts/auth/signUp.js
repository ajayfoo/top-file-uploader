const form = document.getElementById("sign-up-form");
const allInputs = Array.from(form).filter((ele) => ele.tagName !== "BUTTON");

const validateInput = (input) => {
  const { showValidationMessage } = inputMap.get(input);
  if (!showValidationMessage) {
    input.classList.remove("invalid");
    return;
  }
  input.classList.add("invalid");
  const { valueMissing, tooShort } = input.validity;
  const messageEle = input.parentElement.querySelector(".error>.message");
  if (valueMissing) {
    messageEle.textContent = "Required";
  } else if (tooShort) {
    messageEle.textContent =
      "Must be at least " + input.minLength + " character(s) long";
  } else {
    messageEle.textContent = "Invalid input";
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

const validateAllInputs = () => {
  for (const [input, value] of inputMap.entries()) {
    value.showValidationMessage = !input.checkValidity();
    validateInput(input);
  }
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    validateAllInputs();
  }
});
