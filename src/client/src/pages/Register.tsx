import { useRef } from "react";
import Button from "../dawn-ui/components/Button";
import Link from "../dawn-ui/components/Link";
import { showInfoAlert } from "../dawn-ui/components/AlertManager";
import { baseUrl } from "../App";
import Row from "../dawn-ui/components/Row";
import SyPage from "../components/SyPage";
import Container from "../dawn-ui/components/Container";
import { handleClientError, isErr, wrap } from "../util";
import { AxiosWrapper } from "../dawn-ui/axios";

export default function Register() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function register() {
    const username = usernameRef.current?.value;
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    try {
      const client = new AxiosWrapper();
      client.noErrorMessage = true;
      const result = await wrap(
        client.post(baseUrl + "/auth/register", {
          username,
          email,
          password,
        }),
      );

      if (isErr(result)) {
        handleClientError("register", result.v);
      } else {
        showInfoAlert(
          `Welcome to Syrenity, ${result.v.data.username}#${result.v.data.discriminator}!`,
        );
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    } catch {}
  }

  return (
    <SyPage>
      <Row>
        <Container title="Register to Syrenity">
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
                <td>
                  <b>Username</b>
                </td>
                <td>
                  <Row>
                    <input ref={usernameRef} />
                    <Button
                      onClick={(e) =>
                        ((usernameRef.current as HTMLInputElement).value =
                          generateUsername())
                      }
                    >
                      Suggest
                    </Button>
                  </Row>
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <Link href="/login">Have an account?</Link>
                </td>
              </tr>
            </tbody>
          </table>
          <Button big onClick={register}>
            Register
          </Button>
        </Container>
      </Row>
    </SyPage>
  );
}

// Fun fact: this was stolen from 4 version old Syrenity

// Words for suggesting
const nouns = [
  "dog",
  "cat",
  "fridgerator",
  "bean",
  "pupppy",
  "carrot",
  "jellybean",
  "rainbow",
  "soybean",
  "phone",
  "waterbottle",
  "oven",
  "tic-tac-toe_master",
  "lemonade",
  "chocolate",
  "chocolate_bar",
  "donut",
  "person",
  "human",
  "pillow",
  "plushie",
  "apple",
  "banana",
  "gamer",
  "archaeologist",
  "anthropologist",
  "gigachad",
];

const verbs = [
  "walking",
  "running",
  "sleeping",
  "loving",
  "hating",
  "glowing",
  "shining",
  "gaming",
];

const adjectives = [
  "magical",
  "quiet",
  "awesome",
  "overrated",
  "underrated",
  "ultimate",
  "remarkable",
  "unbelieveable",
  "outstanding",
  "abundant",
  "happy",
  "sad",
  "angry",
  "bad",
];

function generateUsername(): string {
  let username = `${adjectives[Math.floor(Math.random() * adjectives.length)]}`;

  if (Math.random() > 0.5)
    username += `${verbs[Math.floor(Math.random() * verbs.length)]}`;

  username += `${nouns[Math.floor(Math.random() * nouns.length)]}`;

  let amount = Math.floor(Math.random() * 5);
  for (let i = 0; i !== amount; i++) username += Math.floor(Math.random() * 9);

  return username;
}
