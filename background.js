// ✅ This function runs in PAGE world - must be fully self-contained
function typeaheadPageWorldLogic(selector, newValue) {
  return new Promise((resolve, reject) => {
    const input = document.querySelector(selector);
    const nativeSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    ).set;

    // Step 1: Set the search text and trigger input event so LinkedIn fetches matching results
    nativeSetter.call(input, newValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));

    // Step 2: Open dropdown via React fiber
    const fiberKey = Object.keys(input).find((k) =>
      k.startsWith("__reactFiber"),
    );
    let current = input[fiberKey];
    while (current) {
      const props = current.memoizedProps;
      if (props?.onFocus)
        props.onFocus({ target: input, currentTarget: input, bubbles: true });
      if (props?.onClick)
        props.onClick({ target: input, currentTarget: input, bubbles: true });
      if (props?.onChange)
        props.onChange({ target: input, currentTarget: input, bubbles: true });
      current = current.return;
    }

    // Step 3: Poll until the matching option appears
    const maxAttempts = 20;
    let attempts = 0;

    const interval = setInterval(() => {
      attempts++;
      const options = document.querySelectorAll('[role="option"]');
      const target = Array.from(options).find((o) =>
        o.textContent.toLowerCase().includes(newValue.toLowerCase()),
      );

      if (target) {
        clearInterval(interval);
        console.log("Selecting:", target.textContent.trim());

        target.click();
        const fiberKey = Object.keys(target).find((k) =>
          k.startsWith("__reactFiber"),
        );
        let current = target[fiberKey];
        while (current) {
          const props = current.memoizedProps;
          if (props?.onClick)
            props.onClick({
              target,
              currentTarget: target,
              bubbles: true,
              preventDefault: () => {},
            });
          if (props?.onMouseDown)
            props.onMouseDown({
              target,
              currentTarget: target,
              bubbles: true,
              preventDefault: () => {},
            });
          current = current.return;
        }

        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.warn(
          "Option not found. Available:",
          Array.from(document.querySelectorAll('[role="option"]')).map((o) =>
            o.textContent.trim(),
          ),
        );
        reject(new Error(`Option "${newValue}" not found`));
      }
    }, 300);
  });
}

// ✅ Single unified message listener - handles ALL message types
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // ---- Form autofill ----
  if (message.type === "FORM_DETECTED") {
    chrome.storage.local.get("profile").then(({ profile }) => {
      const FIELD_RULES = [
        { keys: ["email"], value: profile.email },
        {
          keys: ["first name", "fname", "given name"],
          value: profile.firstName,
        },
        { keys: ["last name", "lname", "surname"], value: profile.lastName },
        { keys: ["city", "town"], value: profile.city },
        { keys: ["country", "nation"], value: profile.country },
      ];

      const mapping = {};
      message.fields.forEach((field, index) => {
        const searchString = `${field.label || ""} ${field.name || ""}`
          .toLowerCase()
          .trim();
        if (searchString && searchString.length > 0) {
          const match = FIELD_RULES.find((rule) =>
            rule.keys.some((key) => searchString.includes(key)),
          );
          if (match) {
            mapping[index] = match.value;
          }
        }
      });

      chrome.tabs.sendMessage(sender.tab.id, { type: "FILL_FORM", mapping });
    });

    return false; // no async sendResponse needed
  }

  // ---- LinkedIn page detected ----
  if (message.type === "LINKEDIN_PAGE_DETECTED") {
    return false;
  }

  // ---- LinkedIn headline updated ----
  if (message.type === "LINKEDIN_HEADLINE_UPDATED") {
    chrome.storage.local.get("linkedInUpdates", (data) => {
      const updates = data.linkedInUpdates || [];
      updates.push({
        profileId: message.profileId,
        headline: message.headline,
        timestamp: message.timestamp,
      });
      if (updates.length > 20) updates.shift();
      chrome.storage.local.set({ linkedInUpdates: updates });
    });

    return false;
  }

  // ---- Inject typeahead script into page world ----
  if (message.type === "INJECT_TYPEAHEAD_SCRIPT") {
    console.log("Background: Injecting typeahead script with:", message);
    chrome.scripting
      .executeScript({
        target: { tabId: sender.tab.id },
        world: "MAIN", // page world - can access React internals
        func: typeaheadPageWorldLogic,
        args: [message.selector, message.newValue],
      })
      .then(() => {
        sendResponse({ status: "injected" });
      })
      .catch((err) => {
        console.error("❌ Background: injection failed:", err.message);
        sendResponse({ status: "failed", error: err.message });
      });

    return true; // ✅ keep channel open for async sendResponse
  }
});
