import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
import { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";
import { TerminalSpinner } from "https://deno.land/x/spinners@v1.1.2/mod.ts";
import TurndownService from "npm:turndown@7.1.1";
import { Timer, formatMillis } from "./timer.ts";
import { hideCursor, showCursor } from "https://deno.land/x/spinners@v1.1.2/util.ts";
import { open } from "https://deno.land/x/open@v0.0.5/index.ts";

interface Challenge {
	parseInput: (input: string) => Promise<void>;
	phaseOne: () => Promise<string | void>;
	phaseTwo: () => Promise<string | void>;
}

const getInputCommand = new Command()
	.description("Downloads the input of a challenge, defaults to today challenge")
	.option("-d, --day <day:number>", "The day", {
		default: new Date().getDate() > 25 ? 25 : new Date().getDate(),
	})
	.option("-y, --year <year:number>", "The year", {
		default: new Date().getFullYear()
	})
	.action(getInput)

const setupCommand = new Command()
	.description("Setups the directory for a challenge")
	.option("-d, --day <day:number>", "The day", {
		default: new Date().getDate() > 25 ? 25 : new Date().getDate(),
	})
	.option("-y, --year <year:number>", "The year", {
		default: new Date().getFullYear()
	})
	.action(setup)

const runCommand = new Command()
	.description("Runs a challenge")
	.option("-d, --day <day:number>", "The day", {
		default: new Date().getDate() > 25 ? 25 : new Date().getDate(),
	})
	.option("-y, --year <year:number>", "The year", {
		default: new Date().getFullYear()
	})
	.action(run)

const startCommand = new Command()
	.description("Starts a challenge in interactive mode with a timer")
	.option("-d, --day <day:number>", "The day", {
		default: new Date().getDate() > 25 ? 25 : new Date().getDate(),
	})
	.option("-y, --year <year:number>", "The year", {
		default: new Date().getFullYear()
	})
	.action(start)

const main = new Command()
	.name("aoc")
	.description("Advent of Code cli")
	.version("0.1")
	.action(() => {
		main.showHelp();
	})

	.command("get-input", getInputCommand)
	.command("setup", setupCommand)
	.command("run", runCommand)
	.command("start", startCommand)

await main.parse(Deno.args)

async function getInput(options: { day: number; year: number; }) {
	const { year, day } = options;

	const dayStr = day < 10 ? `0${day}` : day.toString();

	try {
		const inputFetchSpinner = new TerminalSpinner("Fetching input...");
		inputFetchSpinner.start();
		const res = await fetch(`https://adventofcode.com/${year}/day/${day}/input`, { headers: { cookie: "session=" + config({ safe: true })["AUTH_COOKIE"] } });
		inputFetchSpinner.succeed("Fetched input");

		await Deno.mkdir(`./${year}/${dayStr}`, { recursive: true })

		const file = await Deno.open(`./${year}/${dayStr}/input.txt`, { create: true, write: true })

		await res.body?.pipeTo(file.writable);
		try {
			file.close();
		} catch (error) {
			if (!(error instanceof Deno.errors.BadResource))
				throw error;
		}
	} catch (error) {
		console.error("An error occurred!")
		console.error(error);
	}
}

async function setup(options: { year: number; day: number; }) {
	const { year, day } = options;
	const dayStr = day < 10 ? `0${day}` : day.toString();

	await getInput(options);
	await getChallengeText(options);

	const codeFile = `./${year}/${dayStr}/index.ts`;

	try {
		await Deno.stat(codeFile);
	} catch {
		// File does not exists, create it
		const template = await Deno.readTextFile("./templates/challenge.ts");
		const code = template.replaceAll("__day", dayStr).replaceAll("__year", year.toString());

		await Deno.writeTextFile(codeFile, code);
	}
}

async function run(options: { year: number; day: number; }) {
	try {
		const res = await runCode(options);
		console.log();

		console.log("Phase 1:", res[0]);
		console.log("Phase 2:", res[1]);
	} catch (error) {
		console.error("An error occurred:");
		console.error(error);
	}
}

async function runCode(options: { year: number; day: number; }): Promise<[string | void, string | void]> {
	const { year, day } = options;
	const dayStr = day < 10 ? `0${day}` : day.toString();

	const module = ((await import(`./${year}/${dayStr}/index.ts?version=${new Date().getTime()}`)).default) as Challenge;
	console.log("Parsing input...");

	const input = await Deno.readTextFile(`./${year}/${dayStr}/input.txt`);
	await module.parseInput(input);

	const p1 = await module.phaseOne();
	const p2 = await module.phaseTwo();
	
	return [p1, p2]
}

async function getChallengeText(options: { day: number; year: number; }) {
	console.log("Fetching challenge text...\n")

	const { year, day } = options;
	const dayStr = day < 10 ? `0${day}` : day.toString();

	const [mdPhaseOne, mdPhaseTwo] = await fetchChallengeText(day, year)

	if (mdPhaseOne)
		await Deno.writeTextFile(`./${year}/${dayStr}/one.md`, mdPhaseOne);

	if (mdPhaseTwo)
		await Deno.writeTextFile(`./${year}/${dayStr}/two.md`, mdPhaseTwo);
}

async function fetchChallengeText(day: number, year: number): Promise<(string | undefined)[]> {
	const res = await fetch(`https://adventofcode.com/${year}/day/${day}`, { headers: { cookie: "session=" + config({ safe: true })["AUTH_COOKIE"] } });
	const html = await res.text();

	const articles = new DOMParser().parseFromString(html, "text/html")?.querySelectorAll("article");

	if (!articles) {
		console.log("Could not read challenge text")
		return [undefined, undefined];
	}

	if (articles.length == 0) return [undefined, undefined];

	const tds = new TurndownService();

	const firstChallenge = tds.turndown(articles[0]);
	const secondChallenge = articles.length > 1 ? tds.turndown(articles[1]) : undefined;

	return [firstChallenge, secondChallenge];
}

async function start(options: { year: number; day: number; }) {
	let codeRan = false;
	let phaseOneResult = undefined;
	let phaseTwoResult = undefined;

	let firstChallengeCompleted = -1;
	let secondChallengeCompleted = -1;

	await setup(options);

	const t = new Timer().start("Timer").show();

	let userInput = "";

	while (firstChallengeCompleted === -1 || secondChallengeCompleted === -1) {
		t.hide();
		console.clear();
		hideCursor(Deno.stdout, new TextEncoder());
		printStartScreen(options, userInput);

		if (userInput === "r") {
			try {
				const [p1, p2] = await runCode(options);
				phaseOneResult = p1;
				phaseTwoResult = p2;
				codeRan = true;
				console.log();
			} catch (error) {
				console.error("An error occurred:");
				console.error(error);
			}
		} else if (userInput === "o") {
			open(`https://adventofcode.com/${options.year}/day/${options.day}`);
		} else if (userInput === "f") {
			await getChallengeText(options);
		} else if (userInput === "1") {
			if (phaseOneResult === undefined) {
				console.log("You need to run your code before submitting the answer");
			} else if (firstChallengeCompleted !== -1) {
				console.log("You already completed the first challenge");
			} else {
				firstChallengeCompleted = t.getElapsed();
				console.log(`You completed the first challenge in ${formatMillis(firstChallengeCompleted)}`);
			}
		} else if (userInput === "2") {
			if (firstChallengeCompleted === -1) {
				console.log("You need to complete the first challenge before marking the second one as completed")
			} else if (phaseOneResult === undefined) {
				console.log("You need to return the answer");
			} else if (secondChallengeCompleted !== -1) {
				console.log("You already completed the second challenge");
			} else {
				t.stop();
				secondChallengeCompleted = t.getElapsed() - firstChallengeCompleted;
				break;
			}
		}

		if (codeRan) {
			console.log(`Last run result:\nPhase 1: ${phaseOneResult}\nPhase 2: ${phaseTwoResult}\n`)
		}

		t.show();

		userInput = await readKey();
	}

	console.clear();
	console.log(`Advent of code - Day ${options.day} Year ${options.year}\n\nFirst challenge completed in ${formatMillis(firstChallengeCompleted)}\nSecond challenge completed in ${formatMillis(secondChallengeCompleted)}\nPress any key to exit`);
	showCursor(Deno.stdout, new TextEncoder());
	await readKey();
	Deno.exit(0);
}

function printStartScreen(options: { year: number; day: number; }, input = "") {
	console.log(`Advent of code - Day ${options.day} Year ${options.year}\n`);

	switch (input) {
		case "r":
		case "f":
		case "o":
		case "1":
		case "2":
			break;
		default:
			console.log("Press:\n[o] to open the challenge page\n[f] to re-fetch the challenges text\n[r] to run your code,\n[1] to mark the first challenge as completed,\n[2] to mark the second challenge as completed,\nany other key to show this menu\n");
	}
}

async function readKey() {
	const bufferSize = 16;
	const buf = new Uint8Array(bufferSize);

	let output = "";

	Deno.stdin.setRaw(true)

	const nread = await Deno.stdin.read(buf);

	if (nread === null || (buf && buf[0] === 13)) { // null or enter
		output = "";
	}
	// If you press Ctrl + C, the process will exit.
	else if (buf && buf[0] === 0x03) {
		showCursor(Deno.stdout, new TextEncoder());
		Deno.exit(0);
	}
	else {
		const text = new TextDecoder().decode(buf.subarray(0, nread));
		output = text;
	}

	Deno.stdin.setRaw(false)
	return output;
}
