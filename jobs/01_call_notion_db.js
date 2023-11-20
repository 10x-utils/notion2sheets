const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");
const appRoot = require("app-root-path");
require("dotenv").config({
  path: `${appRoot}/.env`,
});

// Function to query the entire database
async function queryDatabase(notion, databaseId) {
  try {
    let startCursor = undefined;
    let allData = [];

    do {
      const response = await notion.databases.query({
        database_id: databaseId,
        start_cursor: startCursor,
      });

      allData.push(...response.results);
      startCursor = response.next_cursor;
    } while (startCursor);

    return allData;
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  }
}

// Function to execute the database query and save the results to a JSON file
async function execute() {
  console.log("NOTION_API_KEY:", process.env.NOTION_API_KEY);
  console.log("NOTION_DATABASE_ID:", process.env.NOTION_DATABASE_ID);

  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const databaseId = process.env.NOTION_DATABASE_ID;
  const allData = await queryDatabase(notion, databaseId);
  if (allData) {
    const filePath = path.join(__dirname, "notion_database_data.json");
    await fs.promises.writeFile(filePath, JSON.stringify(allData, null, 2));
    console.log(`Data has been written to ${filePath}`);
  }
}

// Execute the function
module.exports.execute = execute;
