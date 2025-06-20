import SyUser from "../models/User";

export type EmailType = "forgot-password";

interface BaseEmail {
  type: EmailType;
  user: SyUser;
}

export interface ForgotPasswordEmail extends BaseEmail {
  type: "forgot-password";
  code: string;
}

type SyrenityEmail = ForgotPasswordEmail;

export default SyrenityEmail;
