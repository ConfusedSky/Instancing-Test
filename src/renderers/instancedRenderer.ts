import * as twgl from "twgl.js";
import { unsetDivisors } from "../glUtils";

export class InstancedRenderer {
    private gl: WebGLRenderingContext;
    private width: number;
    private height: number;

    private programInfo: twgl.ProgramInfo;
    private bufferInfo: twgl.BufferInfo;

    constructor(gl: WebGLRenderingContext, width: number, height: number) {
        this.gl = gl;
        this.width = width;
        this.height = height;

        this.programInfo = twgl.createProgramInfo(this.gl, ["s-vs", "s-fs"]);

        if (!this.programInfo.program) {
            throw new Error("Instanced renderer failed to compile");
        }

        const verts = [
            // positions
            0, 1,
            0, 0,
            1, 1,
            1, 0,
        ];
        const colors = [
            0.0, 0.0, 1.0,
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 1.0,
        ];
        const indices = [
            0, 1, 2, 1, 2, 3,
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
            indices: {
                data: indices,
                numComponents: 1,
            },
        };
        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, arrays);
    }

    public render(width: number, height: number, instances: Float32Array) {
        this.gl.useProgram(this.programInfo.program);

        const arrays: twgl.Arrays = {
            a_translation: {
                numComponents: 2,
                data: instances,
                divisor: 1,
            },
        };

        const uniforms = {
            u_resolution: [this.width, this.height],
            u_size: [width, height],
        };

        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, arrays, this.bufferInfo);
        const vertexArrayInfo = twgl.createVertexArrayInfo(this.gl, this.programInfo, this.bufferInfo);
        twgl.setBuffersAndAttributes(this.gl, this.programInfo, vertexArrayInfo);
        twgl.setUniforms(this.programInfo, uniforms);
        twgl.drawBufferInfo(
            this.gl,
            vertexArrayInfo,
            this.gl.TRIANGLES,
            vertexArrayInfo.numElements,
            0,
            instances.length / 2,
        );

        // Unset divisor so this works properly on iOS
        unsetDivisors(this.gl, this.programInfo, ["a_translation"]);
    }
}
