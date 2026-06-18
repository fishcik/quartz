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
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;600&display=swap"
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
function once(){
  if(window.__scInit)return; window.__scInit=1;
  // ── Dikey okuma ilerleme çubuğu (sol, aşağıdan yukarı) ──
  var pb=document.createElement('div'); pb.id='sc-progress'; document.body.appendChild(pb);
  function prog(){var de=document.documentElement;var st=de.scrollTop||document.body.scrollTop;var h=de.scrollHeight-de.clientHeight;var p=h>0?st/h:0;pb.style.height=(p*100)+'%';}
  window.addEventListener('scroll',prog,{passive:true}); window.addEventListener('resize',prog); window.__scProg=prog; prog();
  // ── Sağ üst araç çubuğu: Mondaine saat + odak/gizle tuşları ──
  var tb=document.createElement('div'); tb.id='sc-tools';
  var ticks=''; for(var i=0;i<12;i++){var a=i*30*Math.PI/180,x1=50+40*Math.sin(a),y1=50-40*Math.cos(a),x2=50+46*Math.sin(a),y2=50-46*Math.cos(a);ticks+='<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" class="sc-tick"/>';}
  tb.innerHTML='<div id="sc-clock"><svg id="sc-clockface" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" class="sc-face"/>'+ticks+'<line id="sc-h" x1="50" y1="50" x2="50" y2="29" class="sc-hand sc-hand-h"/><line id="sc-m" x1="50" y1="50" x2="50" y2="16" class="sc-hand sc-hand-m"/><g id="sc-s"><line x1="50" y1="60" x2="50" y2="15" class="sc-hand-s"/><circle cx="50" cy="20" r="5" class="sc-sec-dot"/></g><circle cx="50" cy="50" r="3.2" class="sc-cap"/></svg><div id="sc-day"></div></div>'+
  '<button id="sc-focus" class="sc-btn" title="Odak modu: kenar sütunları soluklaşır, odak ortada kalır" aria-label="Odak modu"><svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="3.5" fill="currentColor"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button>'+
  '<button id="sc-collapse" class="sc-btn" title="Menüleri gizle: yan sütunlar kapanır, yazı tam ekran olur" aria-label="Menüleri gizle"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 9V4h5v2H6v3H4zm11-5h5v5h-2V6h-3V4zM4 15h2v3h3v2H4v-5zm14 3v-3h2v5h-5v-2h3z" fill="currentColor"/></svg></button>';
  document.body.appendChild(tb);
  document.getElementById('sc-focus').addEventListener('click',function(){document.body.classList.toggle('sc-focus-mode');this.classList.toggle('sc-active');});
  document.getElementById('sc-collapse').addEventListener('click',function(){document.body.classList.toggle('sc-menus-hidden');this.classList.toggle('sc-active');if(window.__scProg)window.__scProg();});
  function tick(){var d=new Date(),z=new Date(d.toLocaleString('en-US',{timeZone:'Europe/Zurich'})),s=z.getSeconds(),m=z.getMinutes(),h=z.getHours(),H=document.getElementById('sc-h'),M=document.getElementById('sc-m'),S=document.getElementById('sc-s');if(!H)return;H.setAttribute('transform','rotate('+((h%12)*30+m*0.5)+' 50 50)');M.setAttribute('transform','rotate('+(m*6+s*0.1)+' 50 50)');S.setAttribute('transform','rotate('+(s*6)+' 50 50)');var dn=document.getElementById('sc-day');if(dn){var day=d.toLocaleDateString('tr-TR',{weekday:'long',timeZone:'Europe/Zurich'});dn.textContent=day.charAt(0).toLocaleUpperCase('tr-TR')+day.slice(1);}}
  tick(); setInterval(tick,1000);
}
function perNav(){
  var slogan=SLO[Math.floor(Math.random()*SLO.length)];
  // ── Header: SAYKO.ch + dönüşümlü slogan (arama kutusunun üzerine) ──
  var ph=document.querySelector('.page-header');
  if(ph&&!ph.querySelector('.site-header')){var sh=document.createElement('div');sh.className='site-header';sh.innerHTML='<a class="site-header-title" href="/">SAYKO.ch</a><p class="site-header-slogan"></p>';sh.querySelector('.site-header-slogan').textContent=slogan;ph.insertAdjacentElement('afterbegin',sh);}
  // ── "Bağlam ağı" başlığı tıklanınca global grafik açılır ──
  var gt=document.querySelector('.graph > h3');
  if(gt&&!gt.getAttribute('data-sc')){gt.setAttribute('data-sc','1');gt.classList.add('sc-graph-link');gt.addEventListener('click',function(){var b=document.querySelector('.global-graph-icon');if(b)b.click();});}
  if(window.__scProg)window.__scProg();
}
function init(){once();perNav();}
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
