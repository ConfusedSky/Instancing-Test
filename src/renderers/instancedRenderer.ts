import * as twgl from "twgl.js";
import { unsetDivisors } from "../glUtils";

export class InstancedRenderer {
    private gl: WebGLRenderingContext;
    private programInfo: twgl.ProgramInfo;
    private bufferInfo: twgl.BufferInfo;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;

        this.programInfo = twgl.createProgramInfo(this.gl, ["s-vs", "s-fs"]);

        const verts = [
            // positions
            -0.05, -0.05,
            -0.05,  0.05,
             0.05, -0.05,
             0.05,  0.05,
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

    public render(time: number) {
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
        this.gl.useProgram(this.programInfo.program);

        const arrays: twgl.Arrays = {
            a_translation: {
                numComponents: 2,
                data: translations,
                divisor: 1,
            },
        };
        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, arrays, this.bufferInfo);
        const vertexArrayInfo = twgl.createVertexArrayInfo(this.gl, this.programInfo, this.bufferInfo);
        twgl.setBuffersAndAttributes(this.gl, this.programInfo, vertexArrayInfo);
        twgl.drawBufferInfo(this.gl, vertexArrayInfo, this.gl.TRIANGLES, vertexArrayInfo.numElements, 0, 100);

        // Unset divisor so this works properly on iOS
        unsetDivisors(this.gl, this.programInfo, ["a_translation"]);
    }
}
