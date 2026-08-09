import fs from "fs"
import path from "path"
import { i18n } from "../i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
const CustomOgImagesEmitterName = "CustomOgImages"

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
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cedarville+Cursive&family=Dancing+Script:wght@500;600&family=Contrail+One&family=Abril+Fatface&family=Cinzel+Decorative:wght@700&family=Poiret+One&family=Limelight&family=Megrim&family=Special+Elite&family=Ultra&family=Lobster&family=Monoton&family=Rye&family=Bungee&family=Rubik+Mono+One&family=Fredericka+the+Great&family=Pirata+One&family=UnifrakturCook:wght@700&family=Della+Respira&family=Italiana&family=Forum&family=Marcellus&family=Yeseva+One&family=Stardos+Stencil:wght@700&family=Audiowide&family=Orbitron:wght@700&family=Sancreek&family=Ewert&family=Fontdiner+Swanky&family=Bigshot+One&family=Codystar:wght@400&family=Silkscreen&family=Noto+Sans+Egyptian+Hieroglyphs&display=swap"
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
// Gerçekçi yılan ayraç: S-kıvrımlı gövde + oval baş + göz + çatal dil
var SC_SERPENT_LINE='<svg class="sc-serpent-div" viewBox="0 0 260 20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10 C14 4 24 16 38 10 C52 4 62 16 78 10 C94 4 106 16 124 10 C142 4 154 16 172 10 C188 4 200 16 214 10 C226 5 234 8 238 10" stroke-width="2.2"/><ellipse cx="245" cy="10" rx="7" ry="4.5" stroke-width="1.8"/><circle cx="248" cy="8.5" r="0.9" fill="currentColor" stroke="none"/><path d="M252 10 L257 7.5 M252 10 L257 12.5" stroke-width="1.1"/></svg>';
var SLO=["Psikoloji: Kitapta durduğu gibi durmaz.","Teori biter, maruz kalma başlar.","İncelemiyoruz, buyuz işte.","Okumuyoruz, maruz kalıyoruz.","Pratikte burdayız, teoride ordayız.","Kitap biter, kafa başlar.","Sistemler çöker, adaptasyon hayatta kalır.","Sınır, sadece bir varsayımdır.","Sınanmamış bir erdem, sadece iyi bir niyettir.","İyileşmek istiyorsan, maruz kalacaksın.","Kurtarıcını beklemeyi bıraktığında, psikolojik doğumun başlar.","Kendine dürüst olmak kadar büyük bir savaş yoktur. — Sigmund Freud","Psikolojinin uzun bir geçmişi, ama kısa bir tarihi vardır. — Ebbinghaus","İnsan, kendisinden başka bir şey değildir, ne olmayı tasarlıyorsa o olur. — Sartre","Kişinin kendisi hakkında çok konuşması, kendini gizlemenin de bir yoludur. — Friedrich Nietzsche","Bir durumu artık değiştiremediğimizde, kendimizi değiştirmeye çağrılırız. — Viktor E. Frankl","Travma başınıza gelen kötü şey değil; o şey gerçekleşirken içinizde verdiğiniz o ıssız savaştır. — Gabor Maté","Geçmiş henüz bitmedi; o, şu an verdiğiniz her otomatik tepkinin içinde saklanıyor. — Peter Levine","Korku, tehlikenin değil; zihninizin o tehlikeye yazdığı senaryonun ürünüdür. — David Burns","Bilişsel kapasiteniz ne kadar yüksek olursa olsun, sinir sisteminiz tehdit hissettiği an ilkelliğe mahkumsunuzdur. — Stephen Porges"];
// Rotating header fonts — picks one per page load/nav (art deco / fancy / vintage / boring karışık)
var SC_FONTS=['Playfair Display','Abril Fatface','Cinzel Decorative','Poiret One','Limelight','Megrim','Special Elite','Ultra','Lobster','Monoton','Rye','Dancing Script','Bebas Neue','Georgia','Bungee','Rubik Mono One','Fredericka the Great','Pirata One','UnifrakturCook','Della Respira','Italiana','Forum','Marcellus','Yeseva One','Stardos Stencil','Audiowide','Orbitron','Sancreek','Ewert','Fontdiner Swanky','Bigshot One','Codystar','Silkscreen'];
// ── Görev 8: Konu hex'lerine Mısır hiyeroglifi — başlık üstünde, soluk ikincil renk ──
// Eşleştirme başlık metniyle (Türkçe-ASCII fold) yapılır; ardışık konular (I/II/III)
// aynı glifi tekrarlar. Önce TAM eşleşme, yoksa sondaki sayı ayrılıp temel glif tekrar.
var SC_GLYPHS=[
  // Bilimsel Çalışma Yöntemleri
  ['ARAŞTIRMA DESENLERI I','𓊖'],['ARAŞTIRMA DESENLERI II','𓊖𓊖'],['ARAŞTIRMA ETIĞI','𓆄'],
  ['ARAŞTIRMA SÜRECI, ARAŞTIRMA SORULARI VE HIPOTEZLER','𓀁'],['BULGULARININ YAYIMLANMASI VE BILIM ETIĞI','𓏞'],
  ['GIRIŞ — AMPIRIK BIR BILIM OLARAK PSIKOLOJI','𓉐'],['LITERATÜR TARAMASI VE BILIMSEL METIN FORMATLARI','𓏛'],
  ['VERI TOPLAMA YÖNTEMLERI I','𓎟'],['VERI TOPLAMA YÖNTEMLERI II','𓎟𓎟'],['ÖRNEKLEM SEÇIMI','𓂧'],
  ['İSTATISTIKSEL VE İÇERIKSEL ANLAMLILIK','𓍝'],['İŞEVURUK TANIM VE ÖLÇME','𓎟'],
  // Biliş Psikolojisi 1
  ['GÖRSEL KORTEKS — NESNELER VE SAHNELER','𓁹'],['DERI DUYULARI VE KIMYASAL DUYULAR','𓂝'],
  ['GIRIŞ — ALGI, DUYU FIZYOLOJISI, GÖZ VE RETINA','𓉐'],['GÖRSEL DIKKAT VE EYLEM','𓂀'],['HAREKET ALGISI','𓂻'],
  ['RENK ALGISI, DERINLIK VE BÜYÜKLÜK ALGISI','𓁺'],['İŞITME — ÇEVRE, MÜZIK VE KONUŞMA ALGISI','𓄔'],
  // Biyolojik Psikoloji 2
  ['BEYIN HASARI VE NÖROPLASTISITE','𓁶'],['BIYOPSIKOLOJININ DIĞER ARAŞTIRMA YÖNTEMLERI','𓏞'],['DENGE DUYUSU','𓍝'],
  ['DUYGU, STRES VE SAĞLIĞIN BIYOPSIKOLOJISI','𓄣'],['LATERALIZASYON, DIL VE AYRIK BEYIN','𓄓'],
  ['MADDE KULLANIMI, BAĞIMLILIK VE ÖDÜL SISTEMI','𓎱'],['NÖROPSIKOLOJIK TESTLER I','𓍼'],['NÖROPSIKOLOJIK TESTLER II','𓍼𓍼'],
  ['PSIKIYATRIK BOZUKLUKLARIN BIYOPSIKOLOJISI','𓀿'],['UYKU, RÜYA VE SIRKADIYEN RITIMLER','𓇰'],
  ['ÖĞRENME, BELLEK VE AMNEZI','𓂉'],['İŞITME','𓄕'],
  // Gelişim Psikolojisi 1
  ['GIRIŞ','𓉐'],['ALGI','𓁹'],['BILIŞ I','𓀁'],['BILIŞ II','𓀁𓀁'],['BIYOLOJI VE DAVRANIŞ','𓆣'],['DIL GELIŞIMI','𓂋'],
  ['DOĞUM ÖNCESI GELIŞIM, DOĞUM VE YENIDOĞAN','𓁒'],['GELIŞIM PSIKOLOJISININ KURAMLARI','𓀗'],
  ['GELIŞIM PSIKOLOJISININ YÖNTEMLERI','𓏞'],['MOTOR GELIŞIM','𓂻'],['OKUL BAŞARISI','𓀋'],['ZEKÂ','𓁶'],
  // Gelişim Psikolojisi 2
  ['AHLAK GELIŞIMI','𓆄'],['AILE','𓉐'],['AKRAN İLIŞKILERI','𓀍'],['BAĞLANMA','𓎬'],['CINSIYET GELIŞIMI','𓁐'],
  ['DUYGUSAL GELIŞIM','𓄣'],['GELIŞIMSEL SAPMALAR','𓀒'],['KIŞILIK VE BENLIK KAVRAMI','𓀀'],
  ['MOTIVASYON VE EYLEM DÜZENLEMESI','𓀤'],['MÜDAHALE PROGRAMLARI','𓂠'],['SOSYAL GELIŞIM','𓊖'],
  // İstatistik 1
  ['BETIMSEL İSTATISTIK I','𓏤'],['BETIMSEL İSTATISTIK II','𓏤𓏤'],['BETIMSEL İSTATISTIK III','𓏤𓏤𓏤'],
  ['GRUP KARŞILAŞTIRMALARI I','𓂓'],['GRUP KARŞILAŞTIRMALARI II','𓂓𓂓'],
  ['OLASILIK KURAMI I','𓋳'],['OLASILIK KURAMI II','𓋳𓋳'],['OLASILIK KURAMI III','𓋳𓋳𓋳'],
  ['ÇIKARIMSAL İSTATISTIK I','𓀞'],['ÇIKARIMSAL İSTATISTIK II','𓀞𓀞'],['İSTATISTIĞE NEDEN İHTIYAÇ DUYARIZ','𓍝'],
  // Klinik Psikoloji 1
  ['ARAŞTIRMA YÖNTEMLERI VE KANITA DAYALI TERAPILER','𓏛'],['BENLIK — KAVRAMLAR VE ÖZ-ŞEFKAT','𓀀'],
  ['BILIŞ — DÜŞÜNCE VE DIL','𓇌'],['DAVRANIŞ — ŞEKILLENDIRME VE KOŞULLU PEKIŞTIRME','𓂻'],
  ['DEĞERLER VE KABUL VE KARARLILIK TERAPISI (ACT)','𓆄'],['DIKKAT EĞITIMI VE FARKINDALIK','𓂀'],
  ['MARUZ BIRAKMA VE DUYGULAR','𓀢'],['MOTIVASYON VE MOTIVASYONEL GÖRÜŞME','𓀊'],
  ['PSIKOTERAPI NEDIR — PSIKOTERAPI EKOLLERI I','𓋹'],['PSIKOTERAPI EKOLLERI II','𓋹𓋹'],
  ['TERAPININ ZORUNLU VE EKOL ÖTESI BOYUTLARI','𓊪'],
  // Klinik Psikoloji 2
  ['BAĞIMLILIKLAR','𓆓'],['BILIM FELSEFESI VE ARAŞTIRMA YAKLAŞIMLARI','𓆄'],['BOYUTSAL YAKLAŞIMLAR','𓏣'],
  ['CINSEL İŞLEV BOZUKLUKLARI VE UYKU BOZUKLUKLARI','𓂸'],['DUYGUDURUM BOZUKLUKLARI','𓀠'],['GIRIŞ - NORMAL VE ANORMAL','𓍝'],['GIRIŞ','𓉐'],
  ['KAYGI BOZUKLUKLARI','𓀉'],['KURAMLAR VE KATEGORIK YAKLAŞIMLAR','𓀗'],
  ['OBSESIF KOMPULSIF BOZUKLUK VE TIKLER','𓀣'],['PSIKOZLAR','𓀡'],
  ['TRAVMA VE TRAVMA SONRASI STRES BOZUKLUĞU','𓀐'],['YEME BOZUKLUKLARI','𓀁'],
  // Sağlık Psikolojisi ve Davranışsal Tıp
  ['SAĞLIK DAVRANIŞLARI','𓋹'],['GERI DÜŞÜŞ','𓀒'],['SAĞLIK MODELLERI; BILMEK NEDEN YETMIYOR?','𓀁'],
  ['SAĞLIK PSIKOLOJISI NEDIR VE NEDEN VAR?','𓉐'],
  ['GÜNEŞTEN KORUNMA','𓇳'],['BESLENME','𓏏'],['BESLENME PSIKOLOJISI','𓏏'],['FIZIKSEL AKTIVITE','𓂻'],
  ['SIGARA','𓆑'],['SIGARANIN PSIKOLOJISI','𓆑'],['KONDOM KULLANIMI','𓂺'],
  // Sosyal Psikoloji
  ['BENLIK','𓀀'],['GIRIŞ VE ARAŞTIRMA YÖNTEMLERI','𓉐'],['GRUP DINAMIĞI VE GRUP PERFORMANSI','𓊖'],
  ['KIŞILERARASI ÇEKIM VE YAKIN İLIŞKILER','𓎬'],['PROSOSYAL DAVRANIŞ','𓂠'],['SALDIRGANLIK','𓀜'],
  ['SOSYAL ALGI VE ATIF','𓁷'],['SOSYAL BILIŞ','𓇌'],['SOSYAL ETKI','𓋾'],
  ['SOSYAL PSIKOLOJI VE KÜLTÜREL FARKLILIKLAR','𓈊'],['TUTUMLAR VE TUTUM DEĞIŞIMI','𓀣'],
  ['ÖNYARGI VE GRUPLAR ARASI İLIŞKILER','𓈎']
];
function scFold(s){
  s=(s||'').toUpperCase();
  s=s.replace(/İ/g,'I').replace(/Ş/g,'S').replace(/Ç/g,'C').replace(/Ğ/g,'G').replace(/Ü/g,'U').replace(/Ö/g,'O');
  return s.replace(new RegExp('[^A-Z0-9 ]', 'g'),' ').replace(/[\s]+/g,' ').trim();
}
var SC_GLYPH_FULL={},SC_GLYPH_BASE={};
SC_GLYPHS.forEach(function(e){
  var f=scFold(e[0]);if(!SC_GLYPH_FULL[f])SC_GLYPH_FULL[f]=e[1];
  if(Array.from(e[1]).length===1){var m=f.match(/^(.*?)[\s]+(III|II|I|3|2|1)$/);var base=m?m[1]:f;if(!SC_GLYPH_BASE[base])SC_GLYPH_BASE[base]=e[1];}
});
function scGlyphFor(title){
  var f=scFold(title);
  if(SC_GLYPH_FULL[f])return SC_GLYPH_FULL[f];
  var m=f.match(/^(.*?)[\s]+(III|II|I|3|2|1)$/);
  if(m){var base=m[1],c=({I:1,II:2,III:3,'1':1,'2':2,'3':3})[m[2]],g=SC_GLYPH_BASE[base];if(g){var o='';for(var i=0;i<c;i++)o+=g;return o;}}
  return '';
}
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
    // Geri (tarayıcı geçmişi)
    var bb=document.createElement('button');bb.type='button';bb.className='sc-toolbtn sc-backbtn';bb.title='Geri';bb.setAttribute('aria-label','Geri');
    bb.innerHTML='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';
    bb.addEventListener('click',function(){if(history.length>1){history.back();}else{location.href='/';}});
    sbbHdr.appendChild(lg);
    sbb.appendChild(sbbHdr);
    var sbbTools=document.createElement('div');sbbTools.className='sc-sbb-tools';
    sbbTools.appendChild(bb);sbbTools.appendChild(gtb);sbbTools.appendChild(bt);sbbTools.appendChild(bf);
    sbb.appendChild(sbbTools);
    // Clock — lüks kasa + Türkçe tarih + saniyeyi gösteren zarif SERPENT ibresi
    var ticks='';for(var i=0;i<60;i++){var a=i*6*Math.PI/180;var isH=(i%5===0);var r1=isH?38.5:41.5,r2=45;var x1=50+r1*Math.sin(a),y1=50-r1*Math.cos(a),x2=50+r2*Math.sin(a),y2=50-r2*Math.cos(a);ticks+='<line x1="'+x1.toFixed(2)+'" y1="'+y1.toFixed(2)+'" x2="'+x2.toFixed(2)+'" y2="'+y2.toFixed(2)+'" class="sc-tick'+(isH?' sc-tick-h':'')+'"/>';}
    var clkDiv=document.createElement('div');clkDiv.id='sc-clock';
    clkDiv.innerHTML='<svg id="sc-clockface" viewBox="0 0 100 100">'+
      '<defs>'+
        '<radialGradient id="sc-faceg" cx="50%" cy="42%" r="62%"><stop offset="0%" class="sc-faceg-0"/><stop offset="100%" class="sc-faceg-1"/></radialGradient>'+
        '<linearGradient id="sc-bezelg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" class="sc-bezelg-0"/><stop offset="50%" class="sc-bezelg-1"/><stop offset="100%" class="sc-bezelg-2"/></linearGradient>'+
      '</defs>'+
      '<circle cx="50" cy="50" r="49" class="sc-bezel"/>'+
      '<circle cx="50" cy="50" r="46.2" class="sc-face"/>'+ticks+
      '<text id="sc-date-txt" x="50" y="32" class="sc-date-text" text-anchor="middle" font-size="6.4">—</text>'+
      '<text x="50" y="74" class="sc-sbb-brand" text-anchor="middle" font-size="7"><tspan class="sc-brand-name">SAYKO</tspan><tspan class="sc-brand-tld">.ch</tspan></text>'+
      '<line id="sc-h" x1="50" y1="50" x2="50" y2="30" class="sc-hand sc-hand-h"/>'+
      '<line id="sc-m" x1="50" y1="50" x2="50" y2="17" class="sc-hand sc-hand-m"/>'+
      '<g id="sc-s">'+
        '<path d="M50 50 C 49.3 54 50.7 57 50 59.5" class="sc-snake-s-tail"/>'+
        '<path d="M50 51 C 47.3 44 52.7 37 50 30 C 48.1 25 51.5 20 50 15.5" class="sc-snake-s-body"/>'+
        '<ellipse cx="50" cy="13.4" rx="2.5" ry="3.1" class="sc-snake-s-head"/>'+
        '<circle cx="51" cy="12.5" r="0.6" class="sc-snake-s-eye"/>'+
        '<path d="M50 10.4 L50 7.2" class="sc-snake-s-tongue"/>'+
        '<path d="M50 7.2 L48.6 5.3 M50 7.2 L51.4 5.3" class="sc-snake-s-tongue"/>'+
      '</g>'+
      '<circle cx="50" cy="50" r="2.7" class="sc-cap"/><circle cx="50" cy="50" r="1.05" class="sc-cap-dot"/>'+
    '</svg>'+
    '<div id="sc-day-strip" class="sc-day-strip"><span>P</span><span>S</span><span>Ç</span><span>P</span><span>C</span><span>C</span><span>P</span></div>';
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
        if(S)S.setAttribute('transform','rotate('+sa+' 50 50)');}
      // Türkçe tarih penceresi: "27 HAZ"
      var dt2=document.getElementById('sc-date-txt');
      if(dt2){var AY=['OCA','ŞUB','MAR','NİS','MAY','HAZ','TEM','AĞU','EYL','EKİ','KAS','ARA'];var ds=z.getDate()+' '+AY[z.getMonth()];if(dt2.textContent!==ds)dt2.textContent=ds;}
      // Gün şeridi (Pzt→Paz), bugünü cardinal vurgula
      var strip=document.getElementById('sc-day-strip');
      if(strip){var wd=z.getDay();var idx=(wd+6)%7;if(strip.__scCur!==idx){strip.__scCur=idx;var sp=strip.children;for(var qi=0;qi<sp.length;qi++){sp[qi].classList.toggle('today',qi===idx);}strip.classList.toggle('weekend',wd===0||wd===6);}}
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
        var hp=decodeURIComponent(anchors[ai].getAttribute('href')||'').replace(/[/]+$/,'').split('/').filter(Boolean);
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
var SC_CURRICULUM = {
  'bilimsel-calisma-yontemleri': [
    'GIRIS AMPIRIK BIR BILIM OLARAK PSIKOLOJI',
    'ARASTIRMA SURECI ARASTIRMA SORULARI VE HIPOTEZLER',
    'ISEVURUK TANIM VE OLCME',
    'ARASTIRMA DESENLERI I',
    'ARASTIRMA DESENLERI II',
    'VERI TOPLAMA YONTEMLERI I',
    'VERI TOPLAMA YONTEMLERI II',
    'ORNEKLEM SECIMI',
    'ISTATISTIKSEL VE ICERIKSEL ANLAMLILIK',
    'BULGULARININ YAYIMLANMASI VE BILIM ETIGI',
    'ARASTIRMA ETIGI',
    'LITERATUR TARAMASI VE BILIMSEL METIN FORMATLARI'
  ],
  'bilis-psikolojisi-1': [
    'GIRIS ALGI DUYU FIZYOLOJISI GOZ VE RETINA',
    'GORSEL KORTEKS NESNELER VE SAHNELER',
    'GORSEL DIKKAT VE EYLEM',
    'RENK ALGISI DERINLIK VE BUYUKLUK ALGISI',
    'HAREKET ALGISI',
    'ISITME CEVRE MUZIK VE KONUSMA ALGISI',
    'DERI DUYULARI VE KIMYASAL DUYULAR'
  ],
  'biyolojik-psikoloji-2': [
    'BIYOPSIKOLOJININ DIGER ARASTIRMA YONTEMLERI',
    'NOROPSIKOLOJIK TESTLER I',
    'NOROPSIKOLOJIK TESTLER II',
    'LATERALIZASYON DIL VE AYRIK BEYIN',
    'BEYIN HASARI VE NOROPLASTISITE',
    'OGRENME BELLEK VE AMNEZI',
    'UYKU RUYA VE SIRKADIYEN RITIMLER',
    'MADDE KULLANIMI BAGIMLILIK VE ODUL SISTEMI',
    'DUYGU STRES VE SAGLIGIN BIYOPSIKOLOJISI',
    'PSIKIYATRIK BOZUKLUKLARIN BIYOPSIKOLOJISI',
    'DENGE DUYUSU',
    'ISITME'
  ],
  'gelisim-psikolojisi-1': [
    'GIRIS GELISIM PSIKOLOJISININ KONUSU VE GOREVLERI',
    'GIRIS',
    'GELISIM PSIKOLOJISININ KURAMLARI',
    'GELISIM PSIKOLOJISININ YONTEMLERI',
    'BIYOLOJI VE DAVRANIS',
    'DOGUM ONCESI GELISIM DOGUM VE YENIDOGAN',
    'ALGI',
    'MOTOR GELISIM',
    'BILIS I',
    'BILIS II',
    'DIL GELISIMI',
    'ZEKA',
    'OKUL BASARISI'
  ],
  'gelisim-psikolojisi-2': [
    'DUYGUSAL GELISIM',
    'BAGLANMA',
    'KISILIK VE BENLIK KAVRAMI',
    'CINSIYET GELISIMI',
    'SOSYAL GELISIM',
    'AKRAN ILISKILERI',
    'AILE',
    'AHLAK GELISIMI',
    'MOTIVASYON VE EYLEM DUZENLEMESI',
    'GELISIMSEL SAPMALAR',
    'MUDAHALE PROGRAMLARI'
  ],
  'istatistik1': [
    'ISTATISTIGE NEDEN IHTIYAC DUYARIZ',
    'BETIMSEL ISTATISTIK I',
    'BETIMSEL ISTATISTIK II',
    'BETIMSEL ISTATISTIK III',
    'OLASILIK KURAMI I',
    'OLASILIK KURAMI II',
    'OLASILIK KURAMI III',
    'CIKARIMSAL ISTATISTIK I',
    'CIKARIMSAL ISTATISTIK II',
    'GRUP KARSILASTIRMALARI I',
    'GRUP KARSILASTIRMALARI II'
  ],
  'klinikpsikoloji1': [
    'GIRIS NORMAL VE ANORMAL',
    'KURAMLAR VE KATEGORIK YAKLASIMLAR',
    'BOYUTSAL YAKLASIMLAR',
    'KAYGI BOZUKLUKLARI',
    'OBSESIF KOMPULSIF BOZUKLUK VE TIKLER',
    'TRAVMA VE TRAVMA SONRASI STRES BOZUKLUGU',
    'DUYGUDURUM BOZUKLUKLARI',
    'PSIKOZLAR',
    'YEME BOZUKLUKLARI',
    'BAGIMLILIKLAR',
    'CINSEL ISLEV BOZUKLUKLARI VE UYKU BOZUKLUKLARI',
    'BILIM FELSEFESI VE ARASTIRMA YAKLASIMLARI'
  ],
  'klinikpsikoloji2': [
    'PSIKOTERAPI NEDIR PSIKOTERAPI EKOLLERI I',
    'PSIKOTERAPI EKOLLERI II',
    'TERAPININ ZORUNLU VE EKOL OTESI BOYUTLARI',
    'DAVRANIS SEKILLENDIRME VE KOSULLU PEKISTIRME',
    'MARUZ BIRAKMA VE DUYGULAR',
    'BILIS DUSUNCE VE DIL',
    'DIKKAT EGITIMI VE FARKINDALIK',
    'DEGERLER VE KABUL VE KARARLILIK TERAPISI ACT',
    'BENLIK KAVRAMLAR VE OZ SEFKAT',
    'MOTIVASYON VE MOTIVASYONEL GORUSME',
    'ARASTIRMA YONTEMLERI VE KANITA DAYALI TERAPILER'
  ],
  'saglikpsikolojisivedavranissaltip': [
    'SAGLIK PSIKOLOJISI NEDIR VE NEDEN VAR',
    'SAGLIK MODELLERI BILMEK NEDEN YETMIYOR',
    'SAGLIK DAVRANISLARI',
    'FIZIKSEL AKTIVITE',
    'BESLENME PSIKOLOJISI',
    'BESLENME',
    'GUNESTEN KORUNMA',
    'KONDOM KULLANIMI',
    'SIGARANIN PSIKOLOJISI',
    'SIGARA',
    'GERI DUSUS'
  ],
  'sosyalpsikoloji': [
    'GIRIS VE ARASTIRMA YONTEMLERI',
    'SOSYAL BILIS',
    'SOSYAL ALGI VE ATIF',
    'BENLIK',
    'TUTUMLAR VE TUTUM DEGISIMI',
    'SOSYAL ETKI',
    'GRUP DINAMIGI VE GRUP PERFORMANSI',
    'KISILERARASI CEKIM VE YAKIN ILISKILER',
    'PROSOSYAL DAVRANIS',
    'SALDIRGANLIK',
    'ONYARGI VE GRUPLAR ARASI ILISKILER',
    'SOSYAL PSIKOLOJI VE KULTUREL FARKLILIKLAR'
  ]
};

