/**
 * Console-Safe Test Utility for Profile Photo Upload
 *
 * Paste into browser console on /trainer/profile and run:
 *   await testUploadFlow()
 * or:
 *   quickDiagnostic()
 *
 * This script:
 * - Detects preview/dev vs production
 * - Checks function route reachability via GET
 * - Attempts a POST upload with a tiny generated JPG using FormData
 * - Logs status, content-type, and response body preview
 */

(function () {
  // -----------------------------
  // Helpers
  // -----------------------------
  function isPreviewEnvironment(hostname) {
    const h = (hostname || "").toLowerCase();
    return (
      h.includes("localhost") ||
      h.includes("preview") ||
      h.includes("editorx.io") ||
      h.includes("wixsite.com")
    );
  }

  function getFunctionsBasePath() {
    const preview = isPreviewEnvironment(window.location.hostname);
    return preview ? "/_functions-dev" : "/_functions";
  }

  function getEndpoint(functionName) {
    return `${getFunctionsBasePath()}/${functionName}`;
  }

  async function safeReadText(response) {
    try {
      return await response.text();
    } catch (e) {
      return `[Unable to read response text: ${String(e)}]`;
    }
  }

  async function safeReadJson(response) {
    try {
      return await response.json();
    } catch (e) {
      return null;
    }
  }

  function looksLikeIndexHtml(htmlText) {
    const t = (htmlText || "").toLowerCase();
    // Heuristics for SPA/homepage shell
    return (
      t.includes("<!doctype html") &&
      (t.includes("<div id=\"root\"") ||
        t.includes("react") ||
        t.includes("vite") ||
        t.includes("next") ||
        t.includes("<title"))
    );
  }

  function extractHtmlTitle(htmlText) {
    const match = (htmlText || "").match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return match ? match[1].trim() : "(no <title> found)";
  }

  function logResponseSummary(label, response, contentType, bodyPreview) {
    console.log(`${label} Status:`, response.status, response.statusText);
    console.log(`${label} Content-Type:`, contentType || "(none)");
    console.log(`${label} Final URL:`, response.url || "(none)");
    console.log(`${label} Body (first 500 chars):`, (bodyPreview || "").slice(0, 500));
  }

  // -----------------------------
  // Test image generation (tiny JPG)
  // -----------------------------
  async function createTestImageBlob() {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(0, 0, 16, 16);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Failed to create image blob"));
            resolve(blob);
          },
          "image/jpeg",
          0.85
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  // -----------------------------
  // 1) Reachability check (GET)
  // -----------------------------
  async function testEndpointReachability(functionName) {
    console.group(`🧪 Reachability Test: ${functionName}`);

    const endpoint = getEndpoint(functionName);
    const fullUrl = window.location.origin + endpoint;

    console.log("Environment:", isPreviewEnvironment(window.location.hostname) ? "Preview/Dev" : "Production");
    console.log("Hostname:", window.location.hostname);
    console.log("Endpoint:", endpoint);
    console.log("Full URL:", fullUrl);

    let res;
    try {
      // GET is just to see if route returns JSON vs HTML (even if method not allowed)
      res = await fetch(endpoint, { method: "GET" });
    } catch (e) {
      console.error("❌ Fetch failed (network/CORS):", e);
      console.groupEnd();
      return { ok: false, reason: "fetch_failed", endpoint };
    }

    const ct = res.headers.get("content-type") || "";
    const text = await safeReadText(res);

    logResponseSummary("[GET]", res, ct, text);

    // Diagnose HTML vs JSON
    if (ct.includes("text/html") || text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      const title = extractHtmlTitle(text);
      console.warn("⚠️ Received HTML for function route.");
      console.warn("HTML <title>:", title);

      if (looksLikeIndexHtml(text)) {
        console.error("🔴 Likely SPA rewrite: function route is serving your app/homepage HTML.");
      } else {
        console.error("🔴 Function route is not returning JSON (could be login page / not found page).");
      }

      console.groupEnd();
      return { ok: false, reason: "html_returned", endpoint, contentType: ct, htmlTitle: title };
    }

    if (ct.includes("application/json")) {
      const json = await safeReadJson(res);
      console.log("✅ JSON received:", json);
      console.groupEnd();
      return { ok: true, reason: "json_returned", endpoint, contentType: ct, json };
    }

    console.warn("⚠️ Non-HTML, non-JSON content-type received:", ct);
    console.groupEnd();
    return { ok: false, reason: "unexpected_content_type", endpoint, contentType: ct, bodyPreview: text.slice(0, 200) };
  }

  // -----------------------------
  // 2) Upload test (POST FormData)
  // -----------------------------
  async function testUpload(functionName) {
    console.group(`🧪 Upload Test: ${functionName}`);

    const endpoint = getEndpoint(functionName);
    const fullUrl = window.location.origin + endpoint;

    console.log("Environment:", isPreviewEnvironment(window.location.hostname) ? "Preview/Dev" : "Production");
    console.log("Hostname:", window.location.hostname);
    console.log("Endpoint:", endpoint);
    console.log("Full URL:", fullUrl);

    const blob = await createTestImageBlob();
    console.log("✅ Created test image blob:", { size: blob.size, type: blob.type });

    const formData = new FormData();
    // Common keys used by upload handlers: "file" or "files"
    formData.append("file", blob, "test-upload.jpg");

    let res;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        body: formData,
        // IMPORTANT: do not manually set Content-Type for FormData
        // credentials may matter depending on auth/session behavior:
        credentials: "include",
      });
    } catch (e) {
      console.error("❌ Upload fetch failed (network/CORS):", e);
      console.groupEnd();
      return { ok: false, reason: "fetch_failed", endpoint };
    }

    const ct = res.headers.get("content-type") || "";
    const text = await safeReadText(res);

    logResponseSummary("[POST]", res, ct, text);

    if (ct.includes("text/html") || text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      const title = extractHtmlTitle(text);
      console.error("🔴 Upload returned HTML instead of JSON.");
      console.error("HTML <title>:", title);
      console.groupEnd();
      return { ok: false, reason: "html_returned", endpoint, contentType: ct, htmlTitle: title };
    }

    if (!ct.includes("application/json")) {
      console.error("🔴 Upload did not return JSON. Content-Type:", ct);
      console.groupEnd();
      return { ok: false, reason: "non_json", endpoint, contentType: ct, bodyPreview: text.slice(0, 300) };
    }

    // Parse JSON
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error("🔴 Failed to parse JSON even though content-type is json:", e);
      console.groupEnd();
      return { ok: false, reason: "json_parse_failed", endpoint, contentType: ct, bodyPreview: text.slice(0, 300) };
    }

    console.log("✅ Parsed JSON:", json);

    // Try to find a URL in common fields
    const url =
      (json && (json.url || json.fileUrl || (json.data && (json.data.url || json.data.fileUrl)))) || null;

    if (url) {
      console.log("🖼️ Returned image URL:", url);
    } else {
      console.warn("⚠️ No url/fileUrl field found in response JSON.");
    }

    console.groupEnd();
    return { ok: true, reason: "upload_complete", endpoint, contentType: ct, json, url };
  }

  // -----------------------------
  // Optional: test image URL accessibility
  // -----------------------------
  async function testImageUrl(url) {
    console.group("🧪 Test Image URL Accessibility");
    console.log("URL:", url);

    try {
      const res = await fetch(url, { method: "HEAD" });
      console.log("HEAD Status:", res.status, res.statusText);
      console.log("Content-Type:", res.headers.get("content-type"));
      if (!res.ok) console.warn("⚠️ URL not accessible (non-2xx).");
    } catch (e) {
      console.error("❌ HEAD request failed:", e);
    }

    console.groupEnd();
  }

  // -----------------------------
  // Public API
  // -----------------------------
  async function testUploadFlow() {
    console.log("🚀 Starting Upload Flow Test");
    console.log("================================");

    // Step 1: Reachability test
    const reach = await testEndpointReachability("uploadProfilePhoto");

    console.log("");
    // Step 2: Upload test
    const upload = await testUpload("uploadProfilePhoto");

    console.log("");
    console.log("================================");
    console.log("✅ Test complete!");
    console.log("Reachability result:", reach);
    console.log("Upload result:", upload);

    if (upload && upload.url) {
      console.log("Tip: Run `await testImageUrl('<url>')` to verify the returned URL is reachable.");
    }

    return { reach, upload };
  }

  function quickDiagnostic() {
    console.group("🔍 Quick Diagnostic");
    console.log("Hostname:", window.location.hostname);
    console.log("Origin:", window.location.origin);
    console.log("Environment:", isPreviewEnvironment(window.location.hostname) ? "Preview/Dev" : "Production");
    console.log("Functions base path:", getFunctionsBasePath());
    console.log("Upload endpoint:", getEndpoint("uploadProfilePhoto"));
    console.log("Full URL:", window.location.origin + getEndpoint("uploadProfilePhoto"));
    console.log("APIs:", {
      fetch: typeof window.fetch === "function",
      FormData: typeof window.FormData === "function",
      File: typeof window.File === "function",
      Canvas: typeof window.HTMLCanvasElement === "function",
    });
    console.groupEnd();
  }

  // Expose helpers to window for console use
  window.testUploadFlow = testUploadFlow;
  window.quickDiagnostic = quickDiagnostic;
  window.testImageUrl = testImageUrl;

  console.log("✅ Upload test utilities loaded.");
  console.log("Run: await testUploadFlow()");
  console.log("Run: quickDiagnostic()");
  console.log("Optional: await testImageUrl('https://...')");

})();
