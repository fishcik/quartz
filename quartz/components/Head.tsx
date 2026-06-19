import { i18n } from "../i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
import { CustomOgImagesEmitterName } from "../../.quartz/plugins"
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
          href="https://fonts.googleapis.com/css2?family=Cedarville+Cursive&family=Dancing+Script:wght@500;600&display=swap"
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

        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        <script dangerouslySetInnerHTML={{__html: `(function(){
var SLO=["Psikoloji: Kitapta durduğu gibi durmaz.","Teori biter, maruz kalma başlar.","İncelemiyoruz, buyuz işte.","Okumuyoruz, maruz kalıyoruz.","Pratikte burdayız, teoride ordayız.","Kitap biter, kafa başlar."];
// ── 1: Saat + progress bar her sayfada (DOMContentLoaded + nav) yeniden kurulur ──
function ensure(){
  // ── 2: Dikey okuma ilerleme çubuğu (sol kenar, aşağıdan yukarı dolar) ──
  var pb=document.getElementById('sc-progress');
  if(!pb){pb=document.createElement('div');pb.id='sc-progress';document.body.appendChild(pb);}
  function prog(){var de=document.documentElement;var st=de.scrollTop||document.body.scrollTop;var h=de.scrollHeight-de.clientHeight;var p=h>0?st/h:0;pb.style.height=(p*100)+'%';}
  window.__scProg=prog; prog();
  // ── Sağ üst sabit bar: Mondaine saat + Genişlet + Fokus tuşları ──
  // (Tuşlar sol sütunda DEĞİL — çünkü Genişlet sol sütunu gizler ve
  //  tuş kaybolup geri toggle edilemezdi. Sabit bar her zaman görünür.)
  var tb=document.getElementById('sc-tools');
  if(!tb){
    tb=document.createElement('div'); tb.id='sc-tools';
    var ticks=''; for(var i=0;i<12;i++){var a=i*30*Math.PI/180,x1=50+40*Math.sin(a),y1=50-40*Math.cos(a),x2=50+46*Math.sin(a),y2=50-46*Math.cos(a);ticks+='<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" class="sc-tick"/>';}
    tb.innerHTML='<div id="sc-clock"><svg id="sc-clockface" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" class="sc-face"/>'+ticks+'<line id="sc-h" x1="50" y1="50" x2="50" y2="29" class="sc-hand sc-hand-h"/><line id="sc-m" x1="50" y1="50" x2="50" y2="16" class="sc-hand sc-hand-m"/><g id="sc-s"><line x1="50" y1="60" x2="50" y2="15" class="sc-hand-s"/><circle cx="50" cy="20" r="5" class="sc-sec-dot"/></g><circle cx="50" cy="50" r="3.2" class="sc-cap"/></svg><div id="sc-day"></div></div>';
    var be=document.createElement('button');
    be.type='button'; be.className='sc-toolbtn sc-expand'; be.title='Genişlet: yan sütunları gizle, yazıyı tam genişliğe al'; be.setAttribute('aria-label','Genişlet');
    be.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
    be.addEventListener('click',function(){document.body.classList.toggle('is-expanded');this.classList.toggle('sc-active');if(window.__scProg)window.__scProg();});
    var bf=document.createElement('button');
    bf.type='button'; bf.className='sc-toolbtn sc-focusbtn'; bf.title='Fokus: yan sütunları soluklaştır, ortadaki yazıya odaklan'; bf.setAttribute('aria-label','Fokus');
    bf.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
    bf.addEventListener('click',function(){document.body.classList.toggle('is-focus');this.classList.toggle('sc-active');});
    tb.appendChild(be); tb.appendChild(bf);
    document.body.appendChild(tb);
  }
  if(!window.__scTick){
    function tick(){var d=new Date(),z=new Date(d.toLocaleString('en-US',{timeZone:'Europe/Zurich'})),s=z.getSeconds(),m=z.getMinutes(),h=z.getHours(),H=document.getElementById('sc-h'),M=document.getElementById('sc-m'),S=document.getElementById('sc-s');if(!H)return;H.setAttribute('transform','rotate('+((h%12)*30+m*0.5)+' 50 50)');M.setAttribute('transform','rotate('+(m*6+s*0.1)+' 50 50)');S.setAttribute('transform','rotate('+(s*6)+' 50 50)');var dn=document.getElementById('sc-day');if(dn){var wd=z.getDay();var day=d.toLocaleDateString('tr-TR',{weekday:'long',timeZone:'Europe/Zurich'});dn.textContent=day.charAt(0).toLocaleUpperCase('tr-TR')+day.slice(1);dn.classList.toggle('weekend',wd===0||wd===6);}}
    tick(); window.__scTick=setInterval(tick,1000);
  }
  if(!window.__scScroll){
    window.addEventListener('scroll',function(){if(window.__scProg)window.__scProg();document.body.classList.toggle('sc-scrolled',(window.scrollY||window.pageYOffset)>100);},{passive:true});
    window.addEventListener('resize',function(){if(window.__scProg)window.__scProg();});
    window.__scScroll=1;
  }
}
function perNav(){
  var slogan=SLO[Math.floor(Math.random()*SLO.length)];
  // ── 5: Header: SAYKO.ch + dönüşümlü slogan (arama kutusunun üstüne) ──
  var ph=document.querySelector('.page-header');
  if(ph&&!ph.querySelector('.site-header')){var sh=document.createElement('div');sh.className='site-header';sh.innerHTML='<a class="site-header-title" href="/">SAYKO.ch</a><p class="site-header-slogan"></p>';sh.querySelector('.site-header-slogan').textContent=slogan;ph.insertAdjacentElement('afterbegin',sh);}
  // ── BUG 1: Explorer ("İçerik") varsayılan KAPALI; başlığa tıklayınca açılır ──
  // (Quartz'ın kendi .explorer-toggle düğmesi .collapsed sınıfını toggle eder.)
  var ex=document.querySelector('.explorer');
  if(ex&&!ex.getAttribute('data-sc-ex')){ex.setAttribute('data-sc-ex','1');ex.classList.add('collapsed');ex.setAttribute('aria-expanded','false');}
  // ── 7a: Graph başlığı tıklanınca yerel grafik açılır/kapanır (varsayılan kapalı) ──
  var g=document.querySelector('.graph');
  if(g&&!g.getAttribute('data-sc')){g.setAttribute('data-sc','1');g.classList.add('sc-graph-collapsed');var gt=g.querySelector('h3');if(gt){gt.classList.add('sc-graph-link');gt.addEventListener('click',function(){g.classList.toggle('sc-graph-collapsed');});}}
  // ── 3: Anasayfa ("sayko.ch") "Son Eklenenler"den çıkar (kod kilidi) ──
  document.querySelectorAll('.recent-notes .recent-li').forEach(function(li){
    var a=li.querySelector('.desc h3 a');
    if(!a)return;
    var t=(a.textContent||'').trim().toLowerCase();
    var href=(a.getAttribute('href')||'').replace(/\\/+$/,'');
    if(t==='sayko.ch'||href===''||href==='.'||href==='/'||/(^|\\/)index$/.test(href)){li.remove();}
  });
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
