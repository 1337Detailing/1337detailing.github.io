/* 1337 Detailing · Bespoke BMW E39-inspired atelier, with progressive enhancement. */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 760px)');
const nav = $('#nav');
const navToggle = $('#nav-toggle');
const navLinks = $('#nav-links');
const washTrigger = $('#wash-trigger');
const washState = $('#wash-state');
const heroVisual = $('#hero-visual');
const canvas = $('#car-canvas');
const fallback = $('#hero-fallback');
let triggerWash = null;

$('#year').textContent = new Date().getFullYear();
navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.innerHTML = `${open ? 'FERMER' : 'MENU'} <span aria-hidden="true">${open ? '×' : '＋'}</span>`;
});
function closeMenu() { nav.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); navToggle.innerHTML = 'MENU <span aria-hidden="true">＋</span>'; }
$$('#nav-links a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

// Keep navigation, prices and contacts functional even if all animation CDNs fail.
let isScrolling = false;
function updateScrollProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  $('#scroll-progress').style.transform = `scaleX(${max > 0 ? Math.max(0, Math.min(1, scrollY / max)) : 0})`;
  isScrolling = false;
}
addEventListener('scroll', () => {
  if (!isScrolling) { isScrolling = true; requestAnimationFrame(updateScrollProgress); }
}, { passive: true });
addEventListener('resize', updateScrollProgress, { passive: true });
updateScrollProgress();

if (!reduceMotion.matches) {
  const revealObserver = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      if (window.gsap) window.gsap.to(e.target, { opacity: 1, y: 0, duration: .95, ease: 'power3.out', overwrite: true });
      else e.target.animate([{ opacity: .5, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 800, easing: 'ease-out' });
      revealObserver.unobserve(e.target);
    }
  }, { threshold: .12, rootMargin: '0px 0px -24px 0px' });
  // Do not hide content until the animation engine is ready.
  if (window.gsap) {
    document.documentElement.classList.add('js', 'motion-ready');
    $$('.reveal').forEach(el => { window.gsap.set(el, { y: 28, opacity: 0 }); revealObserver.observe(el); });
    if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
    if (window.ScrollTrigger) {
      window.gsap.to('.interlude .ring', { rotate: 60, ease: 'none', scrollTrigger: { trigger: '.interlude', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    }
  } else $$('.reveal').forEach(el => revealObserver.observe(el));
  if (window.Lenis && !mobile.matches) {
    try { new window.Lenis({ autoRaf: true, duration: 1.05, smoothWheel: true }); } catch { /* Native scroll remains available. */ }
  }
}

function announce(text) { washState.textContent = text; }
washTrigger.addEventListener('click', () => {
  if (triggerWash) triggerWash();
  else announce('ANIMATION 3D INDISPONIBLE');
});

// Build the studio only when near the viewport. Never block site content on WebGL.
const shouldRender = () => !reduceMotion.matches && !!document.createElement('canvas').getContext('webgl2');
if (shouldRender()) {
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); loadStudio(); }
    }, { rootMargin: '400px 0px 400px 0px' });
    io.observe(heroVisual);
  } else loadStudio();
} else {
  washTrigger.textContent = 'VISUEL STATIQUE';
  washTrigger.disabled = true;
}

async function loadStudio() {
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js');
    initStudio(THREE);
  } catch (error) {
    console.warn('WebGL fallback available:', error);
    washTrigger.textContent = 'VISUEL STATIQUE';
    washTrigger.disabled = true;
  }
}

