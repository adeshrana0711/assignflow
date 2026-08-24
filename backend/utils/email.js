import SibApiV3Sdk from "sib-api-v3-sdk";

let apiInstance = null;

const getBrevo = () => {
  if (!apiInstance) {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY not set");
    }

    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

    apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }
  return apiInstance;
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const brevo = getBrevo();
    const senderEmail = process.env.BREVO_SENDER_EMAIL;

    if (!senderEmail) {
      throw new Error("BREVO_SENDER_EMAIL not set");
    }

    const response = await brevo.sendTransacEmail({
      sender: {
        // This address must be verified in Brevo under Senders, Domains & Dedicated IPs.
        email: senderEmail,
        name: process.env.BREVO_SENDER_NAME || "University Portal",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    console.log("📧 Email sent:", response.messageId);
    return response;
  } catch (err) {
    console.error("❌ Brevo email failed:", err);
    throw err;
  }
};
