uniform float uTime;
uniform float uWindSpeed;
uniform float uWindStrength;

varying vec2 vUv;

void main() {
    vUv = uv;

    // Maschera basata sulle UV: 
    // Immaginiamo che a x=0 la vela sia attaccata al palo.
    // Più ci allontaniamo (x -> 1), più la vela può muoversi.
    float mask = smoothstep(0.0, 0.5, uv.x); 

    // Calcolo del vento usando seno e coseno incrociati
    float wave = sin(position.y * 3.0 + uTime * uWindSpeed) * cos(position.z * 2.0 + uTime * uWindSpeed * 0.5);

    // Spostiamo il vertice lungo la sua normale (si gonfia verso l'esterno)
    csm_Position += normal * wave * uWindStrength * mask;
}