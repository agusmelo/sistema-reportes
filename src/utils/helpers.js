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
    if (fs.existsSync(filePath)) {
      console.log(`File already exists: ${filePath}`);
      throw new Error(`File already exists: ${filePath}`);
    }
    writeFileAtomicSync(filePath, content);
    console.log(`File created: ${filePath}`);
  } catch (error) {
    console.error(`Error ensuring path and file: ${error.message}`);
    throw error; // Re-throw the error if needed for further handling
  }
}

/**
 * Builds a dynamic UPDATE SQL query and returns the query string and values array
 *
 * @param {string} tableName - The name of the table to update
 * @param {Object} changes - Object containing the fields to update
 * @param {string|number} id - The ID of the record to update
 * @returns {Object} Object containing {query: string, values: Array}
 */
function buildUpdateQuery(tableName, changes, id) {
  const keys = Object.keys(changes);
  const setClause = keys.map((key) => `${key} = ?`).join(", ");
  const values = keys.map((key) => changes[key]);

  const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
  const allValues = [...values, id];

  return { query, values: allValues };
}

export { ensurePathAndFile, buildUpdateQuery };
