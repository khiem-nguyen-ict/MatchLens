// LinkedIn Profile Optimizer
// Detects LinkedIn profile URLs and optimizes profile content

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Update a typeahead/autocomplete input on LinkedIn.
 * Uses script injection to access React internals from the page world,
 * bypassing Chrome extension's isolated world restriction.
 */
async function updateLinkedInTypeahead(selector, newValue) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(false);
    }, 10000);

    // Ask background script to do the executeScript (only background can do this)
    chrome.runtime.sendMessage(
      {
        type: "INJECT_TYPEAHEAD_SCRIPT",
        selector,
        newValue,
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

async function updateSelectValue(select, newValue) {
  if (!select) {
    console.error("Select element not found");
    return false;
  }

  const options = Array.from(select.options);
  const match = options.find(
    (opt) => opt.text.trim().toLowerCase() === newValue.trim().toLowerCase(),
  );

  if (!match) {
    console.error(`No option found with text: "${newValue}"`);
    return false;
  }

  select.value = match.value;

  // Trigger change events so frameworks (React, etc.) detect the update
  select.dispatchEvent(new Event("input", { bubbles: true }));
  select.dispatchEvent(new Event("change", { bubbles: true }));

  return true;
}

/**
 * Helper function to update a field with new text.
 * Supports: contenteditable elements and typeahead/search inputs.
 * Async to properly await typeahead completion.
 */
async function updateFieldValue(selector, editor, newValue) {
  try {
    if (!editor) {
      return false;
    }

    if (editor.contentEditable === "true") {
      updateTextInElement(editor, newValue);
    } else {
      switch (editor.tagName) {
        case "INPUT":
          if (isTypeaheadInput(editor)) {
            await updateLinkedInTypeahead(selector, newValue);
          } else {
            editor.value = newValue;
            editor.dispatchEvent(new Event("input", { bubbles: true }));
            editor.dispatchEvent(new Event("change", { bubbles: true }));
          }
          break;
        case "TEXTAREA":
          editor.value = newValue;
          editor.dispatchEvent(new Event("input", { bubbles: true }));
          editor.dispatchEvent(new Event("change", { bubbles: true }));
          break;
        case "SELECT":
          await updateSelectValue(editor, newValue);
          break;
      }
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
function processLinkedInOptimization(config, isDirectUpdate = true) {
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
    var expectedFieldsCount = LINKED_IN_FIELD_MAPPING[config.page].length;

    for (const field of LINKED_IN_FIELD_MAPPING[config.page]) {
      const editor = getEditor(field.selector);
      if (editor) {
        listOfEditors[field.key] = editor;
      }
    }

    console.log(`Update ${Object.keys(listOfEditors).join(", ")}`);

    if (Object.keys(listOfEditors).length >= expectedFieldsCount) {
      clearInterval(waitForEditor);

      // Async IIFE — sequentially awaits each field update
      (async () => {
        const results = {};

        for (const key in listOfEditors) {
          const editor = listOfEditors[key];
          if (key && config[key]) {
            const result = await updateFieldValue(
              LINKED_IN_FIELD_MAPPING[config.page].find(f => f.key === key)?.selector,
              //FIELD_MAPPING_DICTIONARY[key].selector,
              editor,
              config[key]
            );
            results[key] = result;
          } else {
            console.warn(
              `Uppdate Field: ${isDirectUpdate ? "Direct" : "Post-navigation"}: No value for key: ${key}.`,
            );
            results[key] = false;
          }
        }
      })();
    } else if (attempts >= maxAttempts) {
      clearInterval(waitForEditor);
    }
  }, checkInterval);
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "OPTIMIZE_LINKEDIN_PROFILE":
      processLinkedInOptimization(message.config, true);
      sendResponse({ status: "Processing optimization" });
      break;
    case "GET_PROFILE_ID":
      const profileId = extractProfileId();
      sendResponse({ profileId, isProfilePage: isLinkedInProfilePage() });
      break;
    case "DETECT_LINKEDIN_PAGE":
      sendResponse({
        isLinkedInProfile: isLinkedInProfilePage(),
        profileId: extractProfileId(),
      });
      break;
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
          processLinkedInOptimization(update, false);
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
