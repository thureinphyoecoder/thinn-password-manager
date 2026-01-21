import { shake } from "../../shared/utils/shake.js";
import { isValidUsername, normalizeUsername } from "../account/username.js";

export function initCreateScreen() {
  const el = {
    username: document.getElementById("create-username"),
    password: document.getElementById("create-pw"),
    confirm: document.getElementById("confirm-pw"),
    button: document.getElementById("create-btn"),
    msg: document.getElementById("create-msg"),
    ack: document.getElementById("ack-no-recovery"),
    barWrap: document.querySelector(".password-strength"),
    bar: document.getElementById("password-strength-bar"),
  };

  if (Object.values(el).some((v) => !v)) return;

  /* =========================
     HELPERS
  ========================= */
  function strengthOf(pw) {
    if (!pw) return null;
    if (pw.length < 8) return "weak";
    if (pw.length < 12) return "medium";
    return "strong";
  }

  function showError(msg, target) {
    el.msg.textContent = msg;
    el.msg.classList.add("show");
    if (target) {
      target.classList.add("input-error");
      shake(target);
    }
  }

  function clearError() {
    el.msg.textContent = "";
    el.msg.classList.remove("show");
    [el.username, el.password, el.confirm].forEach((i) => i.classList.remove("input-error"));
  }

  function updateStrengthBar() {
    const pw = el.password.value;
    const s = strengthOf(pw);

    el.bar.className = "";
    if (!pw) {
      el.barWrap.classList.remove("show");
      return;
    }
    el.barWrap.classList.add("show");
    el.bar.classList.add(s);
  }

  /* =========================
     LIVE INPUT
  ========================= */
  el.username.addEventListener("input", clearError);
  el.confirm.addEventListener("input", clearError);
  el.ack.addEventListener("change", clearError);
  el.password.addEventListener("input", () => {
    clearError();
    updateStrengthBar();
  });

  /* =========================
     SUBMIT
  ========================= */
  el.button.addEventListener("click", async () => {
    clearError();

    const rawUsername = el.username.value.trim();
    const password = el.password.value;
    const confirm = el.confirm.value;
    const strength = strengthOf(password);

    // USERNAME
    if (!rawUsername) {
      showError("Username is required.", el.username);
      return;
    }

    if (!isValidUsername(rawUsername)) {
      showError("Username must be 1–20 characters (letters, numbers, _ or -).", el.username);
      return;
    }

    const storedUsername = normalizeUsername(rawUsername);

    if (!/^[a-zA-Z0-9]{1,20}$/.test(storedUsername)) {
      showError("Invalid username.", el.username);
      return;
    }

    // PASSWORD
    if (!password) {
      showError("Password is required.", el.password);
      return;
    }

    if (strength === "weak") {
      showError("Password is too weak.", el.password);
      return;
    }

    if (password !== confirm) {
      showError("Passwords do not match.", el.confirm);
      return;
    }

    if (!el.ack.checked) {
      showError("You must acknowledge there is no password recovery.");
      shake(el.ack.closest(".ack"));
      return;
    }

    try {
      await window.vault.save(password, {
        meta: {
          username: storedUsername,
          createdAt: Date.now(),
        },
        items: [],
      });
    } catch (err) {
      showError(err?.message || "Failed to create account");
    }
  });
}
