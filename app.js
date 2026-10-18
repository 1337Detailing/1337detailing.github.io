/* 1337 Detailing · An original procedural 3D car, with progressive enhancement. */
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
  renderer.toneMappingExposure = 1.65;
  renderer.setClearColor(0x0a0a09, 0);

  const mat = (color, roughness = .5, metalness = 0, more = {}) => new T.MeshPhysicalMaterial({ color, roughness, metalness, ...more });
  const paint = mat(0x242622, .25, .56, { clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.65 });
  const trim = mat(0x0c0e0f, .24, .5, { envMapIntensity: 1.8 });
  const rubber = mat(0x111211, .92, .03);
  const blackGlass = mat(0x101a1b, .12, .48, { clearcoat: 1, envMapIntensity: 2.4, side: T.DoubleSide });
  const silver = mat(0x8b8a82, .22, .88, { envMapIntensity: 2.2 });
  const sand = mat(0xc6ad79, .24, .68, { envMapIntensity: 2.0 });
  const lamps = new T.MeshBasicMaterial({ color: 0xe4dac3, toneMapped: false });
  const rearLamp = mat(0x776350, .24, .42, { emissive: 0x342820, emissiveIntensity: .4 });

  // A custom lightbox environment reflected directly in the car's clearcoat.
  // This makes readable automotive-style panel reflections without loading an HDRI.
  const reflectionRoom = new T.Scene();
  reflectionRoom.background = new T.Color(0x181714);
  const panelMat = new T.MeshBasicMaterial({ color: 0xeae3d6, side: T.DoubleSide, toneMapped: false });
  const warmMat = new T.MeshBasicMaterial({ color: 0x9b8d70, side: T.DoubleSide, toneMapped: false });
  for (const [x, y, z, w, h, angle, material] of [
    [-2.8, 3.5, -4.2, 2.3, 5.5, .34, panelMat],
    [ 3.4, 2.9, -2.5, 1.1, 5.8, -.24, warmMat],
    [-1.0, 6.1,  2.5, 7.0, 1.0, -.1, panelMat],
    [ 1.3, 2.9,  5.0, 4.6, 2.0, -.32, warmMat],
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
  // Lower chassis: wheel wells are CUT into the side silhouette, not masked by discs.
  const profile = new T.Shape();
  profile.moveTo(-2.27, .56);
  function arch(cx) {
    const r = .5, cy = .57;
    for (let i = 0; i <= 20; i++) {
      const a = Math.PI - i * Math.PI / 20;
      profile.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
  }
  profile.lineTo(-1.99, .56); arch(-1.49);
  profile.lineTo(.97, .56); arch(1.47);
  profile.lineTo(2.24, .56);
  profile.quadraticCurveTo(2.35, .59, 2.31, .81);
  profile.lineTo(2.25, 1.21);
  profile.quadraticCurveTo(1.75, 1.33, 1.17, 1.36);
  profile.lineTo(-1.82, 1.27);
  profile.quadraticCurveTo(-2.21, 1.22, -2.27, 1.08);
  profile.lineTo(-2.27, .56);
  const chassis = mesh(new T.ExtrudeGeometry(profile, { depth: 1.99, bevelEnabled: true, bevelThickness: .055, bevelSize: .055, bevelSegments: 4, curveSegments: 24 }), paint);
  chassis.position.z = -.995;
  // Body roof/cabin, shaped from side as a continuous aerodynamic canopy.
  const canopy = new T.Shape();
  canopy.moveTo(-1.69, 1.27); canopy.lineTo(-1.21, 1.94);
  canopy.quadraticCurveTo(-1.08, 2.06, -.87, 2.08);
  canopy.lineTo(.49, 2.08);
  canopy.quadraticCurveTo(.72, 2.07, .82, 1.91);
  canopy.lineTo(1.32, 1.32);
  canopy.lineTo(-1.69, 1.27);
  const roof = mesh(new T.ExtrudeGeometry(canopy,{ depth: 1.79,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:3,curveSegments:18 }), paint);
  roof.position.z = -.895;
  // Window plane detailing is set just beyond the roof surface to prevent z-fighting.
  for (const side of [-1, 1]) {
    const outer = side * .939;
    polygon([[-1.44,1.42,outer],[-1.07,1.91,outer],[-.34,1.91,outer],[-.35,1.41,outer]], blackGlass);
    polygon([[-.27,1.41,outer],[-.25,1.91,outer],[.54,1.91,outer],[1.02,1.41,outer]], blackGlass);
    // Chrome glazing border, B-pillar and tinted windshield trim.
    line([[-1.5,1.37,outer + side*.01],[-1.09,1.98,outer + side*.01],[.6,1.98,outer + side*.01],[1.14,1.35,outer + side*.01]], silver, .012);
    line([[-.3,1.36,outer + side*.01],[-.31,1.98,outer + side*.01]], trim, .028);
    line([[-1.83,1.22,side*1.034],[-.95,1.23,side*1.038],[1.12,1.25,side*1.038],[2.04,1.17,side*1.035]], silver, .012);
    line([[-.3,1.2,side*1.048],[-.29,.76,side*1.048]], trim, .012);
    line([[.0,1.2,side*1.052],[.42,1.19,side*1.052]], silver, .017);
    line([[-.65,1.33,side*1.05],[-.28,1.33,side*1.05]], trim, .011);
    // Sculpted wheel arch edges.
    for (const cx of [-1.49, 1.47]) {
      const arcPoints = [];
      for (let n=0; n<=15;n++) { const a = Math.PI - Math.PI*n/15; arcPoints.push([cx + Math.cos(a)*.52, .57+Math.sin(a)*.52,side*1.05]); }
      line(arcPoints, trim, .023);
    }
    // Mirror housing with curved stem, outside the front window.
    line([[.68,1.32,side*.98],[.78,1.44,side*1.18]], trim, .027);
    const mirror = mesh(new T.SphereGeometry(.16,18,12), paint); mirror.scale.set(1.45,.56,.7); mirror.position.set(.77,1.47,side*1.22);
    const mirrorGlass = box(.18,.072,.015,trim,.75,1.46,side*1.31); mirrorGlass.rotation.z=.12;
  }
  // Windshield, rear window and roof seams.
  polygon([[.59,1.99,-.84],[1.19,1.36,-.93],[1.19,1.36,.93],[.59,1.99,.84]], blackGlass);
  polygon([[-1.12,1.99,.84],[-1.54,1.37,.9],[-1.54,1.37,-.9],[-1.12,1.99,-.84]], blackGlass);
  line([[.59,1.99,-.86],[1.2,1.37,-.93]], trim, .029);
  line([[.59,1.99,.86],[1.2,1.37,.93]], trim, .029);
  line([[.7,1.97,-.8],[.7,1.97,.8]], silver, .009);
  // Front fascia / realistic layered grille / bumper aperture.
  box(.064,.34,1.17,trim,2.306,.92,0);
  for (let j=0;j<7;j++) box(.069,.012,1.04,silver,2.346,.78+j*.047,0);
  box(.12,.14,1.6,trim,2.274,.64,0);
  for (const z of [-.79,.79]) {
    const lamp=box(.12,.13,.47,blackGlass,2.253,1.16,z);lamp.rotation.x=z>0?-.08:.08;
    line([[2.324,1.19,z-.21],[2.329,1.19,z+.21]], lamps,.018);
    const frontAir=box(.091,.105,.28,trim,2.31,.72,z);
    frontAir.rotation.y=z>0?-.045:.045;
    box(.13,.125,.34,rearLamp,-2.298,1.09,z);
    // Two exhaust outlets and lower diffuser.
    const pipe=mesh(new T.TorusGeometry(.075,.021,8,20),silver);pipe.position.set(-2.31,.61,z*.82);pipe.rotation.y=Math.PI/2;
  }
  // Hood and boot character lines reveal the form in grazing light.
  for(const z of [-.69,.69]) {
    line([[1.24,1.342,z],[1.63,1.324,z*.93],[2.18,1.243,z*.88]],trim,.008);
    line([[-2.15,1.19,z*.88],[-1.78,1.29,z]],trim,.008);
  }
  // Detailed multi-material forged wheels with rotors, rim lips, six metal spokes.
  for(const x of [-1.49,1.47]) for(const side of [-1,1]) {
    const wheel=new T.Group(); car.add(wheel); wheel.position.set(x,.58,side*1.09);
    const tire=mesh(new T.CylinderGeometry(.49,.49,.29,48,1),rubber,wheel);tire.rotation.x=Math.PI/2;
    const tireSide=side*.165;
    const face=mesh(new T.CylinderGeometry(.383,.383,.015,48),trim,wheel);face.rotation.x=Math.PI/2;face.position.z=tireSide;
    const rotor=mesh(new T.CylinderGeometry(.327,.327,.018,48),silver,wheel);rotor.rotation.x=Math.PI/2;rotor.position.z=tireSide+side*.014;
    const darkDisc=mesh(new T.CylinderGeometry(.274,.274,.021,48),trim,wheel);darkDisc.rotation.x=Math.PI/2;darkDisc.position.z=tireSide+side*.028;
    const lip=mesh(new T.TorusGeometry(.36,.033,10,48),silver,wheel);lip.position.z=tireSide+side*.046;
    const tireLine=mesh(new T.TorusGeometry(.475,.014,8,48),mat(0x272827,.8),wheel);tireLine.position.z=tireSide+side*.04;
    for(let k=0;k<8;k++) {
      const a=(k/8)*Math.PI*2;
      const spoke=mesh(new T.BoxGeometry(.065,.25,.032),silver,wheel);
      spoke.position.set(Math.sin(a)*.17,Math.cos(a)*.17,tireSide+side*.065);
      spoke.rotation.z=-a;
      // Tire shoulder ribs, subtle, limited for mobile GPU budgets.
      if (!smallScreen) {
        const tread=mesh(new T.BoxGeometry(.031,.045,.23),mat(0x171817,.9),wheel);
        tread.position.set(Math.sin(a)*.47,Math.cos(a)*.47,0);tread.rotation.z=-a;
      }
    }
    const hub=mesh(new T.CylinderGeometry(.075,.075,.037,24),sand,wheel);hub.rotation.x=Math.PI/2;hub.position.z=tireSide+side*.084;
  }
  // Lower side skirt / diffuser, roof aerial and relief seams.
  for(const side of [-1,1])box(2.02,.065,.13,trim,-.1,.54,side*1.007);
  const antenna=box(.27,.056,.1,trim,-.88,2.105,0);antenna.rotation.z=-.13;
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

  const pointer={x:0,y:0};let washStart=-1;let washProgress=0;let running=false;
  function startWash(){
    if(running)return;
    running=true;washStart=performance.now(); washProgress=0;
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
      if(washProgress>=.67)announce('03 / FINITION');
      const shine=Math.min(1,Math.max(0,(washProgress-.43)/.53));
      paint.roughness=.25-.13*shine;
      paint.clearcoatRoughness=.09-.055*shine;
      if(washProgress>=1){
        running=false;rig.visible=false;water.visible=false;
        updateFoam(0,false);washTrigger.disabled=false;
        washTrigger.innerHTML='RECOMMENCER <span aria-hidden="true">↗</span>';
        announce('FINI / CARROSSERIE NETTOYÉE');
      }
    }
    const scroll=Math.min(1,Math.max(0,scrollY / (innerHeight*1.7)));
    const targetY=-.11+scroll*.19+(hasFinePointer?pointer.x*.055:0);
    const targetX=smallScreen?-.025:(hasFinePointer?-pointer.y*.035:0);
    car.rotation.y+=(targetY-car.rotation.y)*.035;
    car.rotation.x+=(targetX-car.rotation.x)*.03;
    studio.position.y=Math.sin(time*.62)*.028;
    studio.rotation.y=Math.sin(time*.27)*.017;
    if(!running) paint.roughness+=(.18-paint.roughness)*.003;
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