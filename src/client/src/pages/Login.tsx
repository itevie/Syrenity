import { useRef } from "react";
import Button from "../dawn-ui/components/Button";
import Link from "../dawn-ui/components/Link";
import { axiosClient } from "../App";
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

    // const loginResult = await wrap(
    //   axiosClient.post("/auth/password", {
    //     email,
    //     password,
    //   }),
    // );

    // console.log(loginResult);

    // if (isErr(loginResult)) {
    //   return handleClientError("login", loginResult.v);
    // }

    const result = await wrap(
      axiosClient.post("/auth/get-token", {
        email,
        password,
      }),
    );

    if (isErr(result)) {
      if (result.v instanceof AxiosError && result.v.status === 401) {
        showErrorAlert(
          trans("login.invalidPassword.body"),
          trans("login.invalidPassword.title"),
        );
      } else {
        handleClientError("make token", result.v);
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
