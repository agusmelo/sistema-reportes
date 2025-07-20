import fs from "fs";
import path from "path";
import { sync as writeFileAtomicSync } from "write-file-atomic";
/**
 * Ensures that a directory exists and creates a file with the specified content.
 * Handles errors gracefully and logs them.
 *
 * @param {string} dirPath - The directory path to create if it doesn't exist.
 * @param {string} fileName - The name of the file to create inside the directory.
 * @param {string} content - The content to write into the file.
 */
function ensurePathAndFile(dirPath, fileName, content) {
  try {
    const targetPath = path.resolve(dirPath);

    if (!fs.existsSync(targetPath)) {
      console.log(`Creating directory: ${targetPath}`);
      fs.mkdirSync(targetPath, { recursive: true });
    }

    const filePath = path.join(targetPath, fileName);
    writeFileAtomicSync(filePath, content);
    console.log(`File created: ${filePath}`);
  } catch (error) {
    console.error(`Error ensuring path and file: ${error.message}`);
    throw error; // Re-throw the error if needed for further handling
  }
}

export { ensurePathAndFile };
