const { prisma } = require("../config/database");
const { transporter } = require("../config/smtp");

const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "admin@ilavioo.com";
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "marketing@ilavioo.com";

const createContact = async (contactData) => {
  try {
    const inquiry = await prisma.inquiry.create({
      data: {
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        subject: contactData.subject,
        message: contactData.message,
        company: contactData.company,
        status: "new",
      },
    });

    const subjectLine = contactData.subject
      ? `New Contact: ${contactData.subject}`
      : `New Contact Form: ${contactData.name}`;

    try {
      await transporter.sendMail({
        from: `Contact Form <${FROM_EMAIL}>`,
        to: TO_EMAIL,
        replyTo: contactData.email,
        subject: subjectLine,
        html: buildEmailTemplate(contactData),
      });
    } catch (emailErr) {
      console.warn(`[SMTP] Email send failed: ${emailErr.message}`);
    }

    return inquiry;
  } catch (error) {
    throw new Error(`Failed to send contact: ${error.message}`);
  }
};

const buildEmailTemplate = (data) => {
  const { name, email, phone, company, subject, message } = data;
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #84a98c 0%, #52796f 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
              New Contact Form Submission
            </h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #1f2937; font-size: 20px; margin-top: 0; margin-bottom: 20px;">Contact Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151; width: 140px;">Name</td>
                <td style="padding: 12px; background-color: #ffffff; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Email</td>
                <td style="padding: 12px; background-color: #ffffff; border-bottom: 1px solid #e5e7eb; color: #1f2937;"><a href="mailto:${email}" style="color: #52796f; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 12px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Phone</td>
                <td style="padding: 12px; background-color: #ffffff; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${phone || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding: 12px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Company</td>
                <td style="padding: 12px; background-color: #ffffff; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${company || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding: 12px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Subject</td>
                <td style="padding: 12px; background-color: #ffffff; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${subject || "No subject"}</td>
              </tr>
            </table>
            <div style="margin-top: 30px;">
              <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">Message</h3>
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; border-left: 4px solid #84a98c;">
                <p style="margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
          </div>
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">This email was sent from the contact form at <strong>ilavioo.com</strong></p>
            <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">Received on ${new Date().toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

module.exports = { createContact };
