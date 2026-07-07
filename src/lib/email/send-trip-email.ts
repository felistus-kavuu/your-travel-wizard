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
const TEMPLATE_ID = "TSs2iVhXXNuGke764";
const PUBLIC_KEY = "TSs2iVhXXNuGke764";

export async function sendTripEmail(params: SendTripEmailParams): Promise<void> {
  const templateParams = {
    user_email: params.email,
    destination: params.destination,
    itinerary: params.itinerary,
    packing_list: params.packing_list,
    budget_breakdown: params.budget_breakdown,
    culture_phrases: params.culture_phrases,
  };

  console.log("[send-trip-email] EmailJS payload:", templateParams);

  await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY });
}
