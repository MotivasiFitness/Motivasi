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

    const flagsYes = Object.values(answers).some(
      v => v === true || v === "Yes"
    );

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
