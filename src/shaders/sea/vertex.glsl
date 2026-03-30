#include ../includes/BigWave.glsl

uniform float uTime;
uniform BigWave uBigWaves[4];

varying float vElevation;
varying vec3 vNormal;
varying vec3 vTangent; 
varying vec3 vBitangent;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying float vFoam;

#include ../includes/getGerstnerWave.glsl
#include <fog_pars_vertex>

void main() {

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec3 currentPos = modelPosition.xyz;

    //Declare final variables
    vec3 finalOffset = vec3(0.0);
    vec3 finalTangent = vec3(1.0, 0.0, 0.0);
    vec3 finalBitangent = vec3(0.0, 0.0, 1.0);
    float cumulativeSteepness = 0.0;

    for(int i = 0; i < 3; i++) {
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
        cumulativeSteepness += result.steepnessFactor;
    }

    currentPos += finalOffset;
    modelPosition.xyz = currentPos;

    vec4 mvPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * mvPosition;

    gl_Position = projectedPosition;

    //Varyings
    vElevation = currentPos.y;
    vNormal = normalize(cross(finalTangent, finalBitangent)); //Prodotto Vettoriale
    vTangent = finalTangent;
    vBitangent = finalBitangent;
    vWorldPosition = modelPosition.xyz;
    vUv = uv;
    vFoam = smoothstep(0.2, 0.4, cumulativeSteepness);

    #include <fog_vertex>
}