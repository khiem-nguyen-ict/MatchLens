document.addEventListener("DOMContentLoaded", () => {
  const profileTextarea = document.getElementById("profile");
  const saveButton = document.getElementById("save");
  const editIntro = document.getElementById("editIntro");
  const editAbout = document.getElementById("editAbout");
  const linkedInSection = document.getElementById("linkedInSection");
  const linkedInMessage = document.getElementById("linkedInMessage");

  var profile = null;

  // Load and display saved profile
  chrome.storage.local.get("profile", (data) => {
    if (data.profile) {
      profileTextarea.value = JSON.stringify(data.profile, null, 2); // pretty-print
      profile = data.profile;
    }
  });

  // Helper: return active LinkedIn tab or hide LinkedIn section and return null
  async function getActiveLinkedInTabOrHide() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab || !tab.url || !tab.url.includes("linkedin.com")) {
      return null;
    }
    return tab;
  }

  // Save button click handler
  saveButton.addEventListener("click", async () => {
    try {
      const profile = JSON.parse(profileTextarea.value);
      await chrome.storage.local.set({ profile });
      showMessage("Your profile has been saved!", "success");
    } catch (err) {
      showMessage("Invalid JSON! Please fix it before saving.", "error");
    }
  });

  /**
   * Check current tab and show LinkedIn section if on LinkedIn profile page
   */
  async function checkLinkedInPage() {
    try {
      const tab = await getActiveLinkedInTabOrHide();
      if (!tab) return;

      // Send message to content script to detect if it's a LinkedIn profile page
      try {
        const response = await chrome.tabs.sendMessage(tab.id, {
          type: "DETECT_LINKEDIN_PAGE",
        });

        if (response && response.isLinkedInProfile) {
          linkedInSection.style.display = "flex";
        } else {
          linkedInSection.style.display = "none";
          showMessage(
            "This extension only works on <a href='https://www.linkedin.com/in/' target='_blank'>LinkedIn Profile</a> page only.",
            "error",
          );
        }
      } catch (error) {
        linkedInSection.style.display = "none";
      }
    } catch (error) {
      linkedInSection.style.display = "none";
    }
  }

  /**
   * Validates that required profile fields are present and non-empty.
   */
  function validateProfileFields(fields) {
    for (const [key, value] of Object.entries(fields)) {
      if (!value || value.trim() === "") {
        showMessage(
          `Please enter a valid value for ${key} in your profile JSON`,
          "error",
        );
        return false;
      }
    }
    return true;
  }

  /**
   * Sends an OPTIMIZE_LINKEDIN_PROFILE message to the active LinkedIn tab.
   * Disables the button during processing and re-enables it after a delay.
   */
  async function optimizeLinkedInProfile(button, page, fields) {
    if (!validateProfileFields(fields)) return;

    const config = {
      page,
      ...Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, v?.trim()]),
      ),
    };

    try {
      const tab = await getActiveLinkedInTabOrHide();
      if (!tab) return;

      button.disabled = true;

      await chrome.tabs.sendMessage(tab.id, {
        type: "OPTIMIZE_LINKEDIN_PROFILE",
        config,
      });

      showMessage("Processing...", "success");

      setTimeout(() => {
        button.disabled = false;
      }, 2000);
    } catch (error) {
      showMessage(
        `Failed to update ${errorContext}. Please try again. Error: ${error.message}`,
        "error",
      );
      button.disabled = false;
    }
  }

  /**
   * Edit Intro
   */
  editIntro.addEventListener("click", async () => {
    await optimizeLinkedInProfile(this, "EDIT_INTRO", {
      headline: profile.headline,
      industry: profile.industry,
      pronouns: profile.pronouns,
    });
  });

  /**
   * Edit About
   */
  editAbout.addEventListener("click", async () => {
    await optimizeLinkedInProfile(this, "EDIT_ABOUT", {
      about: profile.about,
    });
  });

  /**
   * Display message to user
   */
  function showMessage(text, type = "success") {
    linkedInMessage.innerHTML = text;
    linkedInMessage.style.display = "block";
    linkedInMessage.style.color = type === "error" ? "#e74c3c" : "#27ae60";

    // Auto-hide after 3 seconds
    setTimeout(() => {
      linkedInMessage.style.display = "none";
    }, 3000);
  }

  // Check LinkedIn page on popup open
  checkLinkedInPage();

  // Recheck when tab changes (if user switches tabs)
  chrome.tabs.onActivated.addListener(checkLinkedInPage);
});
