//EASING
EaseIn = function (power) { return function (t) { return Math.pow(t, power) } };
EaseOut = function (power) { return function (t) { return 1 - Math.abs(Math.pow(t - 1, power)) } };
EaseInOut = function (power) { return function (t) { return t < .5 ? EaseIn(power)(t * 2) / 2 : EaseOut(power)(t * 2 - 1) / 2 + 0.5 } };

var EasingFunctions = {
    linear: EaseInOut(1),
    easeInQuad: EaseIn(2),
    easeOutQuad: EaseOut(2),
    easeInOutQuad: EaseInOut(2),
    easeInCubic: EaseIn(3),
    easeOutCubic: EaseOut(3),
    easeInOutCubic: EaseInOut(3),
    easeInQuart: EaseIn(4),
    easeOutQuart: EaseOut(4),
    easeInOutQuart: EaseInOut(4),
    easeInQuint: EaseIn(5),
    easeOutQuint: EaseOut(5),
    easeInOutQuint: EaseInOut(5)
};

//\EASING

// LAYOUT ///////////////////////////

var THICKNESS_R = 70,
    THICKNESS = Math.pow(THICKNESS_R, 2),
    SPACING = 50,
    MARGIN = 0,
    COLOR1 = 69,
    COLOR2 = 3,
    COLOR3 = 168,
    OPACITY = 100,
    OPACITY_MAX = 255,
    PROXY_RADIUS = 500,
    MOUSE_CLICK_WAVE_DURATION = 500,
    COLOR_ARR1 = [
        /* 255,
         100,
         100*/
        220, 20, 70, 1
    ],
    COLOR_ARR2 = [
        /*100,
        255,
        100*/
        220, 20, 70, .75
    ],
    COLOR_ARR3 = [
        /*255,
        100,
        100*/
        220, 20, 70, .5
    ],
    DRAG = 0.95,
    EASE = 0.15,
    NUM_PARTICLES = ((ROWS = window.innerHeight / SPACING) * (COLS = window.innerWidth / SPACING)),

    /*

    used for sine approximation, but Math.sin in Chrome is still fast enough :)http://jsperf.com/math-sin-vs-sine-approximation

    B = 4 / Math.PI,
    C = -4 / Math.pow( Math.PI, 2 ),
    P = 0.225,

    */

    container,
    particle,
    canvas,
    canvas2,
    flame_canvas,
    mouse,
    stats,
    list,
    ctx,
    ctx2,
    flame_ctx,
    tog,
    man,
    dx, dy,
    mx, my,
    d, t, f,
    a, b,
    i, n,
    w, h,
    p, s,
    r, c
    ;

var click_start_point = false,
    prox_distance_perc = 0,
    old_opacity = OPACITY,
    new_opacity = 0,
    pivot_accent_color_arr = [0, 0, 0],
    c_proxy_radius = 0,
    main_color = [230, 50, 70, 1],
    accent_color = [50, 50, 50, 1],
    diagonal_s = 0,
    calc_win_width = $(window).innerWidth(),
    calc_win_height = $(window).innerHeight(),
    palette = ['rgba(' + main_color[0] + ', ' + main_color[1] + ', ' + main_color[2] + ', ' + .75 + ')', 'rgba(' + main_color[0] + ', ' + main_color[1] + ', ' + main_color[2] + ', ' + 1 + ')', 'rgba(' + main_color[0] + ', ' + main_color[1] + ', ' + main_color[2] + ', ' + 1 + ')'],
    dieing_flame_color = [20, 105, 190, 1];

particle = {
    vx: 0,
    vy: 0,
    x: 0,
    y: 0
};

var updateCanvas = true;

var borderThickness = 2,
    borderInset = 50,
    borderDistance = 10,
    borderFigureInset = 5,
    borderFigureOffsetX = 5,
    borderFigureOffsetY = 10;

var texts = [
    { name: 'logo', x: borderInset, y: 20, font_style: 'small-caps bold ', font_size: 24, font_size_v: 24, font_family: 'sans-serif' }
];

logo_t = 'test';

var contentHeight = 0;

var imageURLs = [];

// imageURLs.push("assets/images/244508.jpg");
//imageURLs.push("assets/images/lame2.gif");

// the loaded images will be placed in images[]
var imgs = [];

var imagesOK = 0;

function loadAllImages(callback) {
    for (var i = 0; i < imageURLs.length; i++) {
        var img = new Image();
        imgs.push(img);
        img.onload = function () {
            imagesOK++;
            if (imagesOK >= imageURLs.length) {
                callback();
            }
        };
        img.onerror = function () { alert("image load failed"); }
        img.crossOrigin = "anonymous";
        img.src = imageURLs[i];
    }
}



function init(e) {
    diagonal_s = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight);

    container = document.getElementById('fragileLayer');

    $(container).css({ 'background': 'rgba(' + main_color[0] + ', ' + main_color[1] + ', ' + main_color[2] + ', ' + .05 + ')' });

    // prevCanvas = $('canvas');
    // if(prevCanvas) {
    //     prevCanvas.remove();
    // }

    canvas = document.getElementById('canvas1');
    //canvas.setAttribute('id', 'canvas1');

    canvas2 = document.getElementById('canvas2');
    canvas3 = document.getElementById('canvas3');

    flame_canvas = document.getElementById("c"),


        //canvas2.setAttribute('id', 'canvas2');



        ctx = canvas.getContext('2d');
    ctx2 = canvas2.getContext('2d');
    ctx3 = canvas3.getContext('2d');
    flame_ctx = flame_canvas.getContext("2d");

    man = false;
    tog = true;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx3.clearRect(0, 0, canvas2.width, canvas2.height);
    flame_ctx.clearRect(0, 0, canvas2.width, canvas2.height);

    // var scaleX = window.innerWidth / canvas2.width;
    // var scaleY = window.innerHeight / canvas2.height;

    // var scaleToFit = Math.min(scaleX, scaleY);
    // var scaleToCover = Math.max(scaleX, scaleY);

    // stage.style.transformOrigin = '0 0'; //scale from top left
    // stage.style.transform = 'scale(' + scaleToFit + ')';

    list = [];
    mouse_click = false;
    mouse_click_timer = false;

    /*w = canvas.width = COLS * SPACING + MARGIN * 2;
    h = canvas.height = ROWS * SPACING + MARGIN * 2;*/
    w = canvas.width = canvas2.width = canvas3.width = flame_canvas.width = window.innerWidth;
    h = canvas.height = canvas2.height = canvas3.height = flame_canvas.height = window.innerHeight;

    // container.style.marginLeft = Math.round( w * -0.5 ) + 'px';
    // container.style.marginTop = Math.round( h * -0.5 ) + 'px';

    for (i = 0; i < NUM_PARTICLES; i++) {

        p = Object.create(particle);
        p.x = p.ox = MARGIN + SPACING * (i % COLS);
        p.y = p.oy = MARGIN + SPACING * Math.floor(i / COLS);

        list[i] = p;
    }

    /// console.log(list);

    const onMousePositionChange = function (e) {
        bounds = container.getBoundingClientRect();
        mx = (e.clientX || bounds.width / 2) - bounds.left;
        my = (e.clientY || bounds.height / 2) - bounds.top;
        man = true;

        Mouse.x = e.clientX;
        Mouse.y = e.clientY;
        updateCanvas = true;
    }

    onMousePositionChange(e);

    window.addEventListener('mousemove', onMousePositionChange);

    var timeoutId = 0;

    $(window).on('mousedown', function () {
        timeoutId = setTimeout(() => { }, MOUSE_CLICK_WAVE_DURATION);

        mouse_click = true;
        click_start_point = false;
    }).on('mouseup mouseleave', function () {
        clearTimeout(timeoutId);
        mouse_click = false;
    });

    // $(document).on("mousedown", window, function(e){
    //
    //
    //     if (mouse_click_timer !== false) {
    //         clearTimeout(mouse_click_timer);
    //     }
    //
    //     mouse_click_timer = setTimeout(() => {
    //         mouse_click = false;
    //     }, MOUSE_CLICK_WAVE_DURATION);
    // });

    if (typeof Stats === 'function') {
        document.body.appendChild((stats = new Stats()).domElement);
    }

    //  container.appendChild( canvas );
    //container.appendChild( canvas2 );
}

function step() {

    if (stats) stats.begin();

    if (tog = !tog) {

        if (!man) {

            //FREE WILL!!11!!1
            // t = +new Date() * 0.001;
            // mx = w * 0.5 + ( Math.cos( t * 2.1 ) * Math.cos( t * 0.9 ) * w * 0.45 );
            // my = h * 0.5 + ( Math.sin( t * 3.2 ) * Math.tan( Math.sin( t * 0.8 ) ) * h * 0.45 );
        }

        b = (a = ctx.createImageData(w, h)).data;

        for (i = 0; i < NUM_PARTICLES; i++) {

            p = list[i];

            d = (dx = mx - p.x) * dx + (dy = my - p.y) * dy;
            f = -THICKNESS / d;

            if (d < THICKNESS) {
                t = Math.atan2(dy, dx);
                p.vx += f * Math.cos(t);
                p.vy += f * Math.sin(t);
            }

            p.x += (p.vx *= DRAG) + (p.ox - p.x) * EASE;
            p.y += (p.vy *= DRAG) + (p.oy - p.y) * EASE;

            // b[n = ( ~~p.x + ( ~~p.y * w ) ) * 4] = OPACITY_MAX;

        }

    } else {

        b = (a = ctx.createImageData(w, h)).data;

        for (i = 0; i < NUM_PARTICLES; i++) {

            p = list[i];
            n = (~~p.x + (~~p.y * w)) * 4;
            // b[n] = COLOR_ARR1[Math.floor(Math.random()*COLOR_ARR1.length)];
            // b[n+1] = COLOR_ARR2[Math.floor(Math.random()*COLOR_ARR2.length)];
            // b[n+2] = COLOR_ARR3[Math.floor(Math.random()*COLOR_ARR3.length)];

            rand_opacity = Math.floor(Math.random() * 100) + 50;
            main_color_arr = rand_opacity % 99 == 0 ? [255, 255, 255, 1] : COLOR_ARR1;


            b[n] = main_color_arr[0];
            b[n + 1] = main_color_arr[1];
            b[n + 2] = main_color_arr[2];

            prox_y = Math.abs(my - p.y);
            prox_x = Math.abs(mx - p.x);
            proxy_distance = Math.sqrt(prox_y * prox_y + prox_x * prox_x);


            if (mouse_click) {
                if (click_start_point === false) click_start_point = +new Date() * 0.001;

                c_time = +new Date() * 0.001 - click_start_point;
                THICKNESS = Math.pow(THICKNESS_R /*/ (c_time * THICKNESS_R / 10)*/, 2.5) * (c_time + 6);
                c_proxy_radius = PROXY_RADIUS + Math.sqrt(THICKNESS);

                c_easeing = EasingFunctions.easeInCubic(c_time);

                pivot_accent_color_arr[0] = 255;
                pivot_accent_color_arr[1] = Math.min(255, (255 * c_proxy_radius / (proxy_distance)) * c_easeing);
                pivot_accent_color_arr[2] = Math.min(255, (255 * c_proxy_radius / (proxy_distance)) * c_easeing);

                b[n] = pivot_accent_color_arr[Math.floor(Math.random() * pivot_accent_color_arr.length)];


                //b[n + 3] = OPACITY /*+ (OPACITY_MAX - OPACITY) * (c_time * MOUSE_CLICK_WAVE_DURATION / 200)*/;

                if (proxy_distance >= PROXY_RADIUS * c_time) {
                    b[n + 3] = OPACITY_MAX;
                } else {
                    b[n + 3] = OPACITY;
                }


                //console.log(c_time);

            } else {
                OPACITY = old_opacity;
                THICKNESS = Math.pow(THICKNESS_R, 2);
                c_proxy_radius = PROXY_RADIUS;
                pivot_accent_color_arr[0] = 255;
                pivot_accent_color_arr[1] = 0;
                pivot_accent_color_arr[2] = 0;
            }

            if (proxy_distance <= c_proxy_radius && proxy_distance <= c_proxy_radius) {
                prox_distance_perc = 100 - (100 * (proxy_distance - THICKNESS_R)) / (c_proxy_radius - THICKNESS_R);

                b[n] = pivot_accent_color_arr[Math.floor(Math.random() * pivot_accent_color_arr.length)];
                b[n + 3] = OPACITY + (OPACITY_MAX - OPACITY) * Math.pow((prox_distance_perc / 100), 3);
            } else
                //b[( ~~p.x + ( ~~p.y * w ) ) * 4] = COLOR_ARR1[Math.floor(Math.random()*COLOR_ARR1.length)];
                b[n + 3] = rand_opacity;

        }

        ctx.putImageData(a, 0, 0);
    }

    draw();

    for (var i = 0; i < texts.length; i++) {

        dty = texts[i].y + texts[i].font_size_v;
        dtx = texts[i].x + ctx.measureText(texts[i].name).width / 2;

        prox_t_y = Math.abs(my - dty);
        prox_t_x = Math.abs(mx - dtx);
        proxy_t_distance = Math.sqrt(prox_t_y * prox_t_y + prox_t_x * prox_t_x);

        //console.log(ctx.shadowBlur)

        ctx.font = texts[i].font_style + texts[i].font_size + 'pt ' + texts[i].font_family;
        ctx.fillStyle = 'rgba(' + main_color[0] + ', ' + main_color[1] + ', ' + main_color[2] + ', ' + 1 + ')';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(texts[i].name, texts[i].x, texts[i].y);
    }

    //console.log(mouse_click);
    if (stats) stats.end();

    requestAnimationFrame(step);
}

