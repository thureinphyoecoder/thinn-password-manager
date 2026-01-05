import { toast } from "../../shared/toast.js";

export async function exportVault() {
  try {
    await window.vault.exportVault();
    toast("Vault exported");
  } catch {
    toast("Export failed");
  }
}
