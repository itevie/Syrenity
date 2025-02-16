import Link from "../dawn-ui/components/Link";
import Navbar from "../dawn-ui/components/Navbar";
import Row from "../dawn-ui/components/Row";

export default function PageNavbar() {
  return (
    <Navbar title="Syrenity" breadcrumb>
      <Row>
        <Link href="/channels">Oepn App</Link>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </Row>
    </Navbar>
  );
}
