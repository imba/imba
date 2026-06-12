import * as fs from 'node:fs';
import { compileImba } from './compiler';

export interface WarmOptions {
	/** files compiled per chunk before yielding the event loop */
	chunkSize?: number;
	/** pause between chunks, ms */
	chunkDelay?: number;
}

/**
 * G1: pre-compile project .imba files into the G2 content-hash cache so the
 * sync compile on Volar's createVirtualCode path (which cannot be moved off
 * the critical path) hits a warm cache instead of cold-compiling on first
 * interaction. Runs in small chunks to stay off the server's hot path.
 */
export async function warmImbaCompileCache(fileNames: string[], options?: WarmOptions): Promise<number> {
	const chunkSize = options?.chunkSize ?? 4;
	const chunkDelay = options?.chunkDelay ?? 10;
	let warmed = 0;

	for (let i = 0; i < fileNames.length; i += chunkSize) {
		for (const fileName of fileNames.slice(i, i + chunkSize)) {
			try {
				const source = fs.readFileSync(fileName, 'utf8');
				compileImba(fileName, source);
				warmed++;
			} catch {
				// unreadable file — nothing to warm
			}
		}
		if (i + chunkSize < fileNames.length) {
			await new Promise(resolve => setTimeout(resolve, chunkDelay));
		}
	}
	return warmed;
}
