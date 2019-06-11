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
    private program: WebGLProgram;

    private buffer: WebGLBuffer;

    private readonly A_POS_LOC: number;
    private readonly U_RES_LOC: WebGLUniformLocation;
    private readonly U_SIZE_LOC: WebGLUniformLocation;
    private readonly U_COLOR_LOC: WebGLUniformLocation;

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

        const vertShader = this.initializeVertShader();
        const fragShader = this.initializeFragShader();
        this.program = createProgram(this.gl, vertShader, fragShader);
        this.buffer = this.gl.createBuffer();
        this.A_POS_LOC = this.gl.getAttribLocation(this.program, "a_position");
        this.U_RES_LOC = this.gl.getUniformLocation(this.program, "u_resolution");
        this.U_SIZE_LOC = this.gl.getUniformLocation(this.program, "u_size");
        this.U_COLOR_LOC = this.gl.getUniformLocation(this.program, "u_color");
        this.gl.useProgram(this.program);
        this.gl.uniform2f(this.U_RES_LOC, this.width, this.height);

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
        this.gl.viewport(0, 0, this.width, this.height);

        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    public drawSpecBox() {
        const translations = [
            0.0, 0.0, .1, .1, .2, .2,
        ];
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
        this.ext.drawArraysInstancedANGLE(this.gl.TRIANGLES, 0, 6, 3);
        // iOS rendering issue
        this.ext.vertexAttribDivisorANGLE(this.A_SPEC_OFFSET_LOC, 0);

        this.gl.disableVertexAttribArray(this.A_SPEC_POS_LOC);
        this.gl.disableVertexAttribArray(this.A_SPEC_COLOR_LOC);
        this.gl.disableVertexAttribArray(this.A_SPEC_OFFSET_LOC);
    }

    public drawBoxes(verts: Float32Array, size: number, color: IColor) {
        this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.A_POS_LOC);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, verts, this.gl.STATIC_DRAW);

        this.gl.uniform1f(this.U_SIZE_LOC, size);
        this.gl.uniform4f(this.U_COLOR_LOC, color.r, color.g, color.b, color.a);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.vertexAttribPointer(this.A_POS_LOC, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.POINTS, 0, verts.length / 2);

        this.gl.disableVertexAttribArray(this.A_POS_LOC);
    }

    private initializeVertShader() {
        return createShader(this.gl, this.gl.VERTEX_SHADER, `
            attribute vec2 a_position;
            uniform vec2 u_resolution;
            uniform float u_size;

            void main() {
                vec2 zeroToOne = (a_position + (u_size / 2.0)) / u_resolution;
                vec2 zeroToTwo = zeroToOne * 2.0;
                vec2 clipSpace = zeroToTwo - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                gl_PointSize = u_size;
            }
        `);
    }

    private initializeFragShader() {
        return createShader(this.gl, this.gl.FRAGMENT_SHADER, `
            precision mediump float;
            uniform vec4 u_color;
            void main() {
                gl_FragColor = u_color;
            }
        `);
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
