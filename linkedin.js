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

/**
 * Helper function to update a field with new text
 * Supports: contenteditable elements and typeahead/search inputs
 */
function updateFieldValue(editor, newValue) {
  try {
    if (!editor) {
      console.error("Editor not found");
      return false;
    }

    // Handle contenteditable elements (like headline)
    if (editor.contentEditable === "true") {
      updateTextInElement(editor, newValue);
    }
    // Handle input fields (like typeahead/search inputs)
    else if (editor.tagName === "INPUT") {
      // Clear the field
      editor.value = "";
      editor.dispatchEvent(new Event("input", { bubbles: true }));

      // Simulate typing character by character to trigger autocomplete
      let charIndex = 0;
      const typeNextChar = () => {
        if (charIndex < newValue.length) {
          editor.value = newValue.substring(0, charIndex + 1);
          editor.dispatchEvent(new Event("input", { bubbles: true }));
          charIndex++;
          setTimeout(typeNextChar, 50); // 50ms delay between characters
        } else {
          // Typing complete, wait for dropdown to appear and select the matching option
          setTimeout(() => {
            selectTypeaheadOption(editor, newValue);
          }, 300); // Wait for dropdown to render
        }
      };
      typeNextChar();
    }

    highlightElement(editor);
    return true;
  } catch (error) {
    console.error("Error updating field:", error);
  }
  return false;
}

/**
 * Helper function to select an option from a typeahead dropdown
 */
function selectTypeaheadOption(inputElement, optionText) {
  try {
    // Find the dropdown container - usually a sibling or near the input
    const container =
      inputElement.closest(
        '[role="combobox"], .typeahead-container, [data-testid*="typeahead"]',
      )?.parentElement ||
      inputElement.parentElement?.parentElement?.parentElement;

    if (!container) {
      console.warn("Could not find typeahead dropdown container");
      return false;
    }

    // Look for dropdown options - try multiple selectors
    const dropdownOptions = container.querySelectorAll(
      '[role="option"], [data-testid*="option"], li, [class*="option"]',
    );

    if (dropdownOptions.length === 0) {
      console.warn("No dropdown options found");
      // Still dispatch events even if we can't find dropdown
      inputElement.dispatchEvent(new Event("change", { bubbles: true }));
      inputElement.dispatchEvent(new Event("blur", { bubbles: true }));
      return false;
    }

    // Find the option that matches the text we're looking for
    for (let option of dropdownOptions) {
      const optionContent = option.textContent.toLowerCase().trim();
      if (optionContent.includes(optionText.toLowerCase())) {
        console.log("Found matching dropdown option:", optionContent);
        option.click();

        // Dispatch events after clicking
        setTimeout(() => {
          inputElement.dispatchEvent(new Event("change", { bubbles: true }));
          inputElement.dispatchEvent(new Event("blur", { bubbles: true }));
        }, 100);
        return true;
      }
    }

    console.warn("No matching option found in dropdown for:", optionText);
    // Dispatch events anyway
    inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    inputElement.dispatchEvent(new Event("blur", { bubbles: true }));
    return false;
  } catch (error) {
    console.error("Error selecting typeahead option:", error);
    return false;
  }
}

/**
 * Helper function to update text in a contenteditable element
 * Preserves the expected format and triggers change events
 */
function updateTextInElement(element, newText) {
  // Clear existing content
  element.innerHTML = "";

  // Create a new paragraph with the text
  const paragraph = document.createElement("p");
  paragraph.textContent = newText;
  element.appendChild(paragraph);

  // Trigger input and change events for LinkedIn to detect the change
  const inputEvent = new Event("input", { bubbles: true });
  const changeEvent = new Event("change", { bubbles: true });
  const blurEvent = new Event("blur", { bubbles: true });

  element.dispatchEvent(inputEvent);
  element.dispatchEvent(changeEvent);
  element.dispatchEvent(blurEvent);
}

/**
 * Main function to process LinkedIn profile optimization
 */
function processLinkedInOptimization(config) {
  const profileId = extractProfileId();

  if (!profileId) {
    console.error("Could not extract profile ID from URL");
    return;
  }

  console.log("Detected LinkedIn Profile ID:", profileId);

  // Check if we need to navigate to edit page
  if (!isEditIntroPage()) {
    console.log("Not on edit/intro page, navigating...");
    navigateToEditIntro(profileId);
    // Store the config to apply after navigation
    chrome.storage.local.set({
      linkedInHeadlineUpdate: {
        profileId,
        newHeadline: config.newHeadline,
        timestamp: Date.now(),
      },
    });
    return;
  }

  // We're on the edit/intro page, wait for the editor to load
  let attempts = 0;
  const maxAttempts = 10;
  const checkInterval = 500; // ms

  const waitForEditor = setInterval(() => {
    attempts++;

    const listOfEditors = {};
    for (const key in FIELD_MAPPING_DICTIONARY) {
      const editor = getEditor(FIELD_MAPPING_DICTIONARY[key].selector);
      if (editor) {
        listOfEditors[key] = editor;
      }
    }

    if (Object.keys(listOfEditors).length > 0) {
      clearInterval(waitForEditor);
      let fieldsFound = Object.keys(listOfEditors).join(", ");
      console.log("Editor found, updating fields:", fieldsFound);
      let success = false;
      for (const key in listOfEditors) {
        const editor = listOfEditors[key];
        if (key && config[key]) {
          let result = updateFieldValue(editor, config[key]);
          success = result || success;
          console.log(
            `Updated ${key} field with value: ${config[key]} and the result was ${result}`,
          );
        }
      }

      if (success) {
        console.log("Headline and industry successfully updated!");
        // Notify background script of success
        chrome.runtime.sendMessage({
          type: "LINKEDIN_HEADLINE_UPDATED",
          profileId,
          newHeadline: config.newHeadline,
          newIndustry: config.newIndustry,
          timestamp: new Date().toISOString(),
        });
      } else {
        console.error("Failed to update fields:", fieldsFound);
      }
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

// On page load, check if we need to apply a pending headline update
window.addEventListener("load", () => {
  chrome.storage.local.get("linkedInHeadlineUpdate", (data) => {
    if (data.linkedInHeadlineUpdate) {
      const update = data.linkedInHeadlineUpdate;
      // Only apply if it's recent (within last 30 seconds)
      if (Date.now() - update.timestamp < 30000 && isEditIntroPage()) {
        console.log("Applying pending headline update...");
        // Wait a bit for content to load
        setTimeout(() => {
          processLinkedInOptimization({ newHeadline: update.newHeadline });
          // Clear the pending update
          chrome.storage.local.remove("linkedInHeadlineUpdate");
        }, 1000);
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
