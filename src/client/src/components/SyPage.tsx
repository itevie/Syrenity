import { ReactNode } from "react";
import Page from "../dawn-ui/components/Page";
import PageNavbar from "./PageNavbar";

export default function SyPage({ children }: { children: ReactNode }) {
  return (
    <>
      <PageNavbar />
      <Page>{children}</Page>
    </>
  );
}
