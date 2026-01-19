import { ok, badRequest, serverError } from "wix-http-functions";
import wixData from "wix-data";

function json(helper, payload) {
  return helper({
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
}

export async function post_parq(request) {
  try {
    let body;
    try {
      body = await request.body.json();
    } catch (e) {
      return json(badRequest, { ok: false, code: "INVALID_JSON", error: "Invalid JSON body" });
    }

    const { clientName, email, answers, memberId } = body || {};

    if (!clientName || !email || !answers) {
      return json(badRequest, { ok: false, code: "VALIDATION_ERROR", error: "Missing required fields" });
    }

    // Compute flagsYes (adjust if you have specific questions)
    const flagsYes = Object.values(answers).some((v) => v === true || v === "Yes");

    const inserted = await wixData.insert("ParqSubmissions", {
      clientName,
      email,
      answers: JSON.stringify(answers),
      flagsYes,
      status: "New",
      submissionDate: new Date(),
      memberId: memberId || null,
    });

    return json(ok, { ok: true, id: inserted._id });
  } catch (err) {
    console.error("PARQ endpoint error:", err);
    return json(serverError, {
      ok: false,
      code: "PARQ_SUBMIT_FAILED",
      error: "Unable to submit PAR-Q. Please try again.",
    });
  }
}
