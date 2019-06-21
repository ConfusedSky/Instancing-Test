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
        const offset = .1;
        for (let y = -10; y < 10; y += 2) {
            for (let x = -10; x < 10; x += 2) {
                const sx = x / 10 + offset + Math.cos(time / 500) * .05;
                res.push(sx * width / 2);
                const sy = y / 10 + offset + Math.sin(time / 500) * .05;
                res.push(sy * height / 2);
            }
        }
        return new Float32Array(res);
        // return new Float32Array([0, 0]);
    })();

    renderer.startNextFrame();
    renderer.drawSpecBox(instances);
    renderer.drawBoxes(v, 10, BLACK);
    renderer.drawBoxes(v2, 10, BLACK);
}

requestAnimationFrame(renderLoop);
