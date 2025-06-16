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
  element: JSX.Element | (() => any);
}

export interface PageBrSection {
  type: "br";
}

export interface PageLabelSection {
  type: "label";
  label: string;
}

export type PageSection = PageButtonSection | PageBrSection | PageLabelSection;

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
              onClick={() =>
                typeof section.element === "function"
                  ? section.element()
                  : setSelectedSection(section)
              }
            />
          ) : section.type === "label" ? (
            <Words type={TextType.Small}>{section.label}</Words>
          ) : (
            <br />
          ),
        )}
      </Sidebar>
      <Content
        className="sy-page-content flex-grow width-100"
        style={{ overflowY: "auto" }}
      >
        <Words type={TextType.PageTitle}>{selectedSection.label}</Words>
        {selectedSection.element as JSX.Element}
      </Content>
    </>
  );
}
