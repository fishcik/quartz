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
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cedarville+Cursive&family=Dancing+Script:wght@500;600&display=swap"
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
// Rotating logo fonts — picks one per page load/nav
var SC_FONTS=['Bebas Neue','Playfair Display','Dancing Script','Cedarville Cursive','Georgia'];
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
    var fnt=SC_FONTS[Math.floor(Math.random()*SC_FONTS.length)];
    var lg=document.createElement('a');lg.className='sc-logo-btn';lg.href='/';lg.setAttribute('aria-label','SAYKO.ch');
    lg.innerHTML='<span class="sc-logo-icon">'+SC_LOGO+'</span><span class="sc-logo-word"><span class="sc-logo-name" style="font-family:\''+fnt+'\',serif">SAYKO</span><span class="sc-logo-tld">.ch</span></span>';
    // Graph toggle
    var gtb=document.createElement('button');gtb.type='button';gtb.id='sc-gtoggle';gtb.className='sc-toolbtn';gtb.title='Nöral Ağ';gtb.setAttribute('aria-label','Graf aç/kapat');
    gtb.innerHTML='<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="5" r="1.8"/><circle cx="19" cy="5" r="1.8"/><circle cx="12" cy="19" r="1.8"/><line x1="6.7" y1="5.9" x2="10.8" y2="18"/><line x1="17.3" y1="5.9" x2="13.2" y2="18"/><line x1="6.8" y1="5" x2="17.2" y2="5"/></svg>';
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
    clkDiv.innerHTML='<svg id="sc-clockface" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" class="sc-face"/>'+ticks+'<text x="50" y="34" class="sc-sbb-brand" text-anchor="middle" font-size="5.5" letter-spacing="1.2">SAYKO.ch</text><line id="sc-h" x1="50" y1="50" x2="50" y2="29" class="sc-hand sc-hand-h"/><line id="sc-m" x1="50" y1="50" x2="50" y2="16" class="sc-hand sc-hand-m"/><g id="sc-s"><line x1="50" y1="60" x2="50" y2="15" class="sc-hand-s"/><text x="50" y="24" class="sc-sec-psi" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="bold">Ψ</text></g><circle cx="50" cy="50" r="3.2" class="sc-cap"/></svg><div id="sc-day"></div>';
    sbb.appendChild(clkDiv);
    // Chevron: bottom-right of SBB box, toggles breadcrumb layers
    var bclayers=document.createElement('div');bclayers.id='sc-bclayers';bclayers.className='sc-bclayers';
    var chev=document.createElement('button');chev.type='button';chev.id='sc-clk-toggle';chev.className='sc-clk-chev';chev.setAttribute('aria-label','Aç/kapat');chev.setAttribute('aria-expanded','true');
    chev.innerHTML='<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
    chev.addEventListener('click',function(){var exp=this.getAttribute('aria-expanded')==='true';this.setAttribute('aria-expanded',exp?'false':'true');bclayers.classList.toggle('sc-collapsed',exp);});
    sbb.appendChild(bclayers);sbb.appendChild(chev);
    document.body.appendChild(sbb);
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
    window.addEventListener('resize',function(){if(window.__scProg)window.__scProg();});
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
function perNav(){
  var slogan=SLO[Math.floor(Math.random()*SLO.length)];
  var isHome=(document.body.getAttribute('data-slug')==='index');
  // Site header with rotating font
  var ph=document.querySelector('.page-header');
  if(ph&&!ph.querySelector('.site-header')){
    var fnt2=SC_FONTS[Math.floor(Math.random()*SC_FONTS.length)];
    var sh=document.createElement('div');sh.className='site-header';
    sh.innerHTML='<a class="site-header-title" href="/" aria-label="SAYKO.ch"><span class="sh-logo">'+SC_LOGO+'</span><span class="sh-word"><span class="sh-name" style="font-family:\''+fnt2+'\',serif">SAYKO</span><span class="sh-tld">.ch</span></span></a><p class="site-header-slogan"></p>';
    sh.querySelector('.site-header-slogan').textContent=slogan;
    ph.insertAdjacentElement('afterbegin',sh);
  }
  // Search: move to body as fixed tail (protrudes from left edge of SBB box)
  var srchEl=document.querySelector('.search');
  if(srchEl&&!srchEl.classList.contains('sc-search-tail')){
    srchEl.classList.add('sc-search-tail');
    document.body.appendChild(srchEl);
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
    var cb=document.createElement('button');cb.type='button';cb.className='sc-curtain-btn';cb.setAttribute('aria-label','Sol sütun aç/kapat');cb.setAttribute('data-open','1');
    cb.innerHTML='<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg><span class="sc-curtain-label">Son Yazılar</span>';
    cb.addEventListener('click',function(){
      var isOpen=this.getAttribute('data-open')==='1';
      lsb.classList.toggle('sc-curtain-closed',isOpen);
      this.setAttribute('data-open',isOpen?'0':'1');
      var ic=this.querySelector('svg');
      if(ic){ic.innerHTML=isOpen?'<polyline points="9 18 15 12 9 6"/>':'<polyline points="15 18 9 12 15 6"/>';}
    });
    var rn2=lsb.querySelector('.recent-notes');
    if(rn2)lsb.insertBefore(cb,rn2);else lsb.appendChild(cb);
  }
  // Graph → "Nöral Ağ" + beyin ikonu + kursif başlık açıkken
  var g=document.querySelector('.graph');
  if(g&&!g.getAttribute('data-sc')){
    g.setAttribute('data-sc','1');g.classList.add('sc-graph-collapsed');
    var gt=g.querySelector('h3');
    if(gt){
      gt.classList.add('sc-graph-link');
      gt.innerHTML='<svg class="sc-neural-ic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.5 2 6 4.5 6 7.5c0 1.5.5 2.8 1.4 3.8C6.5 12.1 6 13.5 6 15c0 3.3 2.7 6 6 6s6-2.7 6-6c0-1.5-.5-2.9-1.4-3.7.9-1 1.4-2.3 1.4-3.8C18 4.5 15.5 2 12 2z"/><line x1="12" y1="10" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/></svg><span class="sc-neural-tx">Nöral Ağ</span>';
      // Kursif başlık — sadece graf açıkken görünür
      var ntitle=document.createElement('div');ntitle.className='sc-neural-title';ntitle.textContent='Nöral Ağ';
      var go=g.querySelector('.graph-outer')||g.querySelector('canvas')||null;
      if(go)g.insertBefore(ntitle,go);else g.appendChild(ntitle);
      gt.addEventListener('click',function(){
        var closed=g.classList.toggle('sc-graph-collapsed');
        var gtb=document.getElementById('sc-gtoggle');
        if(gtb)gtb.classList.toggle('sc-active',!closed);
      });
    }
  }
  updateBcLayers();
  if(window.__scProg)window.__scProg();
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
