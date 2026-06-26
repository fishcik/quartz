import fs from "fs"
import path from "path"
import { i18n } from "../i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
import { CustomOgImagesEmitterName } from "../../.quartz/plugins"

// ── Müfredat verisi: ders adı + GERÇEK Quartz slug'ı + ASCII ikon dosyası ──
// (Quartz slugify Türkçe karakterleri KORUR; İstatistik → i̇ + U+0307 combining)
const SC_COURSES = [
  { n: "01", name: "Bilimsel Çalışma Yöntemleri", slug: "bilimsel-çalışma-yöntemleri", icon: "bilimsel-calisma-yontemleri" },
  { n: "02", name: "Biliş Psikolojisi 1", slug: "biliş-psikolojisi-1", icon: "bilis-psikolojisi-1" },
  { n: "03", name: "Biyolojik Psikoloji 2", slug: "biyolojik-psikoloji-2", icon: "biyolojik-psikoloji-2" },
  { n: "04", name: "Gelişim Psikolojisi 1", slug: "gelişim-psikolojisi-1", icon: "gelisim-psikolojisi-1" },
  { n: "05", name: "Gelişim Psikolojisi 2", slug: "gelişim-psikolojisi-2", icon: "gelisim-psikolojisi-2" },
  { n: "06", name: "İstatistik 1", slug: "i̇statistik-1", icon: "istatistik-1" },
  { n: "07", name: "Klinik Psikoloji 1", slug: "klinik-psikoloji-1", icon: "klinik-psikoloji-1" },
  { n: "08", name: "Klinik Psikoloji 2", slug: "klinik-psikoloji-2", icon: "klinik-psikoloji-2" },
  { n: "09", name: "Sağlık Psikolojisi ve Davranışsal Tıp", slug: "sağlık-psikolojisi-ve-davranışsal-tıp", icon: "saglik-psikolojisi-ve-davranissal-tip" },
  { n: "10", name: "Sosyal Psikoloji", slug: "sosyal-psikoloji", icon: "sosyal-psikoloji" },
]

function readSvg(rel: string): string {
  try {
    return fs
      .readFileSync(path.join(process.cwd(), rel), "utf8")
      .replace(/<\?xml[^>]*\?>/, "")
      .trim()
  } catch {
    return ""
  }
}

// Build-time: ikon + logo SVG'lerini oku, JS'e gömülecek veriyi hazırla
const SC_LOGO_SVG = readSvg("quartz/static/logo-symbol.svg")
const SC_SB_SVG = readSvg("quartz/static/serpentbrain.svg")
const SC_GRID_DATA = SC_COURSES.map((c) => ({
  n: c.n,
  name: c.name,
  slug: c.slug,
  svg: readSvg(`quartz/static/icons/${c.icon}.svg`),
}))
// Slug → ders adı (eyebrow etiketleri için)
const SC_COURSE_MAP: Record<string, string> = {}
for (const c of SC_COURSES) SC_COURSE_MAP[c.slug] = c.name

