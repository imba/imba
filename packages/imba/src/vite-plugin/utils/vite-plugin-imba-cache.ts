import { ImbaRequest } from './id';
import { Code, CompileData } from './compile';

export class VitePluginImbaCache {
	private _css = new Map<string, Code>();
	private _js = new Map<string, Code>();
	private _dependencies = new Map<string, string[]>();
	private _dependants = new Map<string, Set<string>>();
	private _resolvedImbaFields = new Map<string, string>();
	private _errors = new Map<string, any>();

	public update(compileData: CompileData) {
		this._errors.delete(compileData.normalizedFilename);
		this.updateCSS(compileData);
		this.updateJS(compileData);
		this.updateDependencies(compileData);
	}

	public has(imbaRequest: ImbaRequest) {
		const id = imbaRequest.normalizedFilename;
		return this._errors.has(id) || this._js.has(id) || this._css.has(id);
	}

	public setError(imbaRequest: ImbaRequest, error: any) {
		// keep dependency info, otherwise errors in dependants would not trigger an update after fixing
		// because they are no longer watched
		this.remove(imbaRequest, true);
		this._errors.set(imbaRequest.normalizedFilename, error);
	}

	private updateCSS(compileData: CompileData) {
		this._css.set(compileData.normalizedFilename, compileData.compiled.css);
	}

	private updateJS(compileData: CompileData) {
		if (!compileData.ssr) {
			// do not cache SSR js
			this._js.set(compileData.normalizedFilename, compileData.compiled.js);
		}
	}

	private updateDependencies(compileData: CompileData) {
		const id = compileData.normalizedFilename;
		const prevDependencies = this._dependencies.get(id) || [];
		const dependencies = compileData.dependencies;
		this._dependencies.set(id, dependencies);
		const removed = prevDependencies.filter((d) => !dependencies.includes(d));
		const added = dependencies.filter((d) => !prevDependencies.includes(d));
		added.forEach((d) => {
			if (!this._dependants.has(d)) {
				this._dependants.set(d, new Set<string>());
			}
			this._dependants.get(d)!.add(compileData.filename);
		});
		removed.forEach((d) => {
			this._dependants.get(d)!.delete(compileData.filename);
		});
	}

	public remove(imbaRequest: ImbaRequest, keepDependencies: boolean = false): boolean {
		const id = imbaRequest.normalizedFilename;
		let removed = false;
		if (this._errors.delete(id)) {
			removed = true;
		}
		if (this._js.delete(id)) {
			removed = true;
		}
		if (this._css.delete(id)) {
			removed = true;
		}
		if (!keepDependencies) {
			const dependencies = this._dependencies.get(id);
			if (dependencies) {
				removed = true;
				dependencies.forEach((d) => {
					const dependants = this._dependants.get(d);
					if (dependants && dependants.has(imbaRequest.filename)) {
						dependants.delete(imbaRequest.filename);
					}
				});
				this._dependencies.delete(id);
			}
		}

		return removed;
	}

	public getCSS(imbaRequest: ImbaRequest) {
		return this._css.get(imbaRequest.normalizedFilename);
	}

	public getJS(imbaRequest: ImbaRequest) {
		if (!imbaRequest.ssr) {
			// SSR js isn't cached
			return this._js.get(imbaRequest.normalizedFilename);
		}
	}

	public getError(imbaRequest: ImbaRequest) {
		return this._errors.get(imbaRequest.normalizedFilename);
	}

	public getDependants(path: string): string[] {
		const dependants = this._dependants.get(path);
		return dependants ? [...dependants] : [];
	}

	public getResolvedImbaField(name: string, importer?: string): string | void {
		return this._resolvedImbaFields.get(this._getResolvedImbaFieldKey(name, importer));
	}

	public setResolvedImbaField(
		importee: string,
		importer: string | undefined = undefined,
		resolvedImba: string
	) {
		this._resolvedImbaFields.set(
			this._getResolvedImbaFieldKey(importee, importer),
			resolvedImba
		);
	}

	private _getResolvedImbaFieldKey(importee: string, importer?: string): string {
		return importer ? `${importer} > ${importee}` : importee;
	}
}
