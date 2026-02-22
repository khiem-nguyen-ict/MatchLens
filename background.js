chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.type === "FORM_DETECTED") {
    const { profile } = await chrome.storage.local.get("profile");

    const FIELD_RULES = [
      { keys: ["email"], value: profile.email },
      { keys: ["first name", "fname", "given name"], value: profile.firstName },
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
  }

  // Handle LinkedIn profile detection
  if (message.type === "LINKEDIN_PAGE_DETECTED") {
    console.log("LinkedIn profile detected:", {
      url: message.url,
      profileId: message.profileId,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle LinkedIn headline update completion
  if (message.type === "LINKEDIN_HEADLINE_UPDATED") {
    console.log("LinkedIn headline updated successfully:", {
      profileId: message.profileId,
      newHeadline: message.newHeadline,
      timestamp: message.timestamp,
    });

    // Optionally store update history
    chrome.storage.local.get("linkedInUpdates", (data) => {
      const updates = data.linkedInUpdates || [];
      updates.push({
        profileId: message.profileId,
        newHeadline: message.newHeadline,
        timestamp: message.timestamp,
      });
      // Keep only last 20 updates
      if (updates.length > 20) {
        updates.shift();
      }
      chrome.storage.local.set({ linkedInUpdates: updates });
    });
  }
});