var waitForFinalEvent = (function () {
    var timers = {};
    return function (callback, ms, uniqueId) {
        if (!uniqueId) {
            uniqueId = "Don't call this twice without a uniqueId";
        }
        if (timers[uniqueId]) {
            clearTimeout(timers[uniqueId]);
        }
        timers[uniqueId] = setTimeout(callback, ms);
    };
})();

$(window).on('resize', function (e) {
    waitForFinalEvent(function () {
        NUM_PARTICLES = ((ROWS = window.innerHeight / SPACING) * (COLS = window.innerWidth / SPACING));
        init(e);
        init2();
        step();
    }, 500, "some unique string");
});

$(window).on('load', function (e) {
    init(e);
    init2();
    step();
});


// $(document).ready(() => {

//     ///STRIPES

//     loadAllImages(function () {
//         init();
//         init2();
//         step();
//     })


// });


// LINE SEGMENTS
var segments = [

    // Border
    { id: 1, a: { x: 0, y: 0 }, b: { x: window.innerWidth, y: 0 }, flag: 'start', effect_delta: -THICKNESS, edges: 4, parallax_tepth: 0 },
    { id: 1, a: { x: window.innerWidth, y: 0 }, b: { x: window.innerWidth, y: window.innerHeight } },
    { id: 1, a: { x: window.innerWidth, y: window.innerHeight }, b: { x: 0, y: window.innerHeight } },
    { id: 1, a: { x: 0, y: window.innerHeight }, b: { x: 0, y: 0 }, flag: 'end' },

    { id: 2, a: { x: 100, y: 550 }, b: { x: 120, y: 450 }, flag: 'start', parallax_tepth: 0.1, color: [main_color[0], main_color[1], main_color[2], 1], c_x: 1000, c_y: 1000, edges: 4 },
    { id: 2, a: { x: 120, y: 450 }, b: { x: 200, y: 480 } },
    { id: 2, a: { x: 200, y: 480 }, b: { x: 140, y: 610 } },
    { id: 2, a: { x: 140, y: 610 }, b: { x: 100, y: 550 }, flag: 'end' },

    { id: 3, a: { x: 100, y: 200 }, b: { x: 120, y: 250 }, flag: 'start', parallax_tepth: 0.4, effect_delta: 200, color: accent_color/*[139, 195, 74, 1]*/, c_x: 1000, c_y: 1000, edges: 3 },
    { id: 3, a: { x: 120, y: 250 }, b: { x: 60, y: 300 } },
    { id: 3, a: { x: 60, y: 300 }, b: { x: 100, y: 200 }, flag: 'end' },

    { id: 4, a: { x: 200, y: 260 }, b: { x: 220, y: 150 }, flag: 'start', parallax_tepth: 0.75, effect_delta: 0, color: accent_color/*[103, 58, 183, 1],*/, c_x: 1000, c_y: 1000, edges: 4 },
    { id: 4, a: { x: 220, y: 150 }, b: { x: 300, y: 200 } },
    { id: 4, a: { x: 300, y: 200 }, b: { x: 350, y: 320 } },
    { id: 4, a: { x: 350, y: 320 }, b: { x: 200, y: 260 }, flag: 'end' },

    /*{id: 5, a:{x:340,y:60}, b:{x:360,y:40}, flag: 'start', color: [233, 30, 99, 1], c_x: 1000, c_y: 1000, edges: 3},
    {id: 5, a:{x:360,y:40}, b:{x:370,y:70}},
    {id: 5, a:{x:370,y:70}, b:{x:340,y:60}, flag: 'end'},*/

    { id: 6, a: { x: 450, y: 190 }, b: { x: 560, y: 170 }, flag: 'start', parallax_tepth: 0.3, effect_delta: 0, color: accent_color/*[0, 150, 136, 1]*/, c_x: 1000, c_y: 1000, edges: 4 },
    { id: 6, a: { x: 560, y: 170 }, b: { x: 540, y: 270 } },
    { id: 6, a: { x: 540, y: 270 }, b: { x: 430, y: 290 } },
    { id: 6, a: { x: 430, y: 290 }, b: { x: 450, y: 190 }, flag: 'end' },

    { id: 7, a: { x: window.innerWidth - 50, y: window.innerHeight - 50 }, b: { x: window.innerWidth - 40, y: window.innerHeight - 70 }, flag: 'start', parallax_tepth: 0.3, effect_delta: 0, color: accent_color/*[0, 150, 136, 1]*/, c_x: 1000, c_y: 1000, edges: 5 },
    { id: 7, a: { x: window.innerWidth - 40, y: window.innerHeight - 70 }, b: { x: window.innerWidth - 90, y: window.innerHeight - 110 } },
    { id: 7, a: { x: window.innerWidth - 90, y: window.innerHeight - 110 }, b: { x: window.innerWidth - 115, y: window.innerHeight - 100 } },
    { id: 7, a: { x: window.innerWidth - 115, y: window.innerHeight - 100 }, b: { x: window.innerWidth - 230, y: window.innerHeight - 80 } },
    { id: 7, a: { x: window.innerWidth - 230, y: window.innerHeight - 80 }, b: { x: window.innerWidth - 50, y: window.innerHeight - 50 }, flag: 'end' },

    /*{id: 7, a:{x:400,y:95}, b:{x:580,y:50}, flag: 'start', color: [255, 151, 0, 1], c_x: 1000, c_y: 1000, edges: 3},
    {id: 7, a:{x:580,y:50}, b:{x:480,y:150}},
    {id: 7, a:{x:480,y:150}, b:{x:400,y:95}, flag: 'end'},*/
    /*
        {id: 8, a:{x:1400,y:595}, b:{x:1580,y:150}, flag: 'start', parallax_tepth: 0.2, effect_delta:0, color: accent_color, c_x: 1000, c_y: 1000, edges: 3},
        {id: 8, a:{x:1580,y:150}, b:{x:1780,y:450}},
        {id: 8, a:{x:1780,y:450}, b:{x:1400,y:595}, flag: 'end'},*/


    // {id: 9, a:{x:800,y:700}, b:{x:720,y:500}, flag: 'start', color: [96, 125, 139, 1], c_x: 1000, c_y: 1000, edges: 5},
    // {id: 9, a:{x:720,y:500}, b:{x:160,y:800}},
    // {id: 9, a:{x:160,y:800}, b:{x:560,y:830}},
    // {id: 9, a:{x:560,y:830}, b:{x:660,y:630}},
    // {id: 9, a:{x:660,y:630}, b:{x:800,y:700}, flag: 'end'},

    //FRAME

    //TOP
    // {id: 10, a:{x:borderInset,y:borderInset}, b:{x:calc_win_width - (borderInset + borderDistance),y:borderInset}, flag: 'start', effect_delta:0, color: [255, 255, 255, .5], c_x: 0, c_y: 0, edges: 4},
    // {id: 10, a:{x:calc_win_width - (borderInset + borderDistance), y:borderInset}, b:{x:calc_win_width - (borderInset + borderDistance),y:(borderInset + borderThickness)}},
    // {id: 10, a:{x:calc_win_width - (borderInset + borderDistance), y:(borderInset + borderThickness)}, b:{x:borderInset,y:(borderInset + borderThickness)}},
    // {id: 10, a:{x:borderInset,y:(borderInset + borderThickness)}, b:{x:borderInset,y:borderInset}, flag: 'end'},

    //LEFT
    // {id: 11, a:{x:calc_win_width - borderInset, y: borderInset}, b:{x:calc_win_width - (borderInset + borderThickness), y: borderInset}, flag: 'start', color: [255, 255, 255, .5], c_x: 0, c_y: 0, edges: 4},
    // {id: 11, a:{x:calc_win_width - (borderInset + borderThickness), y: borderInset}, b:{x:calc_win_width - (borderInset + borderThickness),y:calc_win_height - (borderInset + borderDistance)}},
    // {id: 11, a:{x:calc_win_width - (borderInset + borderThickness), y:calc_win_height - (borderInset + borderDistance)}, b:{x:calc_win_width - borderInset,y:calc_win_height - (borderInset + borderDistance)}},
    // {id: 11, a:{x:calc_win_width - borderInset,y:calc_win_height - (borderInset + borderDistance)}, b:{x:calc_win_width - borderInset, y: borderInset}, flag: 'end'},

    //BOTTOM
    // {id: 12, a:{x:(borderInset + borderDistance),y:calc_win_height - borderInset}, b:{x:calc_win_width - borderInset,y:calc_win_height - borderInset}, flag: 'start', effect_delta:0, color: [255, 255, 255, .5], c_x: 0, c_y: 0, edges: 4},
    // {id: 12, a:{x:calc_win_width - borderInset, y:calc_win_height - borderInset}, b:{x:calc_win_width - borderInset,y:calc_win_height - (borderInset + borderThickness)}},
    // {id: 12, a:{x:calc_win_width - borderInset, y:calc_win_height - (borderInset + borderThickness)}, b:{x:(borderInset + borderDistance),y:calc_win_height - (borderInset + borderThickness)}},
    // {id: 12, a:{x:(borderInset + borderDistance),y:calc_win_height - (borderInset + borderThickness)}, b:{x:(borderInset + borderDistance),y:calc_win_height - borderInset}, flag: 'end'},

    //RIGHT
    // {id: 13, a:{x:borderInset, y: (borderInset + borderDistance)}, b:{x:(borderInset + borderThickness), y: (borderInset + borderDistance)}, flag: 'start', color: [255, 255, 255, .5], c_x: 0, c_y: 0, edges: 4},
    // {id: 13, a:{x:(borderInset + borderThickness), y: (borderInset + borderDistance)}, b:{x:(borderInset + borderThickness),y:calc_win_height - borderInset}},
    // {id: 13, a:{x:(borderInset + borderThickness),y:calc_win_height - borderInset}, b:{x:borderInset,y:calc_win_height - borderInset}},
    // {id: 13, a:{x:borderInset,y:calc_win_height - borderInset}, b:{x:borderInset, y: (borderInset + borderDistance)}, flag: 'end'},



    { id: 14, parallax_tepth: 0.01, a: { x: borderInset + borderFigureOffsetX, y: (borderInset + borderFigureOffsetY) }, b: { x: (borderInset + 2 * borderFigureInset + borderFigureOffsetX), y: (borderInset + 2 * borderFigureInset + borderFigureOffsetY) }, flag: 'start', effect_delta: 0, color: main_color, c_x: 0, c_y: 0, edges: 4 },
    { id: 14, a: { x: (borderInset + 2 * borderFigureInset + borderFigureOffsetX), y: (borderInset + 2 * borderFigureInset + borderFigureOffsetY) }, b: { x: (borderInset + 2 * borderFigureInset + 100 + borderFigureOffsetX), y: (borderInset + 2 * borderFigureInset + borderFigureOffsetY) } },
    { id: 14, a: { x: (borderInset + 2 * borderFigureInset + 100 + borderFigureOffsetX), y: (borderInset + 2 * borderFigureInset + borderFigureOffsetY) }, b: { x: (borderInset + 2 * borderFigureInset + 100 + borderFigureOffsetX), y: (borderInset + 2 * borderFigureInset - borderThickness + borderFigureOffsetY) } },
    { id: 14, a: { x: (borderInset + 2 * borderFigureInset + 100 + borderFigureOffsetX), y: (borderInset + 2 * borderFigureInset - borderThickness + borderFigureOffsetY) }, b: { x: (borderInset + 2 * borderFigureInset + borderThickness + borderFigureOffsetX), y: (borderInset + 2 * borderFigureInset - borderThickness + borderFigureOffsetY) } },
    { id: 14, a: { x: (borderInset + 2 * borderFigureInset + borderThickness + borderFigureOffsetX), y: (borderInset + 2 * borderFigureInset - borderThickness + borderFigureOffsetY) }, b: { x: (borderInset + borderThickness + borderFigureOffsetX), y: (borderInset - borderThickness + borderFigureOffsetY) } },
    { id: 14, a: { x: (borderInset + borderThickness + borderFigureOffsetX), y: (borderInset + borderFigureOffsetY) }, b: { x: (borderInset + borderFigureOffsetX), y: (borderInset + borderFigureOffsetY - borderThickness) }, flag: 'end' },



    { id: 15, parallax_tepth: 0.01, a: { x: (calc_win_width - borderInset - borderFigureOffsetX), y: (calc_win_height - borderInset - borderFigureOffsetY) }, b: { x: (calc_win_width - borderInset - borderFigureInset * 2 - borderFigureOffsetX), y: (calc_win_height - borderInset - borderFigureInset * 2 - borderFigureOffsetY) }, flag: 'start', effect_delta: 0, color: main_color, c_x: 0, c_y: 0, edges: 4 },
    { id: 15, a: { x: (calc_win_width - borderInset - 2 * borderFigureInset - borderFigureOffsetX), y: (calc_win_height - borderInset - 2 * borderFigureInset - borderFigureOffsetY) }, b: { x: (calc_win_width - borderInset - 2 * borderFigureInset - 100 - borderFigureOffsetX), y: (calc_win_height - borderInset - 2 * borderFigureInset - borderFigureOffsetY) } },
    { id: 15, a: { x: (calc_win_width - borderInset - 2 * borderFigureInset - 100 - borderFigureOffsetX), y: (calc_win_height - borderInset - 2 * borderFigureInset - borderFigureOffsetY) }, b: { x: (calc_win_width - borderInset - 2 * borderFigureInset - 100 - borderFigureOffsetX), y: (calc_win_height - borderInset + borderThickness - 2 * borderFigureInset - borderFigureOffsetY) } },
    { id: 15, a: { x: (calc_win_width - borderInset - 2 * borderFigureInset - 100 - borderFigureOffsetX), y: (calc_win_height - borderInset + borderThickness - 2 * borderFigureInset - borderFigureOffsetY) }, b: { x: (calc_win_width - borderInset - 2 * borderFigureInset - borderThickness - borderFigureOffsetX), y: (calc_win_height - borderInset + borderThickness - 2 * borderFigureInset - borderFigureOffsetY) } },
    { id: 15, a: { x: (calc_win_width - borderInset - 2 * borderFigureInset - borderThickness - borderFigureOffsetX), y: (calc_win_height - borderInset + borderThickness - 2 * borderFigureInset - borderFigureOffsetY) }, b: { x: (calc_win_width - borderInset - borderThickness - borderFigureOffsetX), y: (calc_win_height - borderInset + borderThickness - borderFigureOffsetY) } },
    { id: 15, a: { x: (calc_win_width - borderInset - borderThickness - borderFigureOffsetX), y: (calc_win_height - borderInset + borderThickness - borderFigureOffsetY) }, b: { x: (calc_win_width - borderInset - borderFigureOffsetX), y: (calc_win_height - borderInset + borderThickness - borderFigureOffsetY) }, flag: 'end' },

    //\FRAME


    //HEADER

    // {id: 16, a:{x:borderInset,y:10}, b:{x:borderInset + 100,y:10}, flag: 'start', effect_delta:-THICKNESS, color: [0, 0, 0, 0], c_x: 1000, c_y: 1000, edges: 4, text: 'test', composite: 'destination-out'},
    // {id: 16, a:{x:borderInset + 100,y:10}, b:{x:borderInset + 100,y:10}, effect_delta:-THICKNESS},
    // {id: 16, a:{x:borderInset + 100,y:10}, b:{x:borderInset,y:10}, effect_delta:-THICKNESS},
    // {id: 16, a:{x:borderInset,y:10}, b:{x:borderInset,y:10}, flag: 'end', effect_delta:-THICKNESS},

    //\HEADER


];


