import * as twgl from "twgl.js";
import { unsetDivisors } from "../glUtils";
import { DotsRenderer } from "./dotsRenderer";
import { InstancedRenderer } from "./instancedRenderer";

export interface IRendererOptions {
    canvasID: string;
}

export interface IColor {
    r: number;
    g: number;
    b: number;
    a: number;
}

export class Renderer {
    private gl: WebGLRenderingContext;
    private dots: DotsRenderer;
    private instanced: InstancedRenderer;

    constructor(width: number, height: number, options?: IRendererOptions) {
        const o = options || {} as IRendererOptions;

        const canvasID = o.canvasID || "game-canvas";
        const canvas = document.getElementById(canvasID) as HTMLCanvasElement;

        canvas.width = width;
        canvas.height = height;

        this.gl = canvas.getContext("webgl") as WebGLRenderingContext;

        if (this.gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it");
            throw new Error(); // Terminate execution
        }

        twgl.addExtensionsToContext(this.gl);
        const glANY = this.gl as any;
        if (!glANY.drawArraysInstanced || !glANY.createVertexArray) {
            alert("need drawArraysInstanced and createVertexArray to run");
            return;
        }

        this.dots = new DotsRenderer(this.gl, width, height);
        this.instanced = new InstancedRenderer(this.gl, width, height);
    }

    public startNextFrame() {
        twgl.resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    public drawSpecBox(width: number, height: number, instances: Float32Array) {
        this.instanced.render(width, height, instances);
    }

    public drawBoxes(verts: Float32Array, size: number, color: IColor) {
        this.dots.render(verts, color, size);
    }
}
