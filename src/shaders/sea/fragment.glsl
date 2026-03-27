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
uniform float uNormalScale;
uniform float uNormalSpeed;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vTangent; 
varying vec3 vBitangent;
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {

    vec3 tangent = normalize(vTangent);
    vec3 bitangent = normalize(vBitangent);
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 lightDirection = normalize(uLightDirection); 
    

    // Depth Colour
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier; //Base Strength based on elevation
    vec3 baseColor = mix(uDepthColor, uSurfaceColor, clamp(mixStrength, 0.0, 1.0));  //Clamp set the minimun value to 0.0 and the max to 1.0

    //Normal Mapping
    vec2 uv1 = vUv * uNormalScale + uTime * uNormalSpeed;
    vec2 uv2 = vUv * (uNormalScale * 1.5) - uTime * (uNormalSpeed * 0.8);
    vec3 mapNormal1 = texture2D(uNormalMap, uv1).rgb * 2.0 - 1.0;  //Remapping [-1,1]
    vec3 mapNormal2 = texture2D(uNormalMap, uv2).rgb * 2.0 - 1.0;  //Remapping [-1,1]
    vec3 mixedNormalMap = normalize(mapNormal1 + mapNormal2);
    mat3 tbn = mat3( 
        tangent, 
        bitangent, 
        normal
    );
    normal = normalize(tbn * mixedNormalMap);

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

    // Sky
    finalColor = mix(finalColor, uSkyColor, fresnel * uFresnelIntensity);

    // Subsurface scattering (DA CONTROLLARE FA SCHIFO)
    vec3 sssColor = vec3(0.0, 1.0, 0.5);
    float sssInversion = max(0.0, dot(viewDirection, -lightDirection));
    float sssIntensity = pow(sssInversion, 0.0); 
    float waveThinness = smoothstep(0.0, 0.35, vElevation); 
    vec3 sssGlow = sssColor * sssIntensity * waveThinness * 0.5;
    finalColor += sssGlow;

    gl_FragColor = vec4(finalColor, 1.0);
}