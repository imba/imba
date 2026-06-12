import * as fs from 'node:fs';
import * as path from 'node:path';

// The "ultrafast approximation path" for tag completions: a regex scan over
// workspace .imba files. No compiling, no checker, no export-info crawl (the
// old plugin's getExportedTags rode getExportInfoMap — its slowest completion
// path — and TS can never see tags in files nothing imports yet).

export interface WorkspaceTag {
	name: string;
	fileName: string;
	/** offset of the tag name within the declaring file */
	offset: number;
	/** `global tag` — web component, usable without import */
	global: boolean;
	/** `export tag` — importable */
	exported: boolean;
}

const sharedIndexes = new Map<string, ImbaTagIndex>();

/** one index per workspace-roots set — shared across service plugins */
export function getTagIndex(roots: string[]): ImbaTagIndex {
	const key = [...roots].sort().join('|');
	let index = sharedIndexes.get(key);
	if (!index) {
		index = new ImbaTagIndex(roots);
		sharedIndexes.set(key, index);
	}
	return index;
}

const TAG_DECL = /^[ \t]*(export[ \t]+)?(global[ \t]+)?tag[ \t]+([A-Za-z][\w-]*)/;
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.imba-cache']);
const WALK_THROTTLE_MS = 2000;

export class ImbaTagIndex {
	#byFile = new Map<string, WorkspaceTag[]>();
	#mtimes = new Map<string, number>();
	#lastWalk = 0;
	#files: string[] = [];

	constructor(private readonly roots: string[]) {}

	refresh(): void {
		const now = Date.now();
		if (now - this.#lastWalk >= WALK_THROTTLE_MS) {
			this.#lastWalk = now;
			this.#files = [];
			for (const root of this.roots) {
				this.#walk(root);
			}
			// drop entries for deleted files
			const live = new Set(this.#files);
			for (const file of [...this.#byFile.keys()]) {
				if (!live.has(file)) {
					this.#byFile.delete(file);
					this.#mtimes.delete(file);
				}
			}
		}
		for (const file of this.#files) {
			this.#scan(file);
		}
	}

	get tags(): WorkspaceTag[] {
		return [...this.#byFile.values()].flat();
	}

	#walk(dir: string, depth = 0): void {
		if (depth > 8) {
			return;
		}
		let entries: fs.Dirent[];
		try {
			entries = fs.readdirSync(dir, { withFileTypes: true });
		} catch {
			return;
		}
		for (const entry of entries) {
			if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) {
				continue;
			}
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				this.#walk(full, depth + 1);
			} else if (entry.name.endsWith('.imba')) {
				this.#files.push(full);
			}
		}
	}

	#scan(file: string): void {
		let mtime: number;
		try {
			mtime = fs.statSync(file).mtimeMs;
		} catch {
			this.#byFile.delete(file);
			this.#mtimes.delete(file);
			return;
		}
		if (this.#mtimes.get(file) === mtime) {
			return;
		}
		this.#mtimes.set(file, mtime);
		let source: string;
		try {
			source = fs.readFileSync(file, 'utf8');
		} catch {
			return;
		}
		const tags: WorkspaceTag[] = [];
		let lineStart = 0;
		for (const line of source.split('\n')) {
			const m = TAG_DECL.exec(line);
			if (m) {
				tags.push({
					name: m[3],
					fileName: file,
					offset: lineStart + line.indexOf(m[3], m[0].length - m[3].length),
					global: !!m[2],
					exported: !!m[1],
				});
			}
			lineStart += line.length + 1;
		}
		this.#byFile.set(file, tags);
	}
}
