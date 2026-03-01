document.addEventListener("DOMContentLoaded", () => {
  const profileTextarea = document.getElementById("profile");
  const saveSettingsButton = document.getElementById("saveSettings");
  const editIntroButton = document.getElementById("editIntro");
  const editAboutButton = document.getElementById("editAbout");
  const linkedInProfileSection = document.getElementById(
    "linkedInProfileSection",
  );
  const linkedInJobSection = document.getElementById("linkedInJobSection");
  const linkedInMessage = document.getElementById("linkedInMessage");
  const findJobsButton = document.getElementById("findJobs");
  const getJobDescriptionButton = document.getElementById("getJobDescription");
  const loginBtn = document.getElementById("linkedinLogin");
  const thumbnailImage = document.getElementById("thumbnailImage");
  const linkedinLoginSpan = document.getElementById("linkedinLoginSpan");

  var profile = null;
  var lastTimer = null;

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
  saveSettingsButton.addEventListener("click", async () => {
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

      linkedInProfileSection.style.display =
        response && response.isLinkedInProfile ? "flex" : "none";
      linkedInJobSection.style.display =
        response && response.isLinkedDomainPage ? "flex" : "none";
      getJobDescriptionButton.style.display =
        response && response.isJobDetailsPage ? "block" : "none";
    } catch (error) {
      linkedInProfileSection.style.display = "none";
      linkedInJobSection.style.display = "none";
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

      showMessage("Processing…", "success", maxWaitingTime);

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
  editIntroButton.addEventListener("click", async () => {
    await optimizeLinkedInProfile(editIntroButton, LinkedInPageType.EDIT_INTRO);
  });

  /**
   * Edit About
   */
  editAboutButton.addEventListener("click", async () => {
    await optimizeLinkedInProfile(editAboutButton, LinkedInPageType.EDIT_ABOUT);
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

  getJobDescriptionButton.addEventListener("click", async () => {
    try {
      const tab = await getActiveLinkedInTabOrHide();
      if (!tab) return;
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "GET_JOB_DESCRIPTIONS",
      });
      console.log("MatchLens: Job description response:", response);
      alert(JSON.stringify(response, null, 2));
    } catch (error) {
      showMessage(
        `Failed to get job descriptions. Please try again. Error: ${error.message}`,
        "error",
      );
    }
  });

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
    }
  });

  // Check LinkedIn page on popup open
  checkLinkedInPage();

  // Recheck when tab changes (if user switches tabs)
  chrome.tabs.onActivated.addListener(checkLinkedInPage);

  // 1. When popup opens, immediately reflect current login state
  function updateLoginUI(user) {
    if (user) {
      loginBtn.disabled = true;
      linkedinLoginSpan.textContent = user.user_metadata.given_name + " " + user.user_metadata.family_name;
      thumbnailImage.alt = `Photo of ${user.user_metadata.given_name}`;
      thumbnailImage.src = user.user_metadata.picture;
      thumbnailImage.style.display = "block";
    } else {
      loginBtn.disabled = false;
      linkedinLoginSpan.textContent = "Connect my LinkedIn account";
      thumbnailImage.alt = "";
      thumbnailImage.style.display = "none";
      thumbnailImage.src = "";
    }
  }

  // On popup open — source of truth
  chrome.storage.local.get("linkedinUser", (data) => {
    updateLoginUI(data.linkedinUser || null);
  });

  // If popup happens to be open when auth completes
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "LINKEDIN_LOGIN_STATUS") {
      if (message.status === "success") {
        updateLoginUI(message.user);
        showMessage("Login successful!", "success", 3000);
      } else {
        updateLoginUI(null);
        showMessage(
          "Login failed: " + (message.error || "Unknown error"),
          "error",
          3000,
        );
      }
    }
  });

  loginBtn.addEventListener("click", () => {
    loginBtn.disabled = true;
    loginBtn.text = "Logging in…";
    chrome.runtime.sendMessage({ type: "LINKEDIN_AUTHENTICATE" });
  });
});
