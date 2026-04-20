uniform float uTime;
uniform float uWindSpeed;
uniform float uWindStrength;
uniform vec3 uWindPrimary;
uniform vec3 uWindCounter;

attribute float aOffset;

varying vec2 vUv;

// Simulates the force of the wind
float getGaleForce(float time) {
    float pulse = sin((time + aOffset) * 0.2) * sin((time + aOffset) * 0.7);
    return smoothstep(0.4, 0.8, pulse);
}

// Mask to soften the corners of the sails
float getCornerMask(vec2 uvCoord) {
    float d = min(min(length(uvCoord - vec2(0.0)), length(uvCoord - vec2(1.0, 0.0))),
                  min(length(uvCoord - vec2(0.0, 1.0)), length(uvCoord - vec2(1.0))));
    return smoothstep(0.0, 0.15, d);
}

void main() {
    vUv = uv;
    float mask = getCornerMask(uv);
    vec3 norm = normalize(normal);

    float localTime = (uTime + aOffset) * uWindSpeed;

    // Main Wind Drive
    float gale = getGaleForce(uTime); 
    
    // Get the intensity based on the DIRECTION 
    float primaryIntensity = max(0.0, dot(norm, normalize(uWindPrimary)));
    float counterIntensity = max(0.0, dot(norm, normalize(uWindCounter)));
    float currentWindDrive = mix(primaryIntensity, -counterIntensity * 1.5, gale); //Based on gale (random pulse), control witch force to use.

    // Wave patterns on the sails
    float w1 = sin(uv.x * 4.0 - localTime * 5.0 + aOffset);
    float w2 = sin(uv.x * 7.5 + uv.y * 2.0 - localTime * 8.0 + (aOffset * 0.5)) * 0.4;
    float w3 = sin(uv.x * 15.0 - localTime * 12.0) * 0.1;

    float combinedWave = mix(w1 + w2 + w3, -(w1 + w2), gale);

    //Inflation for volume
    float inflation = 0.5 * currentWindDrive;

    float displacement = (inflation + combinedWave * 0.4) * uWindStrength * mask;

    csm_Position += normal * displacement;
}
