const fs = require('fs');
const packageInfo = require("../package.json");

// Create version file. Needed for tagging.
if (packageInfo && packageInfo.version) {
    fs.writeFileSync("VERSION", packageInfo.version);
} else {
    console.error("No version found");
    process.exitCode(-1);
}

// Create version file. Needed for tagging.
if (packageInfo && packageInfo.name) {
    fs.writeFileSync("NAME", packageInfo.name);
} else {
    console.error("No name found");
    process.exitCode(-1);
}