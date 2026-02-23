/**
 * Utility functions shared across extension scripts
 */

/**
 * Highlight an element to show it has been modified
 */
function highlightElement(element) {
  element.style.color = "#0A66C2"; // LinkedIn blue text color
  element.style.textDecoration = "#0A66C2 wavy underline";
  element.style.transition = "color 0.3s ease";
}

/**
 * LinkedIn Page Types for better handling of different sections and their selectors
 */
const LinkedInPageType = {
  PROFILE: "PROFILE",
  EDIT_INTRO: "EDIT_INTRO",
  EDIT_ABOUT: "EDIT_ABOUT",
  OTHER: "OTHER",
};

/**
 * Define of the fields we want to update on LinkedIn and their corresponding selectors
 */
const LINKED_IN_FIELD_MAPPING = {
  [LinkedInPageType.EDIT_INTRO]: [
    {
      key: "headline",
      selector:
        'div[contenteditable="true"][role="textbox"].tiptap.ProseMirror',
    },
    {
      key: "industry",
      selector:
        '[data-view-name="top-card-edit-industry-single-line-text-input"]',
    },
    {
      key: "pronouns",
      selector:
        'select[aria-label="Month"][data-view-name="top-card-edit-edit-pronoun-button"]',
    },
  ],
  [LinkedInPageType.EDIT_ABOUT]: [
    {
      key: "about",
      selector:
        'textarea[data-view-name="form-add-summary-with-gai-multi-line-text-input"]',
    },
  ],
};
