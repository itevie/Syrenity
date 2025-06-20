import nodemailer, { SendMailOptions } from "nodemailer";
import SyrenityEmail from "./mailSendOptions";
import Logger from "../client/src/dawn-ui/Logger";
import "dotenv/config";
import SyUser from "../models/User";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_PROVIDER!,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const logger = new Logger("mail");

export async function sendEmail(email: SyrenityEmail) {
  let generated = generateMailOptions(email);
  let mailOptions: SendMailOptions = {
    from: process.env.EMAIL,
    to: email.user.fullData.email,
    subject: generated.subject,
    text: generated.text,
  };

  try {
    // TODO: store email in sent_emails
    await transporter.sendMail(mailOptions);
    logger.error(`Sucessfully sent mail!`);
  } catch (e) {
    logger.error(`Failed to send mail`, e);
  }
}

function generateMailOptions(email: SyrenityEmail): {
  subject: string;
  text: string;
} {
  let subject: string;
  let text: string;
  switch (email.type) {
    case "forgot-password":
      subject = `Reset Password Link`;
      text =
        `Here is your password reset link: ${email.code}` +
        `\n\nIf you did not request this, please reset your password.`;
      break;
  }

  return { subject, text };
}

sendEmail({
  type: "forgot-password",
  code: "test!",
  user: {
    fullData: {
      email: "izzyplays07@gmail.com",
    },
  } as unknown as SyUser,
});
