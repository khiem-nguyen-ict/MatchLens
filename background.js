importScripts("supabase.js");

// ---- Initialize Supabase at the top level so it's accessible everywhere ----
const { createClient } = supabase;
const _supabase = createClient(
  "https://gewcvyaulhlfgxsvuvqj.supabase.co",
  "sb_publishable_B1Dlgx2BUeofIblojaXilw_RNET2Eju",
);

// Sync settings to Supabase — pass accessToken directly to avoid session
// storage issues in service workers (no localStorage available)
async function syncSettings(accessToken, userId, profile) {
  if (!accessToken || !userId || !profile) {
    console.warn("syncSettings: missing required params, skipping.");
    return;
  }

  console.log("Syncing profile to Supabase for user:", userId);

  const { error } = await _supabase
    .from("settings")
    .upsert({ id: userId, profile })
    .setHeader("Authorization", `Bearer ${accessToken}`);

  if (error) {
    console.error(
      "syncSettings: upsert failed:",
      error.message,
      error.code,
      error.details,
    );
  } else {
    console.log("syncSettings: success for user:", userId);
  }
}

function tryUpdateLoginStatus(user, message, status) {
  if (user) {
    chrome.storage.local.set({
      linkedinUser: {
        ...user,
      },
    });
  } else {
    chrome.storage.local.remove("linkedinUser");
  }
  try {
    chrome.runtime.sendMessage({
      type: "LINKEDIN_LOGIN_STATUS",
      status,
      user,
      message,
    });
  } catch (e) {
    // Popup is closed, that's fine — popup will read from storage on open
  }
}

// Single unified message listener - handles ALL message types
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // ---- LinkedIn authenticate ----
  if (message.type === "LINKEDIN_AUTHENTICATE") {
    // Wrap in async IIFE so we can use await, and return true below to keep
    // the message channel open for the async sendResponse calls.
    (async () => {
      try {
        // 1. Get the login URL from Supabase
        const { data, error } = await _supabase.auth.signInWithOAuth({
          provider: "linkedin_oidc",
          options: {
            redirectTo: chrome.identity.getRedirectURL(),
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          tryUpdateLoginStatus(
            null,
            "Failed to get auth URL: " + error.message,
            "failed",
          );
          throw error;
        }

        // 2. Launch the Web Auth Flow
        // This opens the LinkedIn login in a secure window and captures the redirect
        chrome.identity.launchWebAuthFlow(
          {
            url: data.url,
            interactive: true,
          },
          async (redirectUrl) => {
            // Handle errors or user canceling the window
            if (chrome.runtime.lastError || !redirectUrl) {
              tryUpdateLoginStatus(
                null,
                "Authentication failed: " +
                  (chrome.runtime.lastError?.message || "Unknown error"),
                "failed",
              );
              return;
            }

            console.log("Auth flow completed. Redirect URL:", redirectUrl);

            // 3. Extract tokens from the URL fragment (the part after #)
            const url = new URL(redirectUrl);
            const params = new URLSearchParams(url.hash.substring(1));
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");

            if (accessToken && refreshToken) {
              // 4. Finalize the session in your Supabase client
              const { data: sessionData, error: sessionError } =
                await _supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });

              if (sessionError) throw sessionError;

              console.log("Login successful!", sessionData.user);

              user = sessionData.user;

              // 5. Sync any existing local profile to Supabase.
              // Pass accessToken and userId directly — don't rely on stored
              // session since localStorage is unavailable in service workers.
              chrome.storage.local.get("profile", (storageData) => {
                if (storageData.profile) {
                  console.log(
                    "Syncing existing profile to Supabase:",
                    storageData.profile,
                  );
                  syncSettings(
                    accessToken,
                    sessionData.user.id,
                    storageData.profile,
                  );
                }
              });
              tryUpdateLoginStatus(user, null, "success");
            } else {
              tryUpdateLoginStatus(
                null,
                "Authentication failed: Tokens not received.",
                "failed",
              );
            }
          },
        );
      } catch (err) {
        tryUpdateLoginStatus(
          null,
          "System error during authentication: " + err.message,
          "failed",
        );
      }
    })();

    return true;
  }

  // ---- Inject typeahead script into page world ----
  if (message.type === "INJECT_TYPEAHEAD_SCRIPT") {
    console.log(
      "MatchLens: Background: Injecting typeahead script with:",
      message,
    );
    chrome.scripting
      .executeScript({
        target: { tabId: sender.tab.id },
        world: "MAIN",
        func: typeaheadPageWorldLogic,
        args: [message.selector, message.newValue],
      })
      .then(() => {
        sendResponse({ status: "injected" });
      })
      .catch((err) => {
        console.error("MatchLens: Background: injection failed:", err.message);
        sendResponse({ status: "failed", error: err.message });
      });

    return true;
  }
});

function sendTabMessage(tabId, payload) {
  // Add this wrapper to both sendMessage calls
  chrome.tabs.sendMessage(
    tabId,
    {
      type: "CV_TAILOR_TRANSFER",
      payload: payload,
    },
    (_response) => {
      if (chrome.runtime.lastError) {
        console.warn("sendMessage failed:", chrome.runtime.lastError.message);
      }
    },
  );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_CV_TAILOR") {
    chrome.tabs.query({ url: "https://cvtailor.adcrew.us/*" }, (tabs) => {
      if (tabs.length > 0) {
        sendTabMessage(tabs[0].id, message.payload);
        chrome.tabs.update(tabs[0].id, { active: true });
      } else {
        chrome.tabs.create({ url: "https://cvtailor.adcrew.us" }, (tab) => {
          chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === tab.id && info.status === "complete") {
              chrome.tabs.onUpdated.removeListener(listener);
              setTimeout(() => {
                sendTabMessage(tab.id, message.payload);
              }, 500);
            }
          });
        });
      }
    });
  }
});
