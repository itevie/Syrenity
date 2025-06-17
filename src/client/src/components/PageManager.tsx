import { useEffect, useState } from "react";
import Content from "../dawn-ui/components/Content";
import GoogleMatieralIcon from "../dawn-ui/components/GoogleMaterialIcon";
import Row from "../dawn-ui/components/Row";
import Sidebar from "../dawn-ui/components/Sidebar";
import SidebarButton from "../dawn-ui/components/SidebarButton";

export let setPage: (page: JSX.Element) => void = () => {};

export let setTransparency: () => void = () => {};
let timer: any;

export default function PageManager() {
  const [element, setElement] = useState<JSX.Element | null>(null);
  const [transparent, setTransparent] = useState<boolean>(false);

  useEffect(() => {
    setPage = (p) => {
      setElement(p);
    };

    setTransparency = () => {
      setTransparent(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setTransparent(false);
      }, 1000);
    };
  }, []);

  return (
    element && (
      <Row
        className={`dawn-fullscreen sy-page-container ${transparent ? "sy-page-container-transparent" : ""}`}
      >
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
