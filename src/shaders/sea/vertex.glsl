uniform float uTime;
uniform float uBigWavesElevation;
uniform float uBigWavesFrequency;
uniform float uBigWavesSpeed;
uniform float uBigWavesSteepness;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void applyGerstnerWave(
    inout vec3 position, 
    inout vec3 tangent, 
    inout vec3 bitangent,
    vec2 direction, 
    float steepness, 
    float elevation, 
    float frequency, 
    float speed
) {
    vec2 d = normalize(direction);
    float phase = (dot(d, position.xz) * frequency) + (uTime * speed);

    float s = sin(phase);
    float c = cos(phase);

    // Horizontal (X, Z) and vertical movement (Y)
    float horizontalOffset = steepness * elevation * c;
    float verticalOffset = elevation * s;

    position.x += d.x * horizontalOffset; //P.x
    position.z += d.y * horizontalOffset; //P.z
    position.y += verticalOffset;         //P.y

    //Calculate common parts for the derivates
    float commonFactor = steepness * elevation * frequency * s;
    float slopeFactor  = elevation * frequency * c;

    // Calculate tanget (derivate partial regard X), partial derivate depens from multiple varibales
    tangent += vec3(
        -d.x * d.x * commonFactor, // Derivate P.x regard x
         d.x * slopeFactor,        // Derivate P.y regard x
        -d.x * d.y * commonFactor  // Derivate P.z regard x
    );

    // Calculate Bitangent (derivate partial regard z), partial derivate depens from multiple varibales
    bitangent += vec3(
        -d.x * d.y * commonFactor, // Derivate di P.x regard z
         d.y * slopeFactor,        // Derivate di P.y regard z
        -d.y * d.y * commonFactor  // Derivate di P.z regard z
    );
}

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    //Create a copy to modified it
    vec3 currentPos = modelPosition.xyz;

    //Default Normals
    vec3 tangent = vec3(1.0, 0.0, 0.0); //X
    vec3 bitangent = vec3(0.0, 0.0, 1.0); //Z

    //Wave 1
    applyGerstnerWave(
        currentPos, tangent, bitangent,
        vec2(1.0, 1.0), 
        uBigWavesSteepness, 
        uBigWavesElevation, 
        uBigWavesFrequency, 
        uBigWavesSpeed
    );

    //Wave 2
    applyGerstnerWave(
        currentPos, tangent, bitangent,
        vec2(-1.0, 1.0), 
        uBigWavesSteepness * 0.5, 
        uBigWavesElevation * 0.3, 
        uBigWavesFrequency * 2.5, 
        uBigWavesSpeed * 1.5
    );

    modelPosition.xyz = currentPos;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    //Varyings
    vElevation = currentPos.y;
    vNormal = normalize(cross(tangent, bitangent)); //Prodotto Vettoriale
    vWorldPosition = modelPosition.xyz;
}