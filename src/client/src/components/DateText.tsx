import { useTranslation } from "react-i18next";

export default function DateText({ date }: { date: Date }) {
  const { i18n } = useTranslation();
  const formatter = new Intl.DateTimeFormat(i18n.language, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return <>{formatter.format(date)}</>;
}
