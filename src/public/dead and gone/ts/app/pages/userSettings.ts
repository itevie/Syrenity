import { PageCallback, showPage } from "../pageManager.js";
import general from '../../general_new.js';
import { client } from "../app.js";
import { updateUI } from "../basicUI.js";

export default async function showUserSettingsPage() {
  const page = await showPage("user_settings");
  general.dataDivs.registerGroup("user_settings");

  // Register change pfp button
  page.elements["change-pfp"].onclick = async () => {
    // Show the modal
    general.modals.showModal("change_pfp", {
      handleIDs: keys => {
        keys["change"].onclick = async () => {
          const avatar = keys["avatar"] as HTMLImageElement;

          // Check if there was any image
          if (!avatar.src) {
            return general.alerts.error(`Please select an image!`, "Oops");
          }

          try {
            // Update
            await client.currentUser.updateAvatar(avatar.src.split(",")[1]);
          } catch (err) {
            return general.alerts.error(`Failed to change your avatar! (${err.toString()})`, "Oops");
          }
        }
      }
    });
  }

  // Register the accent color button
  page.elements["accent-color"].onclick = () => {
    const input = document.createElement("input")
    input.setAttribute("type", "color");
    input.click();
    input.onchange = e => {
      localStorage.setItem("accent-color", input.value);
      document.body.style.setProperty("--color-accent-0", input.value);
      updateUI2(page);
      updateUI();
    }
  }

  updateUI2(page);
}

function updateUI2(page: PageCallback) {
  // Set the appearance color
  page.elements["current-accent-color"].style.backgroundColor = 
    getComputedStyle(document.body).getPropertyValue("--color-accent-0");
}