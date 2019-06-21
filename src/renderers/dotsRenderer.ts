import * as twgl from "twgl.js";
import { IColor } from "./renderer";

export class DotsRenderer {
    private gl: WebGLRenderingContext;
    private width: number;
    private height: number;

    private program: twgl.ProgramInfo;

    constructor(gl: WebGLRenderingContext, width: number, height: number) {
        this.gl = gl;
        this.width = width;
        this.height = height;

        this.program = twgl.createProgramInfo(gl, ["vs", "fs"]);

        if (!this.program.program) {
            throw new Error("Dots renderer failed to compile");
        }
    }

    public render(verts: Float32Array, color: IColor, size: number) {
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
