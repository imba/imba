/* eslint-disable no-unused-vars */
import { createFilter } from '@rollup/pluginutils';
import { Arrayable, ResolvedOptions } from './options';
import { normalizePath } from 'vite';
import * as fs from 'fs';

const VITE_FS_PREFIX = '/@fs/';
const IS_WINDOWS = process.platform === 'win32';

export type ImbaQueryTypes = 'style' | 'script';

export interface RequestQuery {
	// our own
	imba?: boolean;
	type?: ImbaQueryTypes;
	// vite specific
	url?: boolean;
	raw?: boolean;
}

export interface ImbaRequest {
	id: string;
	cssId: string;
	filename: string;
	normalizedFilename: string;
	query: RequestQuery;
	timestamp: number;
	ssr: boolean;
}

function splitId(id: string) {
	const parts = id.split(`?`, 2);
	const filename = parts[0];
	const rawQuery = parts[1];
	return { filename, rawQuery };
}

function parseToImbaRequest(
	id: string,
	filename: string,
	rawQuery: string,
	root: string,
	timestamp: number,
	ssr: boolean
): ImbaRequest | undefined {
	const query = parseRequestQuery(rawQuery);
	if (query.url || query.raw) {
		// skip requests with special vite tags
		return;
	}
	const normalizedFilename = normalize(filename, root);
	const cssId = createVirtualImportId(filename, root, 'style');

	return {
		id,
		filename,
		normalizedFilename,
		cssId,
		query,
		timestamp,
		ssr
	};
}

function createVirtualImportId(filename: string, root: string, type: ImbaQueryTypes) {
	const parts = ['imba', `type=${type}`];
	if (type === 'style') {
		parts.push('lang.css');
	}
	if (existsInRoot(filename, root)) {
		filename = root + filename;
	} else if (filename.startsWith(VITE_FS_PREFIX)) {
		filename = IS_WINDOWS
			? filename.slice(VITE_FS_PREFIX.length) // remove /@fs/ from /@fs/C:/...
			: filename.slice(VITE_FS_PREFIX.length - 1); // remove /@fs from /@fs/home/user
	}
	// return same virtual id format as vite-plugin-vue eg ...App.imba?imba&type=style&lang.css
	return `${filename}?${parts.join('&')}`;
}

function parseRequestQuery(rawQuery: string): RequestQuery {
	const query = Object.fromEntries(new URLSearchParams(rawQuery));
	for (const key in query) {
		if (query[key] === '') {
			// @ts-ignore
			query[key] = true;
		}
	}
	return query as RequestQuery;
}

/**
 * posixify and remove root at start
 *
 * @param filename
 * @param normalizedRoot
 */
export function normalize(filename: string, normalizedRoot: string) {
	return stripRoot(normalizePath(filename), normalizedRoot);
}

function existsInRoot(filename: string, root: string) {
	if (filename.startsWith(VITE_FS_PREFIX)) {
		return false; // vite already tagged it as out of root
	}
	return fs.existsSync(root + filename);
}

function stripRoot(normalizedFilename: string, normalizedRoot: string) {
	return normalizedFilename.startsWith(normalizedRoot + '/')
		? normalizedFilename.slice(normalizedRoot.length)
		: normalizedFilename;
}

function buildFilter(
	include: Arrayable<string> | undefined,
	exclude: Arrayable<string> | undefined,
	extensions: string[]
): (filename: string) => boolean {
	const rollupFilter = createFilter(include, exclude);
	return (filename) => rollupFilter(filename) && extensions.some((ext) => filename.endsWith(ext));
}

export type IdParser = (id: string, ssr: boolean, timestamp?: number) => ImbaRequest | undefined;
export function buildIdParser(options: ResolvedOptions): IdParser {
	const { include, exclude, extensions, root } = options;
	const normalizedRoot = normalizePath(root);
	const filter = buildFilter(include, exclude, extensions!);
	return (id, ssr, timestamp = Date.now()) => {
		const { filename, rawQuery } = splitId(id);
		if (filter(filename)) {
			return parseToImbaRequest(id, filename, rawQuery, normalizedRoot, timestamp, ssr);
		}
	};
}
