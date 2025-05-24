import { useState } from "react";
import Content from "../dawn-ui/components/Content";
import GoogleMatieralIcon from "../dawn-ui/components/GoogleMaterialIcon";
import Row from "../dawn-ui/components/Row";
import Sidebar from "../dawn-ui/components/Sidebar";
import SidebarButton from "../dawn-ui/components/SidebarButton";
import Words, { TextType } from "../dawn-ui/components/Words";
import "./page.css";

export interface PageButtonSection {
  type: "button";
  icon: string;
  label: string;
  element: JSX.Element;
}

export interface PageBrSection {
  type: "br";
}

export type PageSection = PageButtonSection | PageBrSection;

export interface PageOptions {
  sections: PageSection[];
}

export default function Page({ options }: { options: PageOptions }) {
  const [selectedSection, setSelectedSection] = useState<PageButtonSection>(
    options.sections[0] as PageButtonSection,
  );

  return (
    <>
      <Sidebar className="sy-page-sidebar">
        {options.sections.map((section, index) =>
          section.type === "button" ? (
            <SidebarButton
              icon={section.icon}
              label={section.label}
              selected={
                index ===
                options.sections.findIndex(
                  (x) =>
                    (x as PageButtonSection)?.label === selectedSection.label,
                )
              }
              onClick={() => setSelectedSection(section)}
            />
          ) : (
            <br />
          ),
        )}
      </Sidebar>
      <Content className="sy-page-content flex-grow width-100">
        <Words type={TextType.PageTitle}>{selectedSection.label}</Words>
        {selectedSection.element}
      </Content>
    </>
  );
}
