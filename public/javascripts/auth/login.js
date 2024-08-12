const form = document.getElementById("sign-up-form");

const validateInput = (input) => {
  const { showValidationMessage } = inputMap.get(input);
  if (!showValidationMessage) {
    input.classList.remove("invalid");
    return;
  }
  input.classList.add("invalid");
  const { valueMissing } = input.validity;
  const messageEle = document.querySelector("#" + input.id + "-error>.message");
  if (valueMissing) {
    messageEle.textContent = "Required";
  } else {
    messageEle.textContent = "Invalid input";
  }
};

const inputMap = new Map();
const populateInputMap = () => {
  const usernameEle = document.getElementById("username");
  const passwordEle = document.getElementById("password");
  const allInputs = [usernameEle, passwordEle];
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
};

const validateAllInputs = () => {
  for (const [input, value] of inputMap.entries()) {
    value.showValidationMessage = !input.checkValidity();
    validateInput(input);
  }
};

const handleShowPassword = () => {
  const showPasswordBtn = document.getElementById("show-password-button");
  const passwordEle = document.getElementById("password");
  const img = showPasswordBtn.querySelector("img");
  let isHidden = true;
  showPasswordBtn.addEventListener("click", () => {
    if (isHidden) {
      passwordEle.type = "text";
      img.src = "/images/eye-opened.svg";
    } else {
      passwordEle.type = "password";
      img.src = "/images/eye-closed.svg";
    }
    isHidden = !isHidden;
  });
};

populateInputMap();
handleShowPassword();
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    validateAllInputs();
  } else {
    console.log("ready to submit");
  }
});
