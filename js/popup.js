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
  const smartApplyButton = document.getElementById("smartApplyJob");
  const loginBtn = document.getElementById("linkedinLogin");
  const thumbnailImage = document.getElementById("thumbnailImage");
  const linkedinLoginSpan = document.getElementById("linkedinLoginSpan");
  const profileInfo = document.getElementById("profileInfo");
  const loginHint = document.getElementById("loginHint");

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
      smartApplyButton.style.display =
        response && response.isJobDetailsPage ? "block" : "none";
    } catch (error) {
      linkedInProfileSection.style.display = "none";
      linkedInJobSection.style.display = "none";
    }
  }

  /**
   * Safely get nested object value using dot-notation path
   * Returns undefined if any part of the path doesn't exist
   *
   * @param {Object} obj - The object to query
   * @param {string} path - Dot-notation path (e.g., "personalInfo.contact.email")
   * @param {*} defaultValue - Optional default value if path not found
   * @returns {*} The value at the path, defaultValue, or undefined
   */
  function getNestedValue(obj, path, defaultValue = undefined) {
    if (!obj || typeof obj !== "object") {
      return defaultValue;
    }

    if (!path || typeof path !== "string") {
      return defaultValue;
    }

    const keys = path.split(".");
    let result = obj;

    for (const key of keys) {
      // If current level is null/undefined, return default
      if (result == null) {
        return defaultValue;
      }

      // If current level doesn't have the key, return default
      if (typeof result !== "object" || !(key in result)) {
        return defaultValue;
      }

      result = result[key];
    }

    // If final result is null/undefined, return default
    return result ?? defaultValue;
  }

  /**
   * Check if a value at a given path is empty or missing
   * Handles strings, arrays, objects, null, undefined safely
   *
   * @param {Object} obj - The object to query
   * @param {string} path - Dot-notation path
   * @returns {boolean} True if value is empty/missing, false otherwise
   */
  function isEmptyValue(obj, path) {
    const value = getNestedValue(obj, path);

    // null or undefined
    if (value == null) {
      return true;
    }

    // Empty string or whitespace-only string
    if (typeof value === "string") {
      return value.trim() === "";
    }

    // Empty array
    if (Array.isArray(value)) {
      return value.length === 0;
    }

    // Empty object (but not Date, RegExp, etc.)
    if (typeof value === "object" && value.constructor === Object) {
      return Object.keys(value).length === 0;
    }

    // Numbers, booleans, dates, etc. are considered "not empty"
    return false;
  }

  /**
   * Sends an OPTIMIZE_LINKEDIN_PROFILE message to the active LinkedIn tab.
   * Disables the button during processing and re-enables it after a delay.
   */
  async function optimizeLinkedInProfile(button, page) {
    var data = {};

    LINKED_IN_FIELD_MAPPING[page].forEach(({ key }) => {
      // Check if value is empty or missing
      if (isEmptyValue(profile, key)) {
        showMessage(
          `Please enter a valid value for ${key} in your profile JSON`,
          "error",
        );
        throw new Error(
          `Missing or empty field: ${key} in profile JSON. Check your input and try again.`,
        );
      }

      // Value exists and is valid - use it
      const value = getNestedValue(profile, key);
      data[key] = value;
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

      let maxWaitingTime = 10000 * LINKED_IN_FIELD_MAPPING[page].length;

      showMessage("Processing…", "success", maxWaitingTime);

      setTimeout(() => {
        button.disabled = false;
      }, maxWaitingTime);
    } catch (error) {
      showMessage(
        `Failed to update. Please try again. Error: ${error.message}`,
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

  smartApplyButton.addEventListener("click", async () => {
    try {
      const tab = await getActiveLinkedInTabOrHide();
      if (!tab) return;
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "SMART_APPLY_JOB",
      });

      chrome.storage.local.set({
        lastJobDescription: {
          ...response,
        },
      });
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
  function updateLoginUI(session) {
    if (session) {
      linkedinLoginSpan.textContent = "Sign Out";
      profileInfo.innerHTML = `<b>${session.user_metadata.given_name + " " + session.user_metadata.family_name}<b/>`;
      profileInfo.style.display = "block";
      thumbnailImage.alt = `Photo of ${session.user_metadata.given_name}`;
      thumbnailImage.src = session.user_metadata.picture;
      thumbnailImage.style.display = "block";
      loginHint.style.display = "none";
    } else {
      linkedinLoginSpan.textContent = "Connect my LinkedIn account";
      thumbnailImage.alt = "";
      thumbnailImage.style.display = "none";
      thumbnailImage.src = "";
      profileInfo.innerHTML = "";
      profileInfo.style.display = "none";
      loginHint.style.display = "block";
    }
    loginBtn.disabled = false;
  }

  // On popup open — source of truth
  chrome.storage.local.get("linkedinSession", (data) => {
    updateLoginUI(data.linkedinSession || null);
  });

  // If popup happens to be open when auth completes
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "LINKEDIN_LOGIN_STATUS") {
      if (message.status === "success") {
        updateLoginUI(message.session);
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
    chrome.storage.local.get("linkedinSession", (data) => {
      if (data.linkedinSession) {
        loginBtn.text = "Signing Out…";
        chrome.storage.local.clear();
        updateLoginUI(null);
      } else {
        loginBtn.text = "Logging In…";
        chrome.runtime.sendMessage({ type: "LINKEDIN_AUTHENTICATE" });
      }
    });
  });
});

// Initialize JSON Editor for profile
document.addEventListener("DOMContentLoaded", function () {
  const hiddenProfile = document.getElementById("profile");

  // Exit early if required elements don't exist
  if (!hiddenProfile) {
    console.warn("Profile textarea not found in popup");
    return;
  }

  // Initialize the JSON editor
  JSONEditor.init("profile-container");

  // Get the actual editor textarea
  const editor = document.getElementById("editor");

  // Sync: JSON editor -> hidden profile textarea
  if (editor) {
    editor.addEventListener("input", function () {
      hiddenProfile.value = editor.value;
    });
  }

  // Sync: hidden profile textarea -> JSON editor (for popup.js compatibility)
  // Override the value setter to sync changes from popup.js
  let _value = hiddenProfile.value;
  Object.defineProperty(hiddenProfile, "value", {
    get: function () {
      return _value;
    },
    set: function (newValue) {
      _value = newValue;
      if (editor) {
        editor.value = newValue;
        JSONEditor.onInput(editor);
      }
    },
  });

  // Toggle profile editor section visibility
  const settingsToggle = document.getElementById("settingsToggle");
  if (settingsToggle) {
    settingsToggle.addEventListener("click", function () {
      const profileSection = document.getElementById("profileEditorSection");
      const linkedInSection = document.getElementById("linkedInSection");
      if (profileSection && linkedInSection) {
        if (profileSection.style.display === "none") {
          profileSection.style.display = "block";
          linkedInSection.style.display = "none";
        } else {
          profileSection.style.display = "none";
          linkedInSection.style.display = "block";
        }
      }
    });
  }
});
