#include ../includes/BigWave.glsl

uniform float uTime;
uniform BigWave uBigWaves[4];

varying float vElevation;
varying vec3 vNormal;
varying vec3 vTangent; 
varying vec3 vBitangent;
varying vec3 vWorldPosition;
varying vec2 vUv;

#include ../includes/getGerstnerWave.glsl

void main() {

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec3 currentPos = modelPosition.xyz;

    //Declare final variables
    vec3 finalOffset = vec3(0.0);
    vec3 finalTangent = vec3(1.0, 0.0, 0.0);
    vec3 finalBitangent = vec3(0.0, 0.0, 1.0);

    for(int i = 0; i < 4; i++) {
        WaveResult result = getGerstnerWave(
            currentPos, 
            uBigWaves[i].direction, 
            uBigWaves[i].steepness, 
            uBigWaves[i].elevation, 
            uBigWaves[i].frequency, 
            uBigWaves[i].speed,
            float(i)
        );
        
        finalOffset += result.positionOffset;
        finalTangent += result.tangentContribution;
        finalBitangent += result.bitangentContribution;
    }

   
    currentPos += finalOffset;
    modelPosition.xyz = currentPos;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    //Varyings
    vElevation = currentPos.y;
    vNormal = normalize(cross(finalTangent, finalBitangent)); //Prodotto Vettoriale
    vTangent = finalTangent;
    vBitangent = finalBitangent;
    vWorldPosition = modelPosition.xyz;
    vUv = uv;
}