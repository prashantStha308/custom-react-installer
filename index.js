/*
   -----------------------------------------------------------------------------
   |						 __Current Objective:__   							|
   |										   									|
   |	npm start -- --path=PATH_TO_TARGET_DIR --name=PROJECT_NAME --t=react 	|
   |																			|
   |	OR																		|
   |																			|	
   |	node index.js --p=PATH_TO_TARGET_DIR --name=PROJECT_NAME --t=react		|
   -----------------------------------------------------------------------------
*/

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import scaffoldReact from "./scaffoldings/react.js";
import os from 'os';

const argv = yargs(hideBin(process.argv)).parse();

let path = argv.path;
const projectName = argv.name;
const template = argv.t || "react";

(async () => {
	
	if(!path || !projectName){
		console.log("--path OR --name is not defined");
		process.exit(1);
	}
	
	if (path.startsWith('~')) {
		console.error("Please input relative path: /home/....");
		process.exit(1);
	}

	switch(template){
		case "react":
			await scaffoldReact(path, projectName);
			break;
		default:
			console.error(`No available template: ${template}`);
			process.exit(1);
	}
	})();