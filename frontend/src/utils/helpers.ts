function getNumberFromPx(px: string | number): number {
	if (!px) {
		return 0;
	}
	if (typeof px === "number") {
		return px;
	}
	return Number(px.replace("px", ""));
}

function addPxToNumber(number: number, round: boolean = true): string {
	number = round ? Math.round(number) : number;
	return `${number}px`;
}

function HexToHSV(color: HashString): { h: number; s: number; v: number } {
	const [r, g, b] = color
		.replace("#", "")
		.match(/.{1,2}/g)
		?.map((x) => parseInt(x, 16)) || [0, 0, 0];

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const v = max / 255;
	const d = max - min;
	const s = max === 0 ? 0 : d / max;
	const h =
		max === min
			? 0
			: max === r
			? (g - b) / d + (g < b ? 6 : 0)
			: max === g
			? (b - r) / d + 2
			: (r - g) / d + 4;
	return { h: h * 60, s, v };
}

function HSVToHex(h: number, s: number, v: number): HashString {
	s /= 100;
	v /= 100;
	h /= 360;

	let r = 0,
		g = 0,
		b = 0;

	let i = Math.floor(h * 6);
	let f = h * 6 - i;
	let p = v * (1 - s);
	let q = v * (1 - f * s);
	let t = v * (1 - (1 - f) * s);

	switch (i % 6) {
		case 0:
			(r = v), (g = t), (b = p);
			break;
		case 1:
			(r = q), (g = v), (b = p);
			break;
		case 2:
			(r = p), (g = v), (b = t);
			break;
		case 3:
			(r = p), (g = q), (b = v);
			break;
		case 4:
			(r = t), (g = p), (b = v);
			break;
		case 5:
			(r = v), (g = p), (b = q);
			break;
	}
	r = Math.round(r * 255);
	g = Math.round(g * 255);
	b = Math.round(b * 255);
	return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

function getRandomColor() {
	// return pastel light color
	return `hsl(${Math.floor(Math.random() * 360)}, 40%, 80%)`;
}

async function confirm(message: string): Promise<boolean> {
	return new Promise((resolve) => {
		const confirmed = window.confirm(message);
		resolve(confirmed);
	});
};

export { getNumberFromPx, HexToHSV, HSVToHex, addPxToNumber, getRandomColor, confirm };
