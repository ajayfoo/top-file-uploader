const form = document.getElementById("sign-up-form");

const validateInput = (input) => {
  const { showValidationMessage, messages } = inputMap.get(input);
  if (!showValidationMessage) {
    input.classList.remove("invalid");
    return;
  }
  input.classList.add("invalid");
  const { valueMissing, tooLong, tooShort, patternMismatch, customError } =
    input.validity;
  const messageEle = document.querySelector("#" + input.id + "-error>.message");
  if (valueMissing) {
    messageEle.textContent = "Required";
  } else if (tooLong) {
    messageEle.textContent =
      "Must be at most " + input.maxLength + " character(s) long";
  } else if (tooShort) {
    messageEle.textContent =
      "Must be at least " + input.minLength + " character(s) long";
  } else if (patternMismatch) {
    messageEle.textContent = messages.patternMismatch;
  } else if (customError) {
    messageEle.textContent = input.validationMessage;
  } else {
    messageEle.textContent = "Invalid input";
  }
};

const validateConfirmPassword = () => {
  const passwordEle = document.getElementById("password");
  const confirmPasswordEle = document.getElementById("confirm-password");
  if (confirmPasswordEle.value !== passwordEle.value) {
    confirmPasswordEle.setCustomValidity("Passwords must match");
  } else {
    confirmPasswordEle.setCustomValidity("");
  }
};

const inputMap = new Map();
const populateInputMap = () => {
  const usernameEle = document.getElementById("username");
  const passwordEle = document.getElementById("password");
  const confirmPasswordEle = document.getElementById("confirm-password");
  const allInputs = [usernameEle, passwordEle, confirmPasswordEle];
  allInputs.forEach((i) => {
    let edited = false;
    const showValidationMessageObj = { showValidationMessage: false };
    inputMap.set(i, showValidationMessageObj);
    i.addEventListener("input", () => {
      edited = true;
      if (i === confirmPasswordEle) {
        console.log("validating confirm password");
        validateConfirmPassword();
      }
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
  inputMap.get(passwordEle).messages = {
    patternMismatch:
      "Must contain at least one uppercase and lowercase letter, number and special symbol",
  };
  inputMap.get(confirmPasswordEle).messages;
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

const handleShowConfirmPassword = () => {
  const showConfirmPasswordBtn = document.getElementById(
    "show-confirm-password-button",
  );
  const confirmPasswordEle = document.getElementById("confirm-password");
  const img = showConfirmPasswordBtn.querySelector("img");
  let isHidden = true;
  showConfirmPasswordBtn.addEventListener("click", () => {
    if (isHidden) {
      confirmPasswordEle.type = "text";
      img.src = "/images/eye-opened.svg";
    } else {
      confirmPasswordEle.type = "password";
      img.src = "/images/eye-closed.svg";
    }
    isHidden = !isHidden;
  });
};

const usernameIsAvailable = async (username) => {
  const url = location.origin + "/users/" + username;
  const response = await fetch(url, {
    method: "HEAD",
  });
  console.log(response.status);
  return !response.ok;
};

const getNewUsernameAvailabilityIndicator = (forAvailable) => {
  const indicator = document.createElement("img");
  indicator.id = "username-availability-indicator";
  indicator.classList.add("input-helper-icon", "username-availability");
  indicator.style.visibility = "visible";
  if (forAvailable) {
    indicator.src = "/images/tick.svg";
    indicator.alt = "username available";
  } else {
    indicator.src = "/images/close-cross.svg";
    indicator.alt = "username unavailable";
  }
  return indicator;
};

const getNewLoadingImg = () => {
  const img = document.createElement("img");
  img.src = "/images/loading.svg";
  img.classList.add("loading");
  img.alt = "Checking username availability";
  return img;
};

const toggleUsernameAvailabilityIndicator = (parent, state) => {
  const currentImg = parent.querySelector("img");
  currentImg.style.visibility = "visible";
  if (state === "loading") {
    parent.replaceChild(getNewLoadingImg(), currentImg);
  } else if (state === "available") {
    parent.replaceChild(getNewUsernameAvailabilityIndicator(true), currentImg);
  } else if (state === "unavailable") {
    parent.replaceChild(getNewUsernameAvailabilityIndicator(false), currentImg);
  } else if (currentImg !== null) {
    currentImg.style.visibility = "hidden";
  }
};

const checkUsernameAvailability = () => {
  const username = document.getElementById("username");
  let timeoutId = null;
  username.addEventListener("input", () => {
    clearTimeout(timeoutId);
    const { valueMissing, tooLong, tooShort } = username.validity;
    if (valueMissing || tooLong || tooShort) {
      toggleUsernameAvailabilityIndicator(username.parentElement, null);
      return;
    }
    timeoutId = setTimeout(async () => {
      toggleUsernameAvailabilityIndicator(username.parentElement, "loading");
      const isAvailable = await usernameIsAvailable(username.value);
      if (!isAvailable) {
        username.setCustomValidity("Username unavailable");
      } else {
        username.setCustomValidity("");
      }
      toggleUsernameAvailabilityIndicator(
        username.parentElement,
        isAvailable ? "available" : "unavailable",
      );
      inputMap.get(username).showValidationMessage = !isAvailable;
      validateInput(username);
    }, 1000);
  });
};

populateInputMap();
checkUsernameAvailability();
handleShowPassword();
handleShowConfirmPassword();
form.addEventListener("submit", (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    validateAllInputs();
  } else {
    console.log("ready to submit");
  }
});
