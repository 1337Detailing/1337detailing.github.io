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

// A real BMW E39 mesh replaces the former blocky procedural car.
// Source: "BMW E39 Free" by Black Snow, CC BY 4.0, hosted in Sketchfab's viewer.
// Credits are permanently visible beside the 3D scene.
const E39_MODEL = '531a5a93da5d493d9918eb36f011c20d';
const E39_EMBED = 'https://sketchfab.com/models/' + E39_MODEL + '/embed';
let viewerApi = null;
let viewerReady = false;
let washRunning = false;
let finished = false;
let washTimer = 0;
let palette = [];
let originalColors = new Map();
let playerFrame = null;
const staticState = () => {
  washTrigger.disabled = true;
  washTrigger.textContent = 'MODÈLE 3D INDISPONIBLE';
  announce('APERÇU DE SECOURS');
};
canvas.style.display = 'none'; // Old model is not loaded, avoiding duplicate WebGL contexts.
const atelier = document.createElement('div');
atelier.className = 'e39-atelier';
atelier.setAttribute('aria-label', 'BMW Série 5 E39 authentique en 3D');
atelier.innerHTML =
  '<div class="e39-process e39-spray" aria-hidden="true"></div>' +
  '<div class="e39-process e39-foam" aria-hidden="true"></div>' +
  '<div class="e39-process e39-polish" aria-hidden="true"></div>' +
  '<span class="e39-loader">CHARGEMENT DU MODÈLE BMW E39…</span>';
heroVisual.insertBefore(atelier, canvas);
washTrigger.disabled = true;
announce('CHARGEMENT / BMW E39');
const iframe = document.createElement('iframe');
iframe.className = 'e39-iframe';
iframe.title = 'BMW Série 5 E39 — véritable modèle 3D interactif';
iframe.allow = 'autoplay; fullscreen; xr-spatial-tracking';
iframe.allowFullscreen = true;
iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
iframe.setAttribute('loading', 'lazy');
iframe.setAttribute('aria-label', 'Faire pivoter la véritable BMW E39');
atelier.prepend(iframe);
playerFrame = iframe;

