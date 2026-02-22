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

function getEditor(selector) {
  return document.querySelector(selector);
}

const FIELD_MAPPING_DICTIONARY = {
  newHeadline: {
    selector: 'div[contenteditable="true"][role="textbox"].tiptap.ProseMirror',
  },
  newIndustry: {
    selector: '[data-testid="typeahead-input"]',
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
  console.log("🔍 Requesting background to inject typeahead updater...");

  const selector = input.getAttribute("data-testid")
    ? `[data-testid="${input.getAttribute("data-testid")}"]`
    : input.id
      ? `#${input.id}`
      : '[data-testid="typeahead-input"]';

  console.log("🔍 Using selector:", selector);

  const callbackId = `__linkedIn_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.error("❌ Typeahead timed out - no response from page world");
      resolve(false);
    }, 10000);

    // Listen for result dispatched back from page world
    window.addEventListener(
      callbackId,
      (e) => {
        clearTimeout(timeout);
        const result = e.detail;
        if (result.success) {
          console.log("✅ Typeahead updated:", result.result);
        } else {
          console.error("❌ Typeahead update failed:", result.error);
        }
        resolve(result.success);
      },
      { once: true },
    );

    // ✅ Ask background script to do the executeScript (only background can do this)
    chrome.runtime.sendMessage(
      {
        type: "INJECT_TYPEAHEAD_SCRIPT",
        selector,
        newValue,
        callbackId,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "❌ Background message failed:",
            chrome.runtime.lastError.message,
          );
          clearTimeout(timeout);
          resolve(false);
        } else {
          console.log("📨 Background acknowledged:", response);
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
 * ✅ Async to properly await typeahead completion.
 */
async function updateFieldValue(editor, newValue) {
  try {
    if (!editor) {
      console.error("Editor not found");
      return false;
    }

    if (editor.contentEditable === "true") {
      console.log("🖊️ Contenteditable detected");
      updateTextInElement(editor, newValue);
    } else if (editor.tagName === "INPUT") {
      if (isTypeaheadInput(editor)) {
        console.log("🔍 Typeahead input detected");
        await updateLinkedInTypeahead(editor, newValue); // ✅ properly awaited
      } else {
        console.log("📝 Normal input detected");
        editor.value = newValue;
        editor.dispatchEvent(new Event("input", { bubbles: true }));
        editor.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    highlightElement(editor);
    return true;
  } catch (error) {
    console.error("Error updating field:", error);
  }
  return false;
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
  const profileId = extractProfileId();

  if (!profileId) {
    console.error("Could not extract profile ID from URL");
    return;
  }

  console.log("Detected LinkedIn Profile ID:", profileId);

  if (!isEditIntroPage()) {
    console.log("Not on edit/intro page, navigating...");
    navigateToEditIntro(profileId);
    chrome.storage.local.set({
      linkedInHeadlineUpdate: {
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
    for (const key in FIELD_MAPPING_DICTIONARY) {
      const editor = getEditor(FIELD_MAPPING_DICTIONARY[key].selector);
      if (editor) {
        listOfEditors[key] = editor;
      }
    }

    if (
      Object.keys(listOfEditors).length >=
      Object.keys(FIELD_MAPPING_DICTIONARY).length
    ) {
      clearInterval(waitForEditor);
      const fieldsFound = Object.keys(listOfEditors).join(", ");
      console.log("Editor found, updating fields:", fieldsFound);

      // ✅ Async IIFE — sequentially awaits each field update
      (async () => {
        const results = {}; // ✅ Track each field result individually

        for (const key in listOfEditors) {
          const editor = listOfEditors[key];
          if (key && config[key]) {
            const result = await updateFieldValue(editor, config[key]);
            results[key] = result;
            console.log(
              `Set ${key} = "${config[key]}": ${result ? "✅ Success" : "❌ Failed"}`,
            );
          }
        }

        const allSuccess = Object.values(results).every(Boolean);
        const anySuccess = Object.values(results).some(Boolean);

        if (allSuccess) {
          console.log("✅ All fields successfully updated!");
        } else if (anySuccess) {
          const failed = Object.entries(results)
            .filter(([, v]) => !v)
            .map(([k]) => k);
          console.warn("⚠️ Partial success. Failed fields:", failed.join(", "));
        } else {
          console.error("❌ All fields failed to update");
        }

        // Notify background if at least one field succeeded
        if (anySuccess) {
          chrome.runtime.sendMessage({
            type: "LINKEDIN_HEADLINE_UPDATED",
            profileId,
            newHeadline: config.newHeadline,
            newIndustry: config.newIndustry,
            timestamp: new Date().toISOString(),
          });
        }
      })();
    } else if (attempts >= maxAttempts) {
      clearInterval(waitForEditor);
      console.error("Editor not found after maximum attempts");
    }
  }, checkInterval);
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);

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
      isEditPage: isEditIntroPage(),
    });
  }
});

// On page load, check if we need to apply a pending update after navigation
window.addEventListener("load", () => {
  chrome.storage.local.get("linkedInHeadlineUpdate", (data) => {
    if (data.linkedInHeadlineUpdate) {
      const update = data.linkedInHeadlineUpdate;
      if (Date.now() - update.timestamp < 30000 && isEditIntroPage()) {
        console.log("Applying pending profile update...");
        setTimeout(() => {
          console.log(
            "----> Processing LinkedIn optimization after navigation...",
          );
          processLinkedInOptimization(update);
          chrome.storage.local.remove("linkedInHeadlineUpdate");
        }, 2500);
      }
    }
  });
});

// Notify background that LinkedIn content script is loaded
if (isLinkedInProfilePage()) {
  console.log("LinkedIn profile page detected, content script active");
  chrome.runtime.sendMessage({
    type: "LINKEDIN_PAGE_DETECTED",
    url: window.location.href,
    profileId: extractProfileId(),
  });
}