//var canvas, container, ctx,
// MOUSE
var Mouse = {
    x: 0,
    y: 0
};

// Find intersection of RAY & SEGMENT
function getIntersection(ray, segment) {

    // RAY in parametric: Point + Delta*T1
    var r_px = ray.a.x;
    var r_py = ray.a.y;
    var r_dx = ray.b.x - ray.a.x;
    var r_dy = ray.b.y - ray.a.y;

    // SEGMENT in parametric: Point + Delta*T2
    var s_px = segment.a.x;
    var s_py = segment.a.y;
    var s_dx = segment.b.x - segment.a.x;
    var s_dy = segment.b.y - segment.a.y;

    // Are they parallel? If so, no intersect
    var r_mag = Math.sqrt(r_dx * r_dx + r_dy * r_dy);
    var s_mag = Math.sqrt(s_dx * s_dx + s_dy * s_dy);
    if (r_dx / r_mag == s_dx / s_mag && r_dy / r_mag == s_dy / s_mag) {
        // Unit vectors are the same.
        return null;
    }

    // SOLVE FOR T1 & T2
    // r_px+r_dx*T1 = s_px+s_dx*T2 && r_py+r_dy*T1 = s_py+s_dy*T2
    // ==> T1 = (s_px+s_dx*T2-r_px)/r_dx = (s_py+s_dy*T2-r_py)/r_dy
    // ==> s_px*r_dy + s_dx*T2*r_dy - r_px*r_dy = s_py*r_dx + s_dy*T2*r_dx - r_py*r_dx
    // ==> T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx)
    var T2 = (r_dx * (s_py - r_py) + r_dy * (r_px - s_px)) / (s_dx * r_dy - s_dy * r_dx);
    var T1 = (s_px + s_dx * T2 - r_px) / r_dx;

    // Must be within parametic whatevers for RAY/SEGMENT
    if (T1 < 0) return null;
    if (T2 < 0 || T2 > 1) return null;

    // ctx2.strokeStyle = 'red';
    // ctx2.beginPath();
    // ctx2.arc(r_px+r_dx*T1, r_py+r_dy*T1, 0.5, 0, 2*Math.PI, false);
    // ctx2.stroke();

    // Return the POINT OF INTERSECTION
    return {
        x: r_px + r_dx * T1,
        y: r_py + r_dy * T1,
        param: T1
    };

}

