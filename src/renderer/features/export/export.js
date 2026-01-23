import { openPasswordPrompt } from "../../shared/components/passwordPromptModal.js";
import { toast } from "../../shared/components/toast.js";

export async function exportVaultUI() {
  const filePath = await window.vault.pickExportFile();
  if (!filePath) return;

  openPasswordPrompt({
    title: "Export Vault",
    description: "Set a password to protect this export file.",
    onConfirm: async (exportPassword) => {
      await window.vault.exportVault({
        filePath,
        exportPassword,
      });
      toast("Vault exported");
    },
  });
}
