// ✅ This function runs in PAGE world - must be fully self-contained
function typeaheadPageWorldLogic(selector, newValue, callbackId) {
  (async () => {
    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    try {
      const input = document.querySelector(selector);
      if (!input) throw new Error("Input not found: " + selector);

      const reactPropsKey = Object.keys(input).find((k) =>
        k.startsWith("__reactProps"),
      );
      if (!reactPropsKey)
        throw new Error(
          "React props not found. Keys: " +
            Object.keys(input)
              .filter((k) => k.startsWith("__"))
              .join(", "),
        );

      const reactProps = input[reactPropsKey];
      console.log("✅ [PageWorld] React props found");

      input.focus();
      await sleep(300);

      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "a",
          ctrlKey: true,
          bubbles: true,
        }),
      );
      await sleep(100);

      const nativeSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      ).set;

      nativeSetter.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await sleep(200);
      console.log("🗑️ [PageWorld] Cleared value");

      nativeSetter.call(input, newValue);

      if (reactProps.onChange) {
        reactProps.onChange({
          target: input,
          currentTarget: input,
          bubbles: true,
          type: "change",
          nativeEvent: new Event("change"),
        });
      }

      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      await sleep(200);

      if (reactProps.onInput) {
        reactProps.onInput({ target: input, bubbles: true });
      }

      console.log("✅ [PageWorld] Waiting for dropdown...");
      await sleep(1500);

      const dropdownSelectors = [
        '[role="option"]',
        '[role="listbox"] li',
        '[role="listbox"] [role="option"]',
        ".basic-typeahead__selectable",
        '[data-view-name*="typeahead"] li',
        'li[id*="option"]',
        "[aria-selected]",
      ];

      let found = false;
      for (const sel of dropdownSelectors) {
        const items = document.querySelectorAll(sel);
        console.log("[PageWorld] Checking:", sel, "->", items.length, "items");
        if (items.length > 0) {
          let target = Array.from(items).find((el) =>
            el.textContent
              .trim()
              .toLowerCase()
              .includes(newValue.toLowerCase()),
          );
          if (!target) target = items[0];

          console.log("[PageWorld] Clicking:", target.textContent.trim());
          target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
          target.click();
          target.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
          found = true;

          window.dispatchEvent(
            new CustomEvent(callbackId, {
              detail: {
                success: true,
                result: "Clicked: " + target.textContent.trim(),
              },
            }),
          );
          break;
        }
      }

      if (!found) {
        console.warn("[PageWorld] No dropdown, using ArrowDown+Enter fallback");
        input.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "ArrowDown",
            keyCode: 40,
            bubbles: true,
          }),
        );
        await sleep(300);
        input.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            keyCode: 13,
            bubbles: true,
          }),
        );
        window.dispatchEvent(
          new CustomEvent(callbackId, {
            detail: { success: true, result: "fallback-enter" },
          }),
        );
      }
    } catch (err) {
      console.error("[PageWorld] Error:", err.message);
      window.dispatchEvent(
        new CustomEvent(callbackId, {
          detail: { success: false, error: err.message },
        }),
      );
    }
  })();
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
            console.log(
              `Mapping field "${searchString}" to value "${match.value}"`,
            );
            mapping[index] = match.value;
          } else {
            console.log(`No match found for field "${searchString}"`);
          }
        }
      });

      console.log("Final mapping to fill:", mapping);
      chrome.tabs.sendMessage(sender.tab.id, { type: "FILL_FORM", mapping });
    });

    return false; // no async sendResponse needed
  }

  // ---- LinkedIn page detected ----
  if (message.type === "LINKEDIN_PAGE_DETECTED") {
    console.log("LinkedIn profile detected:", {
      url: message.url,
      profileId: message.profileId,
      timestamp: new Date().toISOString(),
    });
    return false;
  }

  // ---- LinkedIn headline updated ----
  if (message.type === "LINKEDIN_HEADLINE_UPDATED") {
    console.log("LinkedIn headline updated successfully:", {
      profileId: message.profileId,
      newHeadline: message.newHeadline,
      timestamp: message.timestamp,
    });

    chrome.storage.local.get("linkedInUpdates", (data) => {
      const updates = data.linkedInUpdates || [];
      updates.push({
        profileId: message.profileId,
        newHeadline: message.newHeadline,
        timestamp: message.timestamp,
      });
      if (updates.length > 20) updates.shift();
      chrome.storage.local.set({ linkedInUpdates: updates });
    });

    return false;
  }

  // ---- Inject typeahead script into page world ----
  if (message.type === "INJECT_TYPEAHEAD_SCRIPT") {
    console.log(
      "📨 Background: injecting typeahead script into tab",
      sender.tab.id,
    );

    chrome.scripting
      .executeScript({
        target: { tabId: sender.tab.id },
        world: "MAIN", // ✅ page world - can access React internals
        func: typeaheadPageWorldLogic,
        args: [message.selector, message.newValue, message.callbackId],
      })
      .then(() => {
        console.log("✅ Background: script injected successfully");
        sendResponse({ status: "injected" });
      })
      .catch((err) => {
        console.error("❌ Background: injection failed:", err.message);
        sendResponse({ status: "failed", error: err.message });
      });

    return true; // ✅ keep channel open for async sendResponse
  }
});
