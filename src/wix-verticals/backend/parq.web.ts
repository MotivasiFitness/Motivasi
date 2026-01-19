import wixData from "wix-data";
import { webMethod, Permissions } from "wix-web-module";

type SubmitParqPayload = {
  clientName: string;
  email: string;
  answers: Record<string, any>;
  memberId?: string;
};

export const submitParq = webMethod(Permissions.Anyone, async (payload: SubmitParqPayload) => {
  try {
    const { clientName, email, answers, memberId } = payload || ({} as SubmitParqPayload);

    if (!clientName || !email || !answers) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        error: "Missing required fields",
      };
    }

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
});