function scNormSlug(s){
  s=(s||'').toLowerCase();
  s=s.replace(/ı/g,'i').replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/i̇/g,'i');
  return s.replace(new RegExp('[^a-z0-9]', 'g'),'');
}

function scSortHoneycombs(){
  var ul=document.querySelector('.page-listing .section-ul, .section-ul');
  if(!ul)return;
  var slug=document.body.getAttribute('data-slug')||'';
  var folder=slug.replace(/[/]index$/,'').replace(/^[/]/,'');
  var normFolder=scNormSlug(folder);
  var curList=SC_CURRICULUM[normFolder];
  if(!curList){
    for(var k in SC_CURRICULUM){
      if(normFolder.indexOf(k)!==-1||k.indexOf(normFolder)!==-1){
        curList=SC_CURRICULUM[k];break;
      }
    }
  }
  if(!curList||!curList.length)return;

  var lis=Array.from(ul.querySelectorAll(':scope > .section-li'));
  if(!lis.length)return;

  function getOrder(li){
    var a=li.querySelector('.desc h3 a');
    var rawText=a?(a.getAttribute('data-raw-title')||a.getAttribute('data-title')||a.textContent||'').trim():'';
    var folded=scFold(rawText);
    for(var i=0;i<curList.length;i++){
      var item=curList[i];
      if(folded===item||folded.indexOf(item)===0||item.indexOf(folded)===0){
        return i;
      }
    }
    return 999;
  }

  lis.sort(function(a,b){
    return getOrder(a)-getOrder(b);
  });

  lis.forEach(function(li){
    ul.appendChild(li);
  });
}