function getSightPolygon(sightX, sightY) {

    // Get all unique points
    var points = (function (segments) {
        var a = [];
        segments.forEach(function (seg) {
            a.push(seg.a, seg.b);
        });
        return a;
    })(segments);

    var uniquePoints = (function (points) {
        var set = {};
        return points.filter(function (p) {
            var key = p.x + "," + p.y;
            if (key in set) {
                return false;
            } else {
                set[key] = true;
                return true;
            }
        });
    })(points);

    // Get all angles
    var uniqueAngles = [];
    for (var j = 0; j < uniquePoints.length; j++) {
        var uniquePoint = uniquePoints[j];
        var angle = Math.atan2(uniquePoint.y - sightY, uniquePoint.x - sightX);
        uniquePoint.angle = angle;
        uniqueAngles.push(angle - 0.00001, angle, angle + 0.00001);
    }

    // RAYS IN ALL DIRECTIONS
    var intersects = [];
    for (var j = 0; j < uniqueAngles.length; j++) {
        var angle = uniqueAngles[j];

        // Calculate dx & dy from angle
        var dx = Math.cos(angle);
        var dy = Math.sin(angle);

        // Ray from center of screen to mouse
        var ray = {
            a: { x: sightX, y: sightY },
            b: { x: sightX + dx, y: sightY + dy }
        };

        // Find CLOSEST intersection
        var closestIntersect = null;
        for (var i = 0; i < segments.length; i++) {
            var intersect = getIntersection(ray, segments[i]);
            if (!intersect) continue;
            if (!closestIntersect || intersect.param < closestIntersect.param) {
                closestIntersect = intersect;
            }
        }

        // Intersect angle
        if (!closestIntersect) continue;
        closestIntersect.angle = angle;

        // Add to list of intersects
        intersects.push(closestIntersect);

    }

    // Sort intersects by angle
    intersects = intersects.sort(function (a, b) {
        return a.angle - b.angle;
    });

    // Polygon is intersects, in order of angle
    return intersects;

}

