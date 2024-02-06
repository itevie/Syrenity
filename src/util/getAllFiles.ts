import fs from 'fs';

/**
 * Retrieves an array of all files from a directory
 * @param dirPath The directory to scan
 * @param arrayOfFiles Used when the directory is recursive
 * @returns The array of files
 */
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(file => {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(dirPath + (dirPath.endsWith('/') ? '' : '/') + file);
    }
  });

  return arrayOfFiles;
}

export default getAllFiles;
