import { useRef } from "react";
import Button from "../dawn-ui/components/Button";
import Link from "../dawn-ui/components/Link";
import { axiosWrapper } from "../dawn-ui/util";
import { baseUrl } from "../App";
import SyPage from "../components/SyPage";
import { showInfoAlert } from "../dawn-ui/components/AlertManager";
import Row from "../dawn-ui/components/Row";
import Container from "../dawn-ui/components/Container";

export default function Login() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function login() {
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    try {
      const result = await axiosWrapper("post", baseUrl + "/auth/get-token", {
        email,
        password,
      });

      localStorage.setItem("token", result.data.token);

      showInfoAlert("Successfully logged in!");
      setTimeout(() => {
        window.location.href = "/channels";
      }, 1000);
    } catch {}
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
