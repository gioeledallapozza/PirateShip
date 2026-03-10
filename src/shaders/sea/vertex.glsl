uniform float uTime;
uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uBigWavesSpeed;
uniform float uBigWavesSteepness;

varying float vElevation;

vec3 getGerstnerWave(vec3 position, vec2 direction, float steepness, float elevation, float frequency, float speed) {
    
    // Normalize direction
    vec2 d = normalize(direction);
    
    // Calculate Phase
    float wavePhase = (dot(d, position.xz) * frequency) + (uTime * speed);

    // Calculate Lateral Movement
    float x = d.x * (steepness * elevation * cos(wavePhase));
    float z = d.y * (steepness * elevation * cos(wavePhase));
    float y = elevation * sin(wavePhase);

    return vec3(x, y, z);
}

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    //Create a copy to pass it as varibale
    vec3 currentPos = modelPosition.xyz;

    //Master wave
   currentPos += getGerstnerWave(
        modelPosition.xyz, 
        vec2(1.0, 1.0),       // Direzione
        uBigWavesSteepness,   // Steepness da Uniform
        uBigWavesElevation,   // Altezza da Uniform
        uBigWavesFrequency.x, // Frequenza da Uniform
        uBigWavesSpeed        // Velocità da Uniform
    );

    //Reflected Wave
   currentPos += getGerstnerWave(
        modelPosition.xyz, 
        vec2(-0.8, 0.2),              // Direzione diversa
        uBigWavesSteepness * 0.5,     // Meno ripida
        uBigWavesElevation * 0.3,     // Più bassa
        uBigWavesFrequency.x * 2.5,   // Più fitta (frequenza alta)
        uBigWavesSpeed * 1.5          // Più veloce
    );

    modelPosition.xyz = currentPos;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    //Varyings
    vElevation = currentPos.y;
}