const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL;
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL;

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set. Add it to your Netlify environment variables.");
}

if (!CONTACT_TO_EMAIL) {
  throw new Error("CONTACT_TO_EMAIL is not set. Add it to your Netlify environment variables.");
}

if (!CONTACT_FROM_EMAIL) {
  throw new Error("CONTACT_FROM_EMAIL is not set. Add it to your Netlify environment variables.");
}

const redirect = (location) => ({
  statusCode: 303,
  headers: {
    Location: location,
    "Cache-Control": "no-store",
  },
  body: "",
});

const formatLine = (label, value) => {
  if (!value || !value.trim()) return "";
  return `<p><strong>${label}:</strong> ${value}</p>`;
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST" },
      body: "Method Not Allowed",
    };
  }

  try {
    const params = new URLSearchParams(event.body || "");
    const get = (key) => {
      const value = params.get(key);
      return value ? value.trim() : "";
    };

    const name = get("name");
    const email = get("email");
    const phone = get("phone");
    const topic = get("topic") || "General";
    const message = get("message");

    if (!name || !email || !message) {
      return redirect("/contact?error=missing");
    }

    const pageUrl = get("page_url");
    const pageTitle = get("page_title");
    const referrer = get("referrer");
    const timestamp = get("timestamp") || new Date().toISOString();

    const utmParts = [
      get("utm_source"),
      get("utm_medium"),
      get("utm_campaign"),
      get("utm_term"),
      get("utm_content"),
    ].filter(Boolean);

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6;">
        <h2 style="margin-top:0;">New enquiry from the contact form</h2>
        ${formatLine("Name", name)}
        ${formatLine("Email", email)}
        ${formatLine("Phone", phone)}
        ${formatLine("Topic", topic)}
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
        <hr style="margin:2rem 0; border:none; border-top:1px solid #e2e8f0;" />
        <h3 style="margin-top:0;">Submission Details</h3>
        ${formatLine("Received", new Date(timestamp).toLocaleString())}
        ${formatLine("Page", pageTitle ? `${pageTitle} (${pageUrl})` : pageUrl)}
        ${formatLine("Referrer", referrer)}
        ${utmParts.length ? `<p><strong>UTM:</strong> ${utmParts.join(" · ")}</p>` : ""}
      </div>
    `;

    const textLines = [`Name: ${name}`, `Email: ${email}`];
    if (phone) textLines.push(`Phone: ${phone}`);
    textLines.push(`Topic: ${topic}`, "", "Message:", message, "");
    textLines.push(`Page: ${(pageTitle ? `${pageTitle} ` : "") + (pageUrl || "")}`.trim());
    if (referrer) textLines.push(`Referrer: ${referrer}`);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: CONTACT_TO_EMAIL,
        reply_to: email,
        subject: `New enquiry (${topic}) from ${name}`,
        html,
        text: textLines.join("\n"),
      }),
    });

    if (!response.ok) {
      const payload = await response.text();
      console.error("Resend API error", response.status, payload);
          return redirect(`/contact?error=send&reason=${encodeURIComponent("verify-domain")}`);
    }

    return redirect("/contact/success");
  } catch (error) {
    console.error("Netlify contact function error", error);
    return redirect("/contact?error=send");
  }
};
