import emailjs from "@emailjs/browser";

export interface SendTripEmailParams {
  email: string;
  destination: string;
  itinerary: string;
  packing_list: string;
  budget_breakdown: string;
  culture_phrases: string;
}

const SERVICE_ID = "service_b1n3mqn";
const TEMPLATE_ID = "template_gzg4i33";
const PUBLIC_KEY = "TSs2iVhXXNuGke764";

let emailJsInitialized = false;

function getEmailJsErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null) {
    const maybeError = error as { text?: unknown; message?: unknown; status?: unknown };
    if (typeof maybeError.text === "string" && maybeError.text.trim()) return maybeError.text;
    if (typeof maybeError.message === "string" && maybeError.message.trim()) return maybeError.message;
    if (maybeError.status) return `EmailJS error status ${String(maybeError.status)}`;
  }
  if (typeof error === "string" && error.trim()) return error;
  return "EmailJS returned an unknown error";
}

export async function sendTripEmail(params: SendTripEmailParams): Promise<void> {
  const recipient = params.email?.trim();
  if (!recipient) {
    throw new Error("Recipient email is empty — please enter your email on the previous screen.");
  }
  const templateParams = {
    // Send under every common EmailJS recipient variable name so whichever
    // one the template's "To Email" field references gets populated.
    user_email: recipient,
    to_email: recipient,
    email: recipient,
    reply_to: recipient,
    destination: params.destination,
    itinerary: params.itinerary,
    packing_list: params.packing_list,
    budget_breakdown: params.budget_breakdown,
    culture_phrases: params.culture_phrases,
  };


  console.log("[send-trip-email] EmailJS import status:", {
    imported: Boolean(emailjs),
    hasInit: typeof emailjs?.init === "function",
    hasSend: typeof emailjs?.send === "function",
    initialized: emailJsInitialized,
  });

  if (!emailJsInitialized) {
    emailjs.init({ publicKey: PUBLIC_KEY });
    emailJsInitialized = true;
    console.log("[send-trip-email] EmailJS initialized:", {
      initialized: emailJsInitialized,
      publicKey: PUBLIC_KEY,
    });
  }

  console.log("[send-trip-email] EmailJS config and template parameters:", {
    serviceId: SERVICE_ID,
    templateId: TEMPLATE_ID,
    publicKey: PUBLIC_KEY,
    templateParams,
  });

  try {
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY });
    console.log("[send-trip-email] EmailJS success response:", response);
  } catch (error) {
    const maybeError = error as { status?: unknown; text?: unknown; message?: unknown };
    console.error("[send-trip-email] EmailJS full error object:", error);
    console.error("[send-trip-email] EmailJS error details:", {
      status: maybeError?.status,
      text: maybeError?.text,
      message: maybeError?.message,
    });
    throw new Error(getEmailJsErrorMessage(error));
  }
}
