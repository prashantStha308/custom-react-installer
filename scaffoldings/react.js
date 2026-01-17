import fs from 'node:fs/promises';
import * as cp from "child_process";
import { promisify } from "node:util";

const execAsync = promisify(cp.exec);

/*
	Steps:

	1. cd to provided path.
	2. run "pnpm create vite@latest projectName -- --template react "
	3. cd porjectName

	4. cd src
	5. rm assets App.css
	6. mkdir app UI UI/Components UI/Navbar UI/Buttons home home/Components home/store

	7. modify vite.config.js to include tailwindcss import and add it to plugins
	8. modify textContent of App.jsx and index.css
	9. touch app/AppContent.js, app/app.routes.js, home/HomeLayout.jsx
	10. Add text contents to AppContent.jsx, app.routes.js and HomeLayout.jsx


	11. Execute pnpm i
	12. Execute pnpm add react-router-dom axios zustand tailwindcss @tailwindcss/vite\
	13. Execute npm run dev

*/

const fileContents = {
	"vite.config.js" : {
		"contents": `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
})
		`,
		pathFromSrc:"../vite.config.js"
	},
	"index.css":{
		contents: "@import 'tailwindcss';",
		pathFromSrc:"./index.css"
	},
	"App.jsx":{
		contents:`import { BrowserRouter } from 'react-router-dom';
import AppContent from './app/AppContent.jsx';

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App;
		`,
		pathFromSrc:"./App.jsx"
	},
	"app.routes.jsx":{
		contents:`import {Routes, Route} from 'react-router-dom';
import HomeLayout from "../home/HomeLayout.jsx";

export default function AppRoutes(){
	return(
		<Routes>
			<Route path="/" element={<HomeLayout />} />
		</Routes>
	)
}
		`,
		pathFromSrc:"./app/app.routes.js"
	},
	"AppContent.jsx":{
		contents:`import AppRoutes from "./app.routes.jsx"

export default function AppContent(){
	return(
		<main className="min-h-screen flex flex-col gap-2" >
			
			<header></header>

			<div>
				<AppRoutes />
			</div>

			<footer></footer>

		</main>
	)
}
		`,
		pathFromSrc:"./app/AppContent.jsx"
	},
	"HomeLayout.jsx":{
		contents:`export default function HomeLayout(){
	return(
		<>
			HomeLayout
		</>
	)
}
		`,
		pathFromSrc:"./home/HomeLayout.jsx"
	}
}

async function initProject(path, projectName){
	try{

		await fs.mkdir(path, { recursive: true });
		process.chdir(path);
		
		const child = cp.spawn('pnpm', ['create', 'vite@latest', projectName, '--template', 'react'], {
			stdio: ['pipe', 'inherit', 'inherit']
		});
				
		await new Promise((resolve, reject) => {
			child.on('close', (code) => {
				if (code !== 0) {
					reject(new Error(`Process exited with code ${code}`));
				} else {
					resolve();
				}
			});
			child.on('error', reject);
		});
		
		if(projectName !== '.'){
			process.chdir(projectName);
		}

		
	} catch(err) {
		console.error('Error:', err.message);
		process.exit(1);
	}
}

async function modifyFolderStruct(){
	process.chdir('./src');

	// Promises to create folders 
	const dirPromises = ['app', 'UI', 'UI/Components','UI/Navbar', 'home', 'home/Components', 'home/store'].map(item => fs.mkdir(item))

	await Promise.allSettled([
		fs.rm('assets', {recursive: true}),
		fs.unlink('./App.css'),
		...dirPromises
	]);

	console.log("Modified Folder structure");
}

async function modifyFileContents (){
	try{
		const filePromises = Object.keys(fileContents).map(key => 
			fs.writeFile(fileContents[key].pathFromSrc, fileContents[key].contents)
		);
		
		const results = await Promise.allSettled(filePromises);
		
		// Check for any failures
		const failures = results.filter(r => r.status === 'rejected');
		if(failures.length > 0){
			console.error('Some files failed to write:', failures);
		}

		console.log("Modified File Contents");
		
	}catch(err){
		console.log(err);
		process.exit(1);
	}
}

async function installDependencies(){
	try{
		// go outside src
		process.chdir("..")

		await execAsync("pnpm i");
		await execAsync("pnpm add react-router-dom axios zustand tailwindcss @tailwindcss/vite");

	}catch(err){
		console.log(err);
		process.exit(1);
	}
}

export default async function scaffoldReact(path, projectName){
	console.log(`Scaffolding React project: ${projectName} on ${path}`)

	try{
		if(!path || !projectName){
			throw new Error("--path and --name cannot be undefined")
		}

		await initProject(path, projectName);
		console.log("initProject succeeded");
		
		await modifyFolderStruct();
		console.log("modifyFolderStruct succeeded");
		
		await modifyFileContents();
		console.log("modifyFileContents succeeded");
		
		await installDependencies();
		console.log(" Installin Dependencies");

	}catch(err){
		console.error(err);
		process.exit(1);
	}
}