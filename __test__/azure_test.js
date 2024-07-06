const { ClientSecretCredential } = require("@azure/identity");
const appRoot = require("app-root-path");
require("dotenv").config({
  path: `${appRoot}/.env`,
});

const tenantId = process.env.TENANTID;
const clientId = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;

const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

credential
  .getToken("https://management.azure.com/.default")
  .then((token) => {
    console.log("Successfully authenticated with Azure");
    console.log("Access token:", token.token);
  })
  .catch((error) => {
    console.error("Failed to authenticate with Azure:", error);
  });
