document.addEventListener("DOMContentLoaded", () => {
  const profileTextarea = document.getElementById("profile");
  const saveButton = document.getElementById("save");
  const linkedInSection = document.getElementById("linkedInSection");
  const updateLinkedInProfile = document.getElementById("updateLinkedInProfile");
  const linkedInMessage = document.getElementById("linkedInMessage");
  const profileIdDisplay = document.getElementById("profileIdDisplay");
  const headlineInput = document.getElementById("headlineInput");

  // Load and display saved profile
  chrome.storage.local.get("profile", (data) => {
    if (data.profile) {
      profileTextarea.value = JSON.stringify(data.profile, null, 2); // pretty-print
    }
  });

  // Save button click handler
  saveButton.addEventListener("click", async () => {
    try {
      const profile = JSON.parse(profileTextarea.value);
      await chrome.storage.local.set({ profile });
      alert("Your profile has been saved!");
    } catch (err) {
      alert("Invalid JSON! Please fix it before saving.");
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
        linkedInSection.style.display = "none";
        return;
      }

      // Send message to content script to detect if it's a LinkedIn profile page
      try {
        const response = await chrome.tabs.sendMessage(tab.id, {
          type: "DETECT_LINKEDIN_PAGE",
        });

        // Load saved profile info if available
        chrome.storage.local.get("profile", (data) => {
            console.log("Loaded profile from storage:", data.profile);
          if (data.profile && data.profile.headline) {
            headlineInput.value = data.profile.headline;
          }
        });

        if (response && response.isLinkedInProfile) {
          linkedInSection.style.display = "block";
          profileIdDisplay.textContent = response.profileId || "Unknown";
        } else {
          linkedInSection.style.display = "none";
        }
      } catch (error) {
        console.log("Content script not ready or page not a LinkedIn profile");
        linkedInSection.style.display = "none";
      }
    } catch (error) {
      console.error("Error checking LinkedIn page:", error);
      linkedInSection.style.display = "none";
    }
  }

  /**
   * Optimize LinkedIn Profile
   */
  updateLinkedInProfile.addEventListener("click", async () => {
    const newHeadline = headlineInput.value.trim();

    if (!newHeadline) {
      showMessage("Please enter a headline", "error");
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab.url.includes("linkedin.com")) {
        showMessage("Not on LinkedIn", "error");
        return;
      }

      updateLinkedInProfile.disabled = true;

      // Send optimization message to content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "OPTIMIZE_LINKEDIN_PROFILE",
        config: {
          newHeadline,
        },
      });

      showMessage("Processing...", "success");

      // Re-enable button after 2 seconds
      setTimeout(() => {
        updateLinkedInProfile.disabled = false;
      }, 2000);
    } catch (error) {
      console.error("Error updating headline:", error);
      showMessage("Failed to update headline. Please try again.", "error");
      updateLinkedInProfile.disabled = false;
    }
  });

  /**
   * Display message to user
   */
  function showMessage(text, type) {
    linkedInMessage.textContent = text;
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
