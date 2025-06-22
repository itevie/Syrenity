import { useRef, useState } from "react";
import Button from "../dawn-ui/components/Button";
import Link from "../dawn-ui/components/Link";
import { axiosWrapper } from "../dawn-ui/util";
import { axiosClient, baseUrl } from "../App";
import SyPage from "../components/SyPage";
import { showInfoAlert } from "../dawn-ui/components/AlertManager";
import Row from "../dawn-ui/components/Row";
import Container from "../dawn-ui/components/Container";
import { handleClientError, isErr, wrap } from "../util";
import { trans } from "../i18n";

export default function ForgotPassword() {
  const emailRef = useRef<HTMLInputElement>(null);
  const [showCode, setShowCode] = useState<boolean>(false);
  const codeRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);

  async function sendCode() {
    const email = emailRef.current?.value;
    const response = await wrap(
      axiosClient.post(
        "/auth/forgot-password",
        {
          email,
        },
        {
          showLoader: true,
        },
      ),
    );

    if (isErr(response)) {
      handleClientError("send code", response.v);
      return;
    }

    showInfoAlert(trans("forgotPassword.codeSent"));
    setShowCode(true);
  }

  async function resetPassword() {
    const email = emailRef.current?.value;
    const code = codeRef.current?.value;
    const newPassword = newPasswordRef.current?.value;

    const result = await wrap(
      axiosClient.post("/auth/forgot-password/change-password", {
        email,
        code,
        new_password: newPassword,
      }),
    );

    if (isErr(result)) {
      handleClientError("change password", result.v);
      return;
    }

    showInfoAlert("Password changed!");
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  }

  return (
    <SyPage>
      <Row>
        <Container title="Forgot your password?">
          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <td>
                  <b>Email</b>
                </td>
                <td>
                  <input ref={emailRef} type="email" />
                </td>
              </tr>
              {showCode && (
                <>
                  <tr>
                    <td>
                      <b>Code</b>
                    </td>
                    <td>
                      <input ref={codeRef} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <b>New Password</b>
                    </td>
                    <td>
                      <input ref={newPasswordRef} />
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
          {showCode ? (
            <Button big onClick={resetPassword}>
              Change Password
            </Button>
          ) : (
            <Button big onClick={sendCode}>
              Send Code
            </Button>
          )}
        </Container>
      </Row>
    </SyPage>
  );
}
