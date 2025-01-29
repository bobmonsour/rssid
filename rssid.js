#!/usr/bin/env node

import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// Get the current directory
const currentDirectory = process.cwd();

// Function to display help message
function displayHelp() {
	console.log(`
Usage: add-rssid [options]

Options:
  -h            Display this help message
  -add, -a      Add the rssid to the front matter of all files listed in filelist.txt
  -remove, -r   Remove the rssid from the front matter of all files listed in filelist.txt
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

// Check for the -f=filename option
const fileOption = process.argv.find((arg) => arg.startsWith("-f="));
const specifiedFilename = fileOption ? fileOption.split("=")[1] : null;

// If specifiedFilename does not have an extension, assume .md
if (specifiedFilename && !path.extname(specifiedFilename)) {
	specifiedFilename += ".md";
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
		// Add rssid logic here
		console.log(`Adding rssid to file: ${filename}`);
		// Your addition logic here
	} else if (removeOption) {
		// Remove rssid logic here
		console.log(`Removing rssid from file: ${filename}`);
		// Your removal logic here
	}

	return true; // Return true if processed successfully, false otherwise
}

if (specifiedFilename) {
	processFile(specifiedFilename);
} else {
	// Read the file list
	const fileListPath = path.join(currentDirectory, "filelist.txt");
	const fileList = fs
		.readFileSync(fileListPath, "utf-8")
		.split("\n")
		.filter(Boolean);

	// Process each file in the file list
	let allProcessedSuccessfully = true;
	fileList.forEach((filename, index) => {
		const lineNumber = index + 1;
		const result = processFile(filename, lineNumber);
		if (!result) {
			allProcessedSuccessfully = false;
		}
	});

	// Delete filelist.txt if all files were processed successfully
	if (allProcessedSuccessfully) {
		fs.unlinkSync(fileListPath);
		console.log(`Deleted file: filelist.txt`);
	}
}
