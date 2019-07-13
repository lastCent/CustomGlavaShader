in vec4 gl_FragCoord;

#request uniform "time" time
uniform float time;

#request uniform "screen" screen
uniform ivec2 screen;

/* Include the user config, overriding any system values. */
#include ":custom.glsl"

/* We need the texture size for smoothing */
#request uniform "audio_sz" audio_sz
uniform int audio_sz;

#request uniform "audio_l" audio_l
#request transform audio_l "window"
#request transform audio_l "fft"
#request transform audio_l "gravity"
#request transform audio_l "avg"
uniform sampler1D audio_l;

#request uniform "audio_r" audio_r
#request transform audio_r "window"
#request transform audio_r "fft"
#request transform audio_r "gravity"
#request transform audio_r "avg"
uniform sampler1D audio_r;

#include ":util/smooth.glsl"

out vec4 fragment;

#define linewidth 10
#define amplification 300
#define BORDER_X screen.x*0.1
#define BORDER_Y screen.y*0.1

#define smooth_v(pos) (((smooth_audio(audio_l, audio_sz, pos) + smooth_audio(audio_r, audio_sz, pos)) / 2 ) * amplification)

#define TWOPI 6.28318530718
#define PI 3.14159265359
#define tripmode 0

vec4 rotate_point(vec4 fragCoord, float angle, vec2 rotation_center) {
    /* add values to angle (such as fragCoord.xy) for neat patterns */
    float sinus = sin(angle);
    float cosinus = cos(angle);

    if (tripmode > 0) {
        sinus *= sin(fragCoord.x);
        cosinus /= cos(fragCoord.x);
    }

    fragCoord.x = fragCoord.x - rotation_center.x;
    fragCoord.y = fragCoord.y - rotation_center.y;

    vec4 temp;
    temp.x = fragCoord.x * cosinus - fragCoord.y * sinus + rotation_center.x;
    temp.y = fragCoord.x * sinus + fragCoord.y * cosinus + rotation_center.y;
    temp.z = fragCoord.z;
    temp.w = fragCoord.w;

    return temp;
}

void draw_square(float v_avg, float time, vec4 color) {
    vec4 outer_square_tblr = vec4(
        screen.y - v_avg - BORDER_Y,
        0 + v_avg + BORDER_Y,
        0 + v_avg + 0.1*screen.x*sin(time) + BORDER_X, 
        screen.x - v_avg + 0.1*screen.x*sin(time) - BORDER_X
    );
    vec4 inner_square_tblr = vec4(
        screen.y - v_avg - linewidth -BORDER_Y,
        0 + v_avg + linewidth + BORDER_Y,
        0 + v_avg + linewidth + 0.1*screen.x*sin(time) + BORDER_X, 
        screen.x - v_avg - linewidth + 0.1*screen.x*sin(time) - BORDER_X  
    );

    /* Rotated rectangle collision detection, rotate point not rectangle */

    vec4 rotated_fragCoord = rotate_point(gl_FragCoord, 0, vec2(screen.x/2, screen.y/2)); 

    vec4 point = rotated_fragCoord;

    if (point.x > outer_square_tblr.z && point.x < outer_square_tblr.w) {
        if (point.y > outer_square_tblr.y && point.y < outer_square_tblr.x) {
            fragment = color;
        } 
    }  
    if (point.x > inner_square_tblr.z && point.x < inner_square_tblr.w) {
        if (point.y > inner_square_tblr.y && point.y < inner_square_tblr.x) {
            fragment = #171717e6;
        } 
    }  
}


void main() {

    fragment = #171717e6;

    /* pos index is [0.0F , 1.0F) */

    for (int i=0; i<10; i++) {
        draw_square(smooth_v(i*0.1F) + i*linewidth, 0.5*time, #ff0000e6 - (i* #20000000) + (i * #00001000)); 
    }

}


