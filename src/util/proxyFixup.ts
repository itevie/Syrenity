export default function fixupURLForProxy(url: string) {
  const headers = {};
  if (url.includes("pximg")) headers["Referer"] = "https://www.pixiv.net";
  return headers;
}