function draw() {

    //console.log(new Date);

    // Clear canvas
    ctx2.fillStyle = "rgba(0,0,0,1)";
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

    //ctx.globalCompositeOperation = 'source-over';

    ctx2.globalCompositeOperation = 'source-over';

    ctx2.rect(0, 0, canvas2.width, canvas2.height);
    ctx2.fill();

    // Draw segments
    drawSegments();

    updateLighting();

    ctx2.globalCompositeOperation = 'destination-over';

    flame_ctx.clearRect(0, 0, w, h);

    if (Math.random() > .18 || 1) flames.push(new Circle(mx, my + 10, 2 + Math.random(), []));
    for (var i = 0; i < flames.length; i++) {
        flames[i].update(1920, h, flames);
        if (flames[i] !== undefined) {
            //console.log(flames[i]);
            flames[i].render(flame_ctx);
        }
    }

    // console.log(mx, my);

    // sway_x = Math.random() > .95 ? randomInRange(-5, 5) : 0 ;
    // sway_y = Math.random() > .95 ? randomInRange(-20,-35) : 0 ;

    // if(mx != undefined && my != undefined) {
    //     var gradient1 = ctx2.createRadialGradient(mx, my, calc_win_width/6, mx + randomInRange(-5, 5), my + sway_y, 0);
    //     gradient1.addColorStop(0,'rgba(0, 0, 0, 0)');
    //     gradient1.addColorStop(0.7,'rgba(' + main_color[0]/10 + ', ' + main_color[1]/10 + ', ' + main_color[2]/10 + ', ' + 1 + ')');
    //     gradient1.addColorStop(1,'rgba(' + main_color[0]/4 + ', ' + main_color[1]/4 + ', ' + main_color[2]/4 + ', ' + 1 + ')');
    //     ctx2.fillStyle = gradient1;
    //     ctx2.fillRect(0, 0, calc_win_width, calc_win_height);

    // }


    // for (var i = 50; i >= 1; i--) {
    //     ctx2.fillStyle = 'rgba(' + main_color[0] + ', ' + main_color[1] + ', ' + main_color[2] + ', ' + 1/(i*i) + ')';

    //     //"rgba(255,255,255," + Math.min(1, Math.pow(1/i, 2)) + ")";
    //    // ctx2.lineWidth=10;
    //     ctx2.beginPath();
    //     ctx2.arc(mx, my, 10+i*i/2, 0, 2*Math.PI, false);
    //     ctx2.fill();
    // }


    // for(var angle=0;angle<Math.PI*2;angle+=(Math.PI*2)/10){
    // 	var dx = Math.cos(angle)*fuzzyRadius;
    // 	var dy = Math.sin(angle)*fuzzyRadius;
    // 	ctx2.beginPath();
    //    	ctx2.arc(mx+dx, my+dy, 2, 0, 2*Math.PI, false);
    //    	ctx2.fill();
    //    }

}

function updateLighting() {


    ctx2.globalCompositeOperation = 'source-over';

    // Sight Polygons
    var fuzzyRadius = 1;
    var polygons = [getSightPolygon(mx, my)];

    // for(var angle=0;angle<Math.PI*2;angle+=(Math.PI*2)){
    //     var dx = Math.cos(angle)*fuzzyRadius;
    //     var dy = Math.sin(angle)*fuzzyRadius;
    //     polygons.push(getSightPolygon(mx+dx,my+dy));
    // };

    //console.log(polygons);

    // DRAW AS A GIANT POLYGON
    for (var i = 1; i < polygons.length; i++) {
        drawPolygon(polygons[i], ctx2, "rgba(100,0,0,0.4)");
    }
    drawPolygon(polygons[0], ctx2, "blue");
}

function drawPolygon(polygon, ctx2, fillStyle, compOperator = 'destination-out') {
    ctx2.globalCompositeOperation = compOperator;
    ctx2.fillStyle = fillStyle;
    ctx2.beginPath();
    ctx2.moveTo(polygon[0].x, polygon[0].y);
    for (var i = 1; i < polygon.length; i++) {
        var intersect = polygon[i];
        ctx2.lineTo(intersect.x, intersect.y);
    }
    ctx2.fill();
}

