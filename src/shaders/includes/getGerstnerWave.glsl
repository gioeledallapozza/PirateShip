#include ./noise2d.glsl

struct WaveResult {
    vec3 positionOffset;
    vec3 tangentContribution;
    vec3 bitangentContribution;
};

WaveResult getGerstnerWave(
    vec3 position, 
    vec2 direction, 
    float steepness, 
    float elevation, 
    float frequency, 
    float speed
) {
    WaveResult result;
    vec2 d = normalize(direction);

    // Il noise "sbalza" la fase rendendo le linee non dritte
    float noise = snoise(position.xz * 0.2);
    float phase = (dot(d, position.xz) * frequency) + (uTime * speed) + (noise * 1.5);

    float s = sin(phase);
    float c = cos(phase);

    // --- POSIZIONE ---
    // Calcoliamo lo spostamento relativo. 
    // Nota: le onde di Gerstner spostano i vertici anche lateralmente (X, Z)
    result.positionOffset = vec3(
        d.x * (steepness * elevation * c),
        elevation * s,
        d.y * (steepness * elevation * c)
    );

    // --- DERIVATE (Tangente e Bitangente) ---
    // Per ottenere la normale corretta, dobbiamo calcolare come cambia la 
    // posizione rispetto a X e rispetto a Z (derivate parziali).
    
    float f_s = steepness * elevation * frequency * s; // Fattore per la parte orizzontale
    float f_c = elevation * frequency * c;             // Fattore per la parte verticale

    // Contributo alla Tangente (variazione rispetto a X)
    result.tangentContribution = vec3(
        - (d.x * d.x * f_s),
        d.x * f_c,
        - (d.x * d.y * f_s)
    );

    // Contributo alla Bitangente (variazione rispetto a Z)
    result.bitangentContribution = vec3(
        - (d.x * d.y * f_s),
        d.y * f_c,
        - (d.y * d.y * f_s)
    );

    return result;
}