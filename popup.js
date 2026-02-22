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
            "This extension only works on LinkedIn profile pages. Please navigate to a LinkedIn profile to use the optimization features.", "error",
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
   * Edit Intro
   */
  editIntro.addEventListener("click", async () => {
    if (!profile || !profile.headline || profile.headline.trim() === "") {
      showMessage("Please enter a headline in your profile JSON", "error");
      return;
    }
    if (!profile.industry || profile.industry.trim() === "") {
      showMessage("Please enter an industry in your profile JSON", "error");
      return;
    }

    try {
      const tab = await getActiveLinkedInTabOrHide();
      if (!tab) return;

      editIntro.disabled = true;

      // Send optimization message to content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "OPTIMIZE_LINKEDIN_PROFILE",
        config: {
          page: "EDIT_INTRO",
          newHeadline: profile.headline.trim(),
          newIndustry: profile.industry.trim(),
        },
      });

      showMessage("Processing...", "success");

      // Re-enable button after 2 seconds
      setTimeout(() => {
        editIntro.disabled = false;
      }, 2000);
    } catch (error) {
      showMessage(
        `Failed to update intro. Please try again. Error: ${error.message}`,
        "error",
      );
      editIntro.disabled = false;
    }
  });

  /**
   * Edit About
   */
  editAbout.addEventListener("click", async () => {
    if (!profile || !profile.about || profile.about.trim() === "") {
      showMessage("Please enter an about in your profile JSON", "error");
      return;
    }
    try {
      const tab = await getActiveLinkedInTabOrHide();
      if (!tab) return;

      editAbout.disabled = true;

      // Send optimization message to content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "OPTIMIZE_LINKEDIN_PROFILE",
        config: {
          page: "EDIT_ABOUT",
          newAbout: profile.about.trim(),
        },
      });

      showMessage("Processing...", "success");

      // Re-enable button after 2 seconds
      setTimeout(() => {
        editAbout.disabled = false;
      }, 2000);
    } catch (error) {
      showMessage(
        `Failed to update about. Please try again. Error: ${error.message}`,
        "error",
      );
      editAbout.disabled = false;
    }
  });

  /**
   * Display message to user
   */
  function showMessage(text, type = "success") {
    linkedInMessage.textContent = text;
    linkedInMessage.style.display = "block";
    linkedInMessage.style.color = type === "error" ? "#e74c3c" : "#27ae60";

    // Auto-hide after 3 seconds
    setTimeout(() => {
      linkedInMessage.style.display = "none";
    }, 5000);
  }

  // Check LinkedIn page on popup open
  checkLinkedInPage();

  // Recheck when tab changes (if user switches tabs)
  chrome.tabs.onActivated.addListener(checkLinkedInPage);
});
