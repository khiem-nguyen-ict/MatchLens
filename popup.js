document.addEventListener("DOMContentLoaded", () => {
  const profileTextarea = document.getElementById("profile");
  const saveButton = document.getElementById("save");
  const updateLinkedInProfile = document.getElementById(
    "updateLinkedInProfile",
  );
  const linkedInMessage = document.getElementById("linkedInMessage");
  const profileIdDisplay = document.getElementById("profileIdDisplay");

  var profile = null;

  // Load and display saved profile
  chrome.storage.local.get("profile", (data) => {
    if (data.profile) {
      profileTextarea.value = JSON.stringify(data.profile, null, 2); // pretty-print
      profile = data.profile;
    }
  });

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
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab.url.includes("linkedin.com")) {
        updateLinkedInProfile.style.display = "none";
        return;
      }

      // Send message to content script to detect if it's a LinkedIn profile page
      try {
        const response = await chrome.tabs.sendMessage(tab.id, {
          type: "DETECT_LINKEDIN_PAGE",
        });

        if (response && response.isLinkedInProfile) {
          updateLinkedInProfile.style.display = "block";
          profileIdDisplay.textContent = response.profileId || "Unknown";
        } else {
          updateLinkedInProfile.style.display = "none";
          showMessage("This extension only works on LinkedIn profile pages. Please navigate to a LinkedIn profile to use the optimization features.");
        }
      } catch (error) {
        updateLinkedInProfile.style.display = "none";
      }
    } catch (error) {
      updateLinkedInProfile.style.display = "none";
    }
  }

  /**
   * Optimize LinkedIn Profile
   */
  updateLinkedInProfile.addEventListener("click", async () => {
    if (!profile || !profile.headline || profile.headline.trim() === "") {
      showMessage("Please enter a headline in your profile JSON", "error");
      return;
    }
    if (!profile.industry || profile.industry.trim() === "") {
      showMessage("Please enter an industry in your profile JSON", "error");
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab.url.includes("linkedin.com")) {
        showMessage("Not on a LinkedIn profile page", "error");
        return;
      }

      updateLinkedInProfile.disabled = true;

      // Send optimization message to content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "OPTIMIZE_LINKEDIN_PROFILE",
        config: {
          newHeadline: profile.headline.trim(),
          newIndustry: profile.industry.trim(),
        },
      });

      showMessage("Processing...", "success");

      // Re-enable button after 2 seconds
      setTimeout(() => {
        updateLinkedInProfile.disabled = false;
      }, 2000);
    } catch (error) {
      showMessage("Failed to update profile. Please try again.", "error");
      updateLinkedInProfile.disabled = false;
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
