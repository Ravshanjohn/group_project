import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const EMAIL_TOKEN = process.env.EMAIL_TOKEN;
const SENDER_EMAIL = process.env.SENDER;

if (!EMAIL_TOKEN) {
  throw new Error("EMAIL_TOKEN is not set");
}

if (!SENDER_EMAIL) {
  throw new Error("SENDER is not set");
}


export const mailtrapClient = new MailtrapClient({
  token: EMAIL_TOKEN,
});

export const sender = {
  email: SENDER_EMAIL,
  name: "Academy",
};



