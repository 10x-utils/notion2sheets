const fs = require("fs");
const path = require("path");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function execute(dbEnvironmentName) {
  console.log("Starting 03_create_csv..");

  function formatColumnName(name) {
    return name.replace(/\W+/g, "_");
  }

  try {
    const dirPath = path.join(__dirname, dbEnvironmentName);
    const jsonString = await fs.promises.readFile(
      path.join(dirPath, `notion_database_data_extracted.json`),
      "utf8"
    );
    const data = JSON.parse(jsonString);

    let columns = [];
    data[0].forEach((item) => {
      let column = formatColumnName(item.key);
      if (item.type === "date") {
        columns.push({
          id: `${column}_start`,
          title: `${column}_start`,
          type: "date",
        });
        columns.push({
          id: `${column}_end`,
          title: `${column}_end`,
          type: "date",
        });
        columns.push({
          id: `${column}_time_zone`,
          title: `${column}_time_zone`,
          type: "date",
        });
      } else if (item.type === "multi_select") {
        for (let multiSelectValue in item.value) {
          columns.push({
            id: formatColumnName(multiSelectValue),
            title: formatColumnName(multiSelectValue),
            type: "multi_select",
          });
        }
      } else {
        columns.push({ id: column, title: column, type: item.type });
      }
    });

    // Sort columns by type alphabetically
    columns.sort((a, b) => a.type.localeCompare(b.type));

    const csvWriter = createCsvWriter({
      path: path.join(dirPath, `notiondb_${dbEnvironmentName}.csv`),
      header: columns,
    });

    const records = data.map((rowData) => {
      let record = {};
      rowData.forEach((item) => {
        let column = formatColumnName(item.key);

        if (item.type === "date") {
          record[`${column}_start`] = item.value.start;
          record[`${column}_end`] = item.value.end;
          record[`${column}_time_zone`] = item.value.time_zone;
        } else if (item.type === "multi_select") {
          for (let multiSelectValue in item.value) {
            record[formatColumnName(multiSelectValue)] = item.value[
              multiSelectValue
            ]
              ? 1
              : 0;
          }
        } else {
          record[column] =
            item.value && item.value.name
              ? item.value.name
              : Object.values(item.value)[0];
        }
      });
      return record;
    });

    csvWriter
      .writeRecords(records)
      .then(() => console.log("The CSV file was written successfully"));
  } catch (err) {
    console.error("Failed to read the file:", err);
  }

  console.log("execute finished");
}

module.exports = {
  execute,
};
