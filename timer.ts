import { writeLine, clearLine } from "https://deno.land/x/spinners@v1.1.2/util.ts";

class Timer {
	private timeoutRef?: number;
	private text: string;
	private pastElapsed = 0;
	private lastStartTime = 0;
	private isPaused = true;
	private textEncoder = new TextEncoder();

	constructor() {
		this.text = "Elapsed";
	}

	start(text?: string) {
		if (text)
			this.text = text;

		this.isPaused = false;
		this.lastStartTime = new Date().getTime();
		return this;
	}

	pause() {
		this.pastElapsed = new Date().getTime() - this.lastStartTime!;
		this.lastStartTime = 0;
		this.isPaused = true;
		return this;
	}

	stop() {
		this.pause();
		this.hide();
		clearLine(Deno.stdout, this.textEncoder);
		return this;
	}

	show() {
		this.timeoutRef = setInterval(() => {
			this.render();
		}, 250);
		return this;
	}

	hide() {
		clearInterval(this.timeoutRef);
		return this;
	}

	render() {
		writeLine(
			Deno.stdout,
			this.textEncoder,
			this.toString()
		);
		return this;
	}

	toString() {
		let str = `${this.text}: ${this.formatElapsed()}`;

		if (this.isPaused) str += " PAUSED";

		return str;
	}

	formatElapsed() {
		return formatMillis(this.getElapsed());
	}

	getElapsed() {
		let elapsed = this.pastElapsed;

		if (this.lastStartTime != 0)
			elapsed += new Date().getTime() - this.lastStartTime!;

		return elapsed;
	}
}

function 	formatMillis(millis: number) {
	let elapsed = millis;

	const hours = Math.floor(elapsed / (1000 * 60 * 60));
	elapsed -= hours * (1000 * 60 * 60);

	const mins = Math.floor(elapsed / (1000 * 60));
	elapsed -= mins * (1000 * 60);

	const seconds = Math.floor(elapsed / (1000));
	elapsed -= seconds * (1000);

	const arr: string[] = [];
	arr.push(hours < 10 ? `0${hours}` : hours.toString());
	arr.push(mins < 10 ? `0${mins}` : mins.toString());
	arr.push(seconds < 10 ? `0${seconds}` : seconds.toString());

	return arr.join(":");
}

export { Timer, formatMillis };