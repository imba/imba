import { promises as fs } from 'fs';
import path from 'path';
import { ResolvedOptions } from './options';

// List of options that changes the prebundling result
const PREBUNDLE_SENSITIVE_OPTIONS: (keyof ResolvedOptions)[] = [
	'compilerOptions',
	'configFile',
	'experimental',
	'extensions',
	'ignorePluginPreprocessors',
	'preprocess'
];

/**
 * @returns Whether the Imba metadata has changed
 */
export async function saveImbaMetadata(cacheDir: string, options: ResolvedOptions) {
	const imbaMetadata = generateImbaMetadata(options);
	const imbaMetadataPath = path.resolve(cacheDir, '_imba_metadata.json');

	const currentImbaMetadata = JSON.stringify(imbaMetadata, (_, value) => {
		// Handle preprocessors
		return typeof value === 'function' ? value.toString() : value;
	});

	let existingImbaMetadata: string | undefined;
	try {
		existingImbaMetadata = await fs.readFile(imbaMetadataPath, 'utf8');
	} catch {
		// ignore
	}

	await fs.mkdir(cacheDir, { recursive: true });
	await fs.writeFile(imbaMetadataPath, currentImbaMetadata);
	return currentImbaMetadata !== existingImbaMetadata;
}

function generateImbaMetadata(options: ResolvedOptions) {
	const metadata: Record<string, any> = {};
	for (const key of PREBUNDLE_SENSITIVE_OPTIONS) {
		metadata[key] = options[key];
	}
	return metadata;
}
