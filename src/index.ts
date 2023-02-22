import { Canvas, Image, loadImage } from "canvas";
import * as fs from "fs";
import { fillCanvas, fillCanvasRegion, fillNewCanvas } from "image-filler";
import { animateSines, animateSinesFrames, drawSine, FillMode, SineWave } from "layered-sine";
import { encode } from "upng-js";

const FPS = 12;

var canvas = new Canvas(1080, 1080, "image");
var ctx = canvas.getContext("2d");
ctx.fillStyle = "#dbdbdb";
ctx.fillRect(0, 0, canvas.width, canvas.height);
const grassWave = new SineWave(-20, canvas.width * 3 / 4, 1, Math.random() * Math.PI / 2, canvas.height / 2);
grassWave.fill = FillMode.DOWN;
grassWave.color = 0xd2ed94;
canvas = drawSine(grassWave, canvas);

const cloudbbg = new SineWave(20, 400, 5, Math.random() * Math.PI, 400);
cloudbbg.fill = FillMode.UP;
cloudbbg.color = 0xc5c5c5;
const cloudbg = new SineWave(25, 500, 4, Math.random() * Math.PI, 300);
cloudbg.fill = FillMode.UP;
cloudbg.color = 0xafafaf;
const cloudfg = new SineWave(25, 400, 2.5, Math.random() * Math.PI, 175);
cloudfg.fill = FillMode.UP;
cloudfg.color = 0x9d9d9d;
const cloudffg = new SineWave(30, 300, 2, Math.random() * Math.PI, 60);
cloudffg.fill = FillMode.UP;
cloudffg.color = 0x898989;

//const amount = animateSinesFrames([cloudbbg, cloudbg, cloudfg, cloudffg], canvas, FPS, __dirname + "/../assets/generated");
const amount = 240;
//fs.writeFileSync(__dirname + "/../generated.png", Buffer.from(animateSines([cloudbbg, cloudbg, cloudfg, cloudffg], canvas, FPS)));

(async () => {
	const inkling = await loadImage(__dirname + "/../assets/inkling.png");
	const inkling1 = await loadImage(__dirname + "/../assets/inkling_1.png");
	const inkling2 = await loadImage(__dirname + "/../assets/inkling_2.png");
	const mapping = [inkling, inkling, inkling2, inkling1, inkling1, inkling2];
	const fog = await loadImage(__dirname + "/../assets/fog.png");

	const frames: ArrayBuffer[] = [];
	for (let ii = 0; ii < amount; ii++) {
		const image = await loadImage(__dirname + `/../assets/generated/frame-${ii}.png`);

		var canvas = new Canvas(1080, 1080, "image");
		const ctx = canvas.getContext("2d");
		ctx.drawImage(image, 0, 0);
		ctx.drawImage(mapping[Math.floor(ii / 8) % 6], 0, 0);
		ctx.globalAlpha = 0.25;
		ctx.drawImage(fog, 0, 0);
		ctx.globalAlpha = 1;

		const offset = (19 - ii % 20) * 4;
		const rain = await fillCanvasRegion(__dirname + "/../assets/raindrop.png", new Canvas(1080, 1080, "image"), { x: -offset, y: -offset * 2 }, { x: canvas.width + offset, y: canvas.height + offset * 2 }, { x: 4, y: 4 }, 6);
		const rainCrop = new Canvas(1080, 1080, "image");
		const rainCtx = rainCrop.getContext("2d");
		// Also used as a mask
		rainCtx.drawImage(fog, 0, 0);
		rainCtx.globalCompositeOperation = "source-in";
		rainCtx.drawImage(rain, 0, 0);

		ctx.drawImage(rainCrop, 0, 0);

		frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
	}

	fs.writeFileSync(__dirname + "/../assets/product.png", Buffer.from(encode(frames, 1080, 1080, 0, Array(frames.length).fill(1000 / FPS))));
})();