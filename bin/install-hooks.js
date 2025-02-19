#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function installHooks() {
	try {
		// Find the project's git root directory
		const gitRoot = execSync("git rev-parse --show-toplevel", {
			encoding: "utf-8",
		}).trim();

		// Source directory for hooks (from your package)
		const hooksSource = path.join(__dirname, "..", "src", "hooks");

		// Configure git to use custom hooks path
		execSync(`git config core.hooksPath "${hooksSource}"`);

		// Make hooks executable
		const hooks = fs.readdirSync(hooksSource);
		hooks.forEach((hook) => {
			const hookPath = path.join(hooksSource, hook);
			fs.chmodSync(hookPath, "755");
		});

		console.log("Git hooks installed successfully!");
	} catch (error) {
		console.error("Error installing git hooks:", error.message);
		process.exit(1);
	}
}

// Run installation if this is not a dependency of another module
if (require.main === module) {
	installHooks();
}

module.exports = installHooks;
