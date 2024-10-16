#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function checkDependencies() {
    try {
        execSync('node -v', { stdio: 'ignore' });
    } catch (error) {
        console.error('Error: Node.js is not installed. Please install Node.js before proceeding.');
        process.exit(1);
    }

    try {
        execSync('git --version', { stdio: 'ignore' });
    } catch (error) {
        console.error('Error: Git is not installed. Please install Git before proceeding.');
        process.exit(1);
    }
}

function removeGitDirectory(projectPath) {
    try {
        const gitPath = path.join(projectPath, '.git');
        fs.rmSync(gitPath, { recursive: true, force: true });
    } catch (error) {
        console.error('Error while removing .git folder:', error);
    }
}

function getPackageManager() {
    try {
        execSync('yarn --version', { stdio: 'ignore' });
        return 'yarn';
    } catch (error) {
        return 'npm';
    }
}

function cleanup(projectPath) {
    if (fs.existsSync(projectPath)) {
        console.log('Cleaning up partially created project...');
        fs.rmSync(projectPath, { recursive: true, force: true });
    }
}

function isValidProjectName(projectName) {
    const regex = /^[a-zA-Z0-9-_]+$/;
    return regex.test(projectName);
}

function main() {
    checkDependencies();

    const projectName = process.argv[2] || 'zkverify-starter-template';
    const projectPath = path.join(process.cwd(), projectName);

    if (!isValidProjectName(projectName)) {
        console.error('Invalid project name. Please use only letters, numbers, dashes, and underscores.');
        process.exit(1);
    }

    if (fs.existsSync(projectPath)) {
        console.error(`Folder "${projectName}" already exists in the current directory. Please choose a different project name.`);
        process.exit(1);
    }

    try {
        console.log(`Creating a new zkVerify project in ${projectPath}...`);
        execSync(`git clone https://github.com/HorizenLabs/zkverifyjs-starter-template.git ${projectPath}`, { stdio: 'inherit' });

        removeGitDirectory(projectPath);
        process.chdir(projectPath);

        const packageManager = getPackageManager();
        console.log(`Detected package manager: ${packageManager}`);
        console.log('Installing dependencies...');
        execSync(`${packageManager} install`, { stdio: 'inherit' });

        console.log(`Project "${projectName}" created successfully!`);
        console.log('To get started:');
        console.log(`  cd ${projectName}`);
        console.log(`  ${packageManager} run dev`);
    } catch (error) {
        console.error('Error occurred while creating the project:', error);
        cleanup(projectPath);
        process.exit(1);
    }
}

main();