function initStudio(T) {
  const smallScreen = mobile.matches;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(smallScreen ? 39 : 35, 1, .1, 120);
  camera.position.set(smallScreen ? 5.2 : 5.5, smallScreen ? 3.15 : 3.3, smallScreen ? 7.3 : 7.9);
  camera.lookAt(0, 1.22, 0);
  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: smallScreen ? 'low-power' : 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, smallScreen ? 1.35 : 1.8));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.44;
  renderer.setClearColor(0x0a0a09, 0);

  const mat = (color, roughness = .5, metalness = 0, more = {}) => new T.MeshPhysicalMaterial({ color, roughness, metalness, ...more });
  const paint = mat(0x050609, .24, .76, { clearcoat: 1, clearcoatRoughness: .075, envMapIntensity: 3.0 });
  const trim = mat(0x08090a, .26, .32, { envMapIntensity: 1.65 });
  const rubber = mat(0x111211, .92, .03);
  const blackGlass = mat(0x09151b, .085, .40, { clearcoat: 1, envMapIntensity: 2.75, side: T.DoubleSide });
  const silver = mat(0xc2c7c9, .085, 1, { envMapIntensity: 3.4 });
  const sand = mat(0xc6ad79, .24, .68, { envMapIntensity: 2.0 });
  const lamps = new T.MeshBasicMaterial({ color: 0xfff2d1, toneMapped: false });
  const haloMat = new T.MeshBasicMaterial({ color: 0xfff6d8, toneMapped: false });
  const haloSoft = new T.MeshBasicMaterial({ color: 0xffe8aa, transparent: true, opacity: .24, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false });
  const chromeDark = mat(0x565e66, .15, .93, { envMapIntensity: 2.65 });
  const crystal = mat(0xb7d6e0, .08, .3, { transparent: true, opacity: .35, depthWrite: false, side: T.DoubleSide });
  const rearLamp = mat(0x8f1117, .17, .32, { emissive: 0x560408, emissiveIntensity: .95 });

  // A custom lightbox environment reflected directly in the car's clearcoat.
  // This makes readable automotive-style panel reflections without loading an HDRI.
  const reflectionRoom = new T.Scene();
  reflectionRoom.background = new T.Color(0x181714);
  const panelMat = new T.MeshBasicMaterial({ color: 0xeae3d6, side: T.DoubleSide, toneMapped: false });
  const warmMat = new T.MeshBasicMaterial({ color: 0x9b8d70, side: T.DoubleSide, toneMapped: false });
  for (const [x, y, z, w, h, angle, material] of [
    [-2.8, 3.5, -4.2, 2.3, 5.5, .34, panelMat],
    [-4.8, 2.7,  1.8, 1.05, 5.1, .3, panelMat],
    [ 3.4, 2.9, -2.5, 1.1, 5.8, -.24, warmMat],
    [-1.0, 6.1,  2.5, 7.0, 1.0, -.1, panelMat],
    [ 1.3, 2.9,  5.0, 4.6, 2.0, -.32, warmMat],
    [ 0.5, 4.9, -0.4, 4.2, .55, -.15, panelMat],
  ]) {
    const rect = new T.Mesh(new T.PlaneGeometry(w, h), material);
    rect.position.set(x, y, z); rect.rotation.y = angle;
    reflectionRoom.add(rect);
  }
  const pmrem = new T.PMREMGenerator(renderer);
  const env = pmrem.fromScene(reflectionRoom, .04).texture;
  scene.environment = env;
  scene.add(new T.AmbientLight(0xd6cfbf, 1.6));
  const key = new T.DirectionalLight(0xf4ead6, 3.3); key.position.set(-4, 8, 7); scene.add(key);
  const rim = new T.DirectionalLight(0xa5936c, 2.3); rim.position.set(3, 6, -7); scene.add(rim);
  const fill = new T.DirectionalLight(0xd0c5aa, 1.1); fill.position.set(6, 1, 6); scene.add(fill);

  const studio = new T.Group(); scene.add(studio);
  const car = new T.Group(); studio.add(car);
  // Basic geometry helpers keep mesh topology consistent across the vehicle.
  function mesh(geometry, material, parent = car) { const obj = new T.Mesh(geometry, material); parent.add(obj); return obj; }
  function box(w, h, d, material, x, y, z, parent = car) {
    const o = mesh(new T.BoxGeometry(w, h, d), material, parent); o.position.set(x,y,z); return o;
  }
  function line(points, material, radius = .009, parent = car) {
    const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
    return mesh(new T.TubeGeometry(curve, Math.max(10, points.length * 6), radius, 5, false), material, parent);
  }
  function polygon(positions, material, parent = car) {
    const geo = new T.BufferGeometry();
    const points = positions.flatMap(p => p);
    geo.setAttribute('position', new T.Float32BufferAttribute(points, 3));
    geo.setIndex([0,1,2,0,2,3]); geo.computeVertexNormals();
    return mesh(geo, material, parent);
  }
  // E39 sedan proportions: squared shoulders, long bonnet, separate boot and C-pillar.
  // This self-contained interpretation is constructed from real 3D geometry, not a flat image.
  const profile = new T.Shape();
  profile.moveTo(-2.29, .54);
  function arch(cx) {
    const r = .50, cy = .56;
    for (let i = 0; i <= 24; i++) {
      const a = Math.PI - i * Math.PI / 24;
      profile.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
  }
  profile.lineTo(-2.00, .54); arch(-1.50);
  profile.lineTo(.93, .54); arch(1.43);
  profile.lineTo(2.24, .54);
  profile.quadraticCurveTo(2.37, .61, 2.32, .85);
  profile.lineTo(2.28, 1.255);
  profile.quadraticCurveTo(1.85, 1.37, 1.20, 1.355);
  profile.lineTo(-1.48, 1.33);
  profile.quadraticCurveTo(-2.05, 1.295, -2.29, 1.20);
  profile.lineTo(-2.29, .54);
  const shell = mesh(new T.ExtrudeGeometry(profile,{
    depth: 1.99, bevelEnabled: true, bevelThickness: .045,
    bevelSize: .044, bevelSegments: 4, curveSegments: 25
  }),paint);
  shell.position.z=-.995;

  const cabin = new T.Shape();
  cabin.moveTo(-1.46,1.32);
  cabin.lineTo(-1.07,1.895);
  cabin.quadraticCurveTo(-.95,2.052,-.76,2.06);
  cabin.lineTo(.51,2.06);
  cabin.quadraticCurveTo(.67,2.06,.80,1.917);
  cabin.lineTo(1.19,1.345);
  cabin.lineTo(-1.46,1.32);
  const roof=mesh(new T.ExtrudeGeometry(cabin,{
    depth:1.81,bevelEnabled:true,bevelThickness:.033,bevelSize:.029,
    bevelSegments:3,curveSegments:20
  }),paint);
  roof.position.z=-.905;
  // Four individually modelled side windows, chrome trim, B-pillars and door lines.
  for(const side of [-1,1]){
    const z=side*.954;
    polygon([[-1.24,1.45,z],[-.97,1.91,z],[-.28,1.925,z],[-.29,1.45,z]],blackGlass);
    polygon([[-.24,1.45,z],[-.23,1.925,z],[.53,1.925,z],[.97,1.45,z]],blackGlass);
    line([[-1.43,1.385,z+side*.015],[-1.00,1.985,z+side*.015],[.58,1.985,z+side*.015],[1.125,1.382,z+side*.015]],silver,.012);
    line([[-.27,1.43,z+side*.019],[-.27,1.965,z+side*.019]],trim,.037);
    line([[-1.43,1.39,z+side*.025],[1.11,1.39,z+side*.025]],silver,.016);
    // E39 rubbing strip, lower sill, four door handles.
    line([[-2.19,.91,side*1.050],[-1.91,.915,side*1.055],[-.16,.925,side*1.057],[1.06,.932,side*1.058],[2.19,.951,side*1.049]],trim,.035);
    line([[-2.15,.882,side*1.062],[2.08,.926,side*1.062]],chromeDark,.009);
    line([[-.20,1.28,side*1.057],[-.20,.74,side*1.059]],trim,.013);
    line([[-1.93,1.25,side*1.052],[-1.96,.74,side*1.056]],trim,.012);
    for(const hx of [-1.53,.15]){
      box(.32,.024,.025,silver,hx,1.19,side*1.077);
      box(.21,.033,.018,trim,hx,1.175,side*1.095);
    }
    for(const cx of [-1.50,1.43]){
      const arc=[];
      for(let n=0;n<=20;n++){const a=Math.PI-Math.PI*n/20;arc.push([cx+Math.cos(a)*.515,.56+Math.sin(a)*.515,side*1.052]);}
      line(arc,chromeDark,.012);
    }
    // E39 door mirrors with paint shells and dark mirror glasses.
    line([[.75,1.38,side*.94],[.83,1.45,side*1.17]],trim,.027);
    const mirror=mesh(new T.SphereGeometry(.16,20,14),paint);
    mirror.scale.set(1.35,.65,.68);mirror.position.set(.84,1.48,side*1.19);
    const mirrorFace=box(.17,.092,.014,blackGlass,.84,1.47,side*1.30);
    mirrorFace.rotation.z=-.1;
    // Front and rear bumper separation lines, sculpted side skirts.
    line([[2.29,.77,side*1.001],[2.13,.72,side*1.046]],chromeDark,.008);
    box(2.0,.058,.13,trim,-.07,.54,side*1.012);
    // Amber side indicator in the front wing.
    box(.15,.047,.013,mat(0xd9a35a,.19,.22,{emissive:0x473008,emissiveIntensity:.25}),1.04,1.12,side*1.071);
  }
  // Windscreen and the distinct short boot of the E39 saloon.
  polygon([[.57,1.994,-.835],[1.092,1.415,-.927],[1.092,1.415,.927],[.57,1.994,.835]],blackGlass);
  polygon([[-1.04,1.992,.84],[-1.39,1.408,.925],[-1.39,1.408,-.925],[-1.04,1.992,-.84]],blackGlass);
  line([[.57,1.994,-.85],[1.11,1.408,-.94]],trim,.023);
  line([[.57,1.994,.85],[1.11,1.408,.94]],trim,.023);
  line([[-1.08,2.07,-.78],[.54,2.07,-.78],[.54,2.07,.78],[-1.08,2.07,.78]],silver,.007);
  // Crisp bonnet/boot pressing lines and E39 chrome belt line.
  for(const z of [-.67,.67]){
    line([[1.19,1.365,z],[1.56,1.355,z*.99],[2.22,1.285,z*.91]],chromeDark,.007);
    line([[-2.22,1.223,z*.92],[-1.49,1.34,z]],chromeDark,.008);
  }
  const bumper=box(.15,.32,1.83,paint,2.31,.76,0);
  const bumperRear=box(.14,.31,1.89,paint,-2.30,.77,0);
  // A true twin-kidney front grille with individually separated vertical slats.
  for(const side of [-1,1]){
    const cz=side*.147, x=2.405;
    const grille=box(.06,.325,.255,trim,2.361,1.025,cz);
    const kidney=[];
    for(let k=0;k<=24;k++){
      const a=k*Math.PI*2/24;
      kidney.push([x,1.025+Math.sin(a)*.18,cz+Math.cos(a)*(.122-(Math.sin(a)>0?.014:0))]);
    }
    line(kidney,silver,.022);
    for(let k=-2;k<=2;k++)line([[x+.001,.88,cz+k*.04],[x+.001,1.166,cz+k*.04]],chromeDark,.010);
  }
  // Individual HELLA-era dual circular projectors with warm white ANGEL EYES,
  // glass housings, bright luminous rings and a restrained additive halo.
  for(const side of [-1,1]){
    const base=side*.71;
    const casing=box(.082,.32,.655,chromeDark,2.325,1.197,side*.747);
    box(.017,.305,.638,crystal,2.386,1.198,side*.747);
    for(const offset of [-.145,.145]){
      const z=base+offset;
      const housing=mesh(new T.CylinderGeometry(.134,.134,.014,40),trim);
      housing.rotation.z=Math.PI/2;housing.position.set(2.392,1.19,z);
      const projector=mesh(new T.CircleGeometry(.081,40),blackGlass);
      projector.rotation.y=Math.PI/2;projector.position.set(2.405,1.19,z);
      const lens=mesh(new T.CircleGeometry(.039,32),silver);
      lens.rotation.y=Math.PI/2;lens.position.set(2.412,1.19,z);
      for(const [radius,tube,material,x] of [[.105,.014,haloMat,2.431],[.119,.023,haloSoft,2.434]]){
        const ring=mesh(new T.TorusGeometry(radius,tube,9,48),material);
        ring.rotation.y=Math.PI/2;ring.position.set(x,1.19,z);
      }
    }
    // Lower bumper fog projectors and red/white rear lamp stacks.
    const fog=mesh(new T.CylinderGeometry(.073,.073,.02,32),lamps);
    fog.rotation.z=Math.PI/2;fog.position.set(2.401,.718,side*.77);
    box(.078,.22,.36,rearLamp,-2.355,1.135,side*.82);
    box(.08,.062,.31,crystal,-2.401,1.23,side*.82);
    const exhaust=mesh(new T.TorusGeometry(.083,.018,10,28),silver);
    exhaust.position.set(-2.383,.61,side*.73);exhaust.rotation.y=Math.PI/2;
  }
  box(.035,.11,1.1,trim,2.417,.65,0);
  box(.022,.018,1.28,silver,2.434,.58,0);
  // Discreet front/boot BMW roundels drawn as real recessed concentric discs.
  function roundel(x,y,z,front){
    const badge=mesh(new T.CylinderGeometry(.083,.083,.012,32),silver);
    badge.rotation.x=Math.PI/2;badge.position.set(x,y,z);
    const blue=mat(0x2c75a1,.18,.22);
    for(let k=0;k<4;k++){
      const wedge=mesh(new T.CircleGeometry(.057,12,k*Math.PI/2,Math.PI/2),k%2?blue:lamps);
      wedge.rotation.x=-Math.PI/2;
      wedge.position.set(x,y+.012,z);
      wedge.rotation.z=front?0:.2;
    }
  }
  roundel(1.82,1.358,0,true);
  // Period-correct deep-dish CHROME wheels: broad polished step lip, visible
  // barrel depth, ten split-spokes, drilled brakes and low-profile tires.
  const wheelGroups=[];
  const deepBarrel=mat(0x868d97,.19,.92,{envMapIntensity:2.6});
  for(const x of [-1.50,1.43])for(const side of [-1,1]){
    const wheel=new T.Group();car.add(wheel);wheel.position.set(x,.57,side*1.075);
    wheelGroups.push(wheel);
    const tire=mesh(new T.CylinderGeometry(.49,.49,.29,48,1),rubber,wheel);
    tire.rotation.x=Math.PI/2;
    const outer=side*.171;
    const barrel=mesh(new T.CylinderGeometry(.40,.40,.02,48),deepBarrel,wheel);
    barrel.rotation.x=Math.PI/2;barrel.position.z=outer;
    const rotor=mesh(new T.CylinderGeometry(.30,.30,.018,48),chromeDark,wheel);
    rotor.rotation.x=Math.PI/2;rotor.position.z=outer+side*.022;
    const inset=mesh(new T.CylinderGeometry(.242,.242,.015,48),trim,wheel);
    inset.rotation.x=Math.PI/2;inset.position.z=outer+side*.039;
    for(const [r,t,d] of [[.405,.036,.05],[.353,.016,.073],[.312,.012,.040]]){
      const lip=mesh(new T.TorusGeometry(r,t,10,60),r>.35?silver:chromeDark,wheel);
      lip.position.z=outer+side*d;
    }
    for(let k=0;k<10;k++){
      const a=2*Math.PI*k/10;
      for(const delta of [-.038,.038]){
        const spoke=mesh(new T.BoxGeometry(.033,.292,.026),silver,wheel);
        spoke.position.set(Math.sin(a+delta)*.17,Math.cos(a+delta)*.17,outer+side*.059);
        spoke.rotation.z=-(a+delta);
      }
      if(!smallScreen){
        const tread=mesh(new T.BoxGeometry(.023,.039,.265),trim,wheel);
        tread.position.set(Math.sin(a)*.478,Math.cos(a)*.478,0);
        tread.rotation.z=-a;
        const brakeHole=mesh(new T.CylinderGeometry(.013,.013,.022,8),trim,wheel);
        brakeHole.rotation.x=Math.PI/2;
        brakeHole.position.set(Math.sin(a)*.273,Math.cos(a)*.273,outer+side*.03);
      }
    }
    const center=mesh(new T.CylinderGeometry(.072,.072,.041,28),silver,wheel);
    center.rotation.x=Math.PI/2;center.position.z=outer+side*.086;
    const emblem=mesh(new T.CylinderGeometry(.046,.046,.045,24),mat(0x22435a,.2,.45),wheel);
    emblem.rotation.x=Math.PI/2;emblem.position.z=outer+side*.104;
    const tireSeam=mesh(new T.TorusGeometry(.477,.009,7,48),chromeDark,wheel);
    tireSeam.position.z=outer+side*.014;
  }
  // Subtle shark fin and contrasting door/window seals.
  const antenna=box(.18,.036,.075,trim,-.68,2.103,0);
  antenna.rotation.z=-.12;
  // The stage uses a subtle procedural radial matte underneath the car.
  const stageCanvas=document.createElement('canvas');stageCanvas.width=256;stageCanvas.height=256;
  const ctx=stageCanvas.getContext('2d');const gradient=ctx.createRadialGradient(128,128,2,128,128,126);
  gradient.addColorStop(0,'rgba(0,0,0,.58)');gradient.addColorStop(.5,'rgba(0,0,0,.3)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,256,256);
  const stage=mesh(new T.PlaneGeometry(8.4,5.8),new T.MeshBasicMaterial({map:new T.CanvasTexture(stageCanvas),transparent:true,depthWrite:false}),scene);
  stage.rotation.x=-Math.PI/2;stage.position.y=.014;
  // Ground guide/turntable lines reinforce the atelier style without a fake floor photo.
  const rings=new T.Group();scene.add(rings);
  for(let radius=2.8;radius<=3.6;radius+=.39){const ring=mesh(new T.RingGeometry(radius,radius+.005,130),new T.MeshBasicMaterial({color:0x625a4a,transparent:true,opacity:.18,side:T.DoubleSide,depthWrite:false}),rings);ring.rotation.x=-Math.PI/2;ring.position.y=.012;ring.scale.y=.66;}

  // The wash rig has articulated geometry: stainless wand, nozzle, fan and moving water.
  const rig=new T.Group();scene.add(rig);
  const wand=mesh(new T.CylinderGeometry(.028,.033,1.08,12),silver,rig);wand.rotation.z=.35;wand.position.set(.31,.55,0);
  const grip=mesh(new T.CylinderGeometry(.065,.055,.24,12),trim,rig);grip.rotation.z=.35;grip.position.set(.46,.9,0);
  const head=mesh(new T.CylinderGeometry(.085,.035,.2,16),sand,rig);head.rotation.z=.35;head.position.set(.14,.14,0);
  rig.position.set(-1.65,3.15,1.65);rig.rotation.x=.38;rig.visible=false;
  // Extra original 3D props give the scene a complete premium detailing atelier.
  // Polishing machine (motor, bridge handle, pad, eccentric spindle).
  const polisher=new T.Group();scene.add(polisher);
  const toolBody=mesh(new T.CylinderGeometry(.115,.145,.4,20),sand,polisher);
  toolBody.rotation.z=Math.PI/2;toolBody.position.set(0,.21,0);
  const toolNose=mesh(new T.SphereGeometry(.14,18,12),trim,polisher);
  toolNose.scale.set(1.3,.8,.8);toolNose.position.set(-.21,.22,0);
  const toolHandle=mesh(new T.TorusGeometry(.20,.035,9,26,Math.PI),trim,polisher);
  toolHandle.rotation.z=Math.PI/2;toolHandle.position.set(.03,.42,0);
  const spindle=mesh(new T.CylinderGeometry(.051,.051,.15,16),chromeDark,polisher);
  spindle.position.y=-.03;
  const pad=mesh(new T.CylinderGeometry(.22,.22,.061,36),mat(0xe8dabb,.9),polisher);
  pad.position.y=-.115;
  const padRim=mesh(new T.TorusGeometry(.20,.012,7,36),silver,polisher);
  padRim.rotation.x=Math.PI/2;padRim.position.y=-.139;
  polisher.visible=false;

  // Ceramic-coating vial with stopper and label on a low product plinth.
  const product=new T.Group();scene.add(product);
  product.position.set(2.78,0,1.67);
  const pedestal=mesh(new T.CylinderGeometry(.31,.34,.16,32),trim,product);
  pedestal.position.y=.095;
  const vial=mesh(new T.CylinderGeometry(.12,.12,.41,24),blackGlass,product);
  vial.position.y=.38;
  const band=mesh(new T.CylinderGeometry(.123,.123,.145,24),sand,product);
  band.position.y=.35;
  const cap=mesh(new T.CylinderGeometry(.083,.083,.14,24),silver,product);
  cap.position.y=.655;
  const stopper=mesh(new T.CylinderGeometry(.049,.049,.045,18),trim,product);
  stopper.position.y=.75;
  // Folded microfiber and pail sitting behind the rear wheel.
  const cloth=new T.Group();scene.add(cloth);cloth.position.set(-2.77,.09,1.70);
  const textile=mat(0xbfb399,.92,.04,{side:T.DoubleSide});
  for(let i=0;i<3;i++){
    const fold=mesh(new T.BoxGeometry(.64,.052,.39),textile,cloth);
    fold.position.set(.04*i,.065*i,0);
  }
  const bucket=new T.Group();scene.add(bucket);bucket.position.set(-2.79,0,-1.58);
  const bucketShell=mesh(new T.CylinderGeometry(.30,.235,.52,24,1,true),trim,bucket);
  bucketShell.position.y=.28;
  const rimBucket=mesh(new T.TorusGeometry(.30,.023,8,32),silver,bucket);
  rimBucket.rotation.x=Math.PI/2;rimBucket.position.y=.54;
  const handleBucket=mesh(new T.TorusGeometry(.38,.018,8,32,Math.PI),silver,bucket);
  handleBucket.rotation.z=Math.PI/2;handleBucket.position.y=.50;
  // Slim studio inspection bars make the glossy clearcoat catch highlights.
  const inspection=new T.Group();scene.add(inspection);
  for(const z of [-2.35,2.35]){
    box(3.3,.065,.11,trim,0,3.5,z,inspection);
    box(3.05,.014,.06,lamps,0,3.465,z,inspection);
  }
  const shineLight=new T.PointLight(0xfff3da,0,4.2,2);
  shineLight.position.set(1.0,2.7,1.7);scene.add(shineLight);
  const starMat=new T.MeshBasicMaterial({color:0xfff5d4,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
  const star=new T.Group();scene.add(star);star.position.set(1.57,1.46,1.22);
  for(const ang of [0,Math.PI/2,Math.PI/4,-Math.PI/4]){
    const arm=mesh(new T.BoxGeometry(.28,.009,.009),starMat,star);
    arm.rotation.z=ang;
  }
  star.visible=false;

  // Water fan is updated with ONE GPU points buffer instead of hundreds of draw calls.
  const count=smallScreen?110:235;
  const positions=new Float32Array(count*3), startSeeds=[];
  for(let i=0;i<count;i++)startSeeds.push([Math.random(),Math.random(),Math.random()]);
  const waterGeometry=new T.BufferGeometry(); waterGeometry.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));
  const waterMaterial=new T.PointsMaterial({color:0xe3d9bd,size:smallScreen?.055:.037,transparent:true,opacity:.82,depthWrite:false,blending:T.NormalBlending,sizeAttenuation:true});
  const water=new T.Points(waterGeometry,waterMaterial);water.visible=false;scene.add(water);
  // Foam laid across hood, roof and trunk; instancing prevents hundreds of draw calls.
  const bubbleCount=smallScreen?150:300;
  const bubbles=new T.InstancedMesh(new T.IcosahedronGeometry(.03,1),new T.MeshPhysicalMaterial({color:0xddd9cc,roughness:.83,transparent:true,opacity:.91,depthWrite:false}),bubbleCount);
  bubbles.instanceMatrix.setUsage(T.DynamicDrawUsage); car.add(bubbles);
  const bubbleEntries=[];
  for(let i=0;i<bubbleCount;i++){
    const x=(Math.random()-.5)*4.18;
    const z=(Math.random()-.5)*1.65;
    let y= x>1.25 ? 1.35- Math.max(0,x-1.5)*.06 : x< -1.56 ? 1.32 : 2.105;
    if (x>-1.3 && x<1.0) y=2.115;
    // Leave some bubbles on front/rear body to suggest real foam distribution.
    if (i%6===0) y=1.21;
    const scale=.33+Math.random()*1.7;
    bubbleEntries.push({x,y:y+Math.random()*.028,z,scale});
  }
  const dummy=new T.Object3D();
  function updateFoam(progress,active){
    for(let i=0;i<bubbleCount;i++){
      const v=bubbleEntries[i];
      // Foam starts behind nozzle pass, rinses away during the second half.
      const path=(v.x+2.15)/4.3;
      const appear=Math.min(1,Math.max(0,(progress-path*.48)*11));
      const rinse=Math.max(0,1-(progress-.52-path*.32)*10);
      const size=active?Math.max(.0001,appear*rinse*v.scale):.0001;
      dummy.position.set(v.x,v.y,v.z);dummy.scale.setScalar(size);dummy.rotation.set(0,i*.18,0);dummy.updateMatrix();bubbles.setMatrixAt(i,dummy.matrix);
    }
    bubbles.instanceMatrix.needsUpdate=true;
  }
  updateFoam(0,false);

  const pointer={x:0,y:0};let washStart=-1;let washProgress=0;let running=false;let detailed=false;
  function startWash(){
    if(running)return;
    running=true;detailed=false;washStart=performance.now(); washProgress=0;
    paint.roughness=.24;paint.clearcoatRoughness=.075;
    polisher.visible=false;star.visible=false;shineLight.intensity=0;
    rig.position.set(-1.65,3.15,1.65);rig.rotation.z=0;
    rig.visible=true;water.visible=true;
    washTrigger.disabled=true;washTrigger.textContent='LAVAGE EN COURS ···';
    announce('01 / PRÉLAVAGE');
  }
  triggerWash=startWash;
  if(!smallScreen)heroVisual.addEventListener('pointermove', e=>{
    const rect=heroVisual.getBoundingClientRect();
    pointer.x=((e.clientX-rect.left)/rect.width-.5)*2;
    pointer.y=((e.clientY-rect.top)/rect.height-.5)*2;
  },{passive:true});
  heroVisual.addEventListener('pointerleave',()=>{pointer.x=0;pointer.y=0;});
  function updateWater(t,px){
    const nozzleX=rig.position.x+.12;
    for(let i=0;i<count;i++){
      const seed=startSeeds[i];
      const f=(seed[0]+t*.0013*(.75+seed[1]*.4))%1;
      const spread=(seed[1]-.5)*.9;
      const trail=(seed[2]-.5)*.3;
      positions[i*3]=nozzleX+spread*f+trail;
      positions[i*3+1]=rig.position.y+.15-f*(1.6+seed[2]*.25);
      positions[i*3+2]=rig.position.z-(1.3*f)+spread*.35;
    }
    waterGeometry.attributes.position.needsUpdate=true;
  }
  const clock=new T.Clock();let frame=0;let animating=true;let inViewport=true;
  const observer=new IntersectionObserver(entries=>{inViewport=entries[0]?.isIntersecting??true;},{threshold:0});observer.observe(heroVisual);
  const hasFinePointer=matchMedia('(pointer:fine)').matches;
  function render(now){
    if(!animating)return;
    requestAnimationFrame(render);
    if(document.hidden||!inViewport)return;
    // 30fps cap on mobile, ~60fps on desktop. Use elapsed time for smooth paths.
    if(smallScreen && now-frame<32)return;
    frame=now;
    const time=clock.getElapsedTime();
    if(running){
      washProgress=Math.min(1,(now-washStart)/7200);
      const ease=washProgress<.5?4*washProgress**3:1-Math.pow(-2*washProgress+2,3)/2;
      rig.position.x=-1.63+3.35*ease;
      rig.position.y=3.08+Math.sin(ease*Math.PI)*.13;
      rig.rotation.z=Math.sin(ease*Math.PI*2)*.08;
      updateFoam(washProgress,true);
      updateWater(now,rig.position.x);
      if(washProgress>.35&&washProgress<.67)announce('02 / RINÇAGE');
      const finishing=washProgress>.68;
      rig.visible=!finishing;water.visible=!finishing;
      polisher.visible=finishing;
      if(finishing){
        const pass=(washProgress-.68)/.32;
        polisher.position.set(1.26+pass*.70,1.65+Math.sin(pass*Math.PI*4)*.028,.57+Math.sin(pass*Math.PI*2)*.10);
        polisher.rotation.y=-.18;pad.rotation.y=now*.012;
        shineLight.position.set(polisher.position.x,2.18,polisher.position.z);
        shineLight.intensity=1.7+Math.sin(now*.012)*.3;
      }
      if(washProgress>=.67)announce('03 / FINITION');
      const shine=Math.min(1,Math.max(0,(washProgress-.43)/.53));
      paint.roughness=.24-.185*shine;
      paint.clearcoatRoughness=.075-.052*shine;
      if(washProgress>=1){
        running=false;detailed=true;rig.visible=false;water.visible=false;polisher.visible=false;
        updateFoam(0,false);washTrigger.disabled=false;
        washTrigger.innerHTML='RECOMMENCER <span aria-hidden="true">↗</span>';
        announce('FINITION MIROIR / NOIR PROFOND');
      }
    }
    const scroll=Math.min(1,Math.max(0,scrollY / (innerHeight*1.7)));
    const targetY=-.11+scroll*.19+(hasFinePointer?pointer.x*.055:0);
    const targetX=smallScreen?-.025:(hasFinePointer?-pointer.y*.035:0);
    car.rotation.y+=(targetY-car.rotation.y)*.035;
    car.rotation.x+=(targetX-car.rotation.x)*.03;
    studio.position.y=Math.sin(time*.62)*.028;
    studio.rotation.y=Math.sin(time*.27)*.017;
    product.rotation.y=Math.sin(time*.42)*.07;
    inspection.position.y=Math.sin(time*.64)*.025;
    if(!running){
      const finalRoughness=detailed?.055:.24;
      paint.roughness+=(finalRoughness-paint.roughness)*.022;
      shineLight.intensity+=(0-shineLight.intensity)*.08;
    }
    star.visible=detailed;
    starMat.opacity=detailed?Math.max(0,(Math.sin(time*2.8)+.2))*.78:0;
    star.scale.setScalar(.85+Math.sin(time*3.7)*.18);
    renderer.render(scene,camera);
  }
  let lastW=0,lastH=0;
  function resize(){
    const rect=heroVisual.getBoundingClientRect();
    const width=Math.max(1,Math.round(rect.width)),height=Math.max(1,Math.round(rect.height));
    if(width===lastW&&height===lastH)return;
    lastW=width;lastH=height;
    renderer.setSize(width,height,false);
    camera.aspect=width/height;
    // Fill desktop visual space and avoid clipping on portrait phones.
    camera.position.set(smallScreen?5.25:5.5,smallScreen?3.2:3.3,smallScreen?7.35:7.9);
    if(width<410)camera.position.multiplyScalar(1.11);
    camera.lookAt(0,1.22,0);
    camera.updateProjectionMatrix();
  }
  resize();
  const ro=new ResizeObserver(resize);ro.observe(heroVisual);
  renderer.render(scene,camera);
  fallback.style.transition='opacity .45s ease';fallback.style.opacity='0';
  fallback.style.pointerEvents='none';
  requestAnimationFrame(render);
  // Autoplay the first studio wash on desktop; mobile keeps explicit opt-in.
  if (!smallScreen) setTimeout(() => { if (!document.hidden && inViewport && !running) startWash(); }, 1600);
  // A static fallback remains shown when the browser blocks 3D import/WebGL.
  addEventListener('pagehide',()=>{animating=false;observer.disconnect();ro.disconnect();renderer.dispose();env.dispose();pmrem.dispose();}, {once:true});
}