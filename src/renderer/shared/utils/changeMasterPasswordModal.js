export function openChangeMasterPasswordModal({ onSuccess, onError }) {
    const modal = document.createElement("div");
    modal.className = "change-pw-modal confirm-modal";

   modal.innerHTML = `
    <div class="confirm-card">
      <h3>Change Master Password</h3>
      <p>Enter your current password and a new password.</p>
      
      <input type="password" id="current-pw-input" placeholder="Current Password" required>
      <input type="password" id="new-pw-input" placeholder="New Password" required>
      
      <div class="confirm-actions">
        <button class="btn ghost cancel">Cancel</button>
        <button class="btn primary confirm" id="change-pw-confirm">Change</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const currentPwInput = modal.querySelector('#current-pw-input');
  const newPwInput = modal.querySelector('#new-pw-input');
  const confirmBtn = modal.querySelector('#change-pw-confirm');
  const cancelBtn = modal.querySelector('.cancel');
  
  let busy = false;
  
  function close() {
    modal.remove();
  }
  
  cancelBtn.onclick = close;

  confirmBtn.onclick = async () => {
    if (busy) return;
    busy = true;
    
    const oldPassword = currentPwInput.value;
    const newPassword = newPwInput.value;
    
    // ---------- Validation ----------
    if (!oldPassword || !newPassword) {
      alert("Please fill in both fields.");
      // shake(modal.querySelector('.confirm-card'));
      busy = false;
      return;
    }
    if (oldPassword === newPassword) {
      alert("New password must be different from the current password.");
      // shake(newPwInput);
      busy = false;
      return;
    }
    
    // ---------- IPC Call ----------
    try {
      const result = await window.vault.changeMasterPassword(oldPassword, newPassword);
      
      if (result.ok) {
        onSuccess();
        close();
      } else {
        alert("Password change failed: " + result.message); // 💡 Error ပြပါ
        onError(result.message);
        busy = false; // Error ဖြစ်ရင် နောက်တစ်ကြိမ် ထပ်ကြိုးစားခွင့်ပြုပါ
      }

    } catch (err) {
      alert("An unexpected error occurred.");
      onError("Unexpected error.");
      busy = false;
    }
  };
}




