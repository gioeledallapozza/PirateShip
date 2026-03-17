uniform vec3 uLightDirection;      // Direzione del sole
uniform vec3 uSkyColor;           // Colore del riflesso del cielo
uniform float uSpecularIntensity;  // Quanto brilla il riflesso (era 0.5)
uniform float uSpecularPower;      // Quanto è "stretto" il riflesso (era 30.0)
uniform float uFresnelPower;       // Forza della curva Fresnel (era 3.0)
uniform float uFresnelIntensity;   // Intensità del riflesso del cielo (era 0.2)

uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {

    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 lightDirection = normalize(uLightDirection); 

    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier; //Base Strength based on elevation
    //Clamp set the minimun value to 0.0 and the max to 1.0
    vec3 baseColor = mix(uDepthColor, uSurfaceColor, clamp(mixStrength, 0.0, 1.0));

    //Diffuse light
    float diffuse = max(0.0, dot(normal, lightDirection)); //dot return 0 when perpendicular 1 if parallel -1 if behind
    diffuse = smoothstep(0.0, 1.0, diffuse); // Clean variable

    // Reflection Light
    vec3 reflectionDirection = reflect(-lightDirection, normal); //The direction of the bounce of the light
    float specular = max(0.0, dot(viewDirection, reflectionDirection)); //DOT return one if the direction is the same if is 90° then 0 if behind -1
    specular = pow(specular, uSpecularPower); //Bigger the number stronger the light and thin

    // Frensel effect 
    float fresnel = pow(1.0 - max(0.0, dot(normal, viewDirection)), uFresnelPower);

    //Shadows 
    vec3 finalColor = baseColor * (diffuse * 0.5 + 0.5);
    
    // Reflexs
    finalColor += specular * uSpecularIntensity;

    //vec(3.0) simulate the reflection of the sky
    finalColor = mix(finalColor, uSkyColor, fresnel * uFresnelIntensity);
    //Mix get 100% of the y value if the third parameter is 1.0 or 100% of the other if the third parameter is 0
     //"Prendi il colore del mare e aggiungici un 20% di bianco (il cielo), ma fallo solo dove l'effetto Fresnel è forte (cioè verso l'orizzonte)".

    gl_FragColor = vec4(finalColor, 1.0);
}