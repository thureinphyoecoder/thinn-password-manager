import { openConfirm } from "../../shared/confirm.js";

export function importVault() {
  openConfirm({
    title: "Import vault",
    message: "This will overwrite your current vault.",
    onConfirm: async ({ showSuccess }) => {
      const password = prompt("Enter vault password");
      if (!password) return;

      await window.vault.importVault(password);

      showSuccess("Imported");

      setTimeout(() => {
        location.reload();
      }, 950);
    },
  });
}
