import { useEffect, useState } from "react";
import Content from "../dawn-ui/components/Content";
import GoogleMatieralIcon from "../dawn-ui/components/GoogleMaterialIcon";
import Row from "../dawn-ui/components/Row";
import Sidebar from "../dawn-ui/components/Sidebar";
import SidebarButton from "../dawn-ui/components/SidebarButton";

export let setPage: (page: JSX.Element) => void = () => {};

export default function PageManager() {
  const [element, setElement] = useState<JSX.Element | null>(null);

  useEffect(() => {
    setPage = (p) => {
      setElement(p);
    };
  }, []);

  return (
    element && (
      <Row className="dawn-fullscreen sy-page-container">
        {element}
        <GoogleMatieralIcon
          onClick={() => setElement(null)}
          name="close"
          className="sy-page-close"
        />
      </Row>
    )
  );
}
