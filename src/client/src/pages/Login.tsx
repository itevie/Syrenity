import { useRef } from "react";
import Button from "../dawn-ui/components/Button";
import Link from "../dawn-ui/components/Link";
import { axiosWrapper } from "../dawn-ui/util";
import { axiosClient, baseUrl } from "../App";
import SyPage from "../components/SyPage";
import {
  showErrorAlert,
  showInfoAlert,
} from "../dawn-ui/components/AlertManager";
import Row from "../dawn-ui/components/Row";
import Container from "../dawn-ui/components/Container";
import { handleClientError, isErr, wrap } from "../util";
import { AxiosError } from "axios";
import { trans } from "../i18n";

export default function Login() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function login() {
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    const result = await wrap(
      axiosClient.post("/auth/get-token", {
        email,
        password,
      }),
    );

    if (isErr(result)) {
      if (result.v instanceof AxiosError && result.v.status === 401) {
        showErrorAlert(
          trans("login.invalidPassword.title"),
          trans("login.invalidPassword.body"),
        );
      } else {
        handleClientError("login", result.v);
      }
      return;
    }

    localStorage.setItem("token", result.v.data.token);

    showInfoAlert("Successfully logged in!");
    setTimeout(() => {
      window.location.href = "/channels";
    }, 1000);
  }

  return (
    <SyPage>
      <Row>
        <Container title="Login to your Syrenity account">
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
              <tr>
                <td>
                  <b>Password</b>
                </td>
                <td>
                  <input ref={passwordRef} type="password" />
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <Link href="/login/forgot-password">Forgot Password?</Link>
                  <br></br>
                  <Link href="/register">No Account?</Link>
                </td>
              </tr>
            </tbody>
          </table>
          <Button big onClick={login}>
            Login
          </Button>
        </Container>
      </Row>
    </SyPage>
  );
}
