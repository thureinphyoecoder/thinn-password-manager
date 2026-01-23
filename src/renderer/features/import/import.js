import { openPasswordPrompt } from "../../shared/components/passwordPromptModal.js";
import { toast } from "../../shared/components/toast.js";

export async function importVaultUI() {
  // 1️⃣ pick file first
  const filePath = await window.vault.pickImportFile();
  if (!filePath) return;

  // 2️⃣ ask password
  openPasswordPrompt({
    title: "Import Vault",
    description: "Enter the password used when this file was exported.",
    onConfirm: async (password) => {
      await window.vault.importVault(filePath, password);
      toast("Vault imported");
    },
  });
}
