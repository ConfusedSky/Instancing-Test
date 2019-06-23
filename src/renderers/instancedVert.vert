attribute vec2 a_position;
attribute vec3 a_color;

attribute vec2 a_translation;

uniform vec2 u_resolution;
uniform vec2 u_size;

varying vec3 f_color;

void main() {
    vec2 scaledSize = a_position * u_size;
    vec2 zeroToOne = (scaledSize + a_translation) / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    f_color = a_color;
}
