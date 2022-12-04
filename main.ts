import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
import { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import TurndownService from "npm:turndown@7.1.1";

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

await main.parse(Deno.args)

async function getInput(options: { day: number; year: number; }) {
	const { year, day } = options;

	const dayStr = day < 10 ? `0${day}` : day.toString();

	try {
		console.log("Fetching input...\n")
		const res = await fetch(`https://adventofcode.com/${year}/day/${day}/input`, { headers: { cookie: "session=" + config({ safe: true })["AUTH_COOKIE"] } });

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
	const { year, day } = options;
	const dayStr = day < 10 ? `0${day}` : day.toString();

	try {
		const module = ((await import(`./${year}/${dayStr}/index.ts`)).default) as Challenge;
		console.log("Parsing input...");

		const input = await Deno.readTextFile(`./${year}/${dayStr}/input.txt`)
		await module.parseInput(input);

		console.log();

		console.log("Phase 1:", await module.phaseOne());
		console.log("Phase 2:", await module.phaseTwo());
	} catch (error) {
		console.error("An error occurred:");
		console.error(error);
	}
}

async function getChallengeText(options: { day: number; year: number; }) {
	console.log("Fetching first challenge text...\n")

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