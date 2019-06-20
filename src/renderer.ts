import * as twgl from "twgl.js";
import { createProgram, createShader } from "./glUtils";

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

    private specProgram: WebGLProgram;
    private vertBuffer: WebGLProgram;
    private colorBuffer: WebGLProgram;
    private offsetBuffer: WebGLProgram;
    private readonly A_SPEC_POS_LOC: number;
    private readonly A_SPEC_OFFSET_LOC: number;
    private readonly A_SPEC_COLOR_LOC: number;

    private ext: ANGLE_instanced_arrays;

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

        this.program = twgl.createProgramInfo(this.gl, ["vs", "fs"]);

        this.specProgram = createProgram(this.gl, this.initializeSpecVertShader(), this.initializeSpecFragShader());
        this.ext = this.gl.getExtension("ANGLE_instanced_arrays");

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

        this.vertBuffer = this.gl.createBuffer();
        this.colorBuffer = this.gl.createBuffer();
        this.offsetBuffer = this.gl.createBuffer();
        this.A_SPEC_POS_LOC = this.gl.getAttribLocation(this.specProgram, "a_position");
        this.A_SPEC_COLOR_LOC = this.gl.getAttribLocation(this.specProgram, "a_color");
        this.A_SPEC_OFFSET_LOC = this.gl.getAttribLocation(this.specProgram, "a_translation");

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(verts), this.gl.STATIC_DRAW);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
    }

    public startNextFrame() {
        twgl.resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    public drawSpecBox(time: number) {
        // const translations = [
            // 0.0, 0.0, .1, .1, .2, .2,
        // ];
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
        this.gl.useProgram(this.specProgram);

        this.gl.enableVertexAttribArray(this.A_SPEC_POS_LOC);
        this.gl.enableVertexAttribArray(this.A_SPEC_COLOR_LOC);
        this.gl.enableVertexAttribArray(this.A_SPEC_OFFSET_LOC);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
        this.gl.vertexAttribPointer(this.A_SPEC_POS_LOC, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.vertexAttribPointer(this.A_SPEC_COLOR_LOC, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.offsetBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(translations), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.A_SPEC_OFFSET_LOC, 2, this.gl.FLOAT, false, 0, 0);

        this.ext.vertexAttribDivisorANGLE(this.A_SPEC_OFFSET_LOC, 1);
        this.ext.drawArraysInstancedANGLE(this.gl.TRIANGLES, 0, 6, 100);
        // iOS rendering issue
        this.ext.vertexAttribDivisorANGLE(this.A_SPEC_OFFSET_LOC, 0);

        this.gl.disableVertexAttribArray(this.A_SPEC_POS_LOC);
        this.gl.disableVertexAttribArray(this.A_SPEC_COLOR_LOC);
        this.gl.disableVertexAttribArray(this.A_SPEC_OFFSET_LOC);
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

    private initializeSpecVertShader() {
        return createShader(this.gl, this.gl.VERTEX_SHADER, `
            attribute vec2 a_position;
            attribute vec3 a_color;

            attribute vec2 a_translation;

            varying vec3 f_color;

            void main() {
                gl_Position = vec4(a_position + a_translation, 0, 1);
                f_color = a_color;
            }
        `);
    }

    private initializeSpecFragShader() {
        return createShader(this.gl, this.gl.FRAGMENT_SHADER, `
            precision mediump float;

            varying vec3 f_color;

            void main() {
                gl_FragColor = vec4(f_color, 1.0);
            }
        `);
    }
}
