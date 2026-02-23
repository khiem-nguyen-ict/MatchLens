// LinkedIn Profile Optimizer
// Detects LinkedIn profile URLs and optimizes profile content

const LinkedInPageType = {
  PROFILE: "PROFILE",
  EDIT_INTRO: "EDIT_INTRO",
  EDIT_ABOUT: "EDIT_ABOUT",
  OTHER: "OTHER",
};

/**
 * Extract profile ID from LinkedIn URL
 * Handles: https://www.linkedin.com/in/khiem-nguyen-ict/ -> khiem-nguyen-ict
 */
function extractProfileId() {
  const urlMatch = window.location.href.match(/linkedin\.com\/in\/([^/?]+)/);
  return urlMatch ? urlMatch[1] : null;
}

/**
 * Check if current page is a LinkedIn profile page
 */
function isLinkedInProfilePage() {
  return /linkedin\.com\/in\//.test(window.location.href);
}

function isEditAboutPage() {
  return /linkedin\.com\/in\/.*\/edit\/forms\/summary\/new/.test(
    window.location.href,
  );
}

/**
 * Check if we're on the edit/intro page
 */
function isEditIntroPage() {
  return /linkedin\.com\/in\/.*\/edit\/intro/.test(window.location.href);
}

/**
 * Navigate to the edit/intro page for a given profile ID
 */
function navigateToEditIntro(profileId) {
  const editIntroUrl = `https://www.linkedin.com/in/${profileId}/edit/intro/`;
  window.location.href = editIntroUrl;
}

function navigateToEditAbout(profileId) {
  const editIntroUrl = `https://www.linkedin.com/in/${profileId}/edit/forms/summary/new/`;
  window.location.href = editIntroUrl;
}

function getEditor(selector) {
  return document.querySelector(selector);
}

