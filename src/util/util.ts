import fs from "fs";
import * as uuid from "uuid";

export function getAllFiles(
  dirPath: string,
  arrayOfFiles: string[] = []
): string[] {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(dirPath + (dirPath.endsWith("/") ? "" : "/") + file);
    }
  });

  return arrayOfFiles;
}

export function fuckYouJs(value: string): number | null {
  return Number.isNaN(parseInt(value)) ? null : parseInt(value);
}

export function generateToken(id: number | string) {
  return `${btoa(id.toString())}.${Date.now()}.${uuid.v4()}`;
}

let chars = "abcdefghijklmnopqrstuvwxyz".split("");
export function randomID(length: number) {
  let result = "";
  for (let i = 0; i != length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * Strips a FullUser of its scary details
 * @param oldUser The object to strip
 * @returns A normal user object
 */
export function stripUser(oldUser: FullUser): User {
  return {
    id: oldUser.id,
    username: oldUser.username,
    discriminator: oldUser.discriminator,
    avatar: oldUser.avatar,
    created_at: oldUser.created_at,
    bio: oldUser.bio,
    is_bot: oldUser.is_bot,
  };
}
