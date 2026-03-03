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

function getLanguageList() {
  // Find by aria-current="true" button's parent nav, then get all sibling buttons
  const activeBtn = document.querySelector('button[aria-current="true"]');
  const nav = activeBtn?.closest("nav");
  const buttons = nav?.querySelectorAll("button");
  const languages = [...(buttons || [])]
    .map((btn) => btn.innerText.trim())
    .filter(Boolean);
  return languages;
}

function extractLinkedInJobData(root = document) {
  const data = {};

  /* =========================
     COMPANY
  ========================== */

  const companyLink = root.querySelector('a[href*="/company/"]');
  if (companyLink) {
    data.companyName = companyLink.innerText.trim();
    data.companyUrl = companyLink.href;
  }

  /* =========================
     JOB TITLE
  ========================== */

  const titleElement = Array.from(root.querySelectorAll("p")).find(
    (p) =>
      p.innerText &&
      !p.innerText.includes("·") &&
      !p.innerText.includes("ago") &&
      !p.innerText.includes("Responses") &&
      !p.innerText.includes("Undo") &&
      p.innerText.length < 120 &&
      p.innerText.match(/[A-Za-z]/),
  );

  if (titleElement) {
    data.jobTitle = titleElement.childNodes[0].textContent.trim();
  }

  /* =========================
     LOCATION + META LINE
  ========================== */

  const metaLine = Array.from(root.querySelectorAll("p")).find(
    (p) => p.innerText.includes("·") && p.innerText.includes("ago"),
  );

  if (metaLine) {
    const parts = metaLine.innerText.split("·").map((s) => s.trim());

    data.location = parts[0] || null;
    data.postedTime = parts[1] || null;
    data.applicants = parts[2] || null;
  }

  /* =========================
     WORK TYPE (Hybrid / Remote)
  ========================== */

  const workTypeBtn = Array.from(root.querySelectorAll("button")).find(
    (btn) =>
      btn.innerText.includes("Hybrid") ||
      btn.innerText.includes("Remote") ||
      btn.innerText.includes("On-site"),
  );

  if (workTypeBtn) {
    data.workType = workTypeBtn.innerText.trim();
  }

  /* =========================
     EMPLOYMENT TYPE
  ========================== */

  const employmentBtn = Array.from(root.querySelectorAll("button")).find(
    (btn) =>
      btn.innerText.includes("Full-time") ||
      btn.innerText.includes("Part-time") ||
      btn.innerText.includes("Contract"),
  );

  if (employmentBtn) {
    data.employmentType = employmentBtn.innerText.trim();
  }

  /* =========================
     APPLY LINK
  ========================== */

  const applyLink = root.querySelector('a[aria-label*="Apply"]');
  if (applyLink) {
    data.applyUrl = applyLink.href;
  }

  /* =========================
     SAVED STATUS
  ========================== */

  const savedBtn = root.querySelector('[data-view-name="job-save-button"]');
  if (savedBtn) {
    data.savedStatus = savedBtn.innerText.trim();
  }

  return data;
}

/**
 * Extracts "About the job" and "About the company" sections from LinkedIn.
 * @returns {{aboutJob: string|null, aboutCompany: string|null}|null} Object with extracted texts or null if the URL doesn't match.
 * @example
 * {
 * "aboutJob": "Teleste is an international technology group…",
 * "aboutCompany": "Teleste offers an integrated product…"
 * }
 */ function getJobDescriptions() {
  if (window.location.href.includes("linkedin.com/jobs/")) {
    // Get job, company info:

    const header = extractLinkedInJobData();

    const sections = Array.from(
      document.querySelectorAll('[data-testid="expandable-text-box"]'),
    ).map((el) => el.innerText);

    //sections = sections.map((s) => s.replace("\n… more", "").trim()); // This code makes bug!!!! (silent bug)

    return {
      ...header,
      aboutJob: sections[0] || null,
      aboutCompany: sections[1] || null,
    };
  }
  return null;
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
    console.error("MatchLens: Select element not found");
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
  console.log(
    `Starting LinkedIn optimization profileId: ${config.profileId}, direct update: ${isDirectUpdate}`,
  );
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

    console.log(`Update the list of ${Object.keys(listOfEditors).join(", ")}`);

    if (Object.keys(listOfEditors).length >= expectedFieldsCount) {
      clearInterval(waitForEditor);

      let languageWarning = getLanguageList().join(", ");

      // Async IIFE — sequentially awaits each field update
      (async () => {
        const results = {};

        for (const key in listOfEditors) {
          const editor = listOfEditors[key];
          let msg = `Updating ${key}...`;
          let isError = false;
          if (key && config[key]) {
            const result = await updateFieldValue(
              LINKED_IN_FIELD_MAPPING[config.page].find((f) => f.key === key)
                ?.selector,
              editor,
              config[key],
            );
            results[key] = result;
            isError = !result;
            msg += result ? "Success" : "Failed";
            console.log(msg);
          } else {
            console.warn(
              `Uppdate Field, Page =${config.page}: ${isDirectUpdate ? "Direct" : "Post-navigation"}: No value for key: ${key}.`,
            );
            results[key] = false;
            isError = true;
            msg += "No value provided";
          }
          let isDone = Object.keys(results).length >= expectedFieldsCount;
          // Relay progress status to popup via runtime.sendMessage
          chrome.runtime.sendMessage({
            type: "PROGRESS_STATUS",
            status: `${msg}`,
            buttonId: config.buttonId,
            isError,
            isDone,
            timeout: isDone ? 3000 : 15000,
          });

          if (isDone && languageWarning.length > 0) {
            alert(
              `Please double-check the following language(s) on your profile: ${languageWarning}. LinkedIn may not allow automatic updates for certain fields when multiple languages are present. If you notice any fields that were not updated, please update them manually. We apologize for the inconvenience.`,
            );
          }
        }
      })();
    } else if (attempts >= maxAttempts) {
      clearInterval(waitForEditor);
    }
  }, checkInterval);
}