export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const rawTitle = fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
    const title = fileData.slug === "index"
      ? "SAYKO.ch - Kitapta durduğu gibi durmaz."
      : `SAYKO.ch - ${rawTitle}`
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    // Url of current page
    const socialUrl =
      fileData.slug === "404" ? url.toString() : joinSegments(url.toString(), fileData.slug!)

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some(
      (e) => e.name === CustomOgImagesEmitterName,
    )
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`

    const coreStylesheet = css[0]?.content
    const coreScript = js.find(
      (r) => r.loadTime === "beforeDOMReady" && r.contentType === "external",
    )

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {coreStylesheet && <link rel="preload" href={coreStylesheet} as="style" />}
        {coreScript && coreScript.contentType === "external" && (
          <link rel="preload" href={coreScript.src} as="script" />
        )}
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cedarville+Cursive&family=Dancing+Script:wght@500;600&family=Contrail+One&family=Abril+Fatface&family=Cinzel+Decorative:wght@700&family=Poiret+One&family=Limelight&family=Megrim&family=Special+Elite&family=Ultra&family=Lobster&family=Monoton&family=Rye&family=Bungee&family=Rubik+Mono+One&family=Fredericka+the+Great&family=Pirata+One&family=UnifrakturCook:wght@700&family=Della+Respira&family=Italiana&family=Forum&family=Marcellus&family=Yeseva+One&family=Stardos+Stencil:wght@700&family=Audiowide&family=Orbitron:wght@700&family=Sancreek&family=Ewert&family=Fontdiner+Swanky&family=Bigshot+One&family=Codystar:wght@400&family=Silkscreen&display=swap"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${getFileExtension(ogImageDefaultPath) ?? "png"}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={socialUrl}></meta>
            <meta property="twitter:url" content={socialUrl}></meta>
          </>
        )}

        <link rel="icon" type="image/svg+xml" href={joinSegments(baseDir, "static/favicon.svg")} />
        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        <script dangerouslySetInnerHTML={{__html: `(function(){
var SC_GRID=${JSON.stringify(SC_GRID_DATA)};
var SC_MAP=${JSON.stringify(SC_COURSE_MAP)};
var SC_LOGO=${JSON.stringify(SC_LOGO_SVG)};
var SC_SB=${JSON.stringify(SC_SB_SVG)};
// Minimal serpent ayraç: header/slogan ile içerik arasındaki ince sepya çizgi yerine
var SC_SERPENT_LINE='<svg class="sc-serpent-div" viewBox="0 0 240 12" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M2 6 C20 0 36 12 56 6 S94 0 116 6 S156 12 178 6 S214 1 232 6"/><path d="M232 6 l6 -3 m-6 3 l6 3" stroke-width="1.1"/><circle cx="234.5" cy="6" r="0.9" fill="currentColor" stroke="none"/></svg>';
var SLO=["Psikoloji: Kitapta durduğu gibi durmaz.","Teori biter, maruz kalma başlar.","İncelemiyoruz, buyuz işte.","Okumuyoruz, maruz kalıyoruz.","Pratikte burdayız, teoride ordayız.","Kitap biter, kafa başlar.","Sistemler çöker, adaptasyon hayatta kalır.","Sınır, sadece bir varsayımdır.","Sınanmamış bir erdem, sadece iyi bir niyettir.","İyileşmek istiyorsan, maruz kalacaksın.","Kurtarıcını beklemeyi bıraktığında, psikolojik doğumun başlar.","Kendine dürüst olmak kadar büyük bir savaş yoktur. — Sigmund Freud","Psikolojinin uzun bir geçmişi, ama kısa bir tarihi vardır. — Ebbinghaus","İnsan, kendisinden başka bir şey değildir, ne olmayı tasarlıyorsa o olur. — Sartre","Kişinin kendisi hakkında çok konuşması, kendini gizlemenin de bir yoludur. — Friedrich Nietzsche","Bir durumu artık değiştiremediğimizde, kendimizi değiştirmeye çağrılırız. — Viktor E. Frankl","Travma başınıza gelen kötü şey değil; o şey gerçekleşirken içinizde verdiğiniz o ıssız savaştır. — Gabor Maté","Geçmiş henüz bitmedi; o, şu an verdiğiniz her otomatik tepkinin içinde saklanıyor. — Peter Levine","Korku, tehlikenin değil; zihninizin o tehlikeye yazdığı senaryonun ürünüdür. — David Burns","Bilişsel kapasiteniz ne kadar yüksek olursa olsun, sinir sisteminiz tehdit hissettiği an ilkelliğe mahkumsunuzdur. — Stephen Porges"];
// Rotating header fonts — picks one per page load/nav (art deco / fancy / vintage / boring karışık)
var SC_FONTS=['Playfair Display','Abril Fatface','Cinzel Decorative','Poiret One','Limelight','Megrim','Special Elite','Ultra','Lobster','Monoton','Rye','Dancing Script','Bebas Neue','Georgia','Bungee','Rubik Mono One','Fredericka the Great','Pirata One','UnifrakturCook','Della Respira','Italiana','Forum','Marcellus','Yeseva One','Stardos Stencil','Audiowide','Orbitron','Sancreek','Ewert','Fontdiner Swanky','Bigshot One','Codystar','Silkscreen'];
// ── Otomatik tema: Luzern gün doğumu/batımına göre (manuel seçim oturum boyunca öncelikli) ──
function scAutoTheme(){
  try{
    if(sessionStorage.getItem('sc_theme_manual'))return; // kullanıcı bu oturumda elle seçtiyse dokunma
  }catch(e){}
  function setTh(th){
    if(document.documentElement.getAttribute('saved-theme')===th)return;
    document.documentElement.setAttribute('saved-theme',th);
    try{localStorage.setItem('theme',th);}catch(e){}
    document.dispatchEvent(new CustomEvent('themechange',{detail:{theme:th}}));
  }
  function apply(sr,ss){
    var now=new Date();var dawn=new Date(sr),dusk=new Date(ss);
    setTh((now<dawn||now>=dusk)?'dark':'light'); // gün batımı→karanlık, gün doğumu→aydınlık
  }
  var today='';try{today=new Date().toISOString().slice(0,10);}catch(e){}
  var cached=null;try{cached=JSON.parse(localStorage.getItem('sc_suntimes')||'null');}catch(e){}
  if(cached&&cached.date===today){apply(cached.sunrise,cached.sunset);return;}
  try{
    fetch('https://api.sunrise-sunset.org/json?lat=47.05&lng=8.31&formatted=0')
      .then(function(r){return r.json();})
      .then(function(d){
        if(d&&d.status==='OK'&&d.results){
          var o={date:today,sunrise:d.results.sunrise,sunset:d.results.sunset};
          try{localStorage.setItem('sc_suntimes',JSON.stringify(o));}catch(e){}
          try{if(sessionStorage.getItem('sc_theme_manual'))return;}catch(e){}
          apply(o.sunrise,o.sunset);
        }
      }).catch(function(){});
  }catch(e){}
}
function ensure(){
  var pb=document.getElementById('sc-progress');
  if(!pb){pb=document.createElement('div');pb.id='sc-progress';document.body.appendChild(pb);}
  function prog(){var de=document.documentElement;var st=de.scrollTop||document.body.scrollTop;var h=de.scrollHeight-de.clientHeight;var p=h>0?st/h:0;pb.style.height=(p*100)+'%';}
  window.__scProg=prog;prog();
  // ── Tema geçişi: saved-theme değişince 300ms yumuşak cross-fade ──
  if(!window.__scThemeObs){
    window.__scThemeObs=1;
    var de2=document.documentElement;
    var tmo=new MutationObserver(function(){
      de2.classList.add('sc-theme-anim');
      clearTimeout(window.__scThemeT);
      window.__scThemeT=setTimeout(function(){de2.classList.remove('sc-theme-anim');},340);
    });
    tmo.observe(de2,{attributes:true,attributeFilter:['saved-theme']});
  }
  // Otomatik tema (gün doğumu/batımı) — sayfa başına bir kez
  if(!window.__scAutoTheme){window.__scAutoTheme=1;scAutoTheme();}
  // ── SBB-KUTUSU: tam sağ sütun genişliği, siyah, dikey ──
  var sbb=document.getElementById('sc-sbb');
  if(!sbb){
    sbb=document.createElement('div');sbb.id='sc-sbb';
    // Header row: logo + graph toggle + theme + focus
    var sbbHdr=document.createElement('div');sbbHdr.className='sc-sbb-hdr';
    // SBB logo: sabit kompakt font (rotasyon yok — sadece sayfa header'ı döner)
    var lg=document.createElement('a');lg.className='sc-logo-btn';lg.href='/';lg.setAttribute('aria-label','SAYKO.ch');
    lg.innerHTML='<span class="sc-logo-icon sc-logo-sb">'+SC_SB+'</span>';
    lg.classList.add('sc-logo-sb-only');
    // Nöral Ağ toggle (beyin ikonu) — graph view'u aç/kapat
    var gtb=document.createElement('button');gtb.type='button';gtb.id='sc-gtoggle';gtb.className='sc-toolbtn';gtb.title='Nöral Ağ';gtb.setAttribute('aria-label','Nöral Ağ aç/kapat');
    gtb.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5C10.3 4 8.2 4.3 7 5.8c-.9 1.1-1.1 2.5-.7 3.7C5.3 10 5 11 5 12.1c0 1.4.7 2.6 1.8 3.3-.2.6-.3 1.2-.3 1.8 0 1.8 1.5 3.3 3.3 3.3.3 0 .6 0 .9-.1"/><path d="M12 4.5c1.7-.5 3.8-.2 5 1.3.9 1.1 1.1 2.5.7 3.7.9.5 1.3 1.5 1.3 2.6 0 1.4-.7 2.6-1.8 3.3.2.6.3 1.2.3 1.8 0 1.8-1.5 3.3-3.3 3.3-.3 0-.6 0-.9-.1"/><path d="M9.7 18.3C10.4 19.3 11.2 19.8 12 20c.8-.2 1.6-.7 2.3-1.7"/><line x1="12" y1="4.5" x2="12" y2="19.5"/><path d="M8.5 8.5c.7.9 1.6 1.3 2.8 1.3"/><path d="M8 13c.8.7 1.8 1 2.8.8"/><path d="M15.5 8.5c-.7.9-1.6 1.3-2.8 1.3"/><path d="M16 13c-.8.7-1.8 1-2.8.8"/></svg>';
    // Beyin tuşu → Quartz'ın fullscreen global graph modunu aç (SBB açık kalır)
    // (stopPropagation: document-level click handler graph'ı hemen kapatmasın)
    gtb.addEventListener('click',function(e){
      e.stopPropagation();
      var self=this;
      // Anasayfada sağ sidebar gizli → global-graph-outer body'e taşı ki görünür olsun
      var ggOuter=document.querySelector('.global-graph-outer');
      if(ggOuter&&ggOuter.closest('.sidebar')){document.body.appendChild(ggOuter);}
      setTimeout(function(){
        var icon=document.querySelector('.global-graph-icon');
        if(icon){icon.click();}else if(ggOuter){ggOuter.classList.add('active');}
        self.classList.add('sc-active');
        setTimeout(function(){
          var cont=document.querySelector('.global-graph-container');
          if(cont&&!cont.querySelector('.sc-gg-hdr')){
            var hd=document.createElement('div');hd.className='sc-gg-hdr';
            hd.innerHTML='<span class="sc-gg-title">Nöral Ağ</span>';
            var xb=document.createElement('button');xb.type='button';xb.className='sc-gg-close';xb.setAttribute('aria-label','Kapat');xb.innerHTML='&#x2715;';
            xb.addEventListener('click',function(){var outer=document.querySelector('.global-graph-outer');if(outer)outer.classList.remove('active');self.classList.remove('sc-active');});
            hd.appendChild(xb);cont.insertBefore(hd,cont.firstChild);
          }
        },60);
      },280);
    });
    // Theme
    var bt=document.createElement('button');bt.type='button';bt.className='sc-toolbtn sc-themebtn';bt.title='Tema';bt.setAttribute('aria-label','Tema');
    bt.innerHTML='<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    bt.addEventListener('click',function(){try{sessionStorage.setItem('sc_theme_manual','1');}catch(e){}var nt=document.documentElement.getAttribute('saved-theme')==='dark'?'light':'dark';document.documentElement.setAttribute('saved-theme',nt);try{localStorage.setItem('theme',nt);}catch(e){}document.dispatchEvent(new CustomEvent('themechange',{detail:{theme:nt}}));});
    // Focus
    var bf=document.createElement('button');bf.type='button';bf.className='sc-toolbtn sc-focusbtn';bf.title='Fokus';bf.setAttribute('aria-label','Fokus');
    bf.innerHTML='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
    bf.addEventListener('click',function(){document.body.classList.toggle('is-focus');this.classList.toggle('sc-active');});
    sbbHdr.appendChild(lg);
    sbb.appendChild(sbbHdr);
    var sbbTools=document.createElement('div');sbbTools.className='sc-sbb-tools';
    sbbTools.appendChild(gtb);sbbTools.appendChild(bt);sbbTools.appendChild(bf);
    sbb.appendChild(sbbTools);
    // Clock
    var ticks='';for(var i=0;i<12;i++){var a=i*30*Math.PI/180,x1=50+40*Math.sin(a),y1=50-40*Math.cos(a),x2=50+46*Math.sin(a),y2=50-46*Math.cos(a);ticks+='<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" class="sc-tick"/>';}
    var clkDiv=document.createElement('div');clkDiv.id='sc-clock';
    var psiTip='<g class="sc-sec-psi" transform="translate(50,20) scale(0.17) translate(-40,-40)"><line x1="40" y1="8" x2="40" y2="76" stroke-width="6" stroke-linecap="round"/><path d="M16,8 C16,8 16,56 40,62" stroke-width="5.5" stroke-linecap="round" fill="none"/><path d="M64,8 C64,8 64,56 40,62" stroke-width="5.5" stroke-linecap="round" fill="none"/><circle cx="16" cy="8" r="6"/><circle cx="40" cy="8" r="6"/><circle cx="64" cy="8" r="6"/></g>';
    clkDiv.innerHTML='<svg id="sc-clockface" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" class="sc-face"/>'+ticks+'<text x="50" y="35" class="sc-sbb-brand" text-anchor="middle" font-size="7"><tspan class="sc-brand-name">SAYKO</tspan><tspan class="sc-brand-tld">.ch</tspan></text><line id="sc-h" x1="50" y1="50" x2="50" y2="29" class="sc-hand sc-hand-h"/><line id="sc-m" x1="50" y1="50" x2="50" y2="16" class="sc-hand sc-hand-m"/><g id="sc-s"><line x1="50" y1="60" x2="50" y2="18" class="sc-hand-s"/>'+psiTip+'</g><circle cx="50" cy="50" r="3.2" class="sc-cap"/></svg><div id="sc-day"></div>';
    // Masaüstünde saate tıklamak SBB-kutusunu kapatır (kuyruğa döner)
    clkDiv.addEventListener('click',function(){if(window.innerWidth>=1200){document.body.classList.remove('sc-sbb-open');}});
    sbb.appendChild(clkDiv);
    // Chevron: bottom-right of SBB box, toggles breadcrumb layers
    var bclayers=document.createElement('div');bclayers.id='sc-bclayers';bclayers.className='sc-bclayers';
    var chev=document.createElement('button');chev.type='button';chev.id='sc-clk-toggle';chev.className='sc-clk-chev';chev.setAttribute('aria-label','Aç/kapat');chev.setAttribute('aria-expanded','true');
    chev.innerHTML='<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
    chev.addEventListener('click',function(){var exp=this.getAttribute('aria-expanded')==='true';this.setAttribute('aria-expanded',exp?'false':'true');bclayers.classList.toggle('sc-collapsed',exp);});
    sbb.appendChild(bclayers);sbb.appendChild(chev);
    document.body.appendChild(sbb);
  }
  // Masaüstü: sağ sütun kenarından beliren minik SAAT kuyruğu → tıkla, SBB açılır
  var stail=document.getElementById('sc-sbb-tail');
  if(!stail){
    stail=document.createElement('button');stail.type='button';stail.id='sc-sbb-tail';stail.setAttribute('aria-label','SAYKO panelini aç');
    stail.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><line x1="12" y1="12" x2="12" y2="6.5" stroke-linecap="round"/><line x1="12" y1="12" x2="15.5" y2="13.5" stroke-linecap="round" stroke="#d2151a"/></svg>';
    stail.addEventListener('click',function(){document.body.classList.add('sc-sbb-open');});
    document.body.appendChild(stail);
  }
  // Mobil/tablet: SBB-kutusunu açan cardinal kırmızı psi tuşu (FAB) + arka perde
  var fab=document.getElementById('sc-sbb-fab');
  if(!fab){
    fab=document.createElement('button');fab.type='button';fab.id='sc-sbb-fab';fab.setAttribute('aria-label','SAYKO panelini aç/kapat');
    fab.innerHTML='<span class="sc-fab-icon sc-fab-sb">'+SC_SB+'</span>';
    var bd=document.createElement('div');bd.id='sc-sbb-backdrop';bd.setAttribute('aria-hidden','true');
    fab.addEventListener('click',function(){document.body.classList.toggle('sc-sbb-open');});
    bd.addEventListener('click',function(){document.body.classList.remove('sc-sbb-open');});
    document.body.appendChild(bd);document.body.appendChild(fab);
  }
  // Sol sütun perdesini geri açan ">>" tuşu (sol-orta, sabit)
  var lrb=document.getElementById('sc-lsb-restore');
  if(!lrb){
    lrb=document.createElement('button');lrb.type='button';lrb.id='sc-lsb-restore';lrb.setAttribute('aria-label','Sol sütunu aç');
    lrb.innerHTML='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 18 13 12 7 6"/><polyline points="13 18 19 12 13 6"/></svg>';
    lrb.addEventListener('click',function(){document.body.classList.remove('sc-lsb-closed');setTimeout(scREdge,10);setTimeout(scREdge,330);});
    document.body.appendChild(lrb);
  }
  // Back-to-top
  var tt=document.getElementById('sc-totop');
  if(!tt){
    tt=document.createElement('button');tt.type='button';tt.id='sc-totop';tt.setAttribute('aria-label','Yukarı çık');tt.title='Yukarı çık';
    tt.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
    tt.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
    document.body.appendChild(tt);
  }
  // Vignette overlay
  var vig=document.getElementById('sc-vignette');
  if(!vig){vig=document.createElement('div');vig.id='sc-vignette';vig.setAttribute('aria-hidden','true');document.body.appendChild(vig);}
  if(!window.__scRafRunning){
    window.__scRafRunning=true;
    var tick=function(){
      var d=new Date();var z=new Date(d.toLocaleString('en-US',{timeZone:'Europe/Zurich'}));
      var H=document.getElementById('sc-h'),M=document.getElementById('sc-m'),S=document.getElementById('sc-s');
      if(H){
        var secMs=Date.now()%60000;var m=z.getMinutes(),h=z.getHours();
        var frac=secMs/60000;
        H.setAttribute('transform','rotate('+((h%12)*30+m*0.5+frac*0.5)+' 50 50)');
        M.setAttribute('transform','rotate('+(m*6+frac*6)+' 50 50)');
        var sa=secMs<58500?(secMs/58500)*360:360;
        S.setAttribute('transform','rotate('+sa+' 50 50)');}
      var dn=document.getElementById('sc-day');
      if(dn){var wd=z.getDay();var day=d.toLocaleDateString('tr-TR',{weekday:'long',timeZone:'Europe/Zurich'});var nt=day.charAt(0).toLocaleUpperCase('tr-TR')+day.slice(1);if(dn.textContent!==nt)dn.textContent=nt;dn.classList.toggle('weekend',wd===0||wd===6);}
      requestAnimationFrame(tick);
    };tick();
  }
  if(!window.__scScroll){
    window.addEventListener('scroll',function(){if(window.__scProg)window.__scProg();var y=window.scrollY||window.pageYOffset;document.body.classList.toggle('sc-scrolled',y>100);var tt=document.getElementById('sc-totop');if(tt)tt.classList.toggle('sc-show',y>400);},{passive:true});
    window.addEventListener('resize',function(){if(window.__scProg)window.__scProg();scREdge();clearTimeout(window.__scFitT);window.__scFitT=setTimeout(function(){scFitHex();scFitHeader();},160);});
    window.__scScroll=1;
  }
  scREdge();
}
function updateBcLayers(){
  var bl=document.getElementById('sc-bclayers');if(!bl)return;
  bl.innerHTML='';
  var slug=document.body.getAttribute('data-slug')||'';
  var parts=slug.split('/').filter(Boolean);
  var isFolder=parts.length>0&&parts[parts.length-1]==='index';
  var real=isFolder?parts.slice(0,-1):parts;
  if(slug===''||slug==='index'||real.length===0)return;
  if(isFolder&&real.length<=1)return;
  var dersName=SC_MAP[real[0]]||real[0];
  var l1=document.createElement('a');l1.className='sc-bclayer sc-bcl-course';l1.href='/'+real[0]+'/';l1.textContent=dersName;
  bl.appendChild(l1);setTimeout(function(){l1.classList.add('sc-bcl-in');},30);
  var toSlug='';
  if(isFolder&&real.length===2){toSlug=real[1];}
  else if(!isFolder&&real.length>=3){toSlug=real[real.length-2];}
  if(toSlug){
    var toName=toSlug;
    if(isFolder&&real.length===2){
      var fh1=document.querySelector('.center .article-title, article .article-title');
      if(fh1&&(fh1.textContent||'').trim())toName=(fh1.textContent||'').trim();
    } else {
      var bc=document.querySelector('.breadcrumb-container');
      var anchors=bc?Array.prototype.slice.call(bc.querySelectorAll('a')):[];
      for(var ai=0;ai<anchors.length;ai++){
        var hp=decodeURIComponent(anchors[ai].getAttribute('href')||'').replace(/\\/+$/,'').split('/').filter(Boolean);
        var last=hp[hp.length-1],prev=hp[hp.length-2];
        if(last===toSlug||(last==='index'&&prev===toSlug)){toName=(anchors[ai].textContent||'').trim();break;}
      }
    }
    var l2=document.createElement('a');l2.className='sc-bclayer sc-bcl-topic';l2.href='/'+real[0]+'/'+toSlug+'/';l2.textContent=toName;
    bl.appendChild(l2);setTimeout(function(){l2.classList.add('sc-bcl-in');},90);
  }
  if(!isFolder&&real.length>=2){
    var h1=document.querySelector('.center .article-title, article .article-title');
    var artTitle=h1?(h1.textContent||'').trim():'';
    if(artTitle){
      var l3=document.createElement('span');l3.className='sc-bclayer sc-bcl-article';l3.textContent=artTitle;
      bl.appendChild(l3);setTimeout(function(){l3.classList.add('sc-bcl-in');},150);
    }
  }
}
// Altıgen konu kutuları: yazı, altıgenin geniş orta bandına TAM sığana dek küçülür
function scFitHex(){
  var slug=document.body.getAttribute('data-slug')||'';
  if(!/\\/index$/.test(slug))return; // yalnız klasör (konu) sayfaları
  var links=document.querySelectorAll('.page-listing .section-li .desc h3 a');
  links.forEach(function(a){
    var lbl=a.querySelector('.sc-hx-label');
    if(!lbl){lbl=document.createElement('span');lbl.className='sc-hx-label';lbl.textContent=(a.textContent||'').trim();a.textContent='';a.appendChild(lbl);}
    var li=a.closest('.section-li');if(!li)return;
    var H=li.clientHeight||152,W=li.clientWidth||132;
    var maxH=H*0.52,maxW=W-18;
    var fs=12;lbl.style.lineHeight='1.18';lbl.style.fontSize=fs+'px';
    var guard=0;
    while((lbl.scrollHeight>maxH||lbl.scrollWidth>maxW)&&fs>6.5&&guard<40){fs-=0.5;lbl.style.fontSize=fs+'px';guard++;}
  });
}
// Sayfanın sağ kenarı ile içerik kutusu arası mesafe (scrollbar hariç) → SBB/kuyruk
// tam sayfa kenarına otursun diye --sc-redge olarak ölçülür.
function scREdge(){
  var pg=document.querySelector('.page');
  var w=document.documentElement.clientWidth||window.innerWidth;
  var re=0;
  if(pg){var r=pg.getBoundingClientRect();re=Math.max(0,Math.round(w-r.right));}
  document.documentElement.style.setProperty('--sc-redge',re+'px');
}
// ── Öneri 6: Dinamik etiket bulutu ──────────────────────────────────
// /tags/ sayfasında, fetchData içeriğindeki tüm yazıları tarayıp her etiketin
// kaç yazıda geçtiğini sayar; etiket bağlantılarını log ölçekle büyütür.
// İçerik büyüdükçe bulut kendiliğinden güncellenir (build değişikliği yok).
function scTagCloud(){
  var slug=document.body.getAttribute('data-slug')||'';
  if(!(slug==='tags'||slug==='tags/index'||slug.indexOf('tags/')===0))return;
  if(typeof fetchData==='undefined'||!fetchData||!fetchData.then)return;
  fetchData.then(function(index){
    var counts={};
    for(var k in index){
      var tags=index[k]&&index[k].tags;
      if(tags&&tags.length){tags.forEach(function(t){var key=(''+t).toLowerCase();counts[key]=(counts[key]||0)+1;});}
    }
    // Yalnız etiket BÖLÜM başlıklarını ölçekle (makale listeleri/iç etiket
    // çipleri bozulmasın) → çok kullanılan etiketin başlığı daha büyük olur.
    var links=document.querySelectorAll('h2 > a.tag-link, h2 a.tag-link');
    if(!links.length)return;
    var max=1,data=[];
    links.forEach(function(a){
      var href=decodeURIComponent(a.getAttribute('href')||'');
      var m=href.match(/tags\\/([^\\/#?]+)/);
      if(!m)return;
      var name=m[1].toLowerCase();
      var c=counts[name]||1;
      if(c>max)max=c;
      data.push([a,c]);
    });
    data.forEach(function(d){
      var a=d[0],c=d[1];
      var t=Math.log(1+c)/Math.log(1+max);
      var fs=1.3+t*2.0;
      a.style.fontSize=fs.toFixed(2)+'rem';
      a.style.opacity=(0.62+t*0.38).toFixed(2);
      a.setAttribute('data-sc-count',String(c));
      a.classList.add('sc-tagcloud-item');
    });
  });
}
// Künye paneli: yazının sonuna taşı, başlık + anahtarları Türkçeleştir
function scProps(){
  var np=document.querySelector('.note-properties');if(!np)return;
  var art=document.querySelector('.center article');
  if(art&&np.parentNode!==art){art.appendChild(np);}
  else if(art&&art.lastElementChild!==np){art.appendChild(np);}
  var ttl=np.querySelector('.note-properties-title');
  if(ttl)ttl.textContent='Etiketler';
  var KEYS={'tags':'Etiketler','description':'Açıklama','aliases':'Takma Adlar','title':'Başlık'};
  np.querySelectorAll('.note-properties-key').forEach(function(k){
    var t=(k.textContent||'').trim().toLowerCase();
    if(KEYS[t]&&!k.getAttribute('data-sc-tr')){k.textContent=KEYS[t];k.setAttribute('data-sc-tr','1');}
  });
}
// Header SAYKO kelimesi: sabit kutuya sığana dek küçülür (logo/slogan asla kaymaz, ".ch" kırpılmaz)
function scFitHeader(){
  var w=document.querySelector('.site-header .sh-word');if(!w)return;
  var fs=2.1;w.style.fontSize=fs+'rem';
  var g=0;while(w.scrollWidth>w.clientWidth&&fs>1.2&&g<28){fs-=0.07;w.style.fontSize=fs+'rem';g++;}
}
// ── Header Efekt 0: Kromatik sapma — sakin, sürekli salınım; imleç yaklaştıkça artar ──
function initFx0(hdr){
  var nm=hdr.querySelector('.sh-name');if(!nm)return;
  var amp=0,target=0,phase=0,rafId=null,trip=0;
  var lx=null,ly=null,lt=0,vel=0,dirx=1,diry=0;
  function frame(){
    amp+=(target-amp)*0.08;
    phase+=0.018;
    vel*=0.9; // hızı yumuşakça söndür
    // İmleç üstte oyalandıkça (yakın + yavaş) → psychedelic "trip" yavaşça yükselir
    var dwell=(target>0.8&&vel<2.4);
    trip+=((dwell?1:0)-trip)*(dwell?0.012:0.06);
    if(amp<0.08&&target<0.08&&trip<0.02){nm.style.textShadow='none';rafId=null;return;}
    // İmleç hareket yönüne hizalı RGB kanal kayması
    var base=amp*(0.55+0.45*Math.sin(phase));
    var wob=1+trip*2.4*Math.sin(phase*0.7); // trip arttıkça dalgalı, nefes alan genlik
    var sx=(base*dirx+amp*0.28*Math.sin(phase))*wob;
    var sy=(base*diry+amp*0.18*Math.cos(phase*1.3))*wob;
    // Hız > 0.5 px/frame iken cardinal kırmızıyı sine modülasyonuyla harmanla
    var rA=vel>0.5?(0.62+0.33*Math.abs(Math.sin(phase*2.0))):0.62;
    var sh=sx.toFixed(2)+'px '+sy.toFixed(2)+'px 0 rgba(200,16,46,'+rA.toFixed(2)+'),'+
      (-sx).toFixed(2)+'px '+(-sy).toFixed(2)+'px 0 rgba(40,80,220,0.52)';
    if(trip>0.02){
      // LSD katmanları: gökkuşağı kanalları phase ile döner, kayma trip ile büyür
      var off=4+trip*18;
      for(var k=0;k<3;k++){
        var hue=(phase*55+k*120)%360;
        var ang=phase*1.25+k*2.094;
        var ox=Math.cos(ang)*off, oy=Math.sin(ang)*off;
        sh+=','+ox.toFixed(2)+'px '+oy.toFixed(2)+'px '+(trip*3).toFixed(2)+'px hsla('+hue.toFixed(0)+',95%,56%,'+(0.5*trip).toFixed(2)+')';
      }
    }
    nm.style.textShadow=sh;
    rafId=requestAnimationFrame(frame);
  }
  function onMove(e){
    var r=nm.getBoundingClientRect();
    var dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
    var d=Math.sqrt(dx*dx+dy*dy);
    target=Math.max(0,(260-d)/260)*2.8;
    var now=Date.now();
    if(lx!==null){
      var mvx=e.clientX-lx,mvy=e.clientY-ly,mag=Math.sqrt(mvx*mvx+mvy*mvy);
      var dt=Math.max(1,now-lt);
      vel=mag/dt*16; // ~px/frame (16ms kare)
      if(mag>0.5){dirx=mvx/mag;diry=mvy/mag;}
    }
    lx=e.clientX;ly=e.clientY;lt=now;
    if(!rafId)rafId=requestAnimationFrame(frame);
  }
  function onLeave(){target=0;vel=0;}
  hdr.addEventListener('mousemove',onMove);
  hdr.addEventListener('mouseleave',onLeave);
  hdr.__scFxClean=function(){cancelAnimationFrame(rafId);hdr.removeEventListener('mousemove',onMove);hdr.removeEventListener('mouseleave',onLeave);nm.style.textShadow='';};
}
// ── Header Efekt 1: Manyetik metin — harfler imlecin yakınında iter, kırmızıya döner ──
function initFx1(hdr){
  var nm=hdr.querySelector('.sh-name');if(!nm||nm.getAttribute('data-sc-mag'))return;
  nm.setAttribute('data-sc-mag','1');
  var txt=nm.textContent||'';nm.innerHTML='';
  var spans=[];
  txt.split('').forEach(function(ch){
    var s=document.createElement('span');s.textContent=ch;
    s.style.cssText='display:inline-block;transition:transform 180ms ease,color 180ms ease;';
    nm.appendChild(s);spans.push(s);
  });
  function onMove(e){
    spans.forEach(function(s){
      var r=s.getBoundingClientRect();
      var dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
      var d=Math.sqrt(dx*dx+dy*dy),R=85;
      if(d<R){var f=(R-d)/R*0.45;s.style.transform='translate('+(-dx*f).toFixed(1)+'px,'+(-dy*f).toFixed(1)+'px)';s.style.color='#C8102E';}
      else{s.style.transform='none';s.style.color='';}
    });
  }
  function onLeave(){spans.forEach(function(s){s.style.transform='none';s.style.color='';});}
  hdr.addEventListener('mousemove',onMove);hdr.addEventListener('mouseleave',onLeave);
  hdr.__scFxClean=function(){hdr.removeEventListener('mousemove',onMove);hdr.removeEventListener('mouseleave',onLeave);nm.innerHTML=txt;nm.removeAttribute('data-sc-mag');};
}
// ── Header Efekt 2: Rorschach mürekkep lekesi — imleç hareketi simetrik bir
//    psikoloji testi lekesi büyütür (dikey eksende aynalanır), sonra yavaşça solar ──
function initFx2(hdr){
  var host=hdr.querySelector('.site-header-title')||hdr.querySelector('.sh-word');if(!host)return;
  var cnv=document.createElement('canvas');
  cnv.style.cssText='position:absolute;left:0;top:0;pointer-events:none;z-index:9;mix-blend-mode:multiply;';
  host.style.position='relative';
  host.appendChild(cnv);
  var ctx2=cnv.getContext('2d');
  var blobs=[],rafId=null,lastSpawn=0,axis=0;
  function resize(){var w=host.clientWidth,h=host.clientHeight;cnv.width=w;cnv.height=h;cnv.style.width=w+'px';cnv.style.height=h+'px';axis=w/2;}
  resize();
  function rgb(){return document.documentElement.getAttribute('saved-theme')==='dark'?'210,24,30':'26,20,16';}
  // İmleç pozisyonu ve aynası → organik leke parçacığı çifti
  function spawn(x,y){
    if(blobs.length>140)return;
    var r=7+Math.random()*16, jx=(Math.random()-0.5)*6, jy=(Math.random()-0.5)*6;
    var grow=r*(1.3+Math.random()*0.7);
    blobs.push({x:x+jx,y:y+jy,r:1,max:grow,a:0.5+Math.random()*0.35,life:1});
    blobs.push({x:2*axis-(x+jx),y:y+jy,r:1,max:grow,a:0.5+Math.random()*0.35,life:1}); // ayna
  }
  function frame(){
    ctx2.clearRect(0,0,cnv.width,cnv.height);
    var c=rgb(),alive=false;
    ctx2.shadowColor='rgba('+c+',1)';ctx2.shadowBlur=6;
    blobs=blobs.filter(function(b){
      if(b.r<b.max)b.r+=(b.max-b.r)*0.14;
      b.life-=0.006; if(b.life<=0)return false;
      alive=true;
      ctx2.fillStyle='rgba('+c+','+(b.a*b.life).toFixed(3)+')';
      ctx2.beginPath();ctx2.arc(b.x,b.y,b.r,0,6.2832);ctx2.fill();
      return true;
    });
    ctx2.shadowBlur=0;
    if(alive)rafId=requestAnimationFrame(frame);else rafId=null;
  }
  function onMove(e){
    var r=host.getBoundingClientRect();var mx=e.clientX-r.left,my=e.clientY-r.top;
    if(mx<0||mx>r.width||my<0||my>r.height)return;
    var now=Date.now();
    if(now-lastSpawn>55){lastSpawn=now;spawn(mx,my);}
    if(!rafId)rafId=requestAnimationFrame(frame);
  }
  hdr.addEventListener('mousemove',onMove);
  host.__scFxResize=resize;window.addEventListener('resize',resize,{passive:true});
  hdr.__scFxClean=function(){cancelAnimationFrame(rafId);rafId=null;blobs=[];hdr.removeEventListener('mousemove',onMove);window.removeEventListener('resize',resize);if(cnv.parentNode)cnv.parentNode.removeChild(cnv);if(host)host.style.position='';};
}
// ── Header efekt koordinatörü — her sayfa yükünde efekt sırası döner ──
function initHeaderFx(){
  if(window.innerWidth<800)return;
  var hdr=document.querySelector('.site-header');if(!hdr)return;
  if(typeof hdr.__scFxClean==='function')hdr.__scFxClean();
  var n=0;try{n=parseInt(localStorage.getItem('sayko_fx')||'0');}catch(e){}
  try{localStorage.setItem('sayko_fx',String((n+1)%3));}catch(e){}
  if(n%3===0)initFx0(hdr);else if(n%3===1)initFx1(hdr);else initFx2(hdr);
}
// ── Görev 7.2: Ders kartlarına imleç-güdümlü 3D tilt (yalnız masaüstü) ──
function scCardTilt(){
  if(window.innerWidth<800)return;
  document.querySelectorAll('.curriculum-grid .cg-cell').forEach(function(c){
    if(c.getAttribute('data-sc-tilt'))return;c.setAttribute('data-sc-tilt','1');
    var ic=c.querySelector('.cg-icon'),nm=c.querySelector('.cg-name');
    c.addEventListener('mousemove',function(e){
      var r=c.getBoundingClientRect();
      var px=(e.clientX-r.left)/r.width-0.5,py=(e.clientY-r.top)/r.height-0.5;
      c.style.transform='perspective(1000px) rotateX('+(-py*6).toFixed(2)+'deg) rotateY('+(px*6).toFixed(2)+'deg) scale(1.01)';
      // İkon parallax: kartın derinliğinde hafifçe öne/yana kayar
      if(ic)ic.style.transform='translate('+(px*9).toFixed(1)+'px,'+(py*9).toFixed(1)+'px) translateZ(24px)';
      // İsimde minik kromatik sapma (imleç yönüne göre)
      if(nm)nm.style.textShadow=(px*3).toFixed(1)+'px 0 0 rgba(200,16,46,0.35),'+(-px*3).toFixed(1)+'px 0 0 rgba(40,80,220,0.30)';
    });
    c.addEventListener('mouseleave',function(){c.style.transform='';if(ic)ic.style.transform='';if(nm)nm.style.textShadow='';});
  });
}
// ── Görev 7: Konu hex'lerine (page-listing) hafif 3D tilt + kromatik sapma ──
function scHexTilt(){
  if(window.innerWidth<800)return;
  document.querySelectorAll('.page-listing .section-li .desc h3 a').forEach(function(a){
    if(a.getAttribute('data-sc-hex'))return;a.setAttribute('data-sc-hex','1');
    a.addEventListener('mousemove',function(e){
      var r=a.getBoundingClientRect();
      var px=(e.clientX-r.left)/r.width-0.5,py=(e.clientY-r.top)/r.height-0.5;
      a.style.transform='perspective(900px) rotateX('+(-py*5).toFixed(2)+'deg) rotateY('+(px*5).toFixed(2)+'deg) scale(1.06)';
      a.style.textShadow=(px*2.4).toFixed(1)+'px 0 0 rgba(200,16,46,0.4),'+(-px*2.4).toFixed(1)+'px 0 0 rgba(40,80,220,0.34)';
    });
    a.addEventListener('mouseleave',function(){a.style.transform='';a.style.textShadow='';});
  });
}
// ── Görev 8: Backlinks + Etiketler'i SBB-kutusuna entegre et ──
// Menüden (sc-bclayers) sonra ince separatör + "Alakalı yazılar:" + backlinks;
// en altta "Etiketler" dropdown (varsayılan kapalı). Her nav'da yeniden kurulur.
function scSbbExtras(){
  var sbb=document.getElementById('sc-sbb');if(!sbb)return;
  var extra=sbb.querySelector('.sc-sbb-extra');
  if(!extra){extra=document.createElement('div');extra.className='sc-sbb-extra';sbb.appendChild(extra);}
  extra.innerHTML='';
  // Alakalı yazılar (backlinks)
  var bl=document.querySelector('.backlinks');
  if(bl){
    var sep=document.createElement('div');sep.className='sc-sbb-sep';extra.appendChild(sep);
    var rt=document.createElement('div');rt.className='sc-sbb-rel-title';rt.textContent='Alakalı yazılar:';extra.appendChild(rt);
    var oh=bl.querySelector('h3');if(oh)oh.style.display='none';
    bl.classList.add('sc-sbb-backlinks');
    extra.appendChild(bl);
  }
  // Etiketler dropdown (note-properties) — varsayılan kapalı
  var np=document.querySelector('.note-properties');
  if(np){
    var det=document.createElement('details');det.className='sc-sbb-tags';
    var sm=document.createElement('summary');sm.textContent='Etiketler';det.appendChild(sm);
    var npt=np.querySelector('.note-properties-title');if(npt)npt.style.display='none';
    np.classList.add('sc-sbb-np');
    det.appendChild(np);
    extra.appendChild(det);
  }
}
// ── Footer'ı body seviyesine taşı → tüm sayfa enini kaplar; SPA nav'da
// Quartz yeni footer üretirse onları siler, body-level olanı korur.
function syncFooter(){
  var fs=document.querySelectorAll('footer');if(fs.length===0)return;
  var bodyFt=null;
  for(var i=0;i<fs.length;i++){if(fs[i].parentElement===document.body){bodyFt=fs[i];break;}}
  if(!bodyFt){document.body.appendChild(fs[0]);}
  else{for(var i=0;i<fs.length;i++){if(fs[i]!==bodyFt)fs[i].remove();}}
}
// ── Footer dalga animasyonu — yalnız <footer> elementini kapsar (yaklaşık 48px) ──
// IntersectionObserver ile görünür olduğunda çalışır → homepage slowdown yok
function ensureFooterWave(){
  var ft=document.querySelector('footer');if(!ft)return;
  // Canvas yoksa (ilk yük ya da SPA nav'da footer yenilendiyse) ekle → her sayfada garanti
  if(!ft.querySelector('#sc-fw')){
    var cnv=document.createElement('canvas');cnv.id='sc-fw';
    cnv.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    if(getComputedStyle(ft).position==='static')ft.style.position='relative';
    ft.insertBefore(cnv,ft.firstChild);
    Array.prototype.slice.call(ft.children).forEach(function(c){if(c.id!=='sc-fw'){c.style.position='relative';c.style.zIndex='1';}});
  }
  if(window.__scFwRaf)return; // tek kalıcı döngü; footer + canvas'ı her karede yeniden bulur
  function rnd(a,b){return a+Math.random()*(b-a);}
  function mkH(){var n=Math.floor(rnd(2,5)),h=[];for(var i=0;i<n;i++)h.push([rnd(0.06,0.28),rnd(1,4),rnd(0,6.28)]);return h;}
  function evalW(h,x,W,p){var y=0;h.forEach(function(s){y+=Math.sin(x/W*6.28*s[1]+p+s[2])*s[0];});return y;}
  function lrp(a,b,t){var n=Math.max(a.length,b.length),r=[];for(var i=0;i<n;i++){var ai=a[i]||[0,1,0],bi=b[i]||[0,1,0];r.push([ai[0]+(bi[0]-ai[0])*t,ai[1]+(bi[1]-ai[1])*t,ai[2]+(bi[2]-ai[2])*t]);}return r;}
  var L=[{p:0,v:0.45,a:mkH(),b:mkH(),t:0,d:rnd(6,18)},{p:3.14,v:-0.32,a:mkH(),b:mkH(),t:0,d:rnd(6,18)}];
  var prev=0,snakePhase=0;
  function tick(ts){
    window.__scFwRaf=requestAnimationFrame(tick);
    var ftn=document.querySelector('footer');if(!ftn){prev=0;return;}
    var cv=ftn.querySelector('#sc-fw');if(!cv){prev=0;return;}
    var rect=ftn.getBoundingClientRect();
    var vh=window.innerHeight||document.documentElement.clientHeight||0;
    if(rect.bottom<-40||rect.top>vh+40){prev=0;return;} // ekran dışı → boşuna çizme
    var dt=prev?(ts-prev)/1000:0;if(dt>0.1)dt=0.1;prev=ts;
    var W=ftn.clientWidth||300,H=Math.max(ftn.clientHeight,48);
    if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
    var ctx=cv.getContext('2d');ctx.clearRect(0,0,W,H);
    var dk=document.documentElement.getAttribute('saved-theme')==='dark';
    var cs=dk?['rgba(50,8,12,0.90)','rgba(22,22,22,0.65)']:['rgba(185,171,150,0.62)','rgba(215,204,187,0.42)'];
    L.forEach(function(l,i){
      l.p+=l.v*dt;l.t+=dt;
      if(l.t>=l.d){l.a=lrp(l.a,l.b,1);l.b=mkH();l.t=0;l.d=rnd(6,18);}
      var pg=l.t/l.d;pg=pg<0.5?2*pg*pg:(4-2*pg)*pg-1;
      var h=lrp(l.a,l.b,pg);
      ctx.beginPath();
      var by=H*0.55;
      for(var x=0;x<=W;x+=3){
        var y=by+evalW(h,x,W,l.p)*H*0.38;
        if(x===0){ctx.moveTo(0,H);ctx.lineTo(0,y);}else ctx.lineTo(x,y);
      }
      ctx.lineTo(W,H);ctx.closePath();
      ctx.fillStyle=cs[i];ctx.fill();
    });
    // ── Dalgaların üstünde ağır ağır süzülen yılan (dalgalara dokunmadan) ──
    snakePhase+=dt*26;                       // yatay hız ~26px/s (yavaş)
    var span=W+180, headX=(snakePhase%span)-90;
    var amp2=Math.min(H*0.20,9), baseY=H*0.46, segs=24, sgap=Math.max(6,W/70);
    var sc=dk?'rgba(232,224,210,0.50)':'rgba(70,54,40,0.46)';
    function syAt(x){return baseY+Math.sin(x*0.05+snakePhase*0.012)*amp2;}
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=sc;
    for(var s=0;s<segs;s++){
      var x1=headX-s*sgap,x2=headX-(s+1)*sgap;
      ctx.lineWidth=2.7*(1-s/segs)+0.5;
      ctx.beginPath();ctx.moveTo(x1,syAt(x1));ctx.lineTo(x2,syAt(x2));ctx.stroke();
    }
    var hy=syAt(headX);
    ctx.fillStyle=sc;ctx.beginPath();ctx.arc(headX,hy,2.5,0,6.2832);ctx.fill();
    // çatal dil (ucunda)
    ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(headX+2,hy);ctx.lineTo(headX+6,hy-1.4);ctx.moveTo(headX+2,hy);ctx.lineTo(headX+6,hy+1.4);ctx.stroke();
  }
  requestAnimationFrame(tick);
}
function perNav(){
  // Sayfa değişince SBB kuyruğunu kapat (her sayfaya temiz başla) + sağ kenarı ölç
  document.body.classList.remove('sc-sbb-open');
  scREdge();
  // Künye (note-properties) panelini yazının SONUNA taşı + Türkçe etiketle
  scProps();
  // Dinamik etiket bulutu (/tags sayfası)
  scTagCloud();
  var slogan=SLO[Math.floor(Math.random()*SLO.length)];
  var isHome=(document.body.getAttribute('data-slug')==='index');
  // Site header with rotating font
  var ph=document.querySelector('.page-header');
  if(ph&&!ph.querySelector('.site-header')){
    var fnt2=SC_FONTS[Math.floor(Math.random()*SC_FONTS.length)];
    var sh=document.createElement('div');sh.className='site-header';
    sh.innerHTML='<a class="site-header-title" href="/" aria-label="SAYKO.ch"><span class="sh-logo sh-logo-sb">'+SC_SB+'</span><span class="sh-word"><span class="sh-name">SAYKO</span><span class="sh-tld">.ch</span></span></a><span class="sh-divider" aria-hidden="true">'+SC_SERPENT_LINE+'</span><p class="site-header-slogan"></p>';
    sh.querySelector('.sh-name').style.fontFamily=fnt2+',serif';
    sh.querySelector('.site-header-slogan').textContent=slogan;
    ph.insertAdjacentElement('afterbegin',sh);
    // Kelimeyi sabit kutuya sığdır → logo/slogan sabit kalır, ".ch" asla kırpılmaz
    requestAnimationFrame(scFitHeader);
    if(document.fonts&&document.fonts.ready&&document.fonts.ready.then){document.fonts.ready.then(scFitHeader);}
  }
  // Search: move to body as fixed tail (SBB kutusunun sol kenarından uzanır).
  // Tıklanınca Quartz container'a .active ekler; biz bunu .sc-search-open olarak
  // kuyruğa yansıtırız → kuyruk sola doğru genişleyip arama çubuğuna dönüşür.
  var srchEl=document.querySelector('.search');
  if(srchEl&&!srchEl.classList.contains('sc-search-tail')){
    srchEl.classList.add('sc-search-tail');
    document.body.appendChild(srchEl);
    var scont=srchEl.querySelector('.search-container');
    if(scont&&window.MutationObserver){
      var smo=new MutationObserver(function(){srchEl.classList.toggle('sc-search-open',scont.classList.contains('active'));});
      smo.observe(scont,{attributes:true,attributeFilter:['class']});
    }
  }
  if(isHome){
    var center=document.querySelector('.center');
    if(center&&!center.querySelector('.curriculum-grid')){
      var grid=document.createElement('nav');grid.className='curriculum-grid';grid.setAttribute('aria-label','Müfredat');
      var hh='';for(var i=0;i<SC_GRID.length;i++){var c=SC_GRID[i];hh+='<a class="cg-cell" href="'+c.slug+'/"><span class="cg-num">'+c.n+'</span><span class="cg-icon">'+c.svg+'</span><span class="cg-name">'+c.name+'</span></a>';}
      grid.innerHTML=hh;
      var art=center.querySelector('article');if(art){center.insertBefore(grid,art);}else{center.appendChild(grid);}
    }
  }
  document.querySelectorAll('.recent-notes .recent-li').forEach(function(li){
    var a=li.querySelector('.desc h3 a');if(!a)return;
    var t=(a.textContent||'').trim().toLowerCase();
    var np=decodeURIComponent((a.getAttribute('href')||'')).replace(/^(\\.\\/|\\.\\.\\/)+/,'').replace(/\\/+$/,'');
    var parts=np.split('/').filter(Boolean);
    var topLevel=parts.length<=1;
    var isCI=parts.length===2&&parts[1]==='index';
    if(t==='sayko.ch'||np===''||np==='.'||/(^|\\/)index$/.test(np)||isCI||(topLevel&&(SC_MAP[parts[0]]||SC_MAP[np]))||topLevel){li.remove();}
  });
  document.querySelectorAll('.recent-notes').forEach(function(rn){
    var feed=!!rn.closest('.page-footer');
    rn.querySelectorAll('.recent-li').forEach(function(li,idx){
      if(li.getAttribute('data-sc-rp'))return;li.setAttribute('data-sc-rp','1');
      var a=li.querySelector('.desc h3 a')||li.querySelector('a');var desc=li.querySelector('.desc')||li;
      if(a){var href=(a.getAttribute('href')||'').replace(/^\\.\\//,'').replace(/^\\//,'');var seg=decodeURIComponent(href).split('/')[0];var label=SC_MAP[seg];
        if(label){var eb=document.createElement('span');eb.className='rp-eyebrow';eb.textContent=label;desc.insertBefore(eb,desc.firstChild);}}
      if(feed){li.classList.add('rp-'+(idx+1));}
    });
  });
  // Sol sütun "Son Yazılar" accordion
  var lrn=document.querySelector('.left.sidebar .recent-notes');
  if(lrn&&!lrn.getAttribute('data-sc-acc')){
    lrn.setAttribute('data-sc-acc','1');
    var ttl=lrn.querySelector('h3');var ttltxt=ttl?(ttl.textContent||'Son Yazılar'):'Son Yazılar';
    var det=document.createElement('details');det.className='rp-accordion';
    var sum=document.createElement('summary');sum.textContent=ttltxt;det.appendChild(sum);
    if(ttl)ttl.remove();while(lrn.firstChild){det.appendChild(lrn.firstChild);}lrn.appendChild(det);
  }
  // Sol sütun perde (curtain) toggle butonu — "Son Yazılar"ın hemen üstünde
  var lsb=document.querySelector('.sidebar.left');
  if(lsb&&!lsb.querySelector('.sc-curtain-btn')){
    var cb=document.createElement('button');cb.type='button';cb.className='sc-curtain-btn';cb.title='Sol sütunu kapat';cb.setAttribute('aria-label','Sol sütunu kapat');
    cb.innerHTML='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 18 11 12 17 6"/><polyline points="11 18 5 12 11 6"/></svg>';
    cb.addEventListener('click',function(){document.body.classList.add('sc-lsb-closed');setTimeout(scREdge,10);setTimeout(scREdge,330);});
    var rn2=lsb.querySelector('.recent-notes');
    if(rn2)lsb.insertBefore(cb,rn2);else lsb.appendChild(cb);
  }
  // Graph: başlangıçta kapalı; başlık/kursif metin gizli (SBB beyin tuşu açar/kapatır)
  var g=document.querySelector('.graph');
  if(g&&!g.getAttribute('data-sc')){
    g.setAttribute('data-sc','1');g.classList.add('sc-graph-collapsed');
  }
  updateBcLayers();
  // Chevron yalnız gerçekten açılır/kapanır katman varsa görünür
  var bl2=document.getElementById('sc-bclayers'),chev2=document.getElementById('sc-clk-toggle');
  if(chev2)chev2.style.display=(bl2&&bl2.children.length>0)?'':'none';
  if(window.__scProg)window.__scProg();
  requestAnimationFrame(function(){requestAnimationFrame(scFitHex);});
  if(document.fonts&&document.fonts.ready&&document.fonts.ready.then){document.fonts.ready.then(scFitHex);}
  scCardTilt();
  scHexTilt();
  scSbbExtras();
  initHeaderFx();
  syncFooter();
  ensureFooterWave();
}
function init(){ensure();perNav();}
document.addEventListener('DOMContentLoaded',init);
document.addEventListener('nav',init);
})();`}} />
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
