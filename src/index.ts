import { FPSCounter } from "./fps-counter";
import { IColor, Renderer } from "./renderers/renderer";

const width = 1280;
const height = 720;
const renderer = new Renderer(width, height);
let fps: FPSCounter;
fps = new FPSCounter();

const BLACK: IColor = {r: 0, g: 0, b: 0, a: 1};

function renderLoop(time: number) {
    requestAnimationFrame(renderLoop);
    fps.render();

    const v = new Float32Array([50, 50, 100, 100]);
    const v2 = new Float32Array([55, 56, 105, 105]);

    const instances = (() => {
        const res = [];
        const offset = .025;
        for (let y = 0; y < 10; y += 1) {
            for (let x = 0; x < 10; x += 1) {
                const sx = x / 10 + (1 + Math.cos(time / 500)) * offset;
                res.push(sx * width);
                const sy = y / 10 + (1 + Math.sin(time / 500)) * offset;
                res.push(sy * height);
            }
        }
        return new Float32Array(res);
    })();

    renderer.startNextFrame();
    renderer.drawSpecBox(width / 20, height / 20, instances);
    renderer.drawBoxes(v, 10, BLACK);
    renderer.drawBoxes(v2, 10, BLACK);
}

requestAnimationFrame(renderLoop);
