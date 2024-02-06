export function createDiscriminator() {
  const id = (Math.floor(Math.random() * 9999) + 1).toString();
  const zeros = '0'.repeat(4 - id.length);
  return `${zeros}${id}`;
}

export function modifyURL(url: string, w: string) {
  const u = new URL(`http://localhost:3000` + url);
  u.pathname = w;
  return `${u.pathname}`;
}

export function combineIntoString(...args: any) {
  let res = "";

  for (let i of args)
    res += `${i}-`;
  return res;
}