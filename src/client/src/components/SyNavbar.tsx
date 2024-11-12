import { Text } from "../dawn-ui";
import Link from "../dawn-ui/components/Link";
import Navbar from "../dawn-ui/components/Navbar";
import Row from "../dawn-ui/components/Row";

export default function SyNavbar() {
  return (
    <Navbar>
      <Row>
        <Text type="navbar">
          <Link href="/">
            Syrenity
          </Link>
        </Text>
        <Row>
          <Link href="/login">
            Login
          </Link>
          <Link href="/register">
            Register
          </Link>
        </Row>
      </Row>
    </Navbar>
  );
}