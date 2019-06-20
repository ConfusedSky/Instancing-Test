import * as twgl from "twgl.js";
import { unsetDivisors } from "./glUtils";

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
    private width: number;
    private height: number;
    private gl: WebGLRenderingContext;
    private program: twgl.ProgramInfo;

    private specProgram: twgl.ProgramInfo;
    private specBuffers: twgl.BufferInfo;

    constructor(width: number, height: number, options?: IRendererOptions) {
        const o = options || {} as IRendererOptions;

        const canvasID = o.canvasID || "game-canvas";
        const canvas = document.getElementById(canvasID) as HTMLCanvasElement;

        this.width = canvas.width = width;
        this.height = canvas.height = height;

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

        this.program = twgl.createProgramInfo(this.gl, ["vs", "fs"]);
        this.specProgram = twgl.createProgramInfo(this.gl, ["s-vs", "s-fs"]);

        const verts = [
            // positions     // colors
            -0.05,  0.05,
             0.05, -0.05,
            -0.05, -0.05,

            -0.05,  0.05,
             0.05, -0.05,
             0.05,  0.05,
        ];
        const colors = [
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0,

            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 1.0,
        ];
        const arrays = {
            a_position: {
                numComponents: 2,
                data: verts,
            },
            a_color: {
                numComponents: 3,
                data: colors,
            },
        };
        this.specBuffers = twgl.createBufferInfoFromArrays(this.gl, arrays);
    }

    public startNextFrame() {
        twgl.resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    public drawSpecBox(time: number) {
        const translations = (() => {
            const res = [];
            const offset = .1;
            for (let y = -10; y < 10; y += 2) {
                for (let x = -10; x < 10; x += 2) {
                    res.push(x / 10 + offset + Math.cos(time / 500) * .05);
                    res.push(y / 10 + offset + Math.sin(time / 500) * .05);
                }
            }
            return res;
        })();
        this.gl.useProgram(this.specProgram.program);

        const arrays: twgl.Arrays = {
            a_translation: {
                numComponents: 2,
                data: translations,
                divisor: 1,
            },
        };
        this.specBuffers = twgl.createBufferInfoFromArrays(this.gl, arrays, this.specBuffers);
        const vertexArrayInfo = twgl.createVertexArrayInfo(this.gl, this.specProgram, this.specBuffers);
        twgl.setBuffersAndAttributes(this.gl, this.specProgram, vertexArrayInfo);
        twgl.drawBufferInfo(this.gl, vertexArrayInfo, this.gl.TRIANGLES, vertexArrayInfo.numElements, 0, 100);

        // Unset divisor so this works properly on iOS
        unsetDivisors(this.gl, this.specProgram, ["a_translation"]);
    }

    public drawBoxes(verts: Float32Array, size: number, color: IColor) {
        const bufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
            a_position: {data: verts, numComponents: 2},
        });

        const uniforms = {
            u_size: size,
            u_resolution: [this.width, this.height],
            u_color: [color.r, color.g, color.b, color.a],
        };

        this.gl.useProgram(this.program.program);
        twgl.setBuffersAndAttributes(this.gl, this.program, bufferInfo);
        twgl.setUniforms(this.program, uniforms);
        twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.POINTS);
    }
}
