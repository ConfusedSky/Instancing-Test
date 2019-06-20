import { FPSCounter } from "./fps-counter";
import { IColor, Renderer } from "./renderers/renderer";

const width = 1280;
const height = 720;
const renderer = new Renderer(width, height);
let fps: FPSCounter;
fps = new FPSCounter();

const BLACK: IColor = {r: 0, g: 0, b: 0, a: 1};

function renderLoop(current: number) {
    requestAnimationFrame(renderLoop);
    fps.render();

    const v = [50, 50, 100, 100];
    const v2 = new Float32Array(v);

    const v3 = [55, 56, 105, 105];
    const v4 = new Float32Array(v3);

    renderer.startNextFrame();
    renderer.drawSpecBox(current);
    renderer.drawBoxes(v2, 10, BLACK);
    renderer.drawBoxes(v4, 10, BLACK);
}

requestAnimationFrame(renderLoop);
