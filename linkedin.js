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

/**
 * Optimize LinkedIn Profile with new text
 * Returns: true if successful, false otherwise
 */
function updateHeadline(newHeadlineText) {
    try {
        // Find the contenteditable headline element
        // LinkedIn uses multiple nested divs, look for contenteditable with role="textbox"
        const headlineEditor = document.querySelector(
            'div[contenteditable="true"][role="textbox"].tiptap.ProseMirror'
        );

        if (!headlineEditor) {
            console.error(
                "Could not find headline editor. Checking for alternative selectors..."
            );
            // Try alternative selector
            const alternativeEditor = document.querySelector(
                'div[contenteditable="true"][role="textbox"]'
            );
            if (!alternativeEditor) {
                console.error("Alternative selector also failed");
                return false;
            }
            updateTextInElement(alternativeEditor, newHeadlineText);
            highlightElement(alternativeEditor);
            return true;
        }

        updateTextInElement(headlineEditor, newHeadlineText);
        highlightElement(headlineEditor);
        return true;
    } catch (error) {
        console.error("Error updating headline:", error);
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

  console.log("Headline updated to:", newText);
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
    const headlineEditor = document.querySelector(
      'div[contenteditable="true"][role="textbox"]'
    );

    if (headlineEditor && config.newHeadline) {
      clearInterval(waitForEditor);
      console.log("Editor found, updating headline...");
      const success = updateHeadline(config.newHeadline);

      if (success) {
        console.log("Headline successfully updated!");
        // Notify background script of success
        chrome.runtime.sendMessage({
          type: "LINKEDIN_HEADLINE_UPDATED",
          profileId,
          newHeadline: config.newHeadline,
          timestamp: new Date().toISOString(),
        });
      } else {
        console.error("Failed to update headline");
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
