export default `uniform sampler2D tFluid;

uniform vec3 uColor;
uniform vec3 uBackgroundColor;

uniform float uDistort;
uniform float uIntensity;
uniform float uRainbow;
uniform float uBlend;
uniform float uShowBackground;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec3 fluidColor = texture2D(tFluid, uv).rgb;

    // Hitung kordinat UV yang terdistorsi oleh arah fluid (rg)
    vec2 distortedUv = uv - fluidColor.rg * uDistort * 0.001;

    // Ambil pixel dari layer di belakang cairan
    vec4 texture = texture2D(inputBuffer, distortedUv);

    // Langsung keluarkan warna aslinya tanpa tambahan warna cairan sama sekali
    // sehingga menghasilkan murni efek distorsi bening transparan
    outputColor = texture;
}
`;

