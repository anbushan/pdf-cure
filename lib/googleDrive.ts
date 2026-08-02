"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    gapi?: any;
    google?: any;
  }
}

interface DriveConfig {
  clientId?: string;
  apiKey?: string;
  appId?: string;
}

// Fetched at runtime (not process.env.NEXT_PUBLIC_*) so an admin can turn
// Drive import on for every tool from the Configuration panel without a
// rebuild — see app/api/public-config/route.ts and lib/settings.ts.
let configPromise: Promise<DriveConfig> | null = null;

function fetchDriveConfig(): Promise<DriveConfig> {
  if (!configPromise) {
    configPromise = fetch("/api/public-config")
      .then((r) => r.json())
      .then((data) => ({
        clientId: data.GOOGLE_CLIENT_ID || undefined,
        apiKey: data.NEXT_PUBLIC_GOOGLE_API_KEY || undefined,
        appId: data.NEXT_PUBLIC_GOOGLE_APP_ID || undefined,
      }));
  }
  return configPromise;
}

/** Whether Google Drive import is configured — starts false and flips once the runtime config loads. */
export function useDriveConfigured(): boolean {
  const [configured, setConfigured] = useState(false);
  useEffect(() => {
    let mounted = true;
    fetchDriveConfig().then((c) => {
      if (mounted) setConfigured(Boolean(c.clientId && c.apiKey));
    });
    return () => {
      mounted = false;
    };
  }, []);
  return configured;
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

function getAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
      resolve(cachedToken.token);
      return;
    }
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
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
  const { clientId, apiKey, appId } = await fetchDriveConfig();
  if (!clientId || !apiKey) {
    throw new Error("Google Drive import isn't configured on this site yet.");
  }

  await Promise.all([loadGapi(), loadGis()]);
  const token = await getAccessToken(clientId);

  return new Promise((resolve, reject) => {
    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
      .setMimeTypes(mimeTypes)
      .setIncludeFolders(true);

    const builder = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(token)
      .setDeveloperKey(apiKey)
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

    if (appId) builder.setAppId(appId);
    builder.build().setVisible(true);
  });
}
