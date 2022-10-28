import {setupVite as imba_setupVite, createElement as imba_createElement, getRenderContext as imba_getRenderContext, createComponent as imba_createComponent} from 'imba';
var $5 = Symbol(), $16 = Symbol();
const $$up$ = Symbol.for('##up'), $afterVisit$ = Symbol.for('#afterVisit'), $appendChild$ = Symbol.for('#appendChild');

/*body*/
import path from "path";
import express from "express";
import compression from "compression";
import serveStatic from "serve-static";
import App from './src/App.imba';
import np from 'node:path';
import url from 'node:url';
import $1 from '*?css';
import $2 from 'src/main.js?web';

const __dirname = url.fileURLToPath(new URL('.',import.meta.url));;
let port = 3000;
const args = process.argv.slice(2);
const portArgPos = args.indexOf("--port") + 1;
if (portArgPos > 0) {
	
	port = parseInt(args[portArgPos],10);
};

async function createServer(root = process.cwd()){
	
	const resolve = function(p) { return path.resolve(root,p); };
	const app = express();
	await imba_setupVite(app,{port: port,root: root},function(prodServer,{distPath: distPath}) {
		
		prodServer.use(compression());
		return prodServer.use(serveStatic(distPath,{index: false}));
	});
	app.use("*",function(req,res) {
		var $3, $4 = imba_getRenderContext(), $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $17, $18;
		
		let html = (($6=$7=1,$3=$4[$5]) || ($6=$7=0,$3=$4[$5]=$3=imba_createElement('html',null,null,null)),
		$6 || ($3[$$up$]=$4._),
		$6 || ($3.lang="en"),
		($6 || ($8=imba_createElement('head',$3,null,null)),
		($6 || ($9=imba_createElement('meta',$8,null,null)),
		$6 || ($9.charset="UTF-8")),
		($6 || ($10=imba_createElement('meta',$8,null,null)),
		$6 || ($10.name="viewport"),
		$6 || ($10.content="width=device-width, initial-scale=1.0")),
		($6 || ($11=imba_createElement('title',$8,null,"Imba App"))),
		($6 || ($12=imba_createElement('style',$8,null,null)),
		$6 || ($12.src=$1)),
		($6 || ($13=imba_createElement('script',$8,null,null)),
		$6 || ($13.type="module"),
		$6 || ($13.src=$2))),
		($6 || ($14=imba_createElement('body',$3,null,null)),
		(()=>{($17=$18=1,$15=$3[$16]) || ($17=$18=0,$3[$16]=$15=imba_createComponent(App,$14,null,null));
		$17 || !$15.setup || $15.setup($18);
		$15[$afterVisit$]($18);
		$17 || $14[$appendChild$]($15);
		;})()),
		$3);
		return res.status(200).set({"Content-Type": "text/html"}).end(String(html));
	});
	return app;
};

const app = await createServer();
console.log("server created");
const server = app.listen(port,function() { return console.log(("http://localhost:" + port)); });
const exitProcess = async function() {
	
	console.log("exiting process");
	process.off("SIGTERM",exitProcess);
	process.off("SIGINT",exitProcess);
	process.stdin.off("end",exitProcess);
	try {
		return await server.close(function() { return console.log("server closed"); });
	} finally {
		process.exit(0);
	};
};

process.once("SIGTERM",exitProcess);
process.once("SIGINT",exitProcess);
process.stdin.on("end",exitProcess);

