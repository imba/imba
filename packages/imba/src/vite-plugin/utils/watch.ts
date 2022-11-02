import { VitePluginImbaCache } from './vite-plugin-imba-cache';
import fs from 'fs';
import { log } from './log';
import { IdParser } from './id';
import { ResolvedOptions } from './options';
import { knownImbaConfigNames } from './load-imba-config';
import path from 'path';
import { FSWatcher } from 'vite';

export function setupWatchers(
	options: ResolvedOptions,
	cache: VitePluginImbaCache,
	requestParser: IdParser
) {
	const { server, configFile: imbaConfigFile } = options;
	if (!server) {
		return;
	}
	const { watcher, ws } = server;
	const { root, server: serverConfig } = server.config;

	const emitChangeEventOnDependants = (filename: string) => {
		const dependants = cache.getDependants(filename);
		dependants.forEach((dependant) => {
			if (fs.existsSync(dependant)) {
				log.debug(
					`emitting virtual change event for "${dependant}" because depdendency "${filename}" changed`
				);
				watcher.emit('change', dependant);
			}
		});
	};

	const removeUnlinkedFromCache = (filename: string) => {
		const imbaRequest = requestParser(filename, false);
		if (imbaRequest) {
			const removedFromCache = cache.remove(imbaRequest);
			if (removedFromCache) {
				log.debug(`cleared VitePluginImbaCache for deleted file ${filename}`);
			}
		}
	};

	const triggerViteRestart = (filename: string) => {
		if (serverConfig.middlewareMode) {
			// in middlewareMode we can't restart the server automatically
			// show the user an overlay instead
			const message =
				'Imba config change detected, restart your dev process to apply the changes.';
			log.info(message, filename);
			ws.send({
				type: 'error',
				err: { message, stack: '', plugin: 'vite-plugin-imba', id: filename }
			});
		} else {
			log.info(`imba config changed: restarting vite server. - file: ${filename}`);
			server.restart();
		}
	};

	// collection of watcher listeners by event
	const listenerCollection = {
		add: [] as Array<Function>,
		change: [emitChangeEventOnDependants],
		unlink: [removeUnlinkedFromCache, emitChangeEventOnDependants]
	};

	if (imbaConfigFile !== false) {
		// configFile false means we ignore the file and external process is responsible
		const possibleImbaConfigs = knownImbaConfigNames.map((cfg) => path.join(root, cfg));
		const restartOnConfigAdd = (filename: string) => {
			if (possibleImbaConfigs.includes(filename)) {
				triggerViteRestart(filename);
			}
		};

		const restartOnConfigChange = (filename: string) => {
			if (filename === imbaConfigFile) {
				triggerViteRestart(filename);
			}
		};

		if (imbaConfigFile) {
			listenerCollection.change.push(restartOnConfigChange);
			listenerCollection.unlink.push(restartOnConfigChange);
		} else {
			listenerCollection.add.push(restartOnConfigAdd);
		}
	}

	Object.entries(listenerCollection).forEach(([evt, listeners]) => {
		if (listeners.length > 0) {
			watcher.on(evt, (filename) => listeners.forEach((listener) => listener(filename)));
		}
	});
}
// taken from vite utils
export function ensureWatchedFile(watcher: FSWatcher, file: string | null, root: string): void {
	if (
		file &&
		// only need to watch if out of root
		!file.startsWith(root + '/') &&
		// some rollup plugins use null bytes for private resolved Ids
		!file.includes('\0') &&
		fs.existsSync(file)
	) {
		// resolve file to normalized system path
		watcher.add(path.resolve(file));
	}
}
