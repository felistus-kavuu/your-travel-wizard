import emailjs from "@emailjs/browser";

export interface SendTripEmailParams {
  email: string;
  destination: string;
  itinerary: string;
  packing_list: string;
  budget_breakdown: string;
  culture_phrases: string;
}

export async function sendTripEmail(params: SendTripEmailParams): Promise<void> {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error(
      "EmailJS is not configured. Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID and VITE_EMAILJS_PUBLIC_KEY.",
    );
  }

  const templateParams = {
    to_email: params.email,
    destination: params.destination,
    itinerary: params.itinerary,
    packing_list: params.packing_list,
    budget_breakdown: params.budget_breakdown,
    culture_phrases: params.culture_phrases,
    subject: `Your TripGenie Plan — ${params.destination}`,
  };

  console.log("[send-trip-email] EmailJS payload:", templateParams);

  await emailjs.send(serviceId, templateId, templateParams, { publicKey });
}
