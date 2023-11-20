// notionToCsv/notionToCsv.js
const { ReadableStream } = require("web-streams-polyfill");
global.ReadableStream = ReadableStream;

// Import your database tools
const callNotionDb = require("./jobs/01_call_notion_db");
const extractDbData = require("./jobs/02_extract_db_data");
const createCsv = require("./jobs/03_create_csv");
const uploadToOnedrive = require("./jobs/04_upload_csv_to_onedrive");

// Define a function to run the jobs
const runJobs = async () => {
  try {
    // console.log("Starting jobs...");

    // console.log("Calling Notion API...");
    // await callNotionDb.execute();
    // console.log("Notion API call completed.");

    // console.log("Extracting data from Notion database...");
    // await extractDbData.execute();
    // console.log("Data extraction completed.");

    // console.log("Creating SQL database...");
    // await createCsv.execute();
    // console.log("SQL database creation completed.");

    console.log("Uploading CSV to OneDrive...");
    await uploadToOnedrive.execute();
    console.log("CSV upload completed.");

    console.log("Jobs completed.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

runJobs();
