import { ReactNode } from "react";
import Page from "../dawn-ui/components/Page";
import SyNavbar from "./SyNavbar";

export default function SyPage({ children }: { children: ReactNode }) {
  return (
    <>
      <SyNavbar />
      <Page>{children}</Page>
    </>
  );
}