// Altıgen konu kutuları: yazı, altıgenin geniş orta bandına TAM sığana dek küçülür
function scFitHex(){
  var links=document.querySelectorAll('.page-listing .section-li .desc h3 a, .section-ul .section-li .desc h3 a');
  if(!links.length)return;
  scSortHoneycombs();
  links=document.querySelectorAll('.page-listing .section-li .desc h3 a, .section-ul .section-li .desc h3 a');
  links.forEach(function(a){
    var rawText=(a.getAttribute('data-raw-title')||a.textContent||'').trim();
    if(!a.getAttribute('data-raw-title')){
      a.setAttribute('data-raw-title',rawText);
    }
    var cleanTitle=a.getAttribute('data-raw-title')||rawText;
    var gl=scGlyphFor(cleanTitle);

    var lbl=a.querySelector('.sc-hx-label');
    var glyphEl=a.querySelector('.sc-hx-glyph');

    if(!lbl){
      lbl=document.createElement('span');
      lbl.className='sc-hx-label';
      lbl.textContent=cleanTitle;
      a.innerHTML='';
      if(gl){
        glyphEl=document.createElement('span');
        glyphEl.className='sc-hx-glyph';
        glyphEl.setAttribute('aria-hidden','true');
        glyphEl.textContent=gl;
        a.appendChild(glyphEl);
      }
      a.appendChild(lbl);
    }else{
      if(gl&&!glyphEl){
        glyphEl=document.createElement('span');
        glyphEl.className='sc-hx-glyph';
        glyphEl.setAttribute('aria-hidden','true');
        glyphEl.textContent=gl;
        a.insertBefore(glyphEl,lbl);
      }
    }

    var li=a.closest('.section-li');if(!li)return;
    var H=li.clientHeight||152,W=li.clientWidth||132;
    var hasG=!!a.querySelector('.sc-hx-glyph');
    var maxH=H*(hasG?0.44:0.54),maxW=W-18;
    var len=cleanTitle.length;
    var fs=(len>35)?7.5:(len>25)?8.5:(len>15)?10:11.5;
    lbl.style.lineHeight='1.16';lbl.style.fontSize=fs+'px';
    if((lbl.scrollHeight>maxH||lbl.scrollWidth>maxW)&&fs>7){
      lbl.style.fontSize=(fs-1.5)+'px';
    }
  });
}

