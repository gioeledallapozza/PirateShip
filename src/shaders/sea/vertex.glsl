uniform float uTime;
uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uBigWavesSpeed;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // elevation based on sin()
    float elevation = sin(modelPosition.x * uBigWavesFrequency.x + 
                          modelPosition.z * uBigWavesFrequency.y + 
                          uTime * uBigWavesSpeed) 
                      * uBigWavesElevation;

    modelPosition.y += elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}