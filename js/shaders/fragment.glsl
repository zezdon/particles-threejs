uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 reolution;
varying vec2 vUv;
varying vec3 vPosition;
varying float vOpacity;
float PI = 3.141592653589793238;
void main()	{

	gl_FragColor = vec4(1.)*vOpacity;
}