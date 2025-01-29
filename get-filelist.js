#!/usr/bin/env node

import fs from "fs";
import path from "path";

// Get the current directory
const directoryPath = process.cwd();

// Path to the output file
const outputFilePath = path.join(directoryPath, "filelist.txt");

// Delete the file if it already exists
if (fs.existsSync(outputFilePath)) {
	fs.unlinkSync(outputFilePath);
	console.log(`Deleted existing file: filelist.txt`);
}

// Check for the -e=<ext> option
const extOption = process.argv.find((arg) => arg.startsWith("-e="));
let specifiedExtension = extOption ? extOption.split("=")[1] : "md";

// Ensure the extension starts with a dot
if (!specifiedExtension.startsWith(".")) {
	specifiedExtension = `.${specifiedExtension}`;
}

// Read the directory contents
fs.readdir(directoryPath, (err, files) => {
	if (err) {
		console.error("Unable to read directory:", err);
		process.exit(1);
	}

	// Filter and process filenames to include their extensions
	const filenamesWithExtensions = files.filter(
		(file) => path.extname(file) === specifiedExtension
	);

	// Create a text file with the list of filenames
	fs.writeFile(outputFilePath, filenamesWithExtensions.join("\n"), (err) => {
		if (err) {
			console.error("Unable to write file:", err);
			process.exit(1);
		}
		console.log(`File list written to filelist.txt`);
	});
});
