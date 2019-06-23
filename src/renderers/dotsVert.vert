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
