import * as twgl from "twgl.js";

export function unsetDivisors(
  gl: WebGLRenderingContext,
  programInfo: twgl.ProgramInfo,
  divisors: string[],
) {
  const unArrays = {} as any;
  divisors.forEach((divisor) => {
    unArrays[divisor] = {
      numComponents: 0,
      data: [],
      divisor: 0,
    };
  });

  const specBuffers = twgl.createBufferInfoFromArrays(gl, unArrays);
  const vertexArrayInfo = twgl.createVertexArrayInfo(gl, programInfo, specBuffers);
  twgl.setBuffersAndAttributes(gl, programInfo, vertexArrayInfo);
}
