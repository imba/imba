const fs = require("fs-extra");
const path = require("path");
const cp = require('child_process');
const root = path.resolve(__dirname, '..')
const rel = function(...params){ return path.resolve(__dirname, "..",...params); }
const nm = function(...params){
	return path.resolve(__dirname, "..", "node_modules", ...params);
}
const dest = rel("node_modules", "typescript-imba-plugin");
const temp = rel("test", "typescript-imba-plugin-linked");


fs.moveSync(dest, temp);
fs.copySync(rel("..", "typescript-imba-plugin"), dest);

try {
    // Now build the plugin with vsce
    cp.execSync("vsce package", { cwd: root });    
} catch (e) {
    console.error("error from vsce", e);
}

fs.rmdirSync(dest, { recursive: true });
fs.moveSync(temp,dest)
