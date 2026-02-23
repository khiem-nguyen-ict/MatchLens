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