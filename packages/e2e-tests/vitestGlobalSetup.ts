import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import { chromium } from 'playwright-core';
import { execa } from 'execa';
import { fileURLToPath } from 'url';

const tempTestDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'tmp', 'e2e-tests');
// const pluginDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'imba');

const isBuildTest = !!process.env.TEST_BUILD;
const isCI = !!process.env.CI;
const showTestBrowser = !!process.env.TEST_SHOW_BROWSER;
const preserveArtifacts = !!process.env.TEST_PRESERVE_ARTIFACTS || isCI;

const DIR = path.join(os.tmpdir(), 'vitest_playwright_global_setup');

// const buildPackagesUnderTest = async () => {
// 	console.log('building packages');
// 	await execa('npm', ['install', '--no-audit', '--prefer-offline'], { stdio: 'inherit', cwd: pluginDir });
// 	console.log('building packages done');
// };

const syncNodeModules = async () => {
	// tests use symbolic linked node_modules directories. make sure the workspace is up for it
	console.log('syncing node_modules');
	await execa(
		'npm',
		['install', '--no-audit'],
		{ stdio: 'inherit' }
	);
	console.log('install dependencies in all subfolders');
	let testDirs = await fs.readdir("./", { withFileTypes: true });
	testDirs = testDirs.filter(dir=> dir.isDirectory() && dir.name !== "node_modules")
	await Promise.all(
		testDirs
			.map(dir=>execa('npm', ['install', '--no-audit'], { stdio: 'inherit', cwd: path.join('./', dir.name) }))
	)
	if(process.env.PUBLISHED){
		try {
			await execa('rm', ['-rf', path.join('node_modules', 'vite')], { stdio: 'inherit', cwd: path.join('..', 'imba') })
		} catch(error){}
		await Promise.all(
			testDirs
				.map(dir=>execa('npm', ['i', 'imba@vite', '--no-save'], { stdio: 'inherit', cwd: path.join('./', dir.name) }))
		)
	}else{
		await Promise.all(
			testDirs
				.map(dir=>execa('npm', ['link', 'imba'], { stdio: 'inherit', cwd: path.join('./', dir.name) }))
		)
	}
};

const startPlaywrightServer = async () => {
	const headless = !showTestBrowser;
	const args = ['--disable-gpu', '--single-process', '--no-zygote', '--no-sandbox'];
	if (isCI) {
		args.push('--disable-setuid-sandbox', '--disable-dev-shm-usage');
	}
	if (headless) {
		args.push('--headless');
	}
	return chromium.launchServer({
		channel: 'chrome',
		headless,
		args
	});
};

export async function setup() {
	// if (!isCI) {
	// TODO currently this builds twice when running yarn test
	console.log('');
	console.log('preparing non ci env...');
	await syncNodeModules();
	// await buildPackagesUnderTest();
	console.log('preparations done');
	// }
	console.log('Starting playwright server ...');
	const browserServer = await startPlaywrightServer();
	console.log('Playwright server running');
	console.log('storing wsEndpoint in ' + DIR);
	await fs.mkdirp(DIR);
	await fs.writeFile(path.join(DIR, 'wsEndpoint'), browserServer.wsEndpoint());
	console.log('clearing previous test artifacts');
	if (!preserveArtifacts) {
		await fs.remove(tempTestDir);
	} else {
		await fs.remove(path.join(tempTestDir, isBuildTest ? 'build' : 'serve'));
	}
	console.log('vitest global setup done');
	return async () => {
		if (!preserveArtifacts) {
			try {
				await fs.remove(tempTestDir);
			} catch (e) {
				console.error('failed to clear ' + tempTestDir, e);
			}
		}
		try {
			await browserServer?.close();
		} catch (e) {
			console.error('failed to close browserServer', e);
		}
	};
}
