uniform float uTime;
uniform vec3 uLightDirection;      
uniform vec3 uSkyColor;           
uniform float uSpecularIntensity; 
uniform float uSpecularPower;      
uniform float uFresnelPower;      
uniform float uFresnelIntensity;   

uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

uniform sampler2D uNormalMap;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vTangent; 
varying vec3 vBitangent;
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {

    // -----------------------------------------------------------
    // 1. SETUP VETTORI BASE
    // -----------------------------------------------------------
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 lightDirection = normalize(uLightDirection); 

    // -----------------------------------------------------------
    // 2. NORMAL MAPPING (La "Vibrazione" di Sea of Thieves)
    // -----------------------------------------------------------
    // Facciamo scorrere due strati di texture in direzioni diverse per rompere il pattern
    vec2 uvScrolling1 = vUv * 12.0 + vec2(uTime * 0.02, uTime * 0.01);
    vec2 uvScrolling2 = vUv * 24.0 - vec2(uTime * 0.04, uTime * 0.03);

    // Campioniamo e convertiamo da [0, 1] a [-1, 1]
    vec3 normalMap1 = texture2D(uNormalMap, uvScrolling1).rgb * 2.0 - 1.0;
    vec3 normalMap2 = texture2D(uNormalMap, uvScrolling2).rgb * 2.0 - 1.0;
    vec3 mixedNormalMap = normalize(normalMap1 + normalMap2);

    // MATRICE TBN: Applichiamo la texture sulla pendenza dell'onda
    mat3 tbn = mat3(normalize(vTangent), normalize(vBitangent), normalize(vNormal));
    vec3 finalNormal = normalize(tbn * mixedNormalMap);

    // -----------------------------------------------------------
    // 3. COLORAZIONE BASE (Elevazione)
    // -----------------------------------------------------------
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 baseColor = mix(uDepthColor, uSurfaceColor, clamp(mixStrength, 0.0, 1.0));

    // -----------------------------------------------------------
    // 4. ILLUMINAZIONE (Usando finalNormal della Normal Map)
    // -----------------------------------------------------------
    
    // DIFFUSE: Luce morbida che modella l'onda
    float diffuse = max(0.0, dot(finalNormal, lightDirection));
    diffuse = smoothstep(0.0, 1.0, diffuse);

    // SPECULAR: I riflessi "taglienti" del sole
    vec3 reflectionDirection = reflect(-lightDirection, finalNormal);
    float specular = max(0.0, dot(viewDirection, reflectionDirection));
    specular = pow(specular, uSpecularPower);

    // FRESNEL: Riflesso del cielo verso l'orizzonte
    float fresnel = pow(1.0 - max(0.0, dot(finalNormal, viewDirection)), uFresnelPower);

    // -----------------------------------------------------------
    // 5. SUBSURFACE SCATTERING (Il "Glow" turchese)
    // -----------------------------------------------------------
    // Questa è la magia: illuminiamo le creste quando la luce viene da dietro
    float sssMask = smoothstep(-0.2, 1.0, vElevation); // Solo sulle punte
    float sssLight = max(0.0, dot(viewDirection, -lightDirection)); // Controluce
    sssLight = pow(sssLight, 3.0); // Concentriamo l'effetto
    vec3 sssColor = vec3(0.0, 1.0, 0.8) * sssLight * sssMask * 0.5;

    // -----------------------------------------------------------
    // 6. COMPOSIZIONE FINALE
    // -----------------------------------------------------------
    
    // Partiamo dalla base colpita dalla luce diffusa
    vec3 color = baseColor * (diffuse * 0.5 + 0.5);

    // Aggiungiamo il bagliore interno (SSS)
    color += sssColor;

    // Aggiungiamo i riflessi speculari (luccichii)
    color += specular * uSpecularIntensity;

    // Mixiamo con il colore del cielo (Fresnel)
    color = mix(color, uSkyColor, fresnel * uFresnelIntensity);

    gl_FragColor = vec4(color, 1.0);


    // vec3 normal = normalize(vNormal);
    // vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    // vec3 lightDirection = normalize(uLightDirection); 

    // float mixStrength = (vElevation + uColorOffset) * uColorMultiplier; //Base Strength based on elevation
    // //Clamp set the minimun value to 0.0 and the max to 1.0
    // vec3 baseColor = mix(uDepthColor, uSurfaceColor, clamp(mixStrength, 0.0, 1.0));

    // //Diffuse light
    // float diffuse = max(0.0, dot(normal, lightDirection)); //dot return 0 when perpendicular 1 if parallel -1 if behind
    // diffuse = smoothstep(0.0, 1.0, diffuse); // Clean variable

    // // Reflection Light
    // vec3 reflectionDirection = reflect(-lightDirection, normal); //The direction of the bounce of the light
    // float specular = max(0.0, dot(viewDirection, reflectionDirection)); //DOT return one if the direction is the same if is 90° then 0 if behind -1
    // specular = pow(specular, uSpecularPower); //Bigger the number stronger the light and thin

    // // Frensel effect 
    // float fresnel = pow(1.0 - max(0.0, dot(normal, viewDirection)), uFresnelPower);

    // //Shadows 
    // vec3 finalColor = baseColor * (diffuse * 0.5 + 0.5);
    
    // // Reflexs
    // finalColor += specular * uSpecularIntensity;

    // //vec(3.0) simulate the reflection of the sky
    // finalColor = mix(finalColor, uSkyColor, fresnel * uFresnelIntensity);
    // //Mix get 100% of the y value if the third parameter is 1.0 or 100% of the other if the third parameter is 0
    //  //"Prendi il colore del mare e aggiungici un 20% di bianco (il cielo), ma fallo solo dove l'effetto Fresnel è forte (cioè verso l'orizzonte)".

    // gl_FragColor = vec4(finalColor, 1.0);
}