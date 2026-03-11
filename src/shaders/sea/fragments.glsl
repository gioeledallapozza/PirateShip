uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vWorldPosition;
void main() {
    // 1. COLORE BASE (Già tuo)
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 baseColor = mix(uDepthColor, uSurfaceColor, clamp(mixStrength, 0.0, 1.0));

    // 2. VETTORI DI LUCE E VISTA
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition); // Direzione verso i tuoi occhi
    vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0)); // Il "Sole"

    // 3. LUCE DIFFUSA (Ombre)
    float diffuse = max(0.0, dot(normal, lightDirection));
    diffuse = smoothstep(0.0, 1.0, diffuse); // Puliamo il valore

    // 4. LUCE SPECULARE (Il riflesso del sole)
    // Calcoliamo come la luce rimbalza sulla normale
    vec3 reflectionDirection = reflect(-lightDirection, normal);
    float specular = max(0.0, dot(viewDirection, reflectionDirection));
    specular = pow(specular, 30.0); // Più alto il numero, più "stretto" e brillante è il riflesso

    // 5. EFFETTO FRESNEL
    // Più guardi l'acqua "di taglio" (vicino all'orizzonte), più deve essere chiara e riflettente
    float fresnel = pow(1.0 - max(0.0, dot(normal, viewDirection)), 3.0);

    // 6. MIX FINALE
    // Applichiamo le ombre al colore base
    vec3 finalColor = baseColor * (diffuse * 0.5 + 0.5);
    
    // Aggiungiamo il riflesso del sole
    finalColor += specular * 0.4;

    // Aggiungiamo un tocco di "luce del cielo" basata sul Fresnel
    finalColor = mix(finalColor, vec3(1.0), fresnel * 0.2);

    gl_FragColor = vec4(finalColor, 1.0);
}