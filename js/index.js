$(function () {

    // $('.card-text').fitText(.3);

    var win = $(window);
    var sections = $('.golden-section');
    // var circles = $('.golden-section-circle');
    var spiral = $('.golden-spiral');
    var active = $('.active');

    // var backgroundColors = sections.css('background-color');

    var width;
    var height;
    var smallScreen;
    var landscape;
    var goldenAspect = 0.618033;
    var axis = 0.7237;
    var spiralOrigin;

    var rotation = 0;
    var sectionCount = sections.length;
    var currentSection = 0;
    var touchStartX = 0;
    var touchStartY = 0;
    var moved = 0;
    var animRAF;
    var scrollTimeout;

    var rotateRight = 1;

    var userAgent = window.navigator.userAgent.toLowerCase(),
        firefox = userAgent.indexOf('firefox') != -1 || userAgent.indexOf('mozilla') == -1,
        ios = /iphone|ipod|ipad/.test(userAgent),
        safari = (userAgent.indexOf('safari') != -1 && userAgent.indexOf('chrome') == -1) || ios,
        linux = userAgent.indexOf('linux') != -1,
        windows = userAgent.indexOf('windows') != -1;

    resizeHandler();

    win.on('resize', resizeHandler);
    win.on('scroll', function (e) {
        e.preventDefault();     // スクロールイベントはキャンセル
    });

    win.on('wheel', function (e) {
        var deltaY = -e.originalEvent.deltaY;
        if (windows || linux) {
            deltaY = e.deltaY * 5;
        }
        moved = -deltaY || 0;
        rotation += moved/-10;
        rotation = trimRotation();
        e.preventDefault();
        startScrollTimeout();
        cancelAnimationFrame(animRAF);
        scrollHandler();
    });

    win.on('touchstart', function (e) {
        e.preventDefault();
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        moved = 0;
        touchStartX = touch.pageX;
        touchStartY = touch.pageY;
        cancelAnimationFrame(animRAF);
    });

    win.on('touchmove', function (e) {
        e.preventDefault();
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        moved = ((touchStartY - touch.pageY) + (touchStartX - touch.pageX)) * 3;
        touchStartX = touch.pageX;
        touchStartY = touch.pageY;
        rotation += moved/-10;
        rotation = trimRotation();
        startScrollTimeout();
        cancelAnimationFrame(animRAF);
        scrollHandler();
    });

    win.on('touchend', function () {
        animateScroll();
    });

    win.on('keydown', function (e) {
        if (e.keyCode === 39 || e.keyCode === 40 || e.keyCode === 32) {
            cancelAnimationFrame(animRAF);
            animateScroll((currentSection + 1) * -90, rotation);
        } else if (e.keyCode === 37 || e.keyCode === 38) {
            cancelAnimationFrame(animRAF);
            animateScroll((currentSection - 1) * -90, rotation);
        }
        scrollHandler();
    });

    sections.on('click', function () {
        cancelAnimationFrame(animRAF);
        animateScroll($(this).index() * -90, rotation);
    });

    active.hover(function () {
        active.css({
            'border-radius': '0%'
        })
    });



    function scrollHandler() {
        requestAnimationFrame(function () {
            var scale = Math.pow(goldenAspect, rotation/90);
            currentSection = Math.min(sectionCount + 2, Math.max(-sectionCount, Math.floor((rotation-30)/-90)));
            currentSection = Math.max(0, Math.min(currentSection, sectionCount-1));
            spiral.css({
                transform: 'rotate(' + -rotateRight*rotation + 'deg) scale(' + scale + ')'
                // transform: 'rotate(' + rotation + 'deg)'
            });
            sections.removeClass('active');
            sections.eq(currentSection).addClass('active');
            // sections.eq(currentSection).hover(function () {
            //     sections.eq(currentSection).css({
            //         'border-radius': '0%'
            //     })
            // });
            // sections.css({
            //     'background-color': sections.eq(currentSection).css("background-color")
            // });
            // sections.find('.golden-section-circle').css({
            //     'background-color': circles.eq(currentSection).css("background-color")
            // });
        })
    }

    function animateScroll(targetR, startR, speed) {
        var mySpeed = speed || .2;
        if (((targetR || Math.abs(targetR) === 0) && Math.abs(targetR - rotation) > .1) || Math.abs(moved) > 1) {
            if (targetR || Math.abs(targetR) === 0) {
                rotation += mySpeed * (targetR - rotation);
            } else {
                moved *= .98;
                rotation += moved / -10;
            }
            rotation = trimRotation();
            scrollHandler();
            animRAF = requestAnimationFrame(function () {
                animateScroll(targetR, startR, speed)
            });
        } else if (targetR || Math.abs(targetR) === 0) {
            cancelAnimationFrame(animRAF);
            rotation = targetR;
            rotation = trimRotation();
            scrollHandler();
        }
    }

    function buildSpiral() {
        var w, h;
        if (smallScreen && !landscape) {
            spiralOrigin = Math.floor(width * (axis)) + 'px ' + Math.floor((width / goldenAspect) * axis) + 'px';
            w = width;
            h = width;
            rotateRight = 1;
        } else {
            // spiralOrigin = Math.floor(width * axis) + 'px ' + Math.floor(width * (1-goldenAspect) * (axis)) + 'px';
            spiralOrigin = Math.floor(width * axis) + 'px ' + Math.floor(width * goldenAspect * axis) +'px';
            w = width * goldenAspect;
            h = w;
            rotateRight = -1;
        }

        var translate = '';
        if (safari || firefox) {
            translate = 'translate3d(0,0,0)'
        }

        spiral.css({
            transformOrigin: spiralOrigin,
            backfaceVisibility: 'hidden'
        });
        sections.each(function (i) {
            var myRotation = Math.floor(90*i);
            $(this).css({
                width: w,
                height: h,
                transformOrigin: spiralOrigin,
                backfaceVisibility: 'hidden',
                // backgroundColor: 'rgb(' + Math.floor(255-i*(255/sectionCount)) + ',50,50)',
                transform: 'rotate(' + -rotateRight*myRotation + 'deg) scale(' + Math.pow(goldenAspect, i) + ') ' + translate
                // transform: 'rotate(' + myRotation + 'deg)'
            });
        });
        scrollHandler();
    }

    function resizeHandler() {
        width = window.innerWidth;
        height = window.innerHeight;
        smallScreen = width < 960;
        landscape = height < width;
        if (landscape) {
            rotateRight = -1;
        }
        buildSpiral();
        // onWindowResize();   // Three.js用リサイズハンドラも呼んでおく
    }

    function trimRotation() {   // -1500 < rotation < 500
        return Math.max(-1500, Math.min(rotation, 500))
    }

    function startScrollTimeout() {
        clearTimeout(scrollTimeout);
        if (currentSection > -1 && currentSection < sectionCount) {
            scrollTimeout = setTimeout(function () {
                cancelAnimationFrame(animRAF);
                animateScroll(currentSection * -90, rotation, .15);
            }, 100);
        }
    }





});



// var container, stats;
// var camera, scene, renderer, obj;
// // var windowHalfX = window.innerWidth / 2;
// // var windowHalfY = window.innerHeight / 2;
// var canvasWidth = document.getElementById("canvas3D").offsetWidth;
// var canvasHeight = document.getElementById("canvas3D").offsetHeight;
// var windowHalfX = canvasWidth / 2;
// var windowHalfY = canvasHeight / 2;
// init();
// animate();
// function init() {
//     // container = document.createElement( 'div' );
//     container = document.getElementById("canvas3D");
//     // document.body.appendChild( container );
//     camera = new THREE.PerspectiveCamera( 45, canvasWidth / canvasHeight, 1, 2000 );
//     camera.position.z = 250;
//     // scene
//     scene = new THREE.Scene();
//     // var ambient = new THREE.AmbientLight( 0x444444 );
//     // scene.add( ambient );
//     // var directionalLight = new THREE.DirectionalLight( 0xffeedd );
//     // directionalLight.position.set( 0, 0, 1 ).normalize();
//     scene.add( new THREE.AmbientLight(0xffffff) );
//     // model
//     var onProgress = function ( xhr ) {
//         if ( xhr.lengthComputable ) {
//             var percentComplete = xhr.loaded / xhr.total * 100;
//             console.log( Math.round(percentComplete, 2) + '% downloaded' );
//         }
//     };
//     var onError = function ( xhr ) { };
//     THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
//     var mtlLoader = new THREE.MTLLoader();
//     mtlLoader.setPath( 'obj/' );
//     mtlLoader.load( 'bench_1.mtl', function( materials ) {
//         materials.preload();
//         var objLoader = new THREE.OBJLoader();
//         objLoader.setMaterials( materials );
//         objLoader.setPath( 'obj/' );
//         objLoader.load( 'bench_1.obj', function ( object ) {
//             object.position.y = - 95;
//             object.scale.set(100, 100, 100);
//             obj = object
//             scene.add( obj );
//         }, onProgress, onError );
//     });
//     //
//     renderer = new THREE.WebGLRenderer({ alpha: true ,antialias:true});
//     renderer.setPixelRatio( window.devicePixelRatio );
//     renderer.setClearColor( new THREE.Color(0xffffff),0.0);
//     renderer.setSize( canvasWidth, canvasHeight );
//     renderer.domElement.style.position = 'relative';
//     // renderer.domElement.style.top = 0;
//     container.appendChild( renderer.domElement );
//     // render();
//     // document.addEventListener( 'mousemove', onDocumentMouseMove, false );
//     //
//     // window.addEventListener( 'resize', onWindowResize, false );
//     // $(window).on()
// }
// function onWindowResize() {
//     canvasWidth = document.getElementById("canvas3D").offsetWidth;
//     canvasHeight = document.getElementById("canvas3D").offsetHeight;
//     windowHalfX = canvasWidth / 2;
//     windowHalfY = canvasHeight / 2;
//     camera.aspect = canvasWidth / canvasHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize( canvasWidth, canvasHeight );
// }
// //
// function animate() {
//     // obj.rotation.z++;
//     requestAnimationFrame( animate );
//     render();
// }
// function render() {
//     // camera.position.x += ( mouseX - camera.position.x ) * .05;
//     // camera.position.y += ( - mouseY - camera.position.y ) * .05;
//     // camera.lookAt( scene.position );
//     renderer.render( scene, camera );
// }
