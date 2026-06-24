importScripts("supabase.js");
importScripts("config.js");

// ---- Initialize Supabase at the top level so it's accessible everywhere ----
const { createClient } = supabase;
const _supabase = createClient(
  "https://gewcvyaulhlfgxsvuvqj.supabase.co",
  CONFIG.SUPABASE_PUBLISHABLE_KEY,
);
const CV_TAILOR_URL = "https://cvtailor.adcrew.us"; //"http://localhost:3014"; //

// Sync settings to Supabase — pass accessToken directly to avoid session
// storage issues in service workers (no localStorage available)
async function saveSessionSettings(session) {
  // Get profile from storage
  const profile = await new Promise((resolve) => {
    chrome.storage.local.get("profile", (storageData) => {
      resolve(storageData.profile);
    });
  });

  if (!profile) {
    profile = {
      message: "Empty profile because you've log out",
    };
  }

  // Save profile to settings table if we have one
  if (profile) {
    const { error } = await _supabase
      .from("settings")
      .upsert({
        id: session.id,
        profile: profile,
      })
      .setHeader("Authorization", `Bearer ${session.accessToken}`);
    if (error) {
      console.error(
        "saveSessionSettings, save profile to settings failed",
        error,
      );
    } else {
      console.info("saveSessionSettings: Save profile successfully!");
    }
  } else {
    console.warn(
      "saveSessionSettings, save profile: No profile found to save!",
    );
  }

  // Save session to sessions table
  const { error } = await _supabase
    .from("sessions")
    .upsert({ id: session.id, session })
    .setHeader("Authorization", `Bearer ${session.accessToken}`);
  if (error) {
    console.error(
      "saveSessionSettings, save session failed - " + error.message,
    );
  } else {
    console.info("saveSessionSettings: Save session successfully!");
  }
}

async function saveJobDescription(description) {
  // Get linkedinSession from storage
  const session = await new Promise((resolve) => {
    chrome.storage.local.get("linkedinSession", (storageData) => {
      resolve(storageData.linkedinSession);
    });
  });

  // Save job description to jobs table if we have a session
  if (session) {
    const { error } = await _supabase
      .from("jobs")
      .upsert({
        id: session.id,
        description,
      })
      .setHeader("Authorization", `Bearer ${session.accessToken}`);
    if (error) {
      console.error(
        "saveJobDescription, save job description to jobs failed",
        error,
      );
    } else {
      console.info("saveJobDescription: Save job description successfully!");
    }
  } else {
    console.warn(
      "saveJobDescription, save job description: No job description found to save!",
    );
  }
}

function tryUpdateLoginStatus(session, message, status) {
  if (session) {
    chrome.storage.local.set({
      linkedinSession: {
        ...session,
      },
    });
  } else {
    chrome.storage.local.remove("linkedinSession");
  }
  try {
    chrome.runtime.sendMessage({
      type: "LINKEDIN_LOGIN_STATUS",
      status,
      session,
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

              const session = {
                accessToken,
                refreshToken,
                ...user,
              };

              await saveSessionSettings(session);
              tryUpdateLoginStatus(session, null, "success");
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
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      func: (data) => {
        window.postMessage(
          { type: "OPEN_CV_TAILOR", payload: data },
          window.location.origin,
        );
      },
      args: [payload],
    },
    () => {
      if (chrome.runtime.lastError) {
        console.warn("executeScript failed:", chrome.runtime.lastError.message);
      }
    },
  );
}

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type === "OPEN_CV_TAILOR") {
    console.log("Now send tab message to CV Tailor: ", message);
    chrome.tabs.query({ url: `${CV_TAILOR_URL}/*` }, (tabs) => {
      if (tabs.length > 0) {
        sendTabMessage(tabs[0].id, message);
        chrome.tabs.update(tabs[0].id, { active: true });
      } else {
        chrome.tabs.create({ url: CV_TAILOR_URL }, (tab) => {
          chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === tab.id && info.status === "complete") {
              chrome.tabs.onUpdated.removeListener(listener);
              setTimeout(() => {
                sendTabMessage(tab.id, message);
              }, 500);
            }
          });
        });
      }
    });
  }
});