function onViewerReady() {
  viewerReady = true;
  fallback.style.opacity = '0';
  fallback.style.pointerEvents = 'none';
  atelier.classList.add('e39-loaded');
  atelier.querySelector('.e39-loader')?.remove();
  washTrigger.disabled = false;
  washTrigger.innerHTML = 'LANCER LE DETAILING <span aria-hidden="true">↗</span>';
  announce('E39 / PRÊTE POUR LE DETAILING');
}
function useDirectEmbed() {
  if(viewerReady) return;
  // With script blockers, the ordinary official embed still works.
  iframe.src = E39_EMBED + '?autostart=1&autospin=' + (reduceMotion.matches ? '0' : '.15') +
    '&camera=0&scrollwheel=0&dnt=1&ui_annotations=0';
  iframe.addEventListener('load', onViewerReady, {once:true});
}
function materialColor(material, color, glossy) {
  const channels = material.channels || {};
  for(const channelName of ['AlbedoPBR', 'DiffusePBR', 'DiffuseColor']){
    const channel = channels[channelName];
    if(!channel) continue;
    channel.enable = true;
    channel.color = color;
    // Separate body material names can have a colored original albedo texture.
    // Remove this source when repainting, but keep all normal / detail maps.
    if(channel.texture) delete channel.texture;
  }
  if(channels.RoughnessPBR){
    channels.RoughnessPBR.enable = true;
    channels.RoughnessPBR.factor = glossy ? .085 : .25;
    if(channels.RoughnessPBR.texture) delete channels.RoughnessPBR.texture;
  }
  if(channels.MetalnessPBR){
    channels.MetalnessPBR.enable = true;
    channels.MetalnessPBR.factor = glossy ? .63 : .90;
  }
  if(channels.ClearCoat){
    channels.ClearCoat.enable = true;
    channels.ClearCoat.factor = 1;
  }
  if(channels.ClearCoatRoughness){
    channels.ClearCoatRoughness.enable = true;
    channels.ClearCoatRoughness.factor = glossy ? .045 : .16;
  }
}
function configureAuthenticFinish() {
  if(!viewerApi || !viewerApi.getMaterialList) return;
  viewerApi.getMaterialList((error, materials) => {
    if(error || !Array.isArray(materials)) return;
    palette=materials;
    for(const item of materials){
      const name=(item.name || '').toLowerCase();
      // Only touch positively identified exterior paint and wheel materials;
      // leave lights, glass, body rubbers and every ambiguous material alone.
      const excluded=/interior|dash|seat|glass|window|rubber|tyre|tire|plastic|trim|bumper.?grille|grill|chrome|badge|logo|number|plate|light|lamp|exhaust|brake|mirror|metal.?detail/;
      const isPaint=/car.?paint|body.?paint|paint.?body|bodywork|carrosserie|exterior.?paint|paintwork|painted.?body|^paint$/i.test(name) && !excluded.test(name);
      const isWheel=/^rim|alloy.?wheel|wheel.?rim|wheel.?metal|rim.?chrome|wheel.?chrome/i.test(name) && !/tyre|tire|rubber/.test(name);
      if(!isPaint && !isWheel)continue;
      originalColors.set(item.stateSetID, isPaint ? 'paint' : 'chrome');
      try {
        materialColor(item, isPaint ? [.018,.020,.026] : [.90,.93,.96], true);
        viewerApi.setMaterial(item);
      } catch(error) { console.warn('Material customization unavailable:', error); }
    }
  });
}
function updateFinish(polished){
  if(!viewerApi || !palette.length)return;
  for(const item of palette){
    if(originalColors.get(item.stateSetID)!=='paint')continue;
    try {
      materialColor(item, [.018,.020,.026], polished);
      viewerApi.setMaterial(item);
    } catch {}
  }
}
function loadSdkAndViewer() {
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
  let initialized=false;
  const fallbackTimer=setTimeout(() => {
    if(!initialized && !viewerReady)useDirectEmbed();
  },7000);
  script.onload=()=>{
    if(!window.Sketchfab){clearTimeout(fallbackTimer);useDirectEmbed();return;}
    try{
      const client=new window.Sketchfab('1.12.1',iframe);
      initialized=true;
      clearTimeout(fallbackTimer);
      client.init(E39_MODEL,{
        autostart:1,
        autospin:reduceMotion.matches?0:.12,
        camera:0,
        scrollwheel:0,
        dnt:1,
        preload:0,
        ui_annotations:0,
        max_texture_size: mobile.matches ? 1024 : 2048,
        success(api) {
          viewerApi=api;
          api.start();
          api.addEventListener('viewerready',()=>{
            onViewerReady();
            configureAuthenticFinish();
          });
        },
        error(){
          console.warn('3D viewer initialization failed; loading direct embed.');
          useDirectEmbed();
        }
      });
    }catch(error){
      console.warn('Sketchfab API unavailable:',error);
      useDirectEmbed();
    }
  };
  script.onerror=()=>{clearTimeout(fallbackTimer);useDirectEmbed();};
  document.head.appendChild(script);
}
function initializeWhenVisible(){
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){
        io.disconnect();
        loadSdkAndViewer();
      }
    },{rootMargin:'350px 0px 350px 0px'});
    io.observe(heroVisual);
  }else loadSdkAndViewer();
}
initializeWhenVisible();

function displayWashPhase(p){
  atelier.classList.toggle('e39-prewash',p<.35);
  atelier.classList.toggle('e39-rinse',p>=.35 && p<.69);
  atelier.classList.toggle('e39-buff',p>=.69 && p<1);
  atelier.classList.toggle('e39-finished',p>=1);
  if(p<.35)announce('01 / MOUSSE ACTIVE');
  else if(p<.69)announce('02 / RINÇAGE');
  else if(p<1)announce('03 / POLISSAGE ET REFLETS');
  else announce('FINITION MIROIR / NOIR PROFOND');
}
function startAuthenticWash(){
  if(!viewerReady||washRunning) return;
  cancelAnimationFrame(washTimer);
  washRunning=true;
  finished=false;
  updateFinish(false);
  const started=performance.now();
  washTrigger.disabled=true;
  washTrigger.textContent='DETAILING EN COURS ···';
  function run(now){
    if(!washRunning) return;
    const p=Math.min(1,(now-started)/9000);
    displayWashPhase(p);
    if(p<1){washTimer=requestAnimationFrame(run);return;}
    washRunning=false;
    finished=true;
    updateFinish(true);
    atelier.classList.remove('e39-prewash','e39-rinse','e39-buff');
    washTrigger.disabled=false;
    washTrigger.innerHTML='RECOMMENCER <span aria-hidden="true">↗</span>';
  }
  washTimer=requestAnimationFrame(run);
}
triggerWash=startAuthenticWash;
addEventListener('pagehide',()=>{
  washRunning=false;
  cancelAnimationFrame(washTimer);
  try{viewerApi?.stop();}catch{}
},{once:true});
