// Year 2022 Day 06

let stream: string;

async function parseInput(input: string): Promise<void> {
	stream = input.split('\n')[0];
}

function charDoesNotRepeatInString(str: string) {
	let ok = true;
	let index = 0;

	while (ok && index < str.length) {
		ok = str.indexOf(str[index]) === str.lastIndexOf(str[index]);
		index++;
	}

	return ok;
}

async function phaseOne(): Promise<string | void> {
	let markerPosition = 0;
	for (let i = 0; i < stream.length - 3; i++) {
		const marker = stream.slice(i, i + 4);

		if (charDoesNotRepeatInString(marker)) {
			markerPosition = i;
			break;
		}
	}

	console.log(stream.slice(markerPosition, markerPosition + 10));
	return (markerPosition + 4).toString();
}

async function phaseTwo(): Promise<string | void> {
	let markerPosition = 0;

	for (let i = 0; i < stream.length - 13; i++) {
		const marker = stream.slice(i, i + 14);

		if (charDoesNotRepeatInString(marker)) {
			markerPosition = i;
			break;
		}
	}

	return (markerPosition + 14).toString();
}

export default {
	parseInput,
	phaseOne,
	phaseTwo
};
