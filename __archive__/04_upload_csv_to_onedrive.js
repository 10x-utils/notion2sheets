const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
global.fetch = fetch;

const appRoot = require("app-root-path");
require("dotenv").config({
  path: `${appRoot}/.env`,
});

const msal = require("@azure/msal-node");
const graph = require("@microsoft/microsoft-graph-client");

const userId = process.env.USERID;

const config = {
  auth: {
    clientId: process.env.CLIENTID,
    authority: `https://login.microsoftonline.com/${process.env.TENENTID}`,
    clientSecret: process.env.CLIENTSECRET,
  },
};

const cca = new msal.ConfidentialClientApplication(config);

async function uploadFileToOneDrive() {
  try {
    const authResponse = await cca.acquireTokenByClientCredential({
      scopes: ["https://graph.microsoft.com/.default"],
    });

    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, authResponse.accessToken);
      },
    });

    const fileName = path.join(__dirname, "notiondb.csv");

    // Read the file just before the upload
    const fileContents = fs.readFileSync(fileName);

    const driveItem = await client
      .api(`/users/${userId}/drive/root:/${path.basename(fileName)}:/content`)
      .put(fileContents);

    console.log("File uploaded to OneDrive successfully", driveItem);
  } catch (error) {
    console.error("Error uploading file to OneDrive", error);
  }
}

module.exports.execute = uploadFileToOneDrive;
