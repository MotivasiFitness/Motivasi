import wixData from "wix-data";

export async function submitParq(payload: {
  clientName: string;
  email: string;
  answers: Record<string, any>;
  memberId?: string;
}) {
  try {
    const { clientName, email, answers, memberId } = payload;

    if (!clientName || !email || !answers) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        error: "Missing required fields",
      };
    }

    // Flag if any yes/no risk questions are "yes" (case-insensitive), any boolean true,
    // or if redFlagSymptoms contains anything other than "none".
    const redFlags =
      Array.isArray((answers as any).redFlagSymptoms) &&
      (answers as any).redFlagSymptoms.length > 0 &&
      !(answers as any).redFlagSymptoms.includes("none");

    const flagsYes =
      redFlags ||
      Object.values(answers).some((v) => {
        if (v === true) return true;
        if (typeof v === "string") return v.toLowerCase() === "yes";
        return false;
      });

    const record = await wixData.insert("ParqSubmissions", {
      clientName,
      email,
      answers: JSON.stringify(answers),
      flagsYes,
      status: "New",
      submissionDate: new Date(),
      memberId: memberId || null,
    });

    return { ok: true, id: record._id };
  } catch (err) {
    console.error("PARQ SUBMIT ERROR", err);
    return {
      ok: false,
      code: "PARQ_SUBMIT_FAILED",
      error: "Unable to submit PAR-Q. Please try again.",
    };
  }
}
