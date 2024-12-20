enum TestEnum {
	A = "a",
	B = "it works",
	C = "dingus"
}

import {decode} from "blurhash";

const width: number = 3527;
const height: number = 2351;

const pixels: Uint8ClampedArray = decode("UEBfLa^j0L4:pIX8IVaK9aad%Mxum,xD-;o}", width, height);

const canvas: HTMLCanvasElement = document.createElement("canvas");
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
const imageData: ImageData = ctx.createImageData(width, height);

canvas.width = width;
canvas.height = height;

imageData.data.set(pixels);
ctx.putImageData(imageData, 0, 0);

canvas.toBlob((blob: Blob) => {
	const imgElement: HTMLImageElement = document.createElement("img");
	const url: string = URL.createObjectURL(blob);

	imgElement.onload = () => {
		URL.revokeObjectURL(url);
		canvas.remove();
	}

	imgElement.src = url;
	document.body.appendChild(imgElement);
});

console.log(TestEnum.B);