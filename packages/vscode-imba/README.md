# Imba VSCode Plugin

This extension provides syntax highlighting, intellisense, go to definition, and hinting.

## Installation

1. Install the Imba extension through VSCode

1. Install imba and typescript@4.9 globally:

	```
	npm i -g imba typescript@4.9
	```

1. Update `settings.json` depending on your OS:

	MacOS:
	```json
	{
			"typescript.tsdk": "/usr/local/lib/node_modules/typescript/lib/"
	}
	```
	Windows:
	```json
	{
			"typescript.tsdk": "c:\\Users\\{User Name}\\AppData\\Roaming\\npm\\node_modules\\typescript\\lib"
	}
	```
	Linux:
	```json
	{
			"typescript.tsdk": "/usr/lib/node_modules/typescript/lib/"
	}
	```
