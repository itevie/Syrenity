import Link from "../dawn-ui/components/Link";
import Navbar from "../dawn-ui/components/Navbar";
import Row from "../dawn-ui/components/Row";

export default function SyNavbar() {
  return (
    <Navbar title="Syrenity">
      <Row>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </Row>
    </Navbar>
  );
}
