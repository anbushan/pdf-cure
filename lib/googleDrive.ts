"use client";

declare global {
  interface Window {
    gapi?: any;
    google?: any;
  }
}

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
export const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
export const GOOGLE_APP_ID = process.env.NEXT_PUBLIC_GOOGLE_APP_ID;

export function isDriveConfigured() {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_API_KEY);
}

let gapiLoadPromise: Promise<void> | null = null;
let gisLoadPromise: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

function loadGapi(): Promise<void> {
  if (!gapiLoadPromise) {
    gapiLoadPromise = loadScript("https://apis.google.com/js/api.js").then(
      () =>
        new Promise<void>((resolve, reject) => {
          window.gapi.load("picker", { callback: resolve, onerror: reject });
        })
    );
  }
  return gapiLoadPromise;
}

function loadGis(): Promise<void> {
  if (!gisLoadPromise) {
    gisLoadPromise = loadScript("https://accounts.google.com/gsi/client");
  }
  return gisLoadPromise;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

function getAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
      resolve(cachedToken.token);
      return;
    }
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/drive.readonly",
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }
          cachedToken = { token: response.access_token, expiresAt: Date.now() + (response.expires_in - 60) * 1000 };
          resolve(response.access_token);
        },
        error_callback: (err: any) => reject(new Error(err?.message ?? "Google sign-in was cancelled or failed.")),
      });
      tokenClient.requestAccessToken({ prompt: cachedToken ? "" : "consent" });
    } catch (e) {
      reject(e);
    }
  });
}

export interface DrivePickResult {
  file: File;
}

/**
 * Opens the Google Drive file picker, restricted to the given MIME types.
 * Resolves with the picked file downloaded as a browser File object
 * (so it can be fed straight into the same onFiles() callback the
 * regular drag-and-drop dropzone uses) or null if the user cancels.
 */
export async function pickFromDrive(mimeTypes: string): Promise<DrivePickResult | null> {
  if (!isDriveConfigured()) {
    throw new Error("Google Drive import isn't configured on this site yet.");
  }

  await Promise.all([loadGapi(), loadGis()]);
  const token = await getAccessToken();

  return new Promise((resolve, reject) => {
    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
      .setMimeTypes(mimeTypes)
      .setIncludeFolders(true);

    const builder = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(token)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setCallback(async (data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const doc = data.docs[0];
          try {
            const res = await fetch(`https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Couldn't download that file from Drive.");
            const blob = await res.blob();
            const file = new File([blob], doc.name, { type: blob.type || doc.mimeType });
            resolve({ file });
          } catch (e) {
            reject(e);
          }
        } else if (data.action === window.google.picker.Action.CANCEL) {
          resolve(null);
        }
      });

    if (GOOGLE_APP_ID) builder.setAppId(GOOGLE_APP_ID);
    builder.build().setVisible(true);
  });
}
