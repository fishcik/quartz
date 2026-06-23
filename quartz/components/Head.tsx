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
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
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
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cedarville+Cursive&family=Dancing+Script:wght@500;600&family=Contrail+One&family=Abril+Fatface&family=Cinzel+Decorative:wght@700&family=Poiret+One&family=Limelight&family=Megrim&family=Special+Elite&family=Ultra&family=Lobster&family=Monoton&family=Rye&display=swap"
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
var SLO=["Psikoloji: Kitapta durduğu gibi durmaz.","Teori biter, maruz kalma başlar.","İncelemiyoruz, buyuz işte.","Okumuyoruz, maruz kalıyoruz.","Pratikte burdayız, teoride ordayız.","Kitap biter, kafa başlar.","Sistemler çöker, adaptasyon hayatta kalır.","Sınır, sadece bir varsayımdır.","Sınanmamış bir erdem, sadece iyi bir niyettir.","İyileşmek istiyorsan, maruz kalacaksın.","Kurtarıcını beklemeyi bıraktığında, psikolojik doğumun başlar.","Kendine dürüst olmak kadar büyük bir savaş yoktur. — Sigmund Freud","Psikolojinin uzun bir geçmişi, ama kısa bir tarihi vardır. — Ebbinghaus","İnsan, kendisinden başka bir şey değildir, ne olmayı tasarlıyorsa o olur. — Sartre","Kişinin kendisi hakkında çok konuşması, kendini gizlemenin de bir yoludur. — Friedrich Nietzsche","Bir durumu artık değiştiremediğimizde, kendimizi değiştirmeye çağrılırız. — Viktor E. Frankl","Travma başınıza gelen kötü şey değil; o şey gerçekleşirken içinizde verdiğiniz o ıssız savaştır. — Gabor Maté","Geçmiş henüz bitmedi; o, şu an verdiğiniz her otomatik tepkinin içinde saklanıyor. — Peter Levine","Korku, tehlikenin değil; zihninizin o tehlikeye yazdığı senaryonun ürünüdür. — David Burns","Bilişsel kapasiteniz ne kadar yüksek olursa olsun, sinir sisteminiz tehdit hissettiği an ilkelliğe mahkumsunuzdur. — Stephen Porges"];
// Rotating header fonts — picks one per page load/nav (art deco / fancy / vintage / boring karışık)
var SC_FONTS=['Playfair Display','Abril Fatface','Cinzel Decorative','Poiret One','Limelight','Megrim','Special Elite','Ultra','Lobster','Monoton','Rye','Dancing Script','Bebas Neue','Georgia'];
function ensure(){
  var pb=document.getElementById('sc-progress');
  if(!pb){pb=document.createElement('div');pb.id='sc-progress';document.body.appendChild(pb);}
  function prog(){var de=document.documentElement;var st=de.scrollTop||document.body.scrollTop;var h=de.scrollHeight-de.clientHeight;var p=h>0?st/h:0;pb.style.height=(p*100)+'%';}
  window.__scProg=prog;prog();
  // ── SBB-KUTUSU: tam sağ sütun genişliği, siyah, dikey ──
  var sbb=document.getElementById('sc-sbb');
  if(!sbb){
    sbb=document.createElement('div');sbb.id='sc-sbb';
    // Header row: logo + graph toggle + theme + focus
    var sbbHdr=document.createElement('div');sbbHdr.className='sc-sbb-hdr';
    // SBB logo: sabit kompakt font (rotasyon yok — sadece sayfa header'ı döner)
    var lg=document.createElement('a');lg.className='sc-logo-btn';lg.href='/';lg.setAttribute('aria-label','SAYKO.ch');
    lg.innerHTML='<span class="sc-logo-icon">'+SC_LOGO+'</span><span class="sc-logo-word"><span class="sc-logo-name">SAYKO</span><span class="sc-logo-tld">.ch</span></span>';
    // Nöral Ağ toggle (beyin ikonu) — graph view'u aç/kapat
    var gtb=document.createElement('button');gtb.type='button';gtb.id='sc-gtoggle';gtb.className='sc-toolbtn';gtb.title='Nöral Ağ';gtb.setAttribute('aria-label','Nöral Ağ aç/kapat');
    gtb.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>';
    gtb.addEventListener('click',function(){var g=document.querySelector('.graph');if(g){var closed=g.classList.toggle('sc-graph-collapsed');this.classList.toggle('sc-active',!closed);}});
    // Theme
    var bt=document.createElement('button');bt.type='button';bt.className='sc-toolbtn sc-themebtn';bt.title='Tema';bt.setAttribute('aria-label','Tema');
    bt.innerHTML='<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    bt.addEventListener('click',function(){var nt=document.documentElement.getAttribute('saved-theme')==='dark'?'light':'dark';document.documentElement.setAttribute('saved-theme',nt);try{localStorage.setItem('theme',nt);}catch(e){}document.dispatchEvent(new CustomEvent('themechange',{detail:{theme:nt}}));});
    // Focus
    var bf=document.createElement('button');bf.type='button';bf.className='sc-toolbtn sc-focusbtn';bf.title='Fokus';bf.setAttribute('aria-label','Fokus');
    bf.innerHTML='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
    bf.addEventListener('click',function(){document.body.classList.toggle('is-focus');this.classList.toggle('sc-active');});
    sbbHdr.appendChild(lg);sbbHdr.appendChild(gtb);sbbHdr.appendChild(bt);sbbHdr.appendChild(bf);
    sbb.appendChild(sbbHdr);
    // Clock
    var ticks='';for(var i=0;i<12;i++){var a=i*30*Math.PI/180,x1=50+40*Math.sin(a),y1=50-40*Math.cos(a),x2=50+46*Math.sin(a),y2=50-46*Math.cos(a);ticks+='<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" class="sc-tick"/>';}
    var clkDiv=document.createElement('div');clkDiv.id='sc-clock';
    clkDiv.innerHTML='<svg id="sc-clockface" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" class="sc-face"/>'+ticks+'<text x="50" y="35" class="sc-sbb-brand" text-anchor="middle" font-size="7"><tspan style="fill:#C8102E">SAYKO</tspan><tspan style="fill:#1a1a1a">.ch</tspan></text><line id="sc-h" x1="50" y1="50" x2="50" y2="29" class="sc-hand sc-hand-h"/><line id="sc-m" x1="50" y1="50" x2="50" y2="16" class="sc-hand sc-hand-m"/><g id="sc-s"><line x1="50" y1="60" x2="50" y2="15" class="sc-hand-s"/><text x="50" y="24" class="sc-sec-psi" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="bold">Ψ</text></g><circle cx="50" cy="50" r="3.2" class="sc-cap"/></svg><div id="sc-day"></div>';
    sbb.appendChild(clkDiv);
    // Chevron: bottom-right of SBB box, toggles breadcrumb layers
    var bclayers=document.createElement('div');bclayers.id='sc-bclayers';bclayers.className='sc-bclayers';
    var chev=document.createElement('button');chev.type='button';chev.id='sc-clk-toggle';chev.className='sc-clk-chev';chev.setAttribute('aria-label','Aç/kapat');chev.setAttribute('aria-expanded','true');
    chev.innerHTML='<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
    chev.addEventListener('click',function(){var exp=this.getAttribute('aria-expanded')==='true';this.setAttribute('aria-expanded',exp?'false':'true');bclayers.classList.toggle('sc-collapsed',exp);});
    sbb.appendChild(bclayers);sbb.appendChild(chev);
    var rsb0=document.querySelector('.sidebar.right');
    if(rsb0&&window.innerWidth>=1200){rsb0.insertBefore(sbb,rsb0.firstChild);}else{document.body.appendChild(sbb);}
  }
  // Mobil/tablet: SBB-kutusunu açan cardinal kırmızı psi tuşu (FAB) + arka perde
  var fab=document.getElementById('sc-sbb-fab');
  if(!fab){
    fab=document.createElement('button');fab.type='button';fab.id='sc-sbb-fab';fab.setAttribute('aria-label','SAYKO panelini aç/kapat');
    fab.innerHTML='<span class="sc-fab-icon">'+SC_LOGO+'</span>';
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
    lrb.addEventListener('click',function(){document.body.classList.remove('sc-lsb-closed');});
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
    window.addEventListener('resize',function(){if(window.__scProg)window.__scProg();clearTimeout(window.__scFitT);window.__scFitT=setTimeout(function(){scFitHex();scFitHeader();},160);});
    window.__scScroll=1;
  }
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
// Header SAYKO kelimesi: sabit kutuya sığana dek küçülür (logo/slogan asla kaymaz, ".ch" kırpılmaz)
function scFitHeader(){
  var w=document.querySelector('.site-header .sh-word');if(!w)return;
  var fs=2.1;w.style.fontSize=fs+'rem';
  var g=0;while(w.scrollWidth>w.clientWidth&&fs>1.2&&g<28){fs-=0.07;w.style.fontSize=fs+'rem';g++;}
}
function perNav(){
  // Move SBB into right sidebar on desktop (exact alignment); back to body on mobile
  var sbbEl=document.getElementById('sc-sbb');
  var rsbEl=document.querySelector('.sidebar.right');
  if(sbbEl){
    if(rsbEl&&window.innerWidth>=1200){
      if(sbbEl.parentNode!==rsbEl)rsbEl.insertBefore(sbbEl,rsbEl.firstChild);
    } else if(sbbEl.parentNode!==document.body&&window.innerWidth<1200){
      document.body.appendChild(sbbEl);
    }
  }
  var slogan=SLO[Math.floor(Math.random()*SLO.length)];
  var isHome=(document.body.getAttribute('data-slug')==='index');
  // Site header with rotating font
  var ph=document.querySelector('.page-header');
  if(ph&&!ph.querySelector('.site-header')){
    var fnt2=SC_FONTS[Math.floor(Math.random()*SC_FONTS.length)];
    var sh=document.createElement('div');sh.className='site-header';
    sh.innerHTML='<a class="site-header-title" href="/" aria-label="SAYKO.ch"><span class="sh-logo">'+SC_LOGO+'</span><span class="sh-word"><span class="sh-name">SAYKO</span><span class="sh-tld">.ch</span></span></a><span class="sh-divider" aria-hidden="true"></span><p class="site-header-slogan"></p>';
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
    cb.addEventListener('click',function(){document.body.classList.add('sc-lsb-closed');});
    var rn2=lsb.querySelector('.recent-notes');
    if(rn2)lsb.insertBefore(cb,rn2);else lsb.appendChild(cb);
  }
  // Graph: başlangıçta kapalı; başlık/kursif metin gizli (SBB beyin tuşu açar/kapatır)
  var g=document.querySelector('.graph');
  if(g&&!g.getAttribute('data-sc')){
    g.setAttribute('data-sc','1');g.classList.add('sc-graph-collapsed');
  }
  updateBcLayers();
  if(window.__scProg)window.__scProg();
  requestAnimationFrame(function(){requestAnimationFrame(scFitHex);});
  if(document.fonts&&document.fonts.ready&&document.fonts.ready.then){document.fonts.ready.then(scFitHex);}
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