function scSortRecentNotes(){
  var rns=document.querySelectorAll('.recent-notes .recent-ul');
  var DATE_MAP={
    'GIRIS NORMAL VE ANORMAL': '2026-08-08',
    'GUNESTEN KORUNMA': '2026-06-25',
    'BESLENME PSIKOLOJISI': '2026-06-25',
    'BESLENME': '2026-06-25',
    'KONDOM KULLANIMI': '2026-06-25',
    'FIZIKSEL AKTIVITE': '2026-06-25',
    'SIGARANIN PSIKOLOJISI': '2026-06-23',
    'SIGARA': '2026-06-23',
    'GERI DUSUS': '2026-06-14',
    'SAGLIK MODELLERI BILMEK NEDEN YETMIYOR': '2026-06-13',
    'SAGLIK PSIKOLOJISI NEDIR VE NEDEN VAR': '2026-06-07',
    'GIRIS GELISIM PSIKOLOJISININ KONUSU VE GOREVLERI': '2026-06-04',
    'GIRIS': '2026-06-04'
  };
  rns.forEach(function(ul){
    var lis=Array.from(ul.querySelectorAll(':scope > .recent-li'));
    if(!lis.length)return;
    lis.sort(function(a,b){
      var aA=a.querySelector('.desc h3 a')||a.querySelector('a');
      var bA=b.querySelector('.desc h3 a')||b.querySelector('a');
      var aTitle=scFold(aA?aA.textContent:'');
      var bTitle=scFold(bA?bA.textContent:'');
      var aDate=DATE_MAP[aTitle]||'2026-05-30';
      var bDate=DATE_MAP[bTitle]||'2026-05-30';
      return bDate.localeCompare(aDate);
    });
    lis.forEach(function(li){ul.appendChild(li);});
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
      var m=href.match(new RegExp('tags/([^/#?]+)'));
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
    if(!nm||!nm.isConnected){rafId=null;return;}
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
// ── Header Efekt 2: Yarık metin — imleç başlığa değince üst/alt yarı zıt yönde
// kayar (skew), aralarında cardinal kırmızı bir yarık çizgisi açılır. (CodePen
// "split menu" efektinin siteye uyarlanmış, font-rotasyonuyla uyumlu hali.) ──
function initFx2(hdr){
  var nm=hdr.querySelector('.sh-name');if(!nm||nm.getAttribute('data-sc-split'))return;
  nm.setAttribute('data-sc-split','1');
  var txt=nm.textContent||'';
  nm.classList.add('sc-split');
  // İki maske (üst/alt yarı) + sabit boyut için şeffaf taban + yarık çizgisi
  nm.innerHTML='<span class="sc-split-line" aria-hidden="true"></span>'+
    '<span class="sc-split-mask sc-split-top" aria-hidden="true"><span>'+txt+'</span></span>'+
    '<span class="sc-split-mask sc-split-bot" aria-hidden="true"><span>'+txt+'</span></span>'+
    '<span class="sc-split-base">'+txt+'</span>';
  hdr.__scFxClean=function(){nm.classList.remove('sc-split');nm.innerHTML=txt;nm.removeAttribute('data-sc-split');};
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
// ── Görev 7 (revize): Konu hex hover efekti artık tamamen CSS — yalnız renk
// değişimi + shadow-inset-center animasyonu. JS tilt KALDIRILDI. ──
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
  var prev=0,snakePhase=0,snakeInit=false;
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
    // 404 sayfasında footer yılanı çizilmez (o yılan, oyuna dönüşen yılanın kendisi)
    if(document.body.getAttribute('data-slug')==='404')return;
    // ── Dalgaların üstünde süzülen EVIL yılan: kara/ipeksi gövde, olivine sırt parıltısı,
    //    kırmızı yarık göz (cute değil — SERPENTBRAIN'deki mürekkep yılanı gibi). Boy = ekranın 1/3'ü ──
    var bodyLen=Math.max(160,W/3);             // ekran genişliğinin 1/3'ü
    var spanX=W+bodyLen+40;
    if(!snakeInit){snakePhase=W*0.22+bodyLen+20;snakeInit=true;}  // ilk karede ekranda başla
    snakePhase+=dt*26;                         // yavaş, akışkan ama görünür
    var headX=(snakePhase%spanX)-bodyLen-20;   // sol dış → sağ dış
    var waveF=0.021, wavePh=snakePhase*0.013;
    var baseY=H*0.42, amp2=Math.min(H*0.19,9);
    function cyAt(x){return baseY+Math.sin(x*waveF+wavePh)*amp2+Math.sin(x*waveF*2.3+wavePh*1.5)*amp2*0.26;}
    // KARANLIK gövde + olivine sırt parıltısı (temaya uyumlu)
    var snHi  =dk?'rgba(150,196,108,0.95)':'rgba(140,186,100,0.95)';  // olivine sırt
    var snBody=dk?'rgba(42,52,40,0.96)':'rgba(34,42,32,0.96)';        // kara gövde
    var snBel =dk?'rgba(14,18,14,0.96)':'rgba(10,12,10,0.96)';        // karın ~ siyah
    var snPat =dk?'rgba(150,196,108,0.55)':'rgba(140,186,100,0.5)';   // olivine desen
    var eyeR  =dk?'rgba(255,52,40,1)':'rgba(225,28,28,1)';            // kötücül kırmızı göz
    var tongueR='rgba(200,16,46,0.95)';
    var NB=54;
    function radAt(s){var maxR=Math.min(6.0,H*0.15);if(s<0.10)return Math.max(0.5,maxR*(s/0.10));return Math.max(0.6,maxR*(0.82+0.18*Math.sin(s*3.14159)));}
    // merkez çizgi noktaları (kuyruk s=0 → baş s=1)
    var P=[];for(var i=0;i<=NB;i++){var s=i/NB;var x=headX-bodyLen*(1-s);P.push({x:x,y:cyAt(x),s:s});}
    var top=[],bot=[];
    for(var i=0;i<=NB;i++){
      var pa=P[Math.max(0,i-1)],pb=P[Math.min(NB,i+1)];
      var tx=pb.x-pa.x,ty=pb.y-pa.y,tl=Math.sqrt(tx*tx+ty*ty)||1;
      var nx=-ty/tl,ny=tx/tl,r=radAt(P[i].s);
      top.push([P[i].x+nx*r,P[i].y+ny*r]);bot.push([P[i].x-nx*r,P[i].y-ny*r]);
    }
    ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.moveTo(top[0][0],top[0][1]);
    for(var i=1;i<=NB;i++)ctx.lineTo(top[i][0],top[i][1]);
    for(var i=NB;i>=0;i--)ctx.lineTo(bot[i][0],bot[i][1]);
    ctx.closePath();
    var bgrad=ctx.createLinearGradient(0,baseY-11,0,baseY+11);
    bgrad.addColorStop(0,snHi);bgrad.addColorStop(0.26,snBody);bgrad.addColorStop(1,snBel);
    ctx.fillStyle=bgrad;ctx.fill();
    // sırt deseni: seyrek olivine eşkenar lekeler
    ctx.fillStyle=snPat;
    for(var i=6;i<NB-3;i+=3){
      var p=P[i],rr=radAt(p.s)*0.42;
      var pa=P[i-1],pb=P[i+1];var aa=Math.atan2(pb.y-pa.y,pb.x-pa.x);
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(aa);
      ctx.beginPath();ctx.moveTo(0,-rr);ctx.lineTo(rr*1.05,0);ctx.lineTo(0,rr);ctx.lineTo(-rr*1.05,0);ctx.closePath();ctx.fill();
      ctx.restore();
    }
    // ── baş (sivri, kara) ──
    var hp=P[NB],pa=P[NB-1];
    var ang=Math.atan2(hp.y-pa.y,hp.x-pa.x);
    var hr=radAt(1)*1.1+1.3;
    ctx.save();ctx.translate(hp.x,hp.y);ctx.rotate(ang);
    var hgrad=ctx.createLinearGradient(0,-hr,0,hr);
    hgrad.addColorStop(0,snHi);hgrad.addColorStop(0.5,snBody);hgrad.addColorStop(1,snBel);
    ctx.fillStyle=hgrad;
    ctx.beginPath();
    ctx.moveTo(hr*1.85,0);
    ctx.quadraticCurveTo(hr*0.5,-hr*1.1,-hr*0.9,-hr*0.8);
    ctx.quadraticCurveTo(-hr*1.15,0,-hr*0.9,hr*0.8);
    ctx.quadraticCurveTo(hr*0.5,hr*1.1,hr*1.85,0);
    ctx.closePath();ctx.fill();
    // göz: küçük, kötücül kırmızı, dikey yarık (parıltılı)
    var ex=hr*0.25,ey=-hr*0.50;
    ctx.save();ctx.shadowColor=eyeR;ctx.shadowBlur=4;
    ctx.fillStyle=eyeR;
    ctx.beginPath();ctx.ellipse(ex,ey,hr*0.36,hr*0.28,0,0,6.2832);ctx.fill();
    ctx.restore();
    ctx.fillStyle='rgba(10,6,4,0.95)';
    ctx.beginPath();ctx.ellipse(ex+hr*0.04,ey,hr*0.09,hr*0.22,0,0,6.2832);ctx.fill();
    ctx.restore();
    // ── çatal dil (ara sıra titreyerek çıkar) ──
    var flick=Math.sin(snakePhase*0.22);
    if(flick>0.2){
      var f=(flick-0.2)/0.8;
      var t0=hr*1.75,tlen=hr*(1.0+f*1.6);
      var bx=hp.x+Math.cos(ang)*t0,by=hp.y+Math.sin(ang)*t0;
      var ttx=hp.x+Math.cos(ang)*(t0+tlen),tty=hp.y+Math.sin(ang)*(t0+tlen);
      var wob=Math.sin(snakePhase*3)*1.1;
      var mx=(bx+ttx)/2+Math.cos(ang+1.57)*wob,my=(by+tty)/2+Math.sin(ang+1.57)*wob;
      ctx.strokeStyle=tongueR;ctx.lineWidth=0.85;
      ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(mx,my,ttx,tty);
      ctx.lineTo(ttx+Math.cos(ang+0.42)*hr*0.55,tty+Math.sin(ang+0.42)*hr*0.55);
      ctx.moveTo(ttx,tty);
      ctx.lineTo(ttx+Math.cos(ang-0.42)*hr*0.55,tty+Math.sin(ang-0.42)*hr*0.55);
      ctx.stroke();
    }
  }
  requestAnimationFrame(tick);
}
// ── Görev 3: Sitedeki TÜM ayraçlar (<hr>) varsayılan serpent ayracına dönüşür ──
function scSerpentHr(){
  document.querySelectorAll('article hr, .center hr, .popover hr').forEach(function(hr){
    if(hr.getAttribute('data-sc-snake'))return;hr.setAttribute('data-sc-snake','1');
    var w=document.createElement('div');w.className='sc-hr-serpent';w.setAttribute('aria-hidden','true');
    w.innerHTML=SC_SERPENT_LINE;
    if(hr.parentNode)hr.parentNode.insertBefore(w,hr);
    hr.style.display='none';
  });
}
// ── Görev: Animasyonlu zarf (mailto:cio@sayko.ch) — sol alt köşede sabit minik buton
// ("sayfa yukarı" butonunun ayna konumu). Body seviyesinde, oturumda bir kez. ──
function scFooterMail(){
  if(document.querySelector('.sc-mail-link'))return;
  var a=document.createElement('a');
  a.className='sc-mail-link';a.href='mailto:cio@sayko.ch';a.title='cio@sayko.ch';a.setAttribute('aria-label','E-posta: cio@sayko.ch');
  a.innerHTML='<span class="sc-mail"><span class="animated-mail">'+
    '<span class="body"></span><span class="top-fold"></span><span class="back-fold"></span><span class="left-fold"></span>'+
    '<span class="letter"><span class="letter-border"></span><span class="letter-title"></span><span class="letter-context"></span><span class="letter-stamp"></span></span>'+
    '</span><span class="shadow"></span></span>';
  document.body.appendChild(a);
}
// ── Görev 3b: Konu makalesinde başlığın üstüne büyük, ortalı hiyeroglif ──
function scArticleGlyph(){
  var slug=document.body.getAttribute('data-slug')||'';
  if(slug.endsWith('/index')||slug===''||slug==='index'||slug==='404')return; // yalnız yaprak makaleler
  var h=document.querySelector('.center .article-title, article .article-title');
  if(!h||h.getAttribute('data-sc-aglyph'))return;
  var gl=scGlyphFor(h.textContent||'');
  if(!gl)return;
  h.setAttribute('data-sc-aglyph','1');
  var g=document.createElement('div');g.className='sc-article-glyph';g.setAttribute('aria-hidden','true');g.textContent=gl;
  if(h.parentNode)h.parentNode.insertBefore(g,h);
}
function perNav(){
  // Masaüstünde sağ SBB/saat kutusu daima açık kalır; mobilde sayfa değişince kapanır
  if(window.innerWidth>=1200){
    document.body.classList.add('sc-sbb-open');
  }else{
    document.body.classList.remove('sc-sbb-open');
  }
  scREdge();
  // Künye (note-properties) panelini yazının SONUNA taşı + Türkçe etiketle
  scProps();
  // Dinamik etiket bulutu (/tags sayfası)
  scTagCloud();
  var slogan=SLO[Math.floor(Math.random()*SLO.length)];
  var isHome=(document.body.getAttribute('data-slug')==='index'||document.body.getAttribute('data-slug')==='');
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
  // Search: move to body as fixed tail (SBB kutusunun sol kenarından uzanır)
  var oldTails=document.querySelectorAll('body > .search.sc-search-tail');
  var curSrch=document.querySelector('.page .search, .center .search, .page-header .search');
  if(curSrch){
    oldTails.forEach(function(el){if(el!==curSrch)el.remove();});
    if(!curSrch.classList.contains('sc-search-tail')){
      curSrch.classList.add('sc-search-tail');
      document.body.appendChild(curSrch);
      var scont=curSrch.querySelector('.search-container');
      if(scont&&window.MutationObserver){
        var smo=new MutationObserver(function(){curSrch.classList.toggle('sc-search-open',scont.classList.contains('active'));});
        smo.observe(scont,{attributes:true,attributeFilter:['class']});
      }
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
    var np=decodeURIComponent((a.getAttribute('href')||'')).replace(/^[.][.][/]|^[.][/]/,'').replace(/[/]+$/,'');
    var parts=np.split('/').filter(Boolean);
    var topLevel=parts.length<=1;
    var isCI=parts.length===2&&parts[1]==='index';
    if(t==='sayko.ch'||np===''||np==='.'||np==='index'||np.endsWith('/index')||isCI||(topLevel&&(SC_MAP[parts[0]]||SC_MAP[np]))||topLevel){li.remove();}
  });
  // Gerçek kronolojiye göre sırala
  scSortRecentNotes();
  document.querySelectorAll('.recent-notes').forEach(function(rn){
    var feed=!!rn.closest('.page-footer');
    rn.querySelectorAll('.recent-li').forEach(function(li,idx){
      if(li.getAttribute('data-sc-rp'))return;li.setAttribute('data-sc-rp','1');
      var a=li.querySelector('.desc h3 a')||li.querySelector('a');var desc=li.querySelector('.desc')||li;
      if(a){var href=(a.getAttribute('href')||'').replace(/^[.][/]/,'').replace(/^[/]/,'');var seg=decodeURIComponent(href).split('/')[0];var label=SC_MAP[seg];
        if(label){var eb=document.createElement('span');eb.className='rp-eyebrow';eb.textContent=label;desc.insertBefore(eb,desc.firstChild);}}
      if(feed){li.classList.add('rp-'+(idx+1));}
    });
  });
  // Sol sütun "Son Yazılar" accordion — yalnızca son 3 yazı
  var lrn=document.querySelector('.left.sidebar .recent-notes');
  if(lrn){
    var rLis=lrn.querySelectorAll('.recent-li');
    rLis.forEach(function(li,idx){
      if(idx>=3){li.remove();}
    });
    if(!lrn.getAttribute('data-sc-acc')){
      lrn.setAttribute('data-sc-acc','1');
      var ttl=lrn.querySelector('h3');var ttltxt=ttl?(ttl.textContent||'Son Yazılar'):'Son Yazılar';
      var det=document.createElement('details');det.className='rp-accordion';
      var sum=document.createElement('summary');sum.textContent=ttltxt;det.appendChild(sum);
      if(ttl)ttl.remove();while(lrn.firstChild){det.appendChild(lrn.firstChild);}lrn.appendChild(det);
    }
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
  scSerpentHr();
  scArticleGlyph();
  scSbbExtras();
  initHeaderFx();
  syncFooter();
  ensureFooterWave();
  scFooterMail();
}
function init(){ensure();perNav();}
if(document.readyState!=='loading'){init();}
else{document.addEventListener('DOMContentLoaded',init);}
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
