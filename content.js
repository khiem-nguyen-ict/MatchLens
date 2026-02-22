function extractFormFields() {
  const fields = [];

  const elements = document.querySelectorAll("input, textarea, select");

  console.log(`Found ${elements.length} input/textarea/select elements`);

  elements.forEach((el, index) => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return; // skip hidden

    console.log("Found field");
    fields.push({
      index,
      tag: el.tagName.toLowerCase(),
      type: el.type || null,
      name: el.name || null,
      id: el.id || null,
      placeholder: el.placeholder || null,
      label: el.labels?.[0]?.innerText || null,
      options:
        el.tagName === "SELECT" ? [...el.options].map((o) => o.text) : null,
    });
  });

  return fields;
}

window.addEventListener("load", () => {
  console.log("Page loaded, extracting form fields...");
  setTimeout(() => {
    const fields = extractFormFields();
    console.log("Detected form fields:", fields);
    if (fields.length > 0) {
      chrome.runtime.sendMessage({
        type: "FORM_DETECTED",
        fields,
      });
    }
  }, 1000); // wait for dynamic render
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "FILL_FORM") {
    const elements = document.querySelectorAll("input, textarea, select");

    Object.entries(message.mapping).forEach(([index, value]) => {
      const el = elements[index];
      if (!el) return;

      if (el.tagName === "SELECT") {
        [...el.options].forEach((option) => {
          if (option.text.toLowerCase().includes(value.toLowerCase())) {
            el.value = option.value;
          }
        });
      } else {
        if (el.value !== value) {
          el.value = value;
          highlightElement(el);
        }
      }

      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
});
