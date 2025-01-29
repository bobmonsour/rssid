#!/usr/bin/env node

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import crypto from "crypto";

// Get the current directory
const currentDirectory = process.cwd();

// Function to display help message
function displayHelp() {
	console.log(`
Usage: add-rssid [options]

Options:
  -h            Display this help message
  -add, -a      Add the rssid to the front matter of all files in the directory
  -remove, -r   Remove the rssid from the front matter of all files in the directory
  -e=<ext>      Process only files with the specified extension (default: .md)
  -f=filename   Process only the specified file (assumes .md extension if not provided)
`);
}

// Check for the -h option
if (process.argv.includes("-h")) {
	displayHelp();
	process.exit(0);
}

// Check for the -add, -a, -remove, or -r option (case-insensitive)
const addOption = process.argv.some(
	(arg) => arg.toLowerCase() === "-add" || arg.toLowerCase() === "-a"
);
const removeOption = process.argv.some(
	(arg) => arg.toLowerCase() === "-remove" || arg.toLowerCase() === "-r"
);

// Ensure either -add, -a, -remove, or -r is present
if (!addOption && !removeOption) {
	console.error("Error: Either -add, -a, -remove, or -r must be specified.");
	process.exit(1);
}

// Check for the -e=<ext> option
const extOption = process.argv.find((arg) => arg.startsWith("-e="));
let specifiedExtension = extOption ? extOption.split("=")[1] : "md";

// Ensure the extension starts with a dot
if (!specifiedExtension.startsWith(".")) {
	specifiedExtension = `.${specifiedExtension}`;
}

// Check for the -f=filename option
const fileOption = process.argv.find((arg) => arg.startsWith("-f="));
let specifiedFilename = fileOption ? fileOption.split("=")[1] : null;

// If specifiedFilename does not have an extension, assume .md
if (specifiedFilename && !path.extname(specifiedFilename)) {
	specifiedFilename += ".md";
}

// Function to generate MD5 hash of a string
function generateMD5Hash(str) {
	return crypto.createHash("md5").update(str).digest("hex");
}

// Function to process a single file
function processFile(filename, lineNumber = null) {
	const filePath = path.join(currentDirectory, filename);
	const fileContent = fs.readFileSync(filePath, "utf-8");

	// Extract existing front matter
	const frontMatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---\n/);
	let frontMatter = {};
	let content = fileContent;

	if (frontMatterMatch) {
		frontMatter = yaml.load(frontMatterMatch[1]);
		content = fileContent.slice(frontMatterMatch[0].length);
	} else {
		console.error(`Error: No front matter found in file: ${filename}`);
		return false;
	}

	// Add or remove rssid based on the option
	if (addOption) {
		// Generate MD5 hash of the base part of the filename (excluding the extension)
		const baseName = path.basename(filename, path.extname(filename));
		const rssid = generateMD5Hash(baseName);
		console.log(`Adding rssid to file: ${filename}`);
		frontMatter.rssid = rssid;
	} else if (removeOption) {
		console.log(`Removing rssid from file: ${filename}`);
		delete frontMatter.rssid;
	}

	// Reconstruct the file content with updated front matter
	const newFrontMatter = yaml.dump(frontMatter);
	const newFileContent = `---\n${newFrontMatter}---\n${content}`;
	fs.writeFileSync(filePath, newFileContent, "utf-8");

	return true; // Return true if processed successfully, false otherwise
}

if (specifiedFilename) {
	processFile(specifiedFilename);
} else {
	// Read the directory contents
	fs.readdir(currentDirectory, (err, files) => {
		if (err) {
			console.error("Unable to read directory:", err);
			process.exit(1);
		}

		// Filter files by the specified extension
		const filteredFiles = files.filter(
			(file) => path.extname(file) === specifiedExtension
		);

		// Process each file with the specified extension
		let allProcessedSuccessfully = true;
		filteredFiles.forEach((filename, index) => {
			const lineNumber = index + 1;
			const result = processFile(filename, lineNumber);
			if (!result) {
				allProcessedSuccessfully = false;
			}
		});

		if (allProcessedSuccessfully) {
			console.log(`Processed all files with extension: ${specifiedExtension}`);
		}
	});
}