function drawSegments(fillStyle = '#fff', compOperator = 'source-over') {
    ctx2.globalCompositeOperation = compOperator;

    edge_count = 0;
    c_x = 0;
    c_y = 0;

    np_x = 0;
    np_y = 0;

    randVelocity_x = 0;
    randVelocity_y = 0;

    centerVector_y = canvas.width / 2 - mx;
    centerVector_x = canvas.height / 2 - my;

    //console.log(centerVector_x, centerVector_y);

    vectorFromCenter = Math.sqrt(centerVector_y * centerVector_y + centerVector_x * centerVector_x);
    parralax_t = Math.atan2(canvas.height / 2 - my, canvas.width / 2 - mx);
    parralax_f_x = vectorFromCenter / (canvas.width / 2);
    parralax_f_y = vectorFromCenter / (canvas.height / 2);

    np_x = parralax_f_x * 30 * Math.cos(parralax_t);
    np_y = parralax_f_y * 30 * Math.sin(parralax_t);

    np_x = !isNaN(np_x) ? np_x : 0;
    np_y = !isNaN(np_y) ? np_y : 0;

    // console.log(np_x, np_y);

    // ctx.globalCompositeOperation = 'source-over';

    // ctx.strokeStyle = 'red';
    // ctx.beginPath();
    // ctx.moveTo(canvas.width/2,canvas.height/2);
    // ctx.lineTo(mx,my);
    // ctx.stroke();

    // ctx.strokeStyle = 'green';
    // ctx.beginPath();
    // ctx.moveTo(canvas.width/2,canvas.height/2);
    // ctx.lineTo(np_x + canvas.width/2,np_y + canvas.height/2);
    // ctx.stroke();

    var polygons = getSightPolygon(mx, my);

    // DRAW ALL RAYS
    ctx.strokeStyle = "#dd3838";
    ctx.fillStyle = "#dd3838";

    for (var i = 0; i < segments.length; i++) {
        let seg = segments[i],
            effect_delta = seg.effect_delta;

        if (seg.composite) {
            ctx2.globalCompositeOperation = seg.composite;
        } else ctx2.globalCompositeOperation = 'source-over';

        if (seg.id > 1) {

            d = (dx = mx - seg.c_x) * dx + (dy = my - seg.c_y) * dy;
            f = -(THICKNESS + effect_delta) / d;

            if (d < (THICKNESS + effect_delta)) {

                t = Math.atan2(dy, dx);
                seg.a.vx += f * Math.cos(t);
                seg.a.vy += f * Math.sin(t);
                seg.b.vx += f * Math.cos(t);
                seg.b.vy += f * Math.sin(t);
            }

            seg.a.x += (seg.a.vx *= DRAG) + (seg.a.ox - seg.a.x) * EASE + np_x * seg.parallax_tepth;
            seg.a.y += (seg.a.vy *= DRAG) + (seg.a.oy - seg.a.y) * EASE + np_y * seg.parallax_tepth;
            seg.b.x += (seg.b.vx *= DRAG) + (seg.b.ox - seg.b.x) * EASE + np_x * seg.parallax_tepth;
            seg.b.y += (seg.b.vy *= DRAG) + (seg.b.oy - seg.b.y) * EASE + np_y * seg.parallax_tepth;
        }

        prox_s_y = Math.abs(my - seg.c_y);
        prox_s_x = Math.abs(mx - seg.c_x);
        proxy_s_distance = Math.sqrt(prox_s_y * prox_s_y + prox_s_x * prox_s_x);

        if (seg.hasOwnProperty('flag')) {

            if (seg.flag == 'start') {

                edge_count = 0;
                c_x = 0;
                c_y = 0;
                fillStyleC = 'transparent';

                if (seg.hasOwnProperty('color')) {
                    opacity_c =/* seg.color[3] */Math.max(0.25, 1 - ((proxy_s_distance) * 100 / diagonal_s) / 100 + seg.parallax_tepth / 2);
                    fillStyleC = 'rgba(' + seg.color[0] + ', ' + seg.color[1] + ', ' + seg.color[2] + ', ' + opacity_c + ')';
                }

                //console.log(proxy_distance);
                ctx2.fillStyle = fillStyleC
                // ctx2.shadowColor = fillStyleC;
                //       ctx2.shadowBlur = 10;
                /*ctx2.shadowOffsetX = 5;
                ctx2.shadowOffsetY = 5;*/
                ctx2.beginPath();
                ctx2.moveTo(seg.a.x, seg.a.y);
                ctx2.lineTo(seg.b.x, seg.b.y);
                c_x += seg.a.x;
                c_y += seg.a.y;
                edge_count++;
            } else if (seg.flag == 'end') {

                ctx2.lineTo(seg.b.x, seg.b.y);
                c_x += seg.a.x;
                c_y += seg.a.y;
                edge_count++;

                c_x = c_x / edge_count;
                c_y = c_y / edge_count;

                for (var j = 0; j < edge_count; j++) {
                    segments[i - j].c_x = c_x;
                    segments[i - j].c_y = c_y;
                }

                start_i = i - edge_count + 1;

                ctx2.closePath();
                ctx2.fill();

                //  ctx2.lineWidth=10;
                // ctx2.stroke();

                if (seg.id == 3) {

                    // make the current path a clipping path
                    // ctx2.clip();

                    // draw the image which will be clipped except in the clipping path
                    //ctx2.drawImage(imgs[1], c_x, c_y);

                    // restore the unclipped context (==undo the clipping path)
                    //ctx2.restore();
                }

                if (segments[start_i].text) {
                    ctx2.font = "small-caps bold 20pt sans-serif";
                    ctx2.fillStyle = '#ffffff';
                    ctx2.textAlign = 'left';
                    ctx2.textBaseline = 'top';
                    ctx2.fillText(segments[start_i].text, 100, 10);
                }

                // ctx2.strokeStyle = '#fff';
                // ctx2.fillStyle = '#fff';
                // ctx2.lineTo(c_x, c_y);
                // ctx2.stroke();

                //  ctx2.beginPath();
                // ctx2.arc(c_x, c_y, 5, 0, 2*Math.PI, false);
                // ctx2.fill();

            }
        } else {

            ctx2.lineTo(seg.b.x, seg.b.y);
            c_x += seg.a.x;
            c_y += seg.a.y;
            edge_count++;
        }
    }

    for (var i = 0; i < texts.length; i++) {

        dty = texts[i].y + texts[i].font_size_v;
        dtx = texts[i].x + ctx2.measureText(texts[i].name).width / 2;

        prox_t_y = Math.abs(my - dty);
        prox_t_x = Math.abs(mx - dtx);
        proxy_t_distance = Math.sqrt(prox_t_y * prox_t_y + prox_t_x * prox_t_x);

        //texts[i].font_size = texts[i].font_size_v +  200/Math.max(20, proxy_t_distance);

        ctx2.font = texts[i].font_style + texts[i].font_size + 'pt ' + texts[i].font_family;
        ctx2.fillStyle = '#fff';
        ctx2.textAlign = 'left';
        ctx2.textBaseline = 'top';
        ctx2.fillText(texts[i].name, texts[i].x, texts[i].y);
    }

    //console.log(segments);
}

function coordsToSegm() {
    $.each(coordinates, function (k, coord) {
        let c_first = coord[0],
            c_last = coord[coord.length - 1];

        //  console.log(coord);

        if (coord.length > 2) {

            for (var i = 0; i <= coord.length - 1; i++) {
                lineObj = { a: coord[i], b: coord[(i + 1) % (coord.length)] };

                segments.push(lineObj);
            }

        }

    });
}

function updateSegments() {

    c_x = 0;
    c_y = 0;

    var edges = 0,
        effect_delta = 0,
        parallax_tepth = 0;

    for (var i = 0; i < segments.length; i++) {
        var seg = segments[i];

        segments[i].a.ox = seg.a.x;
        segments[i].a.oy = seg.a.y;
        segments[i].b.ox = seg.b.x;
        segments[i].b.oy = seg.b.y;

        segments[i].a.vx = 0;
        segments[i].a.vy = 0;
        segments[i].b.vx = 0;
        segments[i].b.vy = 0;

        segments[i].c_x = 0;
        segments[i].c_y = 0;

        segments[i].flames = [];

        ctx3.globalCompositeOperation = 'source-over';

        if (seg.hasOwnProperty('flag')) {


            if (seg.flag == 'start') {
                edges = 1;
                parallax_tepth = seg.parallax_tepth;
                //effect_delta = seg.effect_delta;

                c_x = 0;
                c_y = 0;

                c_x += seg.a.x;
                c_y += seg.a.y;

                ctx3.fillStyle = main_color
                ctx3.beginPath();
                ctx3.moveTo(seg.a.x, seg.a.y);
                ctx3.lineTo(seg.b.x, seg.b.y);

            } else if (seg.flag == 'end') {
                edges++;

                c_x += seg.a.x;
                c_y += seg.a.y;

                c_x = c_x / edges;
                c_y = c_y / edges;

                //console.log(i - edges + 1);

                effect_delta = 0;

                for (var j = 0; j < edges; j++) {
                    segments[i - j].c_x = c_x;
                    segments[i - j].c_y = c_y;

                    tt_y = Math.abs(segments[i - j].a.y - c_y);
                    tt_x = Math.abs(segments[i - j].a.x - c_x);
                    c_effect_delta = Math.sqrt(tt_y * tt_y + tt_x * tt_x);
                    effect_delta = c_effect_delta > effect_delta ? c_effect_delta : effect_delta;

                    // console.log(effect_delta);
                }

                for (var j = 0; j < edges; j++) {
                    segments[i - j]['effect_delta'] = 100 * effect_delta;
                    segments[i - j]['edges'] = edges;
                    segments[i - j]['parallax_tepth'] = parallax_tepth;
                }

                ctx3.lineTo(seg.b.x, seg.b.y);

                ctx3.closePath();
                ctx3.fill();

                start_i = i - edges + 1

                if (segments[start_i].text) {
                    ctx3.font = "small-caps bold 20pt sans-serif";
                    ctx3.fillStyle = main_color;
                    ctx3.textAlign = 'left';
                    ctx3.textBaseline = 'top';
                    ctx3.fillText(segments[start_i].text, 100, 10);
                }

            }
        } else {

            edges++;
            c_x += seg.a.x;
            c_y += seg.a.y;

            ctx3.lineTo(seg.b.x, seg.b.y);
        }



        //if (seg.id == 3) 
        console.log(seg)

    }
}

