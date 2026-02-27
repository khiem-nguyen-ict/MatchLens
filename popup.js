document.addEventListener("DOMContentLoaded", () => {
  const profileTextarea = document.getElementById("profile");
  const saveButton = document.getElementById("save");
  const editIntro = document.getElementById("editIntro");
  const editAbout = document.getElementById("editAbout");
  const linkedInSection = document.getElementById("linkedInSection");
  const linkedInUtils = document.getElementById("linkedInUtils");
  const linkedInMessage = document.getElementById("linkedInMessage");
  const findJobsButton = document.getElementById("findJobs");

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
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "DETECT_LINKEDIN_PAGE",
      });

      linkedInSection.style.display =
        response && response.isLinkedInProfile ? "flex" : "none";
      linkedInUtils.style.display =
        response && response.isLinkedDomainPage ? "flex" : "none";
    } catch (error) {
      linkedInSection.style.display = "none";
      linkedInUtils.style.display = "none";
    }
  }

  /**
   * Sends an OPTIMIZE_LINKEDIN_PROFILE message to the active LinkedIn tab.
   * Disables the button during processing and re-enables it after a delay.
   */
  async function optimizeLinkedInProfile(button, page) {
    var data = {};
    LINKED_IN_FIELD_MAPPING[page].forEach(({ key }) => {
      if (!profile[key] || profile[key].trim() === "") {
        showMessage(
          `Please enter a valid value for ${key} in your profile JSON`,
          "error",
        );
        throw new Error(
          `Missing or empty field: ${key} in profile JSON. Check your input and try again.`,
        );
      } else {
        data[key] = profile[key].trim();
      }
    });

    const config = {
      page,
      buttonId: button.id,
      ...data,
    };

    try {
      const tab = await getActiveLinkedInTabOrHide();
      if (!tab) return;

      button.disabled = true;

      await chrome.tabs.sendMessage(tab.id, {
        type: "OPTIMIZE_LINKEDIN_PROFILE",
        config,
      });

      let maxWaitingTime = 10000 * LINKED_IN_FIELD_MAPPING[page].length; // Max waiting time based on number of fields

      showMessage("Processing...", "success", maxWaitingTime);

      setTimeout(() => {
        button.disabled = false;
      }, maxWaitingTime);
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
    await optimizeLinkedInProfile(editIntro, LinkedInPageType.EDIT_INTRO);
  });

  /**
   * Edit About
   */
  editAbout.addEventListener("click", async () => {
    await optimizeLinkedInProfile(editAbout, LinkedInPageType.EDIT_ABOUT);
  });

  findJobsButton.addEventListener("click", async () => {
    try {
      const tab = await getActiveLinkedInTabOrHide();
      if (!tab) return;
      await chrome.tabs.sendMessage(tab.id, {
        type: "OPEN_LINKEDIN_JOB_SEARCH",
      });
    } catch (error) {
      showMessage(
        `Failed to open LinkedIn job search. Please try again. Error: ${error.message}`,
        "error",
      );
    }
  });

  var lastTimer = null;

  /**
   * Display message to user
   */
  function showMessage(text, type = "success", timeout = 3000) {
    // Auto-hide after 3 seconds
    if (lastTimer) {
      clearTimeout(lastTimer);
      lastTimer = null;
    }

    linkedInMessage.innerHTML = text;
    linkedInMessage.style.display = "block";
    linkedInMessage.style.color = type === "error" ? "#e74c3c" : "#27ae60";

    lastTimer = setTimeout(() => {
      linkedInMessage.style.display = "none";
      lastTimer = null;
    }, timeout);
  }

  // Listen for progress status messages from background/content scripts
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case "PROGRESS_STATUS":
        if (message.status) {
          showMessage(
            message.status,
            message.isError ? "error" : "success",
            message.timeout || 3000,
          );
        }
        if (message.buttonId && message.isDone) {
          const button = document.getElementById(message.buttonId);
          if (button) {
            button.disabled = false;
          }
        }
        sendResponse && sendResponse({ received: true });
        break;
      // ...existing message types can be added here...
    }
  });

  // Check LinkedIn page on popup open
  checkLinkedInPage();

  // Recheck when tab changes (if user switches tabs)
  chrome.tabs.onActivated.addListener(checkLinkedInPage);
});
