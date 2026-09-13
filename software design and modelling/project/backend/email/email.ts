import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "./email.template.js";
import { mailtrapClient, sender } from "./email.config.js";

export const sendVerificationEmail = async (email: string, verificationToken: string) => {
  const recipient = [{ email }];
  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken)
        .replace(
          "{senderName}",
          sender.name
        )
        .replace("{verificationURL}", `${process.env.CLIENT_URL}/verify-email/${verificationToken}`),
      category: "Email Verification",
    });
    return true;
  } catch (error) {
    console.error("Error with sendVerificationEmail in mailtrap", error);
    return false;
  }
};

export const sendWelcomeEmail = async (email: string) => {
  const recipient = [{ email }];

  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Welcome to Academy!",
      html: WELCOME_EMAIL_TEMPLATE.replace("{senderName}", sender.name),
      category: "Welcome Email",  
    });
    return true;
  } catch (error) {
    console.error("Error with sendWelcomeEmail in mailtrap", error);
    throw new Error(`Error sending welcome email: ${error}`);
  };
};

export const sendPasswordResetEmail = async (email: string, resetURL: string) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL).replace("{senderName}", sender.name),
      category: "Password Reset",
    });
    return true;
  } catch (error: unknown) {
  console.error("Error with sendPasswordResetEmail", error);

  let message: string;
  if (error instanceof Error) {
    message = error.message;
  } else {
    message = String(error);
  }

  throw new Error(`Error sending password reset email: ${message}`);
}
};

export const sendResetSuccessEmail = async (email: string) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace("{senderName}", sender.name),
      category: "Password Reset Successful"
    });
    return true;
  } catch (error: unknown) {
    console.error("Error sending password reset success email", error);

    let message: string;
    if (error instanceof Error) {
      message = error.message;
    } else {
      message = String(error);
    }

    throw new Error(`Error sending password reset success email: ${message}`);
  }
};