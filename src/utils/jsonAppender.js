const fs = require("fs").promises;
const path = require("path");

/**
 * Appends an object to a JSON file safely, with file locking and atomic writes.
 * @param {string} filePath - The path to the JSON file.
 * @param {Object} newObject - The object to append.
 */
async function appendToJsonFile(filePath, newObject) {
  const lockFilePath = `${filePath}.lock`;

  try {
    await acquireLock(lockFilePath); // 🔒 Lock the file

    let data = [];

    // Read or create file if missing
    try {
      await fs.access(filePath);
      const fileContent = await fs.readFile(filePath, "utf8");
      if (fileContent) {
        data = JSON.parse(fileContent);
        if (!Array.isArray(data))
          throw new Error("Invalid JSON structure: Expected an array.");
      }
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log(`File not found (${filePath}), creating a new one...`);
        await fs.writeFile(filePath, JSON.stringify([], null, 2), "utf8");
      } else {
        throw err;
      }
    }

    // Append new object
    data.push(newObject);

    // Write using atomic operation
    const tempFilePath = `${filePath}.tmp`;
    await fs.writeFile(tempFilePath, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(tempFilePath, filePath); // Swap files safely

    console.log(`Object successfully appended to ${filePath}`);
  } catch (error) {
    console.error("Error updating JSON file:", error);
  } finally {
    await releaseLock(lockFilePath); // 🔓 Unlock the file
  }
}

/**
 * Acquires a file lock to prevent concurrent writes.
 * @param {string} lockFilePath - The lock file path.
 */
async function acquireLock(lockFilePath) {
  let retries = 5;
  while (retries > 0) {
    try {
      await fs.writeFile(lockFilePath, "lock", { flag: "wx" }); // Create lock file
      return;
    } catch (err) {
      if (err.code === "EEXIST") {
        console.log("Waiting for lock...");
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait before retrying
        retries--;
      } else {
        throw err;
      }
    }
  }
  throw new Error("Could not acquire lock, file is in use.");
}

/**
 * Releases the file lock.
 * @param {string} lockFilePath - The lock file path.
 */
async function releaseLock(lockFilePath) {
  try {
    await fs.unlink(lockFilePath);
  } catch (err) {
    if (err.code !== "ENOENT") console.error("Error releasing lock:", err);
  }
}

// Export the function to be used in other files
module.exports = { appendToJsonFile };
