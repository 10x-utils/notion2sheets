const fs = require("fs");
const path = require("path");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function execute() {
  console.log("Starting 03_create_sql_db..");

  function formatColumnName(name) {
    return name.replace(/\W+/g, "_");
  }

  try {
    const jsonString = await fs.promises.readFile(
      "notion_database_data_extracted.json",
      "utf8"
    );
    const data = JSON.parse(jsonString);

    const determineColumnTitleForType = (itemType, columnName) => {
      let distinctValuesForThisColumn = new Set();
      data.forEach((row) => {
        const columnItem = row.find((i) => i.key === columnName);
        if (columnItem && columnItem.value && columnItem.value.name) {
          distinctValuesForThisColumn.add(columnItem.value.name);
        }
      });

      // Map over distinct values and format them, then join with columnName
      const combinedColumnName = [
        formatColumnName(columnName),
        ...Array.from(distinctValuesForThisColumn).map(formatColumnName),
      ].join("_");

      return combinedColumnName || formatColumnName(columnName);
    };

    let columns = [];
    data[0].forEach((item) => {
      let column = formatColumnName(item.key);
      if (item.type === "date") {
        columns.push({ id: `${column}_start`, title: `${column}_start` });
        columns.push({ id: `${column}_end`, title: `${column}_end` });
        columns.push({
          id: `${column}_time_zone`,
          title: `${column}_time_zone`,
        });
      } else if (item.type === "multi_select") {
        for (let multiSelectValue in item.value) {
          columns.push({
            id: formatColumnName(multiSelectValue),
            title: formatColumnName(multiSelectValue),
          });
        }
      } else if (["status", "select"].includes(item.type)) {
        column = determineColumnTitleForType(item.type, item.key);
        columns.push({ id: column, title: column });
      } else {
        columns.push({ id: column, title: column });
      }
    });

    const csvWriter = createCsvWriter({
      path: "out.csv",
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
        } else if (["select", "status"].includes(item.type)) {
          column = determineColumnTitleForType(item.type, item.key);
          record[column] =
            item.value && item.value.name ? item.value.name : null;
        } else {
          record[column] = Object.values(item.value)[0];
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
