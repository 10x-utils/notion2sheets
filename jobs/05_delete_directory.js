const fs = require("fs").promises;
const path = require("path");

async function execute(dbEnvironmentName) {
  const dirPath = path.join(__dirname, dbEnvironmentName);
  try {
    await fs.rmdir(dirPath, { recursive: true });
    console.log(`Directory ${dbEnvironmentName} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting directory ${dbEnvironmentName}:`, error);
  }
}

module.exports.execute = execute;
