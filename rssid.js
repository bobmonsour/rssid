#!/usr/bin/env node

import fs from "fs";
import path from "path";
import crypto from "crypto";
import yaml from "js-yaml";

// Function to generate MD5 hash
function generateMD5Hash(input) {
	return crypto.createHash("md5").update(input).digest("hex");
}

// Get the current directory
const currentDirectory = process.cwd();

// Function to display help message
function displayHelp() {
	console.log(`
Usage: add-rssid [options]

Options:
  -h            Display this help message
  -remove, -r   Remove the rssid from the front matter of all files listed in filelist.txt
  -f=filename   Process only the specified file (assumes .md extension if not provided)
`);
}

// Check for the -h option
if (process.argv.includes("-h")) {
	displayHelp();
	process.exit(0);
}

// Check for the -remove or -r option (case-insensitive)
const removeOption = process.argv.some(
	(arg) => arg.toLowerCase() === "-remove" || arg.toLowerCase() === "-r"
);

// Check for the -f=filename option
const fileOption = process.argv.find((arg) => arg.startsWith("-f="));
let specifiedFilename = fileOption ? fileOption.split("=")[1] : null;

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
		console.error(
			`Error: No YAML front matter found in ${path.basename(filename)}${
				lineNumber !== null ? ` (filelist.txt line ${lineNumber})` : ""
			}`
		);
		return false;
	}

	if (removeOption) {
		// Remove the rssid from the front matter if it exists
		if (frontMatter.rssid) {
			delete frontMatter.rssid;

			// Convert front matter back to YAML
			const newFrontMatter = yaml.dump(frontMatter);

			// Write the updated content back to the file
			const newFileContent = `---\n${newFrontMatter}---\n${content}`;
			fs.writeFileSync(filePath, newFileContent.trim(), "utf-8");

			console.log(
				`Removed rssid from ${path.basename(filename)}${
					lineNumber !== null ? ` (filelist.txt line ${lineNumber})` : ""
				}`
			);
		} else {
			console.log(
				`No rssid found in ${path.basename(filename)}${
					lineNumber !== null ? ` (filelist.txt line ${lineNumber})` : ""
				}`
			);
		}
	} else {
		// Generate MD5 hash of the filename (excluding the extension)
		const hash = generateMD5Hash(
			path.basename(filename, path.extname(filename))
		);

		// Check if rssid already exists
		if (frontMatter.rssid) {
			console.error(
				`Error: rssid already exists in ${path.basename(filename)}${
					lineNumber !== null ? ` (filelist.txt line ${lineNumber})` : ""
				}`
			);
			return false;
		}

		// Add the rssid to the front matter
		frontMatter.rssid = hash;

		// Convert front matter back to YAML
		const newFrontMatter = yaml.dump(frontMatter);

		// Write the updated content back to the file
		const newFileContent = `---\n${newFrontMatter}---\n${content}`;
		fs.writeFileSync(filePath, newFileContent.trim(), "utf-8");

		console.log(
			`Updated ${path.basename(filename)} with rssid: ${hash}${
				lineNumber !== null ? ` (filelist.txt line ${lineNumber})` : ""
			}`
		);
	}
	return true;
}

// If a specific filename is provided, process only that file
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
		console.log(`Deleted filelist.txt after successful processing.`);
	}
}