/**
 * Opens a LinkedIn job search page in a new tab using the job search keywords
 * stored in the user's profile settings.
 *
 * Retrieves the `jobSearch` field from `profile` in chrome.storage.local and
 * constructs a LinkedIn job search URL with the encoded keywords. If the keywords
 * are empty or whitespace-only, an alert is shown and no tab is opened.
 *
 * @async
 * @function openLinkedInJobSearch
 * @returns {Promise<string|null>} Resolves with the constructed LinkedIn search URL
 *                                 if opened, or `null` if keywords were empty.
 *
 * @example
 * const url = await openLinkedInJobSearch();
 * if (!url) console.log("MatchLens: No job search keywords set in profile.");
 */
async function openLinkedInJobSearch() {
  return new Promise((resolve) => {
    chrome.storage.local.get("profile", (data) => {
      const keywords = data?.profile?.jobSearch || "";

      if (!keywords.trim()) {
        alert(
          "No job search keywords set. Please update your profile settings.",
        );
        resolve(null);
        return;
      }

      const encodedKeywords = encodeURIComponent(keywords);
      const url = `https://www.linkedin.com/jobs/search-results/?keywords=${encodedKeywords}&origin=JOBS_HOME_SEARCH_BUTTON`;
      window.open(url, "_blank");
      resolve(url);
    });
  });
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "OPTIMIZE_LINKEDIN_PROFILE":
      if (message.config) {
        if (!message.config.profileId) {
          message.config.profileId = extractProfileId();
        }
        processLinkedInOptimization(message.config, true);
        sendResponse({ status: "Processing optimization" });
      }
      break;
    case "GET_PROFILE_ID":
      const profileId = extractProfileId();
      sendResponse({ profileId, isProfilePage: isLinkedInProfilePage() });
      break;
    case "DETECT_LINKEDIN_PAGE":
      sendResponse({
        isLinkedDomainPage: /linkedin\.com/.test(window.location.href),
        isLinkedInProfile: isLinkedInProfilePage(),
        isJobDetailsPage:
          /linkedin\.com\/jobs\/search-results\/\?currentJobId=/.test(
            window.location.href,
          ) || /linkedin\.com\/jobs\/view\//.test(window.location.href),
        profileId: extractProfileId(),
      });
      break;
    case "OPEN_LINKEDIN_JOB_SEARCH":
      openLinkedInJobSearch();
      break;
    case "SMART_APPLY_JOB":
      chrome.runtime.sendMessage({
        type: "PROGRESS_STATUS",
        status: `Applying...`,
      });
      try {
        let data = getJobDescriptions();
        sendResponse(data);

        return; // DEBUG, TEMPORARY CODE

        // Find and click the Apply button by its data-view-name attribute
        const applyBtn = document.querySelector(
          'a[data-view-name="job-apply-button"]',
        );
        if (applyBtn && data) {
          applyBtn.click();
          // Call cvtailor
          // content_script.js injected into cvtailor.adcrew.us
          // Extension popup.js

          chrome.storage.local.get("profile", (storageData) => {
            data = { ...data, ...storageData?.profile };
            try {
              chrome.runtime.sendMessage({
                type: "OPEN_CV_TAILOR",
                payload: JSON.stringify(data),
              });
            } catch (e) {
              chrome.runtime.sendMessage({
                type: "PROGRESS_STATUS",
                status: `Something went wrong! Please contact the author.`,
                isError: true,
              });
            }
          });
        } else {
          chrome.runtime.sendMessage({
            type: "PROGRESS_STATUS",
            status: `I couldn't find the “Apply” button for this role. You might want to try a different job posting.`,
            isError: true,
          });
        }
      } catch (e) {
        chrome.runtime.sendMessage({
          type: "PROGRESS_STATUS",
          status: `Unable to read thge job description.`,
          isError: true,
        });
      }
      break;
    default:
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
