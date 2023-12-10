/**
 * Adds or removes a license (declared in a source file) to all the source code
 */

const fs = require("fs");
const path = require("path");
const _ = require("lodash");

function enumerateFiles(directoryPath, fileExtensions) {
  const result = [];

  function traverseDirectory(currentPath) {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        traverseDirectory(filePath);
      } else if (
        stats.isFile() &&
        fileExtensions.includes(path.extname(file))
      ) {
        result.push(filePath);
      }
    }
  }

  traverseDirectory(directoryPath);
  return result;
}

const addLicenses = ({ directoryPath, fileExtensions }) => {
  const licenseContents = fs.readFileSync("LICENSE.code").toString();
  const files = enumerateFiles(directoryPath, fileExtensions);
  for (const file of files) {
    const fileContents = fs.readFileSync(file).toString();
    fs.writeFileSync(file, `${licenseContents}${fileContents}`);
  }
};

const emptyLinesFromStartOfTheContents = (fileContents) => {
  const { result } = (fileContents.split("\n") || []).reduce(
    (acc, line, index) => {
      if (line === "" && index === 0) {
        return acc;
      }
      acc.result.push(line);
      return acc;
    },
    { result: [] }
  );
  return result.join("\n");
};

const removeLicenseFromContents = (fileContents) => {
  const { result } = (fileContents.split("\n") || []).reduce(
    (acc, line, index) => {
      if (line.startsWith("/**") && index === 0) {
        acc.ignore = true;
        return acc;
      }
      if (line.startsWith("*/") && acc.ignore) {
        acc.ignore = false;
        return acc;
      }
      if (!acc.ignore) {
        acc.result.push(line);
      }
      return acc;
    },
    { result: [], ignore: false }
  );
  return result.join("\n");
};

const removeLicenses = ({ directoryPath, fileExtensions }) => {
  const files = enumerateFiles(directoryPath, fileExtensions);
  for (const file of files) {
    const fileContents = fs.readFileSync(file).toString();
    fs.writeFileSync(file, removeLicenseFromContents(fileContents));
  }
};

const removeEmptyLines = ({ directoryPath, fileExtensions }) => {
  const files = enumerateFiles(directoryPath, fileExtensions);
  for (const file of files) {
    const fileContents = fs.readFileSync(file).toString();
    fs.writeFileSync(file, emptyLinesFromStartOfTheContents(fileContents));
  }
};


/**
 * Example usage
 */

// addLicenses({
//   directoryPath: "src",
//   fileExtensions: [".ts", ".tsx"],
// });

// removeLicenses({
//   directoryPath: "src",
//   fileExtensions: [".ts", ".tsx"],
// });

removeEmptyLines({
  directoryPath: "src",
  fileExtensions: [".ts", ".tsx"],
})