const FIELD_MAPPING_DICTIONARY = {
  headline: {
    page: LinkedInPageType.EDIT_INTRO,
    selector: 'div[contenteditable="true"][role="textbox"].tiptap.ProseMirror',
  },
  industry: {
    page: LinkedInPageType.EDIT_INTRO,
    selector: '[data-testid="typeahead-input"]',
  },
  newAbout: {
    page: LinkedInPageType.EDIT_ABOUT,
    selector:
      'textarea[data-view-name="form-add-summary-with-gai-multi-line-text-input"]',
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Update a typeahead/autocomplete input on LinkedIn.
 * Uses script injection to access React internals from the page world,
 * bypassing Chrome extension's isolated world restriction.
 */
async function updateLinkedInTypeahead(input, newValue) {
  const selector = input.getAttribute("data-testid")
    ? `[data-testid="${input.getAttribute("data-testid")}"]`
    : input.id
      ? `#${input.id}`
      : '[data-testid="typeahead-input"]';

  const callbackId = `__linkedIn_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(false);
    }, 10000);

    // Listen for result dispatched back from page world
    window.addEventListener(
      callbackId,
      (e) => {
        clearTimeout(timeout);
        const result = e.detail;
        resolve(result.success);
      },
      { once: true },
    );

    // Ask background script to do the executeScript (only background can do this)
    chrome.runtime.sendMessage(
      {
        type: "INJECT_TYPEAHEAD_SCRIPT",
        selector,
        newValue,
        callbackId,
      },
      (_response) => {
        if (chrome.runtime.lastError) {
          clearTimeout(timeout);
          resolve(false);
        }
      },
    );
  });
}

function isTypeaheadInput(input) {
  // Check 1: aria attributes (most reliable)
  if (input.getAttribute("aria-autocomplete") === "list") return true;
  if (input.getAttribute("role") === "combobox") return true;
  if (input.hasAttribute("aria-haspopup")) return true;

  // Check 2: data-testid contains typeahead
  const testId = input.getAttribute("data-testid") || "";
  if (testId.toLowerCase().includes("typeahead")) return true;

  // Check 3: parent has data-expanded (LinkedIn typeahead wrapper)
  const parent = input.closest("[data-expanded]");
  if (parent) return true;

  // Check 4: nearby listbox in parent
  const container = input.parentElement;
  if (container) {
    const hasListbox =
      container.querySelector('[role="listbox"]') ||
      document.querySelector('[role="listbox"]');
    if (hasListbox) return true;
  }

  // Check 5: React props reveal it's a typeahead
  const reactPropsKey = Object.keys(input).find((k) =>
    k.startsWith("__reactProps"),
  );
  if (reactPropsKey) {
    const props = input[reactPropsKey];
    if (props["aria-autocomplete"] === "list") return true;
    if (props.role === "combobox") return true;
  }

  return false;
}

/**
 * Helper function to update a field with new text.
 * Supports: contenteditable elements and typeahead/search inputs.
 * Async to properly await typeahead completion.
 */
async function updateFieldValue(editor, newValue) {
  try {
    if (!editor) {
      return false;
    }

    if (editor.contentEditable === "true") {
      updateTextInElement(editor, newValue);
    } else if (editor.tagName === "INPUT") {
      if (isTypeaheadInput(editor)) {
        await updateLinkedInTypeahead(editor, newValue);
      } else {
        editor.value = newValue;
        editor.dispatchEvent(new Event("input", { bubbles: true }));
        editor.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } else if (editor.tagName === "TEXTAREA") {
      console.warn(
        "⚠️ Detected textarea - using direct value update which may not trigger React updates. Selector:",
        editor,
      );
      editor.value = newValue;
      editor.dispatchEvent(new Event("input", { bubbles: true }));
      editor.dispatchEvent(new Event("change", { bubbles: true }));
    }

    highlightElement(editor);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Update text in a contenteditable element and trigger change events.
 */
function updateTextInElement(element, newText) {
  element.innerHTML = "";

  const paragraph = document.createElement("p");
  paragraph.textContent = newText;
  element.appendChild(paragraph);

  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.dispatchEvent(new Event("blur", { bubbles: true }));
}

/**
 * Main function to process LinkedIn profile optimization.
 * ✅ Uses async IIFE inside setInterval to properly await field updates.
 */
function processLinkedInOptimization(config) {
  const profileId = extractProfileId() || config.profileId;

  if (!profileId) {
    return;
  }
  if (
    (config.page === LinkedInPageType.EDIT_INTRO && !isEditIntroPage()) ||
    (config.page === LinkedInPageType.EDIT_ABOUT && !isEditAboutPage())
  ) {
    if (config.page === LinkedInPageType.EDIT_INTRO) {
      navigateToEditIntro(profileId);
    } else if (config.page === LinkedInPageType.EDIT_ABOUT) {
      navigateToEditAbout(profileId);
    } else {
      return;
    }

    chrome.storage.local.set({
      linkedInDataUpdate: {
        page: config.page,
        profileId,
        ...config,
        timestamp: Date.now(),
      },
    });
    return;
  }

  let attempts = 0;
  const maxAttempts = 10;
  const checkInterval = 1000;

  const waitForEditor = setInterval(() => {
    attempts++;

    const listOfEditors = {};
    var expectedFieldsCount = Object.keys(FIELD_MAPPING_DICTIONARY).filter(
      (key) => FIELD_MAPPING_DICTIONARY[key].page === config.page,
    ).length;

    for (const key in FIELD_MAPPING_DICTIONARY) {
      if (FIELD_MAPPING_DICTIONARY[key].page !== config.page) {
        continue; // skip fields not relevant to the current page
      }
      const editor = getEditor(FIELD_MAPPING_DICTIONARY[key].selector);
      if (editor) {
        listOfEditors[key] = editor;
      }
    }

    if (Object.keys(listOfEditors).length >= expectedFieldsCount) {
      clearInterval(waitForEditor);

      // Async IIFE — sequentially awaits each field update
      (async () => {
        const results = {};

        for (const key in listOfEditors) {
          const editor = listOfEditors[key];
          if (key && config[key]) {
            const result = await updateFieldValue(editor, config[key]);
            results[key] = result;
          }
        }

        const anySuccess = Object.values(results).some(Boolean);

        // Notify background if at least one field succeeded
        if (anySuccess) {
          chrome.runtime.sendMessage({
            type: "LINKEDIN_HEADLINE_UPDATED",
            profileId,
            headline: config.headline,
            industry: config.industry,
            timestamp: new Date().toISOString(),
          });
        }
      })();
    } else if (attempts >= maxAttempts) {
      clearInterval(waitForEditor);
    }
  }, checkInterval);
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPTIMIZE_LINKEDIN_PROFILE") {
    processLinkedInOptimization(message.config);
    sendResponse({ status: "Processing optimization" });
  }

  if (message.type === "GET_PROFILE_ID") {
    const profileId = extractProfileId();
    sendResponse({ profileId, isProfilePage: isLinkedInProfilePage() });
  }

  if (message.type === "DETECT_LINKEDIN_PAGE") {
    sendResponse({
      isLinkedInProfile: isLinkedInProfilePage(),
      profileId: extractProfileId(),
    });
  }
});

// On page load, check if we need to apply a pending update after navigation
window.addEventListener("load", () => {
  chrome.storage.local.get("linkedInDataUpdate", (data) => {
    if (data.linkedInDataUpdate) {
      const update = data.linkedInDataUpdate;
      if (
        (Date.now() - update.timestamp < 30000 &&
          isEditIntroPage() &&
          update.page === LinkedInPageType.EDIT_INTRO) ||
        (isEditAboutPage() && update.page === LinkedInPageType.EDIT_ABOUT)
      ) {
        setTimeout(() => {
          processLinkedInOptimization(update);
          chrome.storage.local.remove("linkedInDataUpdate");
        }, 2500);
      }
    }
  });
});

// Notify background that LinkedIn content script is loaded
if (isLinkedInProfilePage()) {
  chrome.runtime.sendMessage({
    type: "LINKEDIN_PAGE_DETECTED",
    url: window.location.href,
    profileId: extractProfileId(),
  });
}
