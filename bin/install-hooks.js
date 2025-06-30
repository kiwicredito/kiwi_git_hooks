#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function isInCIEnvironment() {
	return !!(
		process.env.AWS_EXECUTION_ENV ||
		process.env.VERCEL ||
		process.env.GITHUB_ACTIONS
	);
}

function hasGitRepository() {
	try {
		execSync("git rev-parse --git-dir", { stdio: "ignore" });
		return true;
	} catch (error) {
		return false;
	}
}

function installHooks() {
	try {
		// Skip installation in CI environments or when no Git repository exists
		if (isInCIEnvironment() || !hasGitRepository()) {
			console.log("Skipping git hooks installation (CI environment or no git repository detected)");
			return;
		}

		// Find the project's git root directory
		const gitRoot = execSync("git rev-parse --show-toplevel", {
			encoding: "utf-8",
		}).trim();

		// Source directory for hooks (from your package)
		const hooksSource = path.join(__dirname, "..", "src", "hooks");

		// Check if hooks source directory exists
		if (!fs.existsSync(hooksSource)) {
			console.log("Hooks source directory not found, skipping installation");
			return;
		}

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
		// Don't exit with error code in CI environments to prevent build failures
		if (!isInCIEnvironment()) {
			process.exit(1);
		}
	}
}

// Run installation if this is not a dependency of another module
if (require.main === module) {
	installHooks();
}

module.exports = installHooks;
