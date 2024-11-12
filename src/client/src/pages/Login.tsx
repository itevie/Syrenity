import { useRef } from "react";
import Button from "../dawn-ui/components/Button";
import Content from "../dawn-ui/components/Content";
import Link from "../dawn-ui/components/Link";
import Page from "../dawn-ui/components/Page";
import Panel from "../dawn-ui/components/Panel";
import PanelRow from "../dawn-ui/components/PanelRow";
import { axiosWrapper } from "../dawn-ui/util";
import { showInformation } from "../dawn-ui/components/AlertManager";
import SyNavbar from "../components/SyNavbar";
import { baseUrl } from "../App";

export default function Login() {
  const emailRef = useRef<HTMLInputElement>(null);  
  const passwordRef = useRef<HTMLInputElement>(null);  

  async function login() {
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    try {
      const result = await axiosWrapper("post", baseUrl + "/auth/get-token", {
        email,
        password
      });

      localStorage.setItem("token", result.data.token);

      showInformation("Successfully logged in!");
      setTimeout(() => {
        window.location.href = "/channels";
      }, 1000);
    } catch {}
  }

  return (
    <Page>
      <SyNavbar />
      <Content>
        <PanelRow>
          <Panel width="500px" title="Login to your Syrenity account">
            <table style={{width: "100%"}}><tbody>
              <tr>
                <td><b>Email</b></td>  
                <td><input ref={emailRef} type="email" /></td>
              </tr>  
              <tr>
                <td><b>Password</b></td>  
                <td><input ref={passwordRef} type="password" /></td>
              </tr>  
              <tr>
                <td></td>
                <td>
                  <Link href="/login/forgot-password">Forgot Password?</Link>
                </td>
              </tr>
            </tbody></table>
            <Button big onClick={login}>
              Login
            </Button>
          </Panel>
        </PanelRow>
      </Content>
    </Page>
  )
}