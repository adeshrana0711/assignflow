const getBrevoConfig = () => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is missing");
  }

  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL is missing");
  }

  console.log("Brevo API key:", "FOUND");
  console.log("Brevo sender:", senderEmail);

  return {
    apiKey,
    senderEmail,
  };
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { apiKey, senderEmail } = getBrevoConfig();

    const response = await fetch("https://api.sendinblue.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: senderEmail,
          name: process.env.BREVO_SENDER_NAME || "University Portal",
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Brevo API error:", {
        status: response.status,
        data,
      });

      throw new Error(
        data?.message || `Brevo API failed with status ${response.status}`
      );
    }

    console.log("📧 Email sent successfully:", data);

    return data;
  } catch (err) {
    console.error("❌ Brevo email failed:", err.message);
    throw err;
  }
};