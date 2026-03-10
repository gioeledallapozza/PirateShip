uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;

void main() {
    // Calcoliamo la forza del mix basandoci sull'altezza
    // Usiamo offset e multiplier per regolare quanto "stacco" c'è tra i due colori
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    
    // Il mix accetta valori tra 0 e 1, quindi "puliamo" il risultato
    mixStrength = clamp(mixStrength, 0.2, 1.0);

    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);
    
    gl_FragColor = vec4(color, 1.0);
}