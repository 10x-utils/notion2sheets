const process = require("process");

// Import your database tools
const callNotionDb = require("./jobs/01_call_notion_db.js");
const extractDbData = require("./jobs/02_extract_db_data.js");
const createCsv = require("./jobs/03_create_csv.js");
const uploadToGoogleSheets = require("./jobs/04_upload_csv_to_google_sheets.js");
const deleteDirectory = require("./jobs/05_delete_directory.js");

// Define a function to run the jobs
const runJobs = async (dbEnvironmentName) => {
  dbEnvironmentName = dbEnvironmentName.toUpperCase(); // Convert to uppercase
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  try {
    console.log(`Starting jobs for ${dbEnvironmentName}...`);

    console.log("Calling Notion API...");
    await callNotionDb.execute(dbEnvironmentName);
    console.log("Notion API call completed.");

    console.log("Extracting data from Notion database...");
    await delay(500);
    await extractDbData.execute(dbEnvironmentName);
    console.log("Data extraction completed.");

    console.log("Creating CSV...");
    await delay(500);
    await createCsv.execute(dbEnvironmentName);
    console.log("CSV creation completed.");

    console.log("Uploading CSV to Google Sheets...");
    await delay(500);
    await uploadToGoogleSheets.execute(dbEnvironmentName);
    console.log("CSV upload completed.");

    console.log("Deleting temporary directory...");
    await delay(500);
    await deleteDirectory.execute(dbEnvironmentName);
    console.log("Temporary directory deleted.");

    console.log(`Jobs completed for ${dbEnvironmentName}.`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const runAllJobs = async () => {
  const allIds = process.env.ALL.split(",");
  for (const id of allIds) {
    await runJobs(id);
  }
};

const dbEnvironmentName = process.argv[2];
if (dbEnvironmentName === "all") {
  runAllJobs();
} else {
  runJobs(dbEnvironmentName);
}