function init2() {

    //coordsToSegm();

    updateSegments();

    // DRAW LOOP
    window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;

    drawLoop();
}

function drawLoop() {
    requestAnimationFrame(drawLoop);
    if (updateCanvas) {
        ///updateLighting();
        updateCanvas = false;
    }
}

$(document).ready(() => {

    ///STRIPES

    $('.strip').each(function () {
        var $t = $(this),
            rows = $.trim($t.html()).split('|||');

        $t.html('');

        $.each(rows, function (i, val) {
            $('<span class="row"></span>').appendTo($t);

            var letters = $.trim(val).split('');

            $.each(letters, function (j, v) {
                v = (v == ' ') ? '&nbsp;' : v;
                $('<span>' + $.trim(v) + '</span>').appendTo($('.row:last', $t));
            });

        });
    });

    $('body').click(function () {
        for (i = 0; i < $('.strip span').length; i++) {
            (function (ind) {
                setTimeout(function () {
                    $('.strip span:not(".row")').eq(ind).toggleClass('animate');
                }, ind * 15);
            })(i);
        }
    }).click();

    ///\STRIPES

    //SMOOTH SCROLL

    var Scrollbar = window.Scrollbar;

    Scrollbar.use(window.OverscrollPlugin);

    var ScrollbarOptions = {
        damping: 0.1,
        thumbMinSize: 9,
        renderByPixels: true,
        alwaysShowTracks: false,
        continuousScrolling: false,
        overscrollEffect: 'bounce',
        //overscrollEffectColor: '#87ceeb',
        overscrollDamping: 0.2,
        syncCallbacks: true,
        wheelEventTarget: EventTarget | null,
        plugins: {
            overscroll: {
                effect: 'bounce',
                damping: 0.2,
                // glowColor: 'rgba(' + main_color[0] + ', ' + main_color[1] + ', ' + main_color[2] + ', ' + 0.5 + ')',
                maxOverscroll: 150,
                // onScroll(position) {
                //     console.log(posision); // > { x: 12, y: 34 }
                // }
            }
        },
    };

    const scroll = Scrollbar.init(document.getElementById('scrollWrapper'), ScrollbarOptions);

    // scroll.addListener(function (status) {
    //         // ...
    // });

    contentHeight = scroll.getSize().content.height;

    // var scene = document.getElementById('fragileLayer');
    // var parallaxInstance = new Parallax(scene);

    //\SMOOTH SCROLL
});

flames = [];

function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

class Circle {

    constructor(x, y, speed, palette) {

        this.x = x;
        this.y = y;
        this.angle = randomInRange(Math.PI + Math.PI / 2.75, 2 * Math.PI - Math.PI / 2.75);
        this.vx = speed * Math.cos(this.angle);
        this.vy = speed * Math.sin(this.angle);
        this.r = randomInRange(1, 5);
        this.or = this.r;
        this.age = 1;
        this.color = /*palette[Math.floor(Math.random() * palette.length)]*/ 'rgba(' + main_color[0] + ', ' + main_color[1] + ', ' + main_color[2] + ', ' + 1 + ')';
    }

    update(w, h, objectsArray) {
        this.x += (this.vx *= 1.005);
        this.y += (this.vy *= 1.005);
        this.r -= .051;
        this.age++;

        // console.log(this.x, this.y);

        ctx2.globalCompositeOperation = 'lighter';

        if (this.x != undefined && this.y != undefined && !isNaN(this.x) && !isNaN(this.y) && this.or > 4) {
            let c_r = this.r > 0 ? this.r : 0,
                op_scale = (100 * c_r / this.or) / 2000;
            var gradient1 = ctx2.createRadialGradient(this.x, this.y, (c_r + 1) * (c_r + 1) * 5, this.x, this.y, 5);
            gradient1.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient1.addColorStop(1, 'rgba(' + main_color[0] * op_scale + ', ' + main_color[1] * op_scale + ', ' + main_color[2] * op_scale + ', ' + 1 + ')');
            ctx2.fillStyle = gradient1;
            ctx2.fillRect(0, 0, calc_win_width, calc_win_height);
            ctx2.fillRect(0, 0, calc_win_width, calc_win_height);
        }


        if (this.age > 20) {
            this.color = colorMixer(dieing_flame_color, main_color, 1 - 1 / (this.age / 20));
        }

        if (mouse_click && this.age < 20) {
            this.r += .2;
            // this.color = colorMixer(dieing_flame_color, main_color, 1/(this.age));
        }
        if (this.x + this.r < 0 || this.x - this.r > w || this.y - this.r > h || this.r <= 0 || objectsArray.length > 30
        /*|| Math.sqrt((mx-this.x)*(mx-this.x) + (my-this.y)*(my-this.y)) > 300*/) {
            objectsArray.splice(objectsArray.indexOf(this), 1);
        }
    }

    render(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.stroke();
    }

}


//colorChannelA and colorChannelB are ints ranging from 0 to 255
function colorChannelMixer(colorChannelA, colorChannelB, amountToMix) {
    var channelA = colorChannelA * amountToMix;
    var channelB = colorChannelB * (1 - amountToMix);
    return parseInt(channelA + channelB);
}
//rgbA and rgbB are arrays, amountToMix ranges from 0.0 to 1.0
//example (red): rgbA = [255,0,0]
function colorMixer(rgbA, rgbB, amountToMix) {
    var r = colorChannelMixer(rgbA[0], rgbB[0], amountToMix);
    var g = colorChannelMixer(rgbA[1], rgbB[1], amountToMix);
    var b = colorChannelMixer(rgbA[2], rgbB[2], amountToMix);
    return "rgb(" + r + "," + g + "," + b + ")";
}







