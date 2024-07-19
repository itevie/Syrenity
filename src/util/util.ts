import fs from "fs";

export function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(file => {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(dirPath + (dirPath.endsWith("/") ? "" : "/") + file);
        }
    });

    return arrayOfFiles;
}

export function fuckYouJs(value: string): number | null {
    return Number.isNaN(parseInt(value))
        ? null
        : parseInt(value);
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