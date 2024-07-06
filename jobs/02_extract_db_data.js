const fs = require("fs");
const path = require("path");

function extractData(data, multiSelectValuesForKey) {
  let grouped = {};

  for (let key in data.properties) {
    let prop = data.properties[key];

    if (!grouped[prop.type]) {
      grouped[prop.type] = [];
    }

    let valueObj = {};
    switch (prop.type) {
      case "multi_select":
        // Create an object with unique multi_select values for this key set to null
        valueObj = {};
        multiSelectValuesForKey[key].forEach((val) => {
          valueObj[val] = null;
        });

        // Update the values for the current object's multi_select fields
        prop.multi_select.forEach((ms) => {
          valueObj[ms.name] = ms;
        });
        break;

      case "date":
        valueObj = {
          start: prop.date?.start || null,
          end: prop.date?.end || prop.date?.start || null, // If end date is null, set it to start date
          time_zone: prop.date?.time_zone || null,
        };
        break;

      case "unique_id":
        valueObj = { number: prop.unique_id.number };
        break;

      case "email":
        valueObj = { email: prop.email };
        break;

      case "people":
        valueObj = {
          name: prop.people.length > 0 ? prop.people[0].name : null,
        };
        break;

      case "rich_text":
        valueObj = {
          content:
            prop.rich_text.length > 0 ? prop.rich_text[0].text.content : null,
        };
        break;

      case "status":
        valueObj = { name: prop.status.name };
        break;

      case "checkbox":
        valueObj = { checkbox: prop.checkbox };
        break;

      case "phone_number":
        valueObj = { phone_number: prop.phone_number };
        break;

      case "select":
        valueObj = { name: prop.select ? prop.select.name : null };
        break;

      case "number":
        valueObj = { number: prop.number };
        break;

      case "url":
        valueObj = { url: prop.url };
        break;

      case "title":
        valueObj = {
          content: prop.title.length > 0 ? prop.title[0].text.content : null,
        };
        break;

      case "formula":
        // Handle different types of formula results
        switch (prop.formula.type) {
          case "boolean":
            valueObj = { boolean: prop.formula.boolean };
            break;
          case "date":
            valueObj = {
              start: prop.formula.date.start,
              end: prop.formula.date.end,
            };
            break;
          case "number":
            valueObj = { number: prop.formula.number };
            break;
          case "string":
            valueObj = { string: prop.formula.string };
            break;
        }
        break;

      default:
        continue;
    }

    grouped[prop.type].push({
      type: prop.type,
      key: key,
      value: valueObj,
    });
  }

  // Flatten the grouped result into an array
  let result = [];
  for (let type in grouped) {
    result = result.concat(grouped[type]);
  }

  return result;
}

async function processJsonData(dbEnvironmentName) {
  try {
    const dirPath = path.join(__dirname, dbEnvironmentName);
    const jsonString = await fs.promises.readFile(
      path.join(dirPath, `notion_database_data.json`),
      "utf8"
    );
    const dataList = JSON.parse(jsonString);

    let multiSelectValuesForKey = {};
    dataList.forEach((data) => {
      for (let key in data.properties) {
        let prop = data.properties[key];
        if (prop.type === "multi_select") {
          if (!multiSelectValuesForKey[key]) {
            multiSelectValuesForKey[key] = [];
          }
          prop.multi_select.forEach((ms) => {
            if (!multiSelectValuesForKey[key].includes(ms.name)) {
              multiSelectValuesForKey[key].push(ms.name);
            }
          });
        }
      }
    });

    const allResults = dataList.map((data) =>
      extractData(data, multiSelectValuesForKey)
    );

    return allResults;
  } catch (err) {
    console.error("Error:", err);
  }
}

async function execute(dbEnvironmentName) {
  const allResults = await processJsonData(dbEnvironmentName);
  if (allResults) {
    const dirPath = path.join(__dirname, dbEnvironmentName);
    const filePath = path.join(dirPath, `notion_database_data_extracted.json`);
    await fs.promises.writeFile(
      filePath,
      JSON.stringify(allResults, null, 2),
      "utf8"
    );
    console.log(`Data successfully written to ${filePath}`);
  }
}

module.exports.execute = execute;
