const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const appRoot = require("app-root-path");
require("dotenv").config({
  path: `${appRoot}/.env`,
});

const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

const auth = new google.auth.JWT(
  GOOGLE_CLIENT_EMAIL,
  null,
  GOOGLE_PRIVATE_KEY,
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const sheets = google.sheets({ version: "v4", auth });

async function uploadCsvToGoogleSheets(dbEnvironmentName) {
  try {
    const dirPath = path.join(__dirname, dbEnvironmentName);
    const fileName = path.join(dirPath, `notiondb_${dbEnvironmentName}.csv`);
    const fileContents = fs.readFileSync(fileName, "utf8");
    const rows = fileContents.split("\n").map((row) => row.split(","));

    // Check if the sheet exists
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: "sheets.properties",
    });

    let sheetId;
    const existingSheet = sheetMetadata.data.sheets.find(
      (sheet) => sheet.properties.title === dbEnvironmentName
    );

    if (!existingSheet) {
      // Create a new sheet if it does not exist
      const response = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: dbEnvironmentName,
                },
              },
            },
          ],
        },
      });
      sheetId = response.data.replies[0].addSheet.properties.sheetId;
    } else {
      sheetId = existingSheet.properties.sheetId;
    }

    // Define the range to update the data
    const range = `${dbEnvironmentName}!A1`; // Assuming you want to start from the top-left cell

    // Upload data to the sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: rows,
      },
    });

    console.log(
      `CSV uploaded to Google Sheets successfully for ${dbEnvironmentName}`
    );
  } catch (error) {
    console.error(
      `Error uploading CSV to Google Sheets for ${dbEnvironmentName}`,
      error
    );
  }
}

module.exports.execute = uploadCsvToGoogleSheets;
