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
  { n: "01", name: "Bilimsel Çalışma\u00A0Yöntemleri", slug: "bilimsel-çalışma-yöntemleri", icon: "bilimsel-calisma-yontemleri" },
  { n: "02", name: "Biliş Psikolojisi\u00A01", slug: "biliş-psikolojisi-1", icon: "bilis-psikolojisi-1" },
  { n: "03", name: "Biyolojik Psikoloji\u00A02", slug: "biyolojik-psikoloji-2", icon: "biyolojik-psikoloji-2" },
  { n: "04", name: "Gelişim Psikolojisi\u00A01", slug: "gelişim-psikolojisi-1", icon: "gelisim-psikolojisi-1" },
  { n: "05", name: "Gelişim Psikolojisi\u00A02", slug: "gelişim-psikolojisi-2", icon: "gelisim-psikolojisi-2" },
  { n: "06", name: "İstatistik\u00A01", slug: "i̇statistik-1", icon: "istatistik-1" },
  { n: "07", name: "Klinik Psikoloji\u00A01", slug: "klinik-psikoloji-1", icon: "klinik-psikoloji-1" },
  { n: "08", name: "Klinik Psikoloji\u00A02", slug: "klinik-psikoloji-2", icon: "klinik-psikoloji-2" },
  { n: "09", name: "Sağlık Psikolojisi ve\u00A0Davranışsal\u00A0Tıp", slug: "sağlık-psikolojisi-ve-davranışsal-tıp", icon: "saglik-psikolojisi-ve-davranissal-tip" },
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

function scBuildFold(s: string) {
  return (s || "")
    .toUpperCase()
    .replace(/İ/g, "I")
    .replace(/Ş/g, "S")
    .replace(/Ç/g, "C")
    .replace(/Ğ/g, "G")
    .replace(/Ü/g, "U")
    .replace(/Ö/g, "O")
    .replace(/[^A-Z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

const SC_CURRICULUM_DATA: Record<string, string[]> = {
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
    'BILIM FELSEFESI VE ARASTIRMA YAKLASIMLARI',
    'KAYGI BOZUKLUKLARI',
    'OBSESIF KOMPULSIF BOZUKLUK VE TIKLER',
    'TRAVMA VE TRAVMA SONRASI STRES BOZUKLUGU',
    'DUYGUDURUM BOZUKLUKLARI',
    'BAGIMLILIKLAR',
    'PSIKOZLAR',
    'YEME BOZUKLUKLARI',
    'CINSEL ISLEV BOZUKLUKLARI VE UYKU BOZUKLUKLARI'
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
}

interface ScTopic {
  num: number
  title: string
  order: number
  isWritten: boolean
  href: string
  slug: string
}

const SC_COURSE_TOPICS: Record<string, ScTopic[]> = {}
for (const c of SC_COURSES) {
  const contentDir = path.join(process.cwd(), "content", c.name.replace(/\u00A0/g, " "))
  const pubDir = path.join(process.cwd(), "public", c.slug)
  const curKey = scBuildFold(c.slug).replace(/[^A-Z0-9]/g, "").toLowerCase()
  const curList = SC_CURRICULUM_DATA[c.slug] || SC_CURRICULUM_DATA[curKey] || []
  if (!fs.existsSync(contentDir)) continue

  const topics: ScTopic[] = []
  const entries = fs.readdirSync(contentDir)

  for (const e of entries) {
    if (e.startsWith(".") || e === "index.md") continue
    const p = path.join(contentDir, e)
    const stat = fs.statSync(p)

    if (stat.isDirectory()) {
      const subFiles = fs.readdirSync(p).filter((sf) => sf.endsWith(".md") && sf !== "index.md")
      const isWritten = subFiles.some((sf) => fs.statSync(path.join(p, sf)).size > 1000)
      const subDirSlug = e.toLowerCase().replace(/[ —–]+/g, "-").replace(/\s+/g, "-")
      const fText = scBuildFold(e)
      let order = 999
      for (let i = 0; i < curList.length; i++) {
        if (fText === curList[i] || fText.indexOf(curList[i]) === 0 || curList[i].indexOf(fText) === 0) {
          order = i
          break
        }
      }
      topics.push({
        num: 0,
        title: e,
        order,
        isWritten,
        href: `/${c.slug}/${subDirSlug}/`,
        slug: subDirSlug,
      })

      // Alt konuları tara ve alt-ders listesi olarak da kaydet
      const subTopics: ScTopic[] = subFiles.map((sf) => {
        const sfTitle = sf.replace(/\.md$/, "")
        const sfText = scBuildFold(sfTitle)
        let sfOrder = 999
        for (let i = 0; i < curList.length; i++) {
          if (sfText === curList[i] || sfText.indexOf(curList[i]) === 0 || curList[i].indexOf(sfText) === 0) {
            sfOrder = i
            break
          }
        }
        const sfStat = fs.statSync(path.join(p, sf))
        const sfSlug = sfTitle.toLowerCase().replace(/[ —–]+/g, "-").replace(/\s+/g, "-")
        return {
          num: 0,
          title: sfTitle,
          order: sfOrder,
          isWritten: sfStat.size > 1000,
          href: `/${c.slug}/${subDirSlug}/${sfSlug}`,
          slug: `${subDirSlug}/${sfSlug}`,
        }
      })
      subTopics.sort((a, b) => a.order - b.order)
      subTopics.forEach((st, idx) => {
        st.num = idx + 1
      })
      SC_COURSE_TOPICS[`${c.slug}/${subDirSlug}`] = subTopics
      SC_COURSE_TOPICS[subDirSlug] = subTopics
      topics.push(...subTopics)
    } else if (e.endsWith(".md")) {
      const title = e.replace(/\.md$/, "")
      const fText = scBuildFold(title)
      let order = 999
      for (let i = 0; i < curList.length; i++) {
        if (fText === curList[i] || fText.indexOf(curList[i]) === 0 || curList[i].indexOf(fText) === 0) {
          order = i
          break
        }
      }
      const slug = title.toLowerCase().replace(/[ —–]+/g, "-").replace(/\s+/g, "-")
      topics.push({
        num: 0,
        title,
        order,
        isWritten: stat.size > 1000,
        href: `/${c.slug}/${slug}`,
        slug,
      })
    }
  }

  topics.sort((a, b) => a.order - b.order)
  topics.forEach((t, idx) => {
    t.num = idx + 1
  })
  SC_COURSE_TOPICS[c.slug] = topics
}

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
          href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Manufacturing+Consent&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Bebas+Neue&family=Cedarville+Cursive&family=Dancing+Script:wght@500;600&family=Contrail+One&family=Abril+Fatface&family=Cinzel+Decorative:wght@700&family=Poiret+One&family=Limelight&family=Megrim&family=Special+Elite&family=Ultra&family=Lobster&family=Monoton&family=Rye&family=Bungee&family=Rubik+Mono+One&family=Fredericka+the+Great&family=Pirata+One&family=UnifrakturCook:wght@700&family=Della+Respira&family=Italiana&family=Forum&family=Marcellus&family=Yeseva+One&family=Stardos+Stencil:wght@700&family=Audiowide&family=Orbitron:wght@700&family=Sancreek&family=Ewert&family=Fontdiner+Swanky&family=Bigshot+One&family=Codystar:wght@400&family=Silkscreen&family=Noto+Sans+Egyptian+Hieroglyphs&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Syne:wght@400..800&family=Cinzel:wght@400..900&family=Rubik+Glitch&family=Almendra+Display&display=swap"
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
var SC_TOPICS=${JSON.stringify(SC_COURSE_TOPICS)};
var SC_LOGO=${JSON.stringify(SC_LOGO_SVG)};
var SC_SB=${JSON.stringify(SC_SB_SVG)};
// Gerçekçi yılan ayraç: S-kıvrımlı gövde + oval baş + göz + çatal dil
var SC_SERPENT_LINE='<svg class="sc-serpent-div" viewBox="0 0 260 20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10 C14 4 24 16 38 10 C52 4 62 16 78 10 C94 4 106 16 124 10 C142 4 154 16 172 10 C188 4 200 16 214 10 C226 5 234 8 238 10" stroke-width="2.2"/><ellipse cx="245" cy="10" rx="7" ry="4.5" stroke-width="1.8"/><circle cx="248" cy="8.5" r="0.9" fill="currentColor" stroke="none"/><path d="M252 10 L257 7.5 M252 10 L257 12.5" stroke-width="1.1"/></svg>';
var SLO=["Zihin, davranış ve aradaki her şey..","Psikoloji: Kitapta durduğu gibi durmaz.","Teori biter, maruz kalma başlar.","İncelemiyoruz, buyuz işte.","Okumuyoruz, maruz kalıyoruz.","Pratikte burdayız, teoride ordayız.","Kitap biter, kafa başlar.","Sistemler çöker, adaptasyon hayatta kalır.","Sınır, sadece bir varsayımdır.","Sınanmamış bir erdem, sadece iyi bir niyettir.","İyileşmek istiyorsan, maruz kalacaksın.","Kurtarıcını beklemeyi bıraktığında, psikolojik doğumun başlar.","Kendine dürüst olmak kadar büyük bir savaş yoktur. — Sigmund Freud","Psikolojinin uzun bir geçmişi, ama kısa bir tarihi vardır. — Ebbinghaus","İnsan, kendisinden başka bir şey değildir, ne olmayı tasarlıyorsa o olur. — Sartre","Kişinin kendisi hakkında çok konuşması, kendini gizlemenin de bir yoludur. — Friedrich Nietzsche","Bir durumu artık değiştiremediğimizde, kendimizi değiştirmeye çağrılırız. — Viktor E. Frankl","Travma başınıza gelen kötü şey değil; o şey gerçekleşirken içinizde verdiğiniz o ıssız savaştır. — Gabor Maté","Geçmiş henüz bitmedi; o, şu an verdiğiniz her otomatik tepkinin içinde saklanıyor. — Peter Levine","Korku, tehlikenin değil; zihninizin o tehlikeye yazdığı senaryonun ürünüdür. — David Burns","Bilişsel kapasiteniz ne kadar yüksek olursa olsun, sinir sisteminiz tehdit hissettiği an ilkelliğe mahkumsunuzdur. — Stephen Porges"];
// Rotating header fonts — picks one per page load/nav (art deco / fancy / vintage / boring karışık)
var SC_FONTS=['Playfair Display','Abril Fatface','Cinzel Decorative','Poiret One','Limelight','Megrim','Special Elite','Ultra','Lobster','Monoton','Rye','Dancing Script','Bebas Neue','Georgia','Bungee','Rubik Mono One','Fredericka the Great','Pirata One','UnifrakturCook','Della Respira','Italiana','Forum','Marcellus','Yeseva One','Stardos Stencil','Audiowide','Orbitron','Sancreek','Ewert','Fontdiner Swanky','Bigshot One','Codystar','Silkscreen','Fraunces','Syne','Cinzel','Rubik Glitch','Almendra Display'];
// ── Görev 8: Konu hex'lerine Mısır hiyeroglifi — başlık üstünde, soluk ikincil renk ──
// Eşleştirme başlık metniyle (Türkçe-ASCII fold) yapılır; ardışık konular (I/II/III)
// aynı glifi tekrarlar. Önce TAM eşleşme, yoksa sondaki sayı ayrılıp temel glif tekrar.
var SC_GLYPHS=[
  // Bilimsel Çalışma Yöntemleri
  ['ARAŞTIRMA DESENLERI I','𓊖'],['ARAŞTIRMA DESENLERI II','𓊖𓊖'],['ARAŞTIRMA ETIĞI','𓆄'],
  ['ARAŞTIRMA SÜRECI, ARAŞTIRMA SORULARI VE HIPOTEZLER','𓀁'],['BULGULARININ YAYIMLANMASI VE BILIM ETIĞI','𓏞'],
  ['GIRIŞ: AMPIRIK BIR BILIM OLARAK PSIKOLOJI','𓉐'],['GIRIŞ — AMPIRIK BIR BILIM OLARAK PSIKOLOJI','𓉐'],['GIRIŞ - AMPIRIK BIR BILIM OLARAK PSIKOLOJI','𓉐'],['LITERATÜR TARAMASI VE BILIMSEL METIN FORMATLARI','𓏛'],
  ['VERI TOPLAMA YÖNTEMLERI I','𓎟'],['VERI TOPLAMA YÖNTEMLERI II','𓎟𓎟'],['ÖRNEKLEM SEÇIMI','𓂧'],
  ['İSTATISTIKSEL VE İÇERIKSEL ANLAMLILIK','𓍝'],['İŞEVURUK TANIM VE ÖLÇME','𓎟'],
  // Biliş Psikolojisi 1
  ['GÖRSEL KORTEKS — NESNELER VE SAHNELER','𓁹'],['DERI DUYULARI VE KIMYASAL DUYULAR','𓂝'],
  ['GIRIŞ: ALGI, DUYU FIZYOLOJISI, GÖZ VE RETINA','𓉐'],['GIRIŞ — ALGI, DUYU FIZYOLOJISI, GÖZ VE RETINA','𓉐'],['GIRIŞ - ALGI, DUYU FIZYOLOJISI, GÖZ VE RETINA','𓉐'],['GÖRSEL DIKKAT VE EYLEM','𓂀'],['HAREKET ALGISI','𓂻'],
  ['RENK ALGISI, DERINLIK VE BÜYÜKLÜK ALGISI','𓁺'],['İŞITME — ÇEVRE, MÜZIK VE KONUŞMA ALGISI','𓄔'],
  // Biyolojik Psikoloji 2
  ['BEYIN HASARI VE NÖROPLASTISITE','𓁶'],['BIYOPSIKOLOJININ DIĞER ARAŞTIRMA YÖNTEMLERI','𓏞'],['DENGE DUYUSU','𓍝'],
  ['DUYGU, STRES VE SAĞLIĞIN BIYOPSIKOLOJISI','𓄣'],['LATERALIZASYON, DIL VE AYRIK BEYIN','𓄓'],
  ['MADDE KULLANIMI, BAĞIMLILIK VE ÖDÜL SISTEMI','𓎱'],['NÖROPSIKOLOJIK TESTLER I','𓍼'],['NÖROPSIKOLOJIK TESTLER II','𓍼𓍼'],
  ['PSIKIYATRIK BOZUKLUKLARIN BIYOPSIKOLOJISI','𓀿'],['UYKU, RÜYA VE SIRKADIYEN RITIMLER','𓇰'],
  ['ÖĞRENME, BELLEK VE AMNEZI','𓂉'],['İŞITME','𓄕'],
  // Gelişim Psikolojisi 1
  ['GIRIŞ: GELIŞIM PSIKOLOJISININ KONUSU VE GÖREVLERI','𓉐'],['GIRIŞ - GELIŞIM PSIKOLOJISININ KONUSU VE GÖREVLERI','𓉐'],['GIRIŞ — GELIŞIM PSIKOLOJISININ KONUSU VE GÖREVLERI','𓉐'],['GIRIŞ','𓉐'],['ALGI','𓁹'],['BILIŞ I','𓀁'],['BILIŞ II','𓀁𓀁'],['BIYOLOJI VE DAVRANIŞ','𓆣'],['DIL GELIŞIMI','𓂋'],
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
  ['CINSEL İŞLEV BOZUKLUKLARI VE UYKU BOZUKLUKLARI','𓂸'],['DUYGUDURUM BOZUKLUKLARI','𓀠'],['GIRIŞ: NORMAL VE ANORMAL','𓍝'],['GIRIŞ - NORMAL VE ANORMAL','𓍝'],['GIRIŞ — NORMAL VE ANORMAL','𓍝'],['GIRIŞ','𓉐'],
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
  return s.replace(new RegExp('[^A-Z0-9 ]', 'g'),' ').replace(new RegExp('\\s+', 'g'),' ').trim();
}
var SC_GLYPH_FULL={},SC_GLYPH_BASE={};
SC_GLYPHS.forEach(function(e){
  var f=scFold(e[0]);if(!SC_GLYPH_FULL[f])SC_GLYPH_FULL[f]=e[1];
  if(Array.from(e[1]).length===1){var m=f.match(/^(.*?)[ \t]+(III|II|I|3|2|1)$/);var base=m?m[1]:f;if(!SC_GLYPH_BASE[base])SC_GLYPH_BASE[base]=e[1];}
});
function scGlyphFor(title){
  var f=scFold(title);
  if(SC_GLYPH_FULL[f])return SC_GLYPH_FULL[f];
  if(f.indexOf('NORMAL VE ANORMAL')!==-1) return '𓍝';
  if(f.indexOf('GIRIS')!==-1) return '𓉐';
  var m=f.match(/^(.*?)[ \t]+(III|II|I|3|2|1)$/);
  if(m){var base=m[1],c=({I:1,II:2,III:3,'1':1,'2':2,'3':3})[m[2]],g=SC_GLYPH_BASE[base];if(g){var o='';for(var i=0;i<c;i++)o+=g;return o;}}
  return '';
}
function scGetElByHref(href){
  if(!href) return null;
  var rawId = href.replace(/^#/, '');
  var decodedId = '';
  try { decodedId = decodeURIComponent(rawId); } catch(e){ decodedId = rawId; }
  return document.getElementById(decodedId) || document.getElementById(rawId);
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
  if(!pb){
    pb=document.createElement('div');pb.id='sc-progress';
    pb.setAttribute('title','Okuma İlerlemesi • Başa Dön');
    pb.innerHTML='<div class="sc-spine-column"></div>'+
      '<span id="sc-progress-badge" class="sc-progress-badge"></span>';
    document.body.appendChild(pb);
    pb.addEventListener('click',function(e){
      e.stopPropagation();
      window.scrollTo({top:0,behavior:'smooth'});
    });
  }
  function prog(){
    var de=document.documentElement;var st=de.scrollTop||document.body.scrollTop;var h=de.scrollHeight-de.clientHeight;var p=h>0?st/h:0;
    pb.style.height=(p*100)+'%';
    if(p>0.008){
      pb.classList.add('sc-prog-active');
    }else{
      pb.classList.remove('sc-prog-active');
    }
    var badge=document.getElementById('sc-progress-badge');
    if(badge){
      var pct=Math.round(p*100);
      var art=document.querySelector('article, .center');
      var wc=art?(art.textContent||'').split(new RegExp('\\s+')).length:600;
      var totalMin=Math.ceil(wc/180);
      var remMin=Math.max(1, Math.ceil(totalMin*(1-p)));
      badge.textContent='%'+pct+(p<0.95?' • ~'+remMin+' dk':' • Bitti');
    }
  }
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
    gtb.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5C10.3 4 8.2 4.3 7 5.8c-.9 1.1-1.1 2.5-.7 3.7C5.3 10 5 11 5 12.1c0 1.4.7 2.6 1.8 3.3-.2.6-.3 1.2-.3 1.8 0 1.8 1.5 3.3 3.3 3.3.3 0 .6 0 .9-.1"/><path d="M12 4.5c1.7-.5 3.8-.2 5 1.3.9 1.1 1.1 2.5.7 3.7.9.5 1.3 1.5 1.3 2.6 0 1.4-.7 2.6-1.8 3.3.2.6.3 1.2.3 1.8 0 1.8-1.5 3.3-3.3 3.3-.3 0-.6 0-.9-.1"/><path d="M9.7 18.3C10.4 19.3 11.2 19.8 12 20c.8-.2 1.6-.7 2.3-1.7"/><line x1="12" y1="4.5" x2="12" y2="19.5"/><path d="M8.5 8.5c.7.9 1.6 1.3 2.8 1.3"/><path d="M8 13c.8.7 1.8 1 2.8.8"/><path d="M15.5 8.5c-.7.9-1.6 1.3-2.8 1.3"/><path d="M16 13c-.8.7-1.8 1-2.8.8"/></svg>';
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
    // Sözlük / K&K Tuşu (𓅔) - Nöral ağın hemen sağına
    var bg=document.createElement('button');bg.type='button';bg.className='sc-toolbtn sc-glossarybtn';bg.title='Kavramlar & Kelimeler (Sözlük)';bg.setAttribute('aria-label','Kavramlar & Kelimeler (Sözlük)');
    bg.innerHTML='<span class="sc-sbb-glyph">𓅔</span>';
    bg.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      if(typeof window.scOpenGlossary==='function') window.scOpenGlossary();
      else if(typeof scOpenGlossary==='function') scOpenGlossary();
    });
    // Focus & Bionic Reading
    var bf=document.createElement('button');bf.type='button';bf.className='sc-toolbtn sc-focusbtn';bf.title='Fokus & Bionic Okuma';bf.setAttribute('aria-label','Fokus & Bionic Okuma');
    bf.innerHTML='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
    bf.addEventListener('click',function(){
      this.classList.toggle('sc-active');
      if(typeof window.scToggleBionicReading==='function') window.scToggleBionicReading();
      else if(typeof scToggleBionicReading==='function') scToggleBionicReading();
    });
    // Geri (tarayıcı geçmişi)
    var bb=document.createElement('button');bb.type='button';bb.className='sc-toolbtn sc-backbtn';bb.title='Geri';bb.setAttribute('aria-label','Geri');
    bb.innerHTML='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';
    bb.addEventListener('click',function(){if(history.length>1){history.back();}else{location.href='/';}});
    sbbHdr.appendChild(lg);
    sbb.appendChild(sbbHdr);
    var sbbTools=document.createElement('div');sbbTools.className='sc-sbb-tools';
    sbbTools.appendChild(bb);sbbTools.appendChild(gtb);sbbTools.appendChild(bg);sbbTools.appendChild(bt);sbbTools.appendChild(bf);
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
    var sbbFoot=document.createElement('div');sbbFoot.className='sc-sbb-foot';
    var bm=document.createElement('a');bm.className='sc-sbb-mailbtn';bm.href='mailto:cio@sayko.ch';bm.title='cio@sayko.ch';bm.setAttribute('aria-label','E-posta: cio@sayko.ch');
    bm.innerHTML='<span class="sc-sbb-mail-at">@</span>';
    sbbFoot.appendChild(bm);

    // ── Beta 1: 3D Anatomik Korteks Ağı (Hilal: ☾) ──
    var bCortex=document.createElement('button');bCortex.type='button';bCortex.className='sc-sbb-footbtn sc-btn-cortex3d';
    bCortex.title='Beta: 3D Anatomik Korteks Ağı';bCortex.setAttribute('aria-label','3D Nöral Korteks Ağı');
    bCortex.innerHTML='<span class="sc-cortex-hilal" aria-hidden="true">☾</span>';
    bCortex.addEventListener('click',function(e){e.stopPropagation();scOpen3DCortex();});
    sbbFoot.appendChild(bCortex);

    // ── Beta 2: Typst İsviçre Monografi Dizgisi (Mühür: 🞢) ──
    var bTypst=document.createElement('button');bTypst.type='button';bTypst.className='sc-sbb-footbtn sc-btn-typst';
    bTypst.title='Beta: Typst İsviçre Monografi Dizgisi';bTypst.setAttribute('aria-label','Typst Monografi Dizgisi');
    bTypst.innerHTML='<span class="sc-typst-mark" aria-hidden="true">🞢</span>';
    bTypst.addEventListener('click',function(e){e.stopPropagation();scTriggerTypstMode();});
    sbbFoot.appendChild(bTypst);

    sbb.appendChild(sbbFoot);
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
    window.addEventListener('resize',function(){if(window.__scProg)window.__scProg();scREdge();clearTimeout(window.__scFitT);window.__scFitT=setTimeout(function(){scFitHex(); scInjectCourseHero();scFitHeader();},160);});
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
      var l3=document.createElement('a');l3.className='sc-bclayer sc-bcl-article';l3.href=window.location.pathname;l3.textContent=artTitle;
      bl.appendChild(l3);setTimeout(function(){l3.classList.add('sc-bcl-in');},150);
      
      var tocLinks=document.querySelectorAll('article a[href^="#"], .center a[href^="#"]');
      var tocItems=[];
      var seenIds={};
      tocLinks.forEach(function(ta){
        var href=ta.getAttribute('href')||'';
        if(href.length>1&&!seenIds[href]){
          var txt=(ta.textContent||'').trim();
          if(txt&&txt!=='İçindekiler'&&txt!=='#'&&txt.length>2){
            seenIds[href]=true;
            tocItems.push({href:href,text:txt});
          }
        }
      });
      if(!tocItems.length){
        document.querySelectorAll('article h2, .center article h2').forEach(function(h2){
          var txt=(h2.textContent||'').trim();
          if(txt&&txt!=='İçindekiler'){
            var id=h2.id||scFold(txt).toLowerCase().replace(new RegExp('[^a-z0-9]', 'g'),'-');
            if(!h2.id)h2.id=id;
            tocItems.push({href:'#'+id,text:txt});
          }
        });
      }

      if(tocItems.length>0){
        var tocWrap=document.createElement('div');tocWrap.className='sc-bclayer-toc';
        var tocElements=[];
        tocItems.slice(0,7).forEach(function(item,tIdx){
          var ta=document.createElement('a');
          ta.className='sc-bctoc-item';
          ta.href=item.href;
          ta.textContent=item.text;
          ta.addEventListener('click',function(e){
            e.preventDefault();
            var targetEl=scGetElByHref(item.href);
            if(targetEl){
              targetEl.scrollIntoView({behavior:'smooth',block:'start'});
              history.pushState(null,'',item.href);
            }
          });
          tocWrap.appendChild(ta);
          tocElements.push({a:ta,href:item.href});
          setTimeout(function(){ta.classList.add('sc-bcl-in');},180+tIdx*25);
        });
        bl.appendChild(tocWrap);

        // Scroll spy for active TOC highlight
        function highlightToc(){
          var activeHref=null;
          for(var si=0;si<tocElements.length;si++){
            var el=scGetElByHref(tocElements[si].href);
            if(el){
              var r=el.getBoundingClientRect();
              if(r.top<=240){ activeHref=tocElements[si].href; }
            }
          }
          if(!activeHref&&tocElements.length) activeHref=tocElements[0].href;
          tocElements.forEach(function(te){
            if(te.href===activeHref){te.a.classList.add('sc-active');}
            else{te.a.classList.remove('sc-active');}
          });
        }
        window.removeEventListener('scroll',window.__scTocSpy);
        window.__scTocSpy=highlightToc;
        window.addEventListener('scroll',highlightToc,{passive:true});
        setTimeout(highlightToc,220);
      }
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
    'BILIM FELSEFESI VE ARASTIRMA YAKLASIMLARI',
    'KAYGI BOZUKLUKLARI',
    'OBSESIF KOMPULSIF BOZUKLUK VE TIKLER',
    'TRAVMA VE TRAVMA SONRASI STRES BOZUKLUGU',
    'DUYGUDURUM BOZUKLUKLARI',
    'BAGIMLILIKLAR',
    'PSIKOZLAR',
    'YEME BOZUKLUKLARI',
    'CINSEL ISLEV BOZUKLUKLARI VE UYKU BOZUKLUKLARI'
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
  var slug=document.body.getAttribute('data-slug')||window.location.pathname||'';
  var folder=slug.replace(/[/]index$/,'').replace(/^[/]/,'').split('/')[0];
  var normFolder=scNormSlug(folder);
  var curList=SC_CURRICULUM[folder]||SC_CURRICULUM[normFolder];
  if(!curList){
    for(var k in SC_CURRICULUM){
      if(scNormSlug(k)===normFolder||normFolder.indexOf(scNormSlug(k))!==-1||scNormSlug(k).indexOf(normFolder)!==-1){
        curList=SC_CURRICULUM[k];break;
      }
    }
  }
  if(!curList||!curList.length)return;

  var lis=Array.from(ul.querySelectorAll(':scope > .section-li'));
  if(!lis.length)return;

  function getOrder(li){
    var a=li.querySelector('.desc h3 a')||li.querySelector('a');
    if(!a)return 999;
    // Try multiple text sources
    var rawText=(a.getAttribute('data-raw-title')||'').trim();
    if(!rawText){
      var lbl=a.querySelector('.sc-hx-label');
      rawText=lbl?(lbl.textContent||'').trim():(a.textContent||'').trim();
    }
    var href=decodeURIComponent(a.getAttribute('href')||'');
    var lastSeg=href.split('/').pop()||'';
    var fText=scFold(rawText);
    var fHref=scFold(lastSeg);

    // Strategy 1: Exact or prefix match
    for(var i=0;i<curList.length;i++){
      var item=curList[i];
      if(fText===item||fHref===item){return i;}
    }
    // Strategy 2: Prefix/contains match
    for(var i=0;i<curList.length;i++){
      var item=curList[i];
      if(fText.indexOf(item)===0||item.indexOf(fText)===0||fHref.indexOf(item)===0||item.indexOf(fHref)===0){return i;}
    }
    // Strategy 3: Substring match (at least 3 words overlap)
    var fWords=fText.split(' ');
    for(var i=0;i<curList.length;i++){
      var item=curList[i];
      var iWords=item.split(' ');
      var overlap=0;
      for(var w=0;w<fWords.length;w++){
        if(iWords.indexOf(fWords[w])!==-1)overlap++;
      }
      if(overlap>=Math.min(3,iWords.length)){return i;}
    }
    return 999;
  }

  lis.sort(function(a,b){
    return getOrder(a)-getOrder(b);
  });

  lis.forEach(function(li){
    ul.appendChild(li);
  });
  ul.setAttribute('data-sc-sorted','1');
}

// Altıgen konu kutuları: yazı, altıgenin geniş orta bandına TAM sığana dek küçülür
function scFitHex(){
  var links=document.querySelectorAll('.page-listing .section-li .desc h3 a, .section-ul .section-li .desc h3 a');
  if(!links.length)return;
  scSortHoneycombs();
  links=document.querySelectorAll('.page-listing .section-li .desc h3 a, .section-ul .section-li .desc h3 a');
  var slug=document.body.getAttribute('data-slug')||window.location.pathname||'';
  var cleanSlug=slug.replace(/[/]index$/,'').replace(/^[/]/,'').replace(/[/]+$/,'');
  var firstFolder=cleanSlug.split('/')[0];
  var cTopics=null;
  if(typeof SC_TOPICS!=='undefined'&&SC_TOPICS){
    cTopics = SC_TOPICS[cleanSlug] || SC_TOPICS[decodeURIComponent(cleanSlug)] ||
              SC_TOPICS[firstFolder] || SC_TOPICS[decodeURIComponent(firstFolder)];
  }

  links.forEach(function(a, idx){
    var rawText=(a.getAttribute('data-raw-title')||a.textContent||'').trim();
    if(!a.getAttribute('data-raw-title')){
      a.setAttribute('data-raw-title',rawText);
    }
    var cleanTitle=a.getAttribute('data-raw-title')||rawText;
    var gl=scGlyphFor(cleanTitle);

    // Boş / Yazılmış konu tespiti
    var isWritten=false;
    if(cTopics){
      var fClean=scFold(cleanTitle);
      for(var ti=0;ti<cTopics.length;ti++){
        var tt=cTopics[ti];
        var fTitle=scFold(tt.title);
        if(fTitle===fClean||fClean.indexOf(fTitle)===0||fTitle.indexOf(fClean)===0){
          isWritten=tt.isWritten;break;
        }
      }
    }

    // Tekrar eden isimleri engellemek için a içeriğini tamamen sıfırla
    a.innerHTML='';

    // 1. Ders Numarası (tam tepe açısı)
    var numEl=document.createElement('span');
    numEl.className='sc-hx-num';
    numEl.setAttribute('aria-hidden','true');
    numEl.textContent=String(idx+1);
    a.appendChild(numEl);

    // 2. Hiyeroglif İkonu (tam ortada, büyük)
    if(gl){
      var glyphEl=document.createElement('span');
      glyphEl.className='sc-hx-glyph';
      glyphEl.setAttribute('aria-hidden','true');
      glyphEl.textContent=gl;
      a.appendChild(glyphEl);
    }

    // 3. Konu Başlığı (glifin altında tek sefer)
    var lbl=document.createElement('span');
    lbl.className='sc-hx-label';
    lbl.textContent=cleanTitle;
    a.appendChild(lbl);

    var li=a.closest('.section-li');if(!li)return;
    if(cTopics){
      if(!isWritten){
        li.classList.add('sc-hx-empty');
        li.classList.remove('sc-hx-written');
      } else {
        li.classList.add('sc-hx-written');
        li.classList.remove('sc-hx-empty');
      }
    }

    var H=li.clientHeight||198,W=li.clientWidth||172;
    var maxH=H*0.42,maxW=W-22;
    var len=cleanTitle.length;
    var fs=(len>40)?8.5:(len>28)?9.8:(len>18)?11.2:12.5;
    lbl.style.lineHeight='1.18';lbl.style.fontSize=fs+'px';
    if((lbl.scrollHeight>maxH||lbl.scrollWidth>maxW)&&fs>7.5){
      lbl.style.fontSize=(fs-1.5)+'px';
    }
  });
}

function scSortRecentNotes(){
  var isHome = document.body.getAttribute('data-slug') === 'index' || !document.body.getAttribute('data-slug');
  var rns = document.querySelectorAll('.recent-notes .recent-ul');
  
  if(isHome){
    var homeArticles = [
      {
        course: 'BİLİŞ PSİKOLOJİSİ 1',
        title: 'Görsel Korteks — Nesneler ve Sahneler',
        href: '/biliş-psikolojisi-1/görsel-korteks-—-nesneler-ve-sahneler',
        dateStr: '30 AĞU 2026',
        datetime: '2026-08-30T00:00:00.000Z',
        cls: 'rp-1',
        status: 'writing',
        tooltip: 'Yazılıyor...'
      },
      {
        course: 'KLİNİK PSİKOLOJİ 1',
        title: 'Kuramlar ve Kategorik Yaklaşımlar',
        href: '/klinik-psikoloji-1/kuramlar-ve-kategorik-yaklaşımlar',
        dateStr: '27 AĞU 2026',
        datetime: '2026-08-27T00:00:00.000Z',
        cls: 'rp-2',
        status: 'done',
        tooltip: 'Tamamlandı.'
      },
      {
        course: 'BİLİŞ PSİKOLOJİSİ 1',
        title: 'Giriş: Algı, Duyu Fizyolojisi, Göz ve Retina',
        href: '/biliş-psikolojisi-1/giriş:-algı,-duyu-fizyolojisi,-göz-ve-retina',
        dateStr: '20 AĞU 2026',
        datetime: '2026-08-20T00:00:00.000Z',
        cls: 'rp-3',
        status: 'done',
        tooltip: 'Tamamlandı.'
      },
      {
        course: 'KLİNİK PSİKOLOJİ 1',
        title: 'Giriş: Normal ve Anormal',
        href: '/klinik-psikoloji-1/giriş:-normal-ve-anormal',
        dateStr: '03 TEM 2026',
        datetime: '2026-07-03T00:00:00.000Z',
        cls: 'rp-4',
        status: 'done',
        tooltip: 'Tamamlandı.'
      }
    ];
    rns.forEach(function(ul){
      if(ul.closest('.left.sidebar')) return;
      var html = '';
      homeArticles.forEach(function(art){
        html += '<li class="recent-li ' + art.cls + '" data-sc-rp="1">' +
          '<div class="section">' +
          '<div class="desc">' +
          '<span class="rp-eyebrow">' + art.course + '</span>' +
          '<h3><span class="sc-status-dot sc-status-' + art.status + '" data-tooltip="' + art.tooltip + '"></span><a href="' + art.href + '" class="internal">' + art.title + '</a></h3>' +
          '</div>' +
          '<p class="meta"><time datetime="' + art.datetime + '">' + art.dateStr + '</time></p>' +
          '</div>' +
          '</li>';
      });
      ul.innerHTML = html;
      
      var rnCont = ul.closest('.recent-notes');
      if(rnCont && !rnCont.querySelector('.sc-all-notes-btn-wrap')){
        var btnWrap = document.createElement('div');
        btnWrap.className = 'sc-all-notes-btn-wrap';
        btnWrap.innerHTML = '<a href="/tum-yazilar" class="sc-all-notes-btn">Tüm Yazılar &rarr;</a>';
        rnCont.appendChild(btnWrap);
      }
    });
  }
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
// ─── Görev: Makale Sonu İleri / Geri Navigasyonu (Sleek Serpent Head Arrows) ───
function scPostNav(){
  var slug=document.body.getAttribute('data-slug')||'';
  if(!slug || slug==='index' || slug.endsWith('/index') || slug==='404' || slug==='tum-yazilar') return;

  var segs=slug.split('/');
  if(segs.length<2) return;
  var courseSlug=segs[0];
  var topics=(typeof SC_TOPICS!=='undefined'&&SC_TOPICS)?SC_TOPICS[courseSlug]:null;
  if(!topics || !topics.length) return;

  var art=document.querySelector('.center article');
  if(!art) return;

  var oldNav=art.querySelector('.sc-post-nav');
  if(oldNav) oldNav.remove();

  var pageTitleEl=art.querySelector('.article-title, h1');
  var pageTitle=(pageTitleEl ? pageTitleEl.textContent : '').trim();
  var pageTitleFold=scFold(pageTitle);
  var currSlug=segs.slice(1).join('/');

  var currIdx=-1;
  for(var i=0; i<topics.length; i++){
    var t=topics[i];
    var tFold=scFold(t.title);
    if(tFold===pageTitleFold || (pageTitleFold && (tFold.indexOf(pageTitleFold)===0 || pageTitleFold.indexOf(tFold)===0))){
      currIdx=i; break;
    }
    if(t.slug===currSlug || decodeURIComponent(t.slug)===decodeURIComponent(currSlug)){
      currIdx=i; break;
    }
  }
  if(currIdx===-1) return;

  var prevTopic = currIdx > 0 ? topics[currIdx - 1] : null;
  var nextTopic = currIdx < topics.length - 1 ? topics[currIdx + 1] : null;
  if(!prevTopic && !nextTopic) return;

  var SC_ARROW_LEFT = '<svg class="sc-serpent-nav-arrow sc-arrow-left" viewBox="0 0 34 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M32 8 C24 8 19 5 14 4 C10 3 6 7 5 8 C6 9 10 13 14 12 C19 11 24 8 32 8 Z" fill="currentColor" fill-opacity="0.18" stroke-width="1.7"/>' +
    '<circle cx="9.5" cy="7.3" r="1.1" fill="currentColor" stroke="none"/>' +
    '<path d="M5 8 L2.5 8 M2.5 8 L0.8 6.8 M2.5 8 L0.8 9.2" stroke-width="1.2"/>' +
  '</svg>';

  var SC_ARROW_RIGHT = '<svg class="sc-serpent-nav-arrow sc-arrow-right" viewBox="0 0 34 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M2 8 C10 8 15 5 20 4 C24 3 28 7 29 8 C28 9 24 13 20 12 C15 11 10 8 2 8 Z" fill="currentColor" fill-opacity="0.18" stroke-width="1.7"/>' +
    '<circle cx="24.5" cy="7.3" r="1.1" fill="currentColor" stroke="none"/>' +
    '<path d="M29 8 L31.5 8 M31.5 8 L33.2 6.8 M31.5 8 L33.2 9.2" stroke-width="1.2"/>' +
  '</svg>';

  var nav=document.createElement('nav');
  nav.className='sc-post-nav';
  if(!prevTopic) nav.classList.add('has-only-next');
  if(!nextTopic) nav.classList.add('has-only-prev');

  var html='';
  if(prevTopic){
    var prevNum = prevTopic.num < 10 ? '0' + prevTopic.num : String(prevTopic.num);
    html += '<a href="' + prevTopic.href + '" class="sc-post-nav-card sc-post-nav-prev" aria-label="Önceki Konu: ' + prevTopic.title + '">' +
              '<div class="sc-post-nav-arrow-wrap sc-nav-left">' +
                SC_ARROW_LEFT +
              '</div>' +
              '<div class="sc-post-nav-text">' +
                '<span class="sc-post-nav-badge">' + prevNum + ' • ÖNCEKİ KONU</span>' +
                '<span class="sc-post-nav-title">' + prevTopic.title + '</span>' +
              '</div>' +
            '</a>';
  }
  if(nextTopic){
    var nextNum = nextTopic.num < 10 ? '0' + nextTopic.num : String(nextTopic.num);
    html += '<a href="' + nextTopic.href + '" class="sc-post-nav-card sc-post-nav-next" aria-label="Sonraki Konu: ' + nextTopic.title + '">' +
              '<div class="sc-post-nav-text">' +
                '<span class="sc-post-nav-badge">' + nextNum + ' • SONRAKİ KONU</span>' +
                '<span class="sc-post-nav-title">' + nextTopic.title + '</span>' +
              '</div>' +
              '<div class="sc-post-nav-arrow-wrap sc-nav-right">' +
                SC_ARROW_RIGHT +
              '</div>' +
            '</a>';
  }
  nav.innerHTML = html;

  // Sıralama kuralı: 'ileri/geri tuşları' > K&K (note-properties) > Kaynaklar (footnotes)
  var np = art.querySelector('.note-properties');
  var fn = art.querySelector('section[data-footnotes], section.footnotes');
  if(np && np.parentNode === art){
    art.insertBefore(nav, np);
  } else if(fn && fn.parentNode === art){
    art.insertBefore(nav, fn);
  } else {
    art.appendChild(nav);
  }
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

// ── Header Efekt 3: Blurred Dissolve (Bilinçaltı Çözünmesi / Ethereal Fog) ──
function initFxBlurredDissolve(hdr){
  var nm=hdr.querySelector('.sh-name');if(!nm)return;
  var originalTxt=nm.textContent||'';
  var chars=originalTxt.split('');
  nm.innerHTML='';
  var spans=[];
  chars.forEach(function(ch){
    var sp=document.createElement('span');
    sp.textContent=ch;
    sp.className='sc-dissolve-char';
    sp.style.cssText='display:inline-block;transition:filter 0.28s cubic-bezier(0.16,1,0.3,1), transform 0.28s cubic-bezier(0.16,1,0.3,1), opacity 0.28s ease, color 0.28s ease;';
    nm.appendChild(sp);
    spans.push(sp);
  });

  function onMove(e){
    spans.forEach(function(sp){
      var r=sp.getBoundingClientRect();
      var cx=r.left+r.width/2, cy=r.top+r.height/2;
      var dist=Math.hypot(e.clientX-cx, e.clientY-cy);
      var radius=110;
      if(dist<radius){
        var intensity=1 - (dist/radius);
        var blurPx=(intensity * 9.5).toFixed(1);
        var op=(1 - intensity * 0.72).toFixed(2);
        var driftY=((e.clientY - cy) * 0.16).toFixed(1);
        var driftX=((e.clientX - cx) * 0.16).toFixed(1);
        var scale=(1 + intensity * 0.12).toFixed(2);
        sp.style.filter='blur(' + blurPx + 'px)';
        sp.style.opacity=op;
        sp.style.transform='translate(' + driftX + 'px,' + driftY + 'px) scale(' + scale + ')';
        sp.style.color='#C8102E';
        sp.style.textShadow='0 0 ' + (intensity * 16).toFixed(0) + 'px rgba(200,16,46,0.9), 0 0 ' + (intensity * 30).toFixed(0) + 'px rgba(138,3,3,0.7)';
      } else {
        sp.style.filter='blur(0px)';
        sp.style.opacity='1';
        sp.style.transform='none';
        sp.style.color='';
        sp.style.textShadow='none';
      }
    });
  }

  function onLeave(){
    spans.forEach(function(sp){
      sp.style.filter='blur(0px)';
      sp.style.opacity='1';
      sp.style.transform='none';
      sp.style.color='';
      sp.style.textShadow='none';
    });
  }

  hdr.addEventListener('mousemove', onMove);
  hdr.addEventListener('mouseleave', onLeave);
  hdr.__scFxClean=function(){
    hdr.removeEventListener('mousemove', onMove);
    hdr.removeEventListener('mouseleave', onLeave);
    nm.innerHTML=originalTxt;
    nm.style.filter='';
  };
}

// ── Header Efekt 4: Rorschach Sıvı Deformasyonu (Ink Melt) ──
function initFx4(hdr){
  var nm=hdr.querySelector('.sh-name');if(!nm)return;
  var svgFilterId='sc-rorschach-filter';
  var svg=document.getElementById('sc-rorschach-svg');
  if(!svg){
    svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.id='sc-rorschach-svg';
    svg.style.cssText='position:absolute;width:0;height:0;pointer-events:none;';
    svg.innerHTML='<filter id="'+svgFilterId+'"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="2" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" id="sc-rorschach-disp"/></filter>';
    document.body.appendChild(svg);
  }
  var disp=document.getElementById('sc-rorschach-disp');
  nm.style.filter='url(#'+svgFilterId+')';

  var scale=0, targetScale=0, rafId=null;
  function frame(){
    scale+=(targetScale-scale)*0.1;
    if(disp) disp.setAttribute('scale', scale.toFixed(2));
    if(Math.abs(targetScale-scale)>0.05){
      rafId=requestAnimationFrame(frame);
    } else {
      if(targetScale===0 && disp) disp.setAttribute('scale','0');
      rafId=null;
    }
  }

  function onMove(e){
    var r=nm.getBoundingClientRect();
    var dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2);
    var d=Math.sqrt(dx*dx+dy*dy);
    targetScale=Math.max(0, (180-d)/180)*22;
    if(!rafId) rafId=requestAnimationFrame(frame);
  }
  function onLeave(){
    targetScale=0;
    if(!rafId) rafId=requestAnimationFrame(frame);
  }

  hdr.addEventListener('mousemove',onMove);
  hdr.addEventListener('mouseleave',onLeave);
  hdr.__scFxClean=function(){
    cancelAnimationFrame(rafId);
    hdr.removeEventListener('mousemove',onMove);
    hdr.removeEventListener('mouseleave',onLeave);
    nm.style.filter='';
  };
}

// ── Header Efekt 5: Bilişsel Deşifre / Stroop Scramble (Interactive Kinetic Decrypt) ──
function initFx5(hdr){
  var nm=hdr.querySelector('.sh-name');if(!nm)return;
  var originalTxt=nm.textContent||'SAYKO';
  var glyphs=['Ψ','Φ','Ω','Ξ','Σ','λ','𓁹','𓉐','𓀗','Δ','θ','0','1','§','∞','¥','ø','µ','∿','⨀'];
  nm.innerHTML='';
  var spans=[];

  originalTxt.split('').forEach(function(ch){
    var s=document.createElement('span');
    s.textContent=ch;
    s.className='sc-decrypt-char';
    s.setAttribute('data-orig', ch);
    s.style.cssText='display:inline-block;cursor:crosshair;transition:color 0.15s ease, transform 0.15s ease;';
    nm.appendChild(s);
    spans.push(s);

    s.addEventListener('mouseenter', function(){
      scrambleChar(s, ch);
    });
  });

  function scrambleChar(el, finalChar){
    var count=0, max=6;
    var intId=setInterval(function(){
      count++;
      if(count<max){
        el.textContent=glyphs[Math.floor(Math.random()*glyphs.length)];
        el.style.color='#C8102E';
        el.style.transform='scale(1.15)';
      } else {
        clearInterval(intId);
        el.textContent=finalChar;
        el.style.color='';
        el.style.transform='none';
      }
    }, 40);
  }

  function cascadeDecrypt(){
    spans.forEach(function(s, i){
      setTimeout(function(){
        scrambleChar(s, s.getAttribute('data-orig'));
      }, i*70);
    });
  }
  cascadeDecrypt();

  hdr.addEventListener('mouseenter', cascadeDecrypt);
  hdr.__scFxClean=function(){
    hdr.removeEventListener('mouseenter', cascadeDecrypt);
    nm.innerHTML=originalTxt;
  };
}

// ── Header Efekt 6: Variable Font Canlı Deformasyon (Interactive Kinetic Weight) ──
function initFx6(hdr){
  var nm=hdr.querySelector('.sh-name');if(!nm)return;
  nm.style.fontFamily="'Fraunces', 'Syne', serif";
  nm.style.transition='letter-spacing 0.15s ease';
  var curW=400, targetW=400, rafId=null;

  function frame(){
    curW+=(targetW-curW)*0.12;
    nm.style.fontVariationSettings="'wght' " + curW.toFixed(0) + ", 'opsz' 72";
    nm.style.fontWeight=curW.toFixed(0);
    if(Math.abs(targetW-curW)>1){
      rafId=requestAnimationFrame(frame);
    } else {
      rafId=null;
    }
  }

  function onMove(e){
    var xRatio=Math.max(0, Math.min(1, e.clientX / window.innerWidth));
    targetW = 100 + xRatio * 800; // 100 (ultra-thin) to 900 (ultra-black)
    var lsp = (-0.02 + xRatio * 0.14).toFixed(3) + 'em';
    nm.style.letterSpacing=lsp;
    if(!rafId) rafId=requestAnimationFrame(frame);
  }

  function onLeave(){
    targetW=400;
    nm.style.letterSpacing='0.04em';
    if(!rafId) rafId=requestAnimationFrame(frame);
  }

  window.addEventListener('mousemove', onMove);
  hdr.addEventListener('mouseleave', onLeave);
  hdr.__scFxClean=function(){
    cancelAnimationFrame(rafId);
    window.removeEventListener('mousemove', onMove);
    hdr.removeEventListener('mouseleave', onLeave);
    nm.style.fontVariationSettings='';
    nm.style.fontWeight='';
    nm.style.letterSpacing='';
    nm.style.fontFamily='';
  };
}

// ── Header efekt koordinatörü — 7 seçkin efekt sırayla döner ──
function initHeaderFx(){
  if(window.innerWidth<800)return;
  var hdr=document.querySelector('.site-header');if(!hdr)return;
  if(typeof hdr.__scFxClean==='function')hdr.__scFxClean();
  var n=0;try{n=parseInt(localStorage.getItem('sayko_fx')||'0');}catch(e){}
  try{localStorage.setItem('sayko_fx',String((n+1)%7));}catch(e){}
  var fxList=[initFx0, initFx1, initFx2, initFxBlurredDissolve, initFx4, initFx5, initFx6];
  var fn=fxList[n%7];
  if(typeof fn==='function') fn(hdr);
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
// ── Görev 8: Backlinks + Etiketler SBB-kutusundan geçici olarak kaldırıldı ──
function scSbbExtras(){
  var sbb=document.getElementById('sc-sbb');if(!sbb)return;
  var extra=sbb.querySelector('.sc-sbb-extra');
  if(extra){extra.innerHTML='';extra.style.display='none';}
  var bl=document.querySelector('.backlinks');if(bl)bl.style.display='none';
  var np=document.querySelector('.note-properties');if(np)np.style.display='none';
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
  // Deprecated: Mail button moved to SBB toolbar
}
// ── Görev 3b: Konu makalesinde başlığın üstüne büyük, ortalı hiyeroglif ve Ders Rozeti ──
function scArticleGlyph(){
  var slug=document.body.getAttribute('data-slug')||'';
  if(slug.endsWith('/index')||slug===''||slug==='index'||slug==='404'||slug==='tum-yazilar')return; // yalnız yaprak makaleler
  var h=document.querySelector('.center .article-title, article .article-title');
  if(!h||h.getAttribute('data-sc-aglyph'))return;
  h.setAttribute('data-sc-aglyph','1');

  var parts=slug.split('/').filter(Boolean);
  var courseSlug=parts[0];
  var courseName=SC_MAP[courseSlug];

  var headerWrap=document.createElement('div');
  headerWrap.className='sc-article-header-meta';

  if(courseName){
    var eyebrow=document.createElement('a');
    eyebrow.className='sc-article-course-eyebrow';
    eyebrow.href='/'+courseSlug+'/';
    eyebrow.textContent=courseName;
    headerWrap.appendChild(eyebrow);
  }

  var gl=scGlyphFor(h.textContent||'');
  if(gl){
    var g=document.createElement('div');
    g.className='sc-article-glyph';
    g.setAttribute('aria-hidden','true');
    g.textContent=gl;
    headerWrap.appendChild(g);
  }

// ─── BETA 1: 3D Anatomik Korteks Ağı (Self-Contained 3D Connectome Engine) ───
function scOpen3DCortex(){
  var existing=document.getElementById('sc-cortex-modal');
  if(existing){ existing.remove(); return; }

  var modal=document.createElement('div');
  modal.id='sc-cortex-modal';
  modal.className='sc-cortex-modal';
  modal.innerHTML='<div class="sc-cortex-hud">' +
      '<div class="sc-cortex-hud-left">' +
        '<span class="sc-cortex-hud-badge">☾ 3D ANATOMİK KORTEKS AĞI • BETA</span>' +
        '<span class="sc-cortex-hud-hint">Sürükle: 360° Döndür • Tekerlek: Yakınlaş • Düğüme Tıkla: Konuya Git</span>' +
      '</div>' +
      '<button type="button" class="sc-cortex-close" aria-label="Kapat">✕</button>' +
    '</div>' +
    '<canvas id="sc-cortex-canvas"></canvas>' +
    '<div id="sc-cortex-tooltip" class="sc-cortex-tooltip"></div>';

  document.body.appendChild(modal);

  var canvas=modal.querySelector('#sc-cortex-canvas');
  var ctx=canvas.getContext('2d');
  var tooltip=modal.querySelector('#sc-cortex-tooltip');
  var closeBtn=modal.querySelector('.sc-cortex-close');

  function resize(){
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  var nodes=[];
  var lobes=[
    {name:'FRONTAL KORTEKS (Sol)', h:-1, z:0.8, y:-0.3, col:'#C8102E'},
    {name:'FRONTAL KORTEKS (Sağ)', h:1, z:0.8, y:-0.3, col:'#C8102E'},
    {name:'PARİYETAL KORTEKS (Sol)', h:-1, z:0.1, y:-0.8, col:'#d29b63'},
    {name:'PARİYETAL KORTEKS (Sağ)', h:1, z:0.1, y:-0.8, col:'#d29b63'},
    {name:'TEMPORAL KORTEKS (Sol)', h:-1.1, z:0.2, y:0.2, col:'#a84b3e'},
    {name:'TEMPORAL KORTEKS (Sağ)', h:1.1, z:0.2, y:0.2, col:'#a84b3e'},
    {name:'OKSİPİTAL KORTEKS (Sol)', h:-0.8, z:-0.9, y:-0.2, col:'#e64a19'},
    {name:'OKSİPİTAL KORTEKS (Sağ)', h:0.8, z:-0.9, y:-0.2, col:'#e64a19'},
    {name:'SEREBELLUM / BEYİNSAPI', h:0, z:-0.6, y:0.9, col:'#8A0303'}
  ];

  var cList=SC_COURSES||[];
  cList.forEach(function(c, i){
    var lb=lobes[i % lobes.length];
    var cx=(lb.h * 170) + (Math.random()-0.5)*40;
    var cy=(lb.y * 140) + (Math.random()-0.5)*35;
    var cz=(lb.z * 160) + (Math.random()-0.5)*40;
    var cNode={
      x:cx, y:cy, z:cz,
      r:6.5,
      name:c.name,
      href:'/'+c.slug+'/',
      lobe:lb.name,
      isCourse:true,
      color:lb.col
    };
    nodes.push(cNode);

    var topics=(typeof SC_TOPICS!=='undefined'&&SC_TOPICS)?SC_TOPICS[c.slug]:[];
    if(topics&&topics.length){
      var tSample=topics.slice(0, 6);
      tSample.forEach(function(t, ti){
        var ang=(ti / tSample.length) * Math.PI * 2;
        var rad=35 + Math.random()*25;
        nodes.push({
          x:cx + Math.cos(ang)*rad,
          y:cy + Math.sin(ang)*rad*0.7,
          z:cz + (Math.random()-0.5)*30,
          r:3.2,
          name:t.title,
          href:t.href,
          lobe:lb.name,
          parent:cNode,
          isCourse:false,
          color:lb.col
        });
      });
    }
  });

  var rotX=0.2, rotY=0.4;
  var targetRotX=0.2, targetRotY=0.4;
  var zoom=1.1, targetZoom=1.1;
  var isDragging=false, lastMouseX=0, lastMouseY=0;
  var hoveredNode=null;
  var rafId=null;

  function onMouseDown(e){
    if(e.target===canvas){
      isDragging=true;
      lastMouseX=e.clientX;
      lastMouseY=e.clientY;
    }
  }
  function onMouseMove(e){
    if(isDragging){
      var dx=e.clientX - lastMouseX;
      var dy=e.clientY - lastMouseY;
      targetRotY += dx * 0.006;
      targetRotX += dy * 0.006;
      lastMouseX=e.clientX;
      lastMouseY=e.clientY;
    }
    var rect=canvas.getBoundingClientRect();
    var mx=e.clientX - rect.left;
    var my=e.clientY - rect.top;
    var found=null;
    for(var i=nodes.length-1; i>=0; i--){
      var n=nodes[i];
      if(n._sx!==undefined && Math.hypot(n._sx - mx, n._sy - my) < (n.r * (n._scale||1) + 6)){
        found=n; break;
      }
    }
    hoveredNode=found;
    if(found){
      canvas.style.cursor='pointer';
      tooltip.style.display='block';
      tooltip.style.left=(e.clientX + 14)+'px';
      tooltip.style.top=(e.clientY + 14)+'px';
      tooltip.innerHTML='<div class="sc-tt-lobe">'+found.lobe+'</div><div class="sc-tt-title">'+found.name+'</div>';
    } else {
      canvas.style.cursor=isDragging?'grabbing':'grab';
      tooltip.style.display='none';
    }
  }
  function onMouseUp(){ isDragging=false; }
  function onWheel(e){
    e.preventDefault();
    targetZoom = Math.max(0.55, Math.min(2.4, targetZoom - e.deltaY * 0.0015));
  }
  function onClick(e){
    if(hoveredNode && hoveredNode.href){
      cleanup();
      window.location.href = hoveredNode.href;
    }
  }

  function render(){
    rotX += (targetRotX - rotX) * 0.1;
    rotY += (targetRotY - rotY) * 0.1;
    zoom += (targetZoom - zoom) * 0.1;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    var cx=canvas.width/2;
    var cy=canvas.height/2;
    var cosY=Math.cos(rotY), sinY=Math.sin(rotY);
    var cosX=Math.cos(rotX), sinX=Math.sin(rotX);
    var fov=460 * zoom;

    nodes.forEach(function(n){
      var x1 = n.x * cosY - n.z * sinY;
      var z1 = n.z * cosY + n.x * sinY;
      var y1 = n.y * cosX - z1 * sinX;
      var z2 = z1 * cosX + n.y * sinX + 500;

      var scale = fov / Math.max(10, z2);
      n._sx = cx + x1 * scale;
      n._sy = cy + y1 * scale;
      n._sz = z2;
      n._scale = scale;
    });

    ctx.lineWidth=0.9;
    nodes.forEach(function(n){
      if(n.parent){
        var alpha = Math.max(0.12, Math.min(0.75, 320 / n._sz));
        ctx.strokeStyle = n.color || '#C8102E';
        ctx.globalAlpha = alpha * 0.45;
        ctx.beginPath();
        ctx.moveTo(n._sx, n._sy);
        ctx.lineTo(n.parent._sx, n.parent._sy);
        ctx.stroke();
      }
    });

    ctx.globalAlpha=0.18;
    ctx.strokeStyle='#C8102E';
    for(var b=0; b<nodes.length-4; b+=5){
      ctx.beginPath();
      ctx.moveTo(nodes[b]._sx, nodes[b]._sy);
      ctx.lineTo(nodes[b+3]._sx, nodes[b+3]._sy);
      ctx.stroke();
    }

    nodes.sort(function(a,b){ return b._sz - a._sz; });

    nodes.forEach(function(n){
      var isHov = (hoveredNode === n);
      var radius = n.r * n._scale * (isHov ? 1.5 : 1);
      ctx.globalAlpha = Math.max(0.25, Math.min(1, 460 / n._sz));
      ctx.fillStyle = isHov ? '#ffffff' : n.color;
      ctx.beginPath();
      ctx.arc(n._sx, n._sy, Math.max(1.8, radius), 0, Math.PI*2);
      ctx.fill();

      if(n.isCourse || isHov){
        ctx.fillStyle = isHov ? '#ffffff' : '#e6e2da';
        ctx.font = (isHov ? '600 11px' : '500 9px') + ' "Josefin Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(n.name, n._sx, n._sy - radius - 5);
      }
    });

    rafId=requestAnimationFrame(render);
  }

  function onKeyDown(e){
    if(e.key==='Escape') cleanup();
  }

  function cleanup(){
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('keydown', onKeyDown);
    if(modal.parentNode) modal.remove();
  }

  modal.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('wheel', onWheel, {passive:false});
  canvas.addEventListener('click', onClick);
  closeBtn.addEventListener('click', cleanup);
  window.addEventListener('keydown', onKeyDown);

  rafId=requestAnimationFrame(render);
}

// ─── BETA 2: Typst İsviçre Klinik Monografi Dizgisi (Swiss Academic Monograph) ───
function scTriggerTypstMode(){
  var art=document.querySelector('.center article, article');
  if(!art){
    alert('Typst İsviçre Monografi Dizgisi bir makale sayfasında açılabilir.');
    return;
  }
  var isTypst=document.body.classList.toggle('sc-typst-active');
  var banner=document.getElementById('sc-typst-banner');
  if(isTypst){
    if(!banner){
      banner=document.createElement('div');
      banner.id='sc-typst-banner';
      banner.className='sc-typst-banner';
      banner.innerHTML='<div class="sc-typst-bar">' +
          '<div class="sc-typst-title">🞢 TYPST İSVİÇRE MONOGRAFİ DİZGİSİ (BETA)</div>' +
          '<div class="sc-typst-actions">' +
            '<button type="button" class="sc-typst-btn sc-typst-print" onclick="window.print()">PDF Olarak Kaydet / Yazdır</button>' +
            '<button type="button" class="sc-typst-btn sc-typst-close" onclick="scTriggerTypstMode()">Normale Dön ✕</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(banner);
    }
  } else {
    if(banner) banner.remove();
  }
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
  scPostNav();
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
    var a=li.querySelector('.desc h3 a')||li.querySelector('a');if(!a)return;
    var t=(a.textContent||'').trim().toLowerCase();
    var href=decodeURIComponent((a.getAttribute('href')||'')).normalize('NFC').replace(/^[.][.][/]|^[.][/]/,'').replace(/[/]+$/,'');
    var isCourse = SC_MAP[href] || (href.indexOf('/') === -1 && SC_MAP[href]);
    if(t==='sayko.ch'||t==='home'||t==='tüm yazılar'||t==='tum-yazilar'||href===''||href==='.'||href==='index'||href.endsWith('/index')||isCourse){
      li.remove();
    }
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
  requestAnimationFrame(function(){requestAnimationFrame(scFitHex);requestAnimationFrame(scPostNav);});
  if(document.fonts&&document.fonts.ready&&document.fonts.ready.then){document.fonts.ready.then(function(){scFitHex();scPostNav();});}
  

// ─── KAVRAMLAR & KELİMELER (SÖZLÜK) & AKORDİYON SİSTEMİ ───────────
var SC_GLOSSARY = [];
function scFetchGlossary(cb){
  if(SC_GLOSSARY.length > 0){ if(cb) cb(SC_GLOSSARY); return; }
  fetch('/static/sc-glossary.json')
    .then(function(r){ return r.json(); })
    .then(function(data){ SC_GLOSSARY = data || []; if(cb) cb(SC_GLOSSARY); })
    .catch(function(){ if(cb) cb([]); });
}

function scInitAccordions(){
  // Process articles
  document.querySelectorAll('article, .center article').forEach(function(art){
    // Remove any legacy "Kavramlar ve Dipnotlar" headings and their surrounding dividers
    art.querySelectorAll('h2, h3, h4').forEach(function(h){
      var txt = (h.textContent || '').trim().toLowerCase();
      if(txt === 'kavramlar ve dipnotlar' || txt === 'dipnotlar' || txt === 'kavramlar & dipnotlar'){
        var p = h.previousElementSibling;
        if(p && (p.tagName === 'HR' || (p.classList && (p.classList.contains('sc-hr-serpent') || p.classList.contains('sc-serpent-div'))))) p.remove();
        var n = h.nextElementSibling;
        if(n && (n.tagName === 'HR' || (n.classList && (n.classList.contains('sc-hr-serpent') || n.classList.contains('sc-serpent-div'))))) n.remove();
        h.remove();
      }
    });

    // 1. KAVRAMLAR & KELİMELER (Footnotes Accordion - Default Closed)
    var fnSec = art.querySelector('.footnotes, section[data-footnotes]');
    var fnDet = null;
    if(fnSec && !fnSec.getAttribute('data-sc-fn-acc')){
      fnSec.setAttribute('data-sc-fn-acc', '1');

      // Remove internal Footnotes / Dipnotlar headings
      fnSec.querySelectorAll('h2, h3, h4, #footnote-label, .sr-only').forEach(function(h){
        h.remove();
      });

      // Remove preceding dividers (hr / serpent lines)
      var prev = fnSec.previousElementSibling;
      while(prev && (prev.tagName === 'HR' || (prev.classList && (prev.classList.contains('sc-hr-serpent') || prev.classList.contains('sc-serpent-div'))))){
        var toDel = prev;
        prev = prev.previousElementSibling;
        toDel.remove();
      }

      var lis = fnSec.querySelectorAll('ol > li, ul > li, li');
      var countText = lis.length ? ' (' + lis.length + ' Kavram)' : '';

      fnDet = document.createElement('details');
      fnDet.className = 'sc-acc sc-footnotes-acc';

      var sum = document.createElement('summary');
      sum.className = 'sc-acc-header';
      sum.innerHTML = '<span class="sc-acc-glyph">𓅔</span><span class="sc-acc-title">Kavramlar & Kelimeler</span><span class="sc-acc-meta">' + countText + '</span><span class="sc-acc-chevron">▼</span>';
      fnDet.appendChild(sum);

      var bodyDiv = document.createElement('div');
      bodyDiv.className = 'sc-acc-body';

      while(fnSec.firstChild){
        bodyDiv.appendChild(fnSec.firstChild);
      }

      var moreDiv = document.createElement('div');
      moreDiv.className = 'sc-glossary-more-wrap';
      var moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'sc-open-all-btn';
      moreBtn.innerHTML = 'Tüm Kavramlar & Kelimeler (Sözlük) &rarr;';
      moreBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        scOpenGlossary();
      });
      moreDiv.appendChild(moreBtn);
      bodyDiv.appendChild(moreDiv);

      fnDet.appendChild(bodyDiv);
      fnSec.appendChild(fnDet);
    } else if(art.querySelector('.sc-footnotes-acc')){
      fnDet = art.querySelector('.sc-footnotes-acc');
    }

    // 2. KAYNAKLAR (Kaynakça Accordion - Default Closed & Thin Red Dividers)
    var refDet = null;
    var h2s = art.querySelectorAll('h2, h3, h4');
    h2s.forEach(function(h2){
      var t = (h2.textContent || '').trim().toLowerCase();
      if((t === 'kaynaklar' || t === 'kaynakça' || t === 'kaynak') && !h2.getAttribute('data-sc-ref-acc')){
        h2.setAttribute('data-sc-ref-acc', '1');

        var refItems = [];
        var nodesToRemove = [h2];
        var next = h2.nextElementSibling;
        while(next){
          if(next.tagName && next.tagName.match(/^H[1-6]$/)) break;
          if(next.classList && (next.classList.contains('footnotes') || next.classList.contains('sc-footnotes-acc') || next.classList.contains('sc-acc'))) break;
          
          if(next.tagName === 'UL' || next.tagName === 'OL'){
            next.querySelectorAll('li').forEach(function(li){
              refItems.push(li.innerHTML);
            });
            nodesToRemove.push(next);
          } else if(next.tagName === 'P'){
            var pText = next.innerHTML.trim();
            if(pText){
              refItems.push(pText);
            }
            nodesToRemove.push(next);
          } else if(next.tagName === 'HR' || (next.classList && (next.classList.contains('sc-hr-serpent') || next.classList.contains('sc-serpent-div')))){
            nodesToRemove.push(next);
          }
          next = next.nextElementSibling;
        }

        if(refItems.length > 0){
          var countText = ' (' + refItems.length + ' Kaynak)';
          refDet = document.createElement('details');
          refDet.className = 'sc-acc sc-references-acc';

          var sum = document.createElement('summary');
          sum.className = 'sc-acc-header';
          sum.innerHTML = '<span class="sc-acc-glyph">𓆄</span><span class="sc-acc-title">Kaynaklar</span><span class="sc-acc-meta">' + countText + '</span><span class="sc-acc-chevron">▼</span>';
          refDet.appendChild(sum);

          var bodyDiv = document.createElement('div');
          bodyDiv.className = 'sc-acc-body';
          var ul = document.createElement('ul');
          refItems.forEach(function(html){
            var li = document.createElement('li');
            li.innerHTML = html;
            ul.appendChild(li);
          });
          bodyDiv.appendChild(ul);
          refDet.appendChild(bodyDiv);

          nodesToRemove.forEach(function(node){
            node.remove();
          });
        }
      }
    });

    if(!refDet && art.querySelector('.sc-references-acc')){
      refDet = art.querySelector('.sc-references-acc');
    }

    // 3. STRICT BOTTOM PLACEMENT: 1. Kavramlar & Kelimeler -> 2. Kaynaklar (EN ALTA)
    if(fnDet){
      var p = fnDet.previousElementSibling;
      while(p && (p.tagName === 'HR' || (p.classList && (p.classList.contains('sc-hr-serpent') || p.classList.contains('sc-serpent-div'))))){
        var d = p; p = p.previousElementSibling; d.remove();
      }
      if(fnSec && fnSec.parentNode === art){
        art.appendChild(fnSec);
      } else {
        art.appendChild(fnDet);
      }
    }
    if(refDet){
      art.appendChild(refDet);
    }
  });

  // Modal setup
  var gm = document.getElementById('sc-glossary-modal');
  if(!gm){
    gm = document.createElement('div');
    gm.id = 'sc-glossary-modal';
    gm.className = 'sc-modal-overlay';
    gm.innerHTML = [
      '<div class="sc-modal-box sc-glossary-box">',
      '  <div class="sc-modal-header">',
      '    <div class="sc-modal-title-group">',
      '      <span class="sc-modal-title"><span class="sc-modal-glyph">𓅔</span> Kavramlar & Kelimeler</span>',
      '      <span class="sc-modal-subtitle" id="sc-glossary-count">Sözlük Yükleniyor...</span>',
      '    </div>',
      '    <input type="text" id="sc-glossary-search" placeholder="Kavram veya terim ara..." autocomplete="off">',
      '    <button type="button" class="sc-modal-close" title="Kapat (ESC)">✕</button>',
      '  </div>',
      '  <div class="sc-glossary-letters" id="sc-glossary-letters"></div>',
      '  <div class="sc-glossary-list" id="sc-glossary-list"></div>',
      '</div>'
    ].join('');
    document.body.appendChild(gm);

    gm.querySelector('.sc-modal-close').addEventListener('click', scCloseGlossary);
    gm.addEventListener('click', function(e){
      if(e.target === gm) scCloseGlossary();
    });

    var sInput = gm.querySelector('#sc-glossary-search');
    if(sInput){
      sInput.addEventListener('input', function(){
        scRenderGlossaryList(sInput.value.trim().toLowerCase());
      });
    }
  }

  // 3. SEARCH INTEGRATION (Sitedeki arama kutusu sözlük terimlerini de bulur)
  scInitSearchGlossary();
}

function scInitSearchGlossary(){
  scFetchGlossary(function(terms){
    var searchBars = document.querySelectorAll('.search-bar, input[name="search"]');
    searchBars.forEach(function(sb){
      if(sb.getAttribute('data-sc-gsearch')) return;
      sb.setAttribute('data-sc-gsearch', '1');

      sb.addEventListener('input', function(){
        var q = sb.value.trim().toLowerCase();
        if(q.length < 2) return;

        var matches = terms.filter(function(item){
          return (item.term || '').toLowerCase().indexOf(q) !== -1 || (item.desc || '').toLowerCase().indexOf(q) !== -1;
        });

        if(matches.length > 0){
          setTimeout(function(){
            var layout = document.querySelector('.search-layout');
            if(layout && !layout.querySelector('.sc-search-glossary-group')){
              var gGroup = document.createElement('div');
              gGroup.className = 'sc-search-glossary-group';
              var gHdr = document.createElement('div');
              gHdr.className = 'sc-search-g-title';
              gHdr.textContent = 'Kavramlar & Kelimeler (' + matches.length + ')';
              gGroup.appendChild(gHdr);

              matches.slice(0, 4).forEach(function(m){
                var itemEl = document.createElement('div');
                itemEl.className = 'sc-search-g-item';
                itemEl.innerHTML = '<strong>' + m.term + '</strong>: ' + (m.desc.length > 70 ? m.desc.slice(0, 70) + '...' : m.desc);
                itemEl.addEventListener('click', function(e){
                  e.preventDefault();
                  scOpenGlossary(m.term);
                });
                gGroup.appendChild(itemEl);
              });

              layout.insertBefore(gGroup, layout.firstChild);
            }
          }, 120);
        }
      });
    });
  });
}

function scRenderGlossaryList(query){
  var gm = document.getElementById('sc-glossary-modal');
  if(!gm) return;
  var list = gm.querySelector('#sc-glossary-list');
  var lettersBar = gm.querySelector('#sc-glossary-letters');
  var countEl = gm.querySelector('#sc-glossary-count');
  if(!list) return;

  if(countEl){
    countEl.textContent = SC_GLOSSARY.length + ' Psikoloji Terimi';
  }

  var filtered = SC_GLOSSARY.filter(function(item){
    if(!query) return true;
    return (item.term || '').toLowerCase().indexOf(query) !== -1 || (item.desc || '').toLowerCase().indexOf(query) !== -1;
  });

  list.innerHTML = '';
  if(filtered.length === 0){
    list.innerHTML = '<div class="sc-glossary-empty">Aranan kavram bulunamadı.</div>';
    return;
  }

  var letterSet = {};
  filtered.forEach(function(item){
    var firstChar = (item.term || '').charAt(0).toUpperCase();
    if(firstChar) letterSet[firstChar] = true;
  });

  if(lettersBar && !query){
    lettersBar.innerHTML = Object.keys(letterSet).sort().map(function(char){
      return '<a href="#sc-letter-' + char + '" class="sc-letter-link">' + char + '</a>';
    }).join(' ');
  } else if(lettersBar) {
    lettersBar.innerHTML = '';
  }

  var currentLetter = '';
  filtered.forEach(function(item){
    var firstChar = (item.term || '').charAt(0).toUpperCase();
    if(firstChar !== currentLetter && !query){
      currentLetter = firstChar;
      var lHdr = document.createElement('div');
      lHdr.id = 'sc-letter-' + currentLetter;
      lHdr.className = 'sc-glossary-letter-hdr';
      lHdr.textContent = currentLetter;
      list.appendChild(lHdr);
    }

    var card = document.createElement('div');
    card.className = 'sc-glossary-card';
    var sourcesHtml = (item.sources || []).map(function(src){
      return '<a href="' + src.url + '" class="sc-term-source-badge" data-no-popover="true">' + src.title + '</a>';
    }).join('');

    card.innerHTML = [
      '<div class="sc-term-title">' + item.term + '</div>',
      '<div class="sc-term-desc">' + item.desc + '</div>',
      '<div class="sc-term-sources"><span class="sc-source-label">Kaynak Yazılar:</span> ' + sourcesHtml + '</div>'
    ].join('');
    list.appendChild(card);
  });
}

function scOpenGlossary(searchTerm){
  scInitAccordions();
  var gm = document.getElementById('sc-glossary-modal');
  if(!gm) return;
  var sInput = gm.querySelector('#sc-glossary-search');
  if(sInput){
    sInput.value = searchTerm || '';
  }
  scFetchGlossary(function(){
    scRenderGlossaryList(searchTerm ? searchTerm.toLowerCase() : '');
  });
  gm.classList.add('sc-active');
  document.body.classList.add('sc-modal-open');
  if(sInput && !searchTerm) setTimeout(function(){ sInput.focus(); }, 100);
}
window.scOpenGlossary = scOpenGlossary;

function scCloseGlossary(){
  var gm = document.getElementById('sc-glossary-modal');
  if(gm) gm.classList.remove('sc-active');
  document.body.classList.remove('sc-modal-open');
}
window.scCloseGlossary = scCloseGlossary;

// ─── SYNAPTIC HIVE FULLSCREEN MODAL SİSTEMİ ───────────────────────────
function scFindDiagramSvg(wrap){
  if(!wrap) return null;
  var mSvg = wrap.querySelector('.mermaid svg, svg[id^="mermaid-"]');
  if(mSvg) return mSvg;
  var svgs = wrap.querySelectorAll('svg');
  for(var i=0; i<svgs.length; i++){
    var s = svgs[i];
    if(s.classList && (s.classList.contains('external-icon') || s.classList.contains('sc-progress-serpent') || s.classList.contains('sc-serpent-div'))) continue;
    if(s.closest('a.external, a.external-link, .callout-title, .sc-diag-zoom-btn')) continue;
    return s;
  }
  return null;
}

function scInitDiagramModal(){
  var dm = document.getElementById('sc-diagram-modal');
  if(!dm){
    dm = document.createElement('div');
    dm.id = 'sc-diagram-modal';
    dm.className = 'sc-modal-overlay';
    dm.innerHTML = [
      '<div class="sc-modal-box sc-diagram-box">',
      '  <div class="sc-modal-header">',
      '    <div class="sc-modal-title" id="sc-diag-modal-title">Diyagram Görünümü</div>',
      '    <button type="button" class="sc-modal-close" title="Kapat (ESC)">✕</button>',
      '  </div>',
      '  <div class="sc-diagram-modal-content" id="sc-diagram-modal-content"></div>',
      '</div>'
    ].join('');
    document.body.appendChild(dm);

    dm.querySelector('.sc-modal-close').addEventListener('click', scCloseDiagramModal);
    dm.addEventListener('click', function(e){
      if(e.target === dm) scCloseDiagramModal();
    });
  }

  // Attach bespoke zoom buttons to all callout diagrams & mermaid containers
  document.querySelectorAll('.callout[data-callout="abstract"], .mermaid, div.mermaid, pre:has(> code.mermaid)').forEach(function(wrap){
    var svg = scFindDiagramSvg(wrap);
    if(!svg && !wrap.classList.contains('mermaid') && !wrap.querySelector('pre > code.mermaid')) return;
    if(wrap.getAttribute('data-sc-diag-ready')) return;
    wrap.setAttribute('data-sc-diag-ready', '1');
    wrap.style.position = 'relative';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sc-diag-zoom-btn';
    btn.innerHTML = 'İncele';
    btn.title = 'Tam Ekran Görünüm (Tek Tıklama)';
    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      var targetSvg = scFindDiagramSvg(wrap);
      var title = (wrap.querySelector('.callout-title-inner, .callout-title') || {}).textContent || 'Diyagram Görünümü';
      if(targetSvg) scOpenDiagramModal(targetSvg, title);
    });
    wrap.appendChild(btn);

    wrap.addEventListener('click', function(e){
      if(e.target.closest('a, button, input, label')) return;
      var targetSvg = scFindDiagramSvg(wrap);
      if(targetSvg){
        e.preventDefault();
        var title = (wrap.querySelector('.callout-title-inner, .callout-title') || {}).textContent || 'Diyagram Görünümü';
        scOpenDiagramModal(targetSvg, title);
      }
    });
  });
}

function scOpenDiagramModal(svgEl, titleText){
  scInitDiagramModal();
  var dm = document.getElementById('sc-diagram-modal');
  if(!dm) return;
  var cont = dm.querySelector('#sc-diagram-modal-content');
  var titleEl = dm.querySelector('#sc-diag-modal-title');
  if(titleEl && titleText) titleEl.textContent = titleText.trim();
  if(!cont) return;
  cont.innerHTML = '';
  
  var cloned = svgEl.cloneNode(true);
  cloned.removeAttribute('width');
  cloned.removeAttribute('height');
  cloned.style.width = '100%';
  cloned.style.maxWidth = '1100px';
  cloned.style.maxHeight = '78vh';
  cloned.style.height = 'auto';
  cloned.style.display = 'block';
  cloned.style.margin = 'auto';
  cont.appendChild(cloned);
  
  dm.classList.add('sc-active');
  document.body.classList.add('sc-modal-open');
}

function scCloseDiagramModal(){
  var dm = document.getElementById('sc-diagram-modal');
  if(dm) dm.classList.remove('sc-active');
  document.body.classList.remove('sc-modal-open');
}

// ─── BIONIC READING MOTORU ──────────────────────────────────────────
function scToggleBionicReading(){
  var isFocus = document.body.classList.toggle('is-focus');
  var isBionic = document.body.classList.toggle('is-bionic');
  try { localStorage.setItem('sc_bionic', isBionic ? '1' : '0'); } catch(e){}

  var targets = document.querySelectorAll('article p, article li, article blockquote');
  targets.forEach(function(el){
    if(isBionic){
      if(!el.getAttribute('data-sc-orig-html')){
        el.setAttribute('data-sc-orig-html', el.innerHTML);
      }
      scApplyBionicToTextNodes(el);
    } else {
      var orig = el.getAttribute('data-sc-orig-html');
      if(orig){
        el.innerHTML = orig;
        el.removeAttribute('data-sc-orig-html');
      }
    }
  });
}
window.scToggleBionicReading = scToggleBionicReading;

function scApplyBionicToTextNodes(node){
  if(node.nodeType === Node.TEXT_NODE){
    var text = node.nodeValue;
    if(!text || !text.trim()) return;
    var span = document.createElement('span');
    span.className = 'sc-bionic-transformed';
    span.innerHTML = text.replace(/([a-zA-Z0-9çğıöşüÇĞİÖŞÜ]+)/g, function(w){
      var len = w.length;
      if(len <= 1) return w;
      var mid = len <= 3 ? 1 : (len <= 6 ? 2 : Math.ceil(len / 2) - 1);
      return '<b class="sc-bionic-b">' + w.slice(0, mid) + '</b>' + w.slice(mid);
    });
    node.parentNode.replaceChild(span, node);
  } else if(node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('katex') && !node.classList.contains('sc-gfx-card') && !node.classList.contains('sc-bionic-transformed') && !node.classList.contains('sc-sdt-simulator')){
    Array.from(node.childNodes).forEach(scApplyBionicToTextNodes);
  }
}

// ── SAYKO.ch Standart Medya / Görsel Çerçevesi (Otomatik Frame Entegrasyonu) ──
function scEnhanceMedia(){
  document.querySelectorAll('article img, .center img').forEach(function(img){
    if(img.closest('figure, .sc-media-frame, .sc-img-frame, .sc-gfx-container, #sc-clock, .sc-toolbtn, .callout, .sc-sbb-foot')) return;
    var figure=document.createElement('figure');
    figure.className='sc-media-frame';
    img.parentNode.insertBefore(figure, img);
    figure.appendChild(img);
    var capText=img.getAttribute('alt') || img.getAttribute('title');
    if(capText && capText.trim() && !capText.startsWith('http') && !capText.endsWith('.png') && !capText.endsWith('.jpg') && !capText.endsWith('.svg')){
      var figcap=document.createElement('figcaption');
      figcap.className='sc-media-caption';
      figcap.textContent=capText;
      figure.appendChild(figcap);
    }
  });
}

// ─── MEDIUM-ZOOM GÖRSEL MODALI (Tek Tıklama) ─────────────────────────

function scInjectCourseHero(){
  var pl = document.querySelector('.page-listing');
  if(!pl || pl.getAttribute('data-sc-hero-ready')) return;
  pl.setAttribute('data-sc-hero-ready', '1');

  var path = decodeURIComponent(window.location.pathname).replace(/^[/]|[/]$/g, '');
  var seg = path.split('/')[0];
  var matchedCourse = null;
  for(var i=0; i<SC_GRID.length; i++){
    if(SC_GRID[i].slug === seg || seg.indexOf(SC_GRID[i].slug) !== -1 || SC_GRID[i].slug.indexOf(seg) !== -1){
      matchedCourse = SC_GRID[i];
      break;
    }
  }
  if(matchedCourse){
    var existingHero = document.querySelector('.sc-course-hero-header');
    if(!existingHero){
      var hero = document.createElement('div');
      hero.className = 'sc-course-hero-header';
      hero.innerHTML = '<div class="sc-course-hero-badge"><span class="sc-course-hero-icon">' + matchedCourse.svg + '</span><span class="sc-course-hero-num">' + matchedCourse.n + '</span></div><h1 class="sc-course-hero-title">' + matchedCourse.name + '</h1>';
      pl.parentNode.insertBefore(hero, pl);
    }
  }
}

function scInitMediaZoom(){
  scEnhanceMedia();
  var mm = document.getElementById('sc-media-modal');
  if(!mm){
    mm = document.createElement('div');
    mm.id = 'sc-media-modal';
    mm.className = 'sc-media-modal';
    mm.innerHTML = '<img id="sc-media-modal-img" src="" alt=""><div id="sc-media-modal-cap" style="position:absolute;bottom:20px;color:#ece7dd;font-style:italic;font-size:0.9rem;text-align:center;padding:0 20px;"></div>';
    document.body.appendChild(mm);

    mm.addEventListener('click', function(){
      mm.classList.remove('sc-active');
      document.body.classList.remove('sc-modal-open');
    });
  }

  document.querySelectorAll('article img, .center img, figure img, .sc-media-frame img, .sc-img-frame img, .sc-gfx-container img').forEach(function(img){
    if(img.closest('#sc-clock, .sc-toolbtn, .sc-sbb-foot, button, a')) return;
    img.style.cursor = 'zoom-in';
    if(img.getAttribute('data-sc-zoom-ready')) return;
    img.setAttribute('data-sc-zoom-ready', '1');

    img.addEventListener('click', function(e){
      if(e.target.closest('a, button')) return;
      e.preventDefault();
      e.stopPropagation();
      var modalImg = mm.querySelector('#sc-media-modal-img');
      var modalCap = mm.querySelector('#sc-media-modal-cap');
      if(modalImg){
        modalImg.src = img.src;
        modalImg.alt = img.alt || '';
      }
      var captionText = img.getAttribute('alt') || img.getAttribute('title') || '';
      var parentFig = img.closest('figure, .sc-media-frame, .sc-img-frame, .sc-gfx-frame');
      if(parentFig){
        var capEl = parentFig.querySelector('figcaption, .sc-media-caption, .sc-img-caption, .sc-gfx-caption');
        if(capEl) captionText = capEl.textContent || captionText;
      }
      if(modalCap) modalCap.textContent = captionText;
      mm.classList.add('sc-active');
      document.body.classList.add('sc-modal-open');
    });
  });
}

// ─── CANLI SDT (Sinyal Algılama) SİMÜLATÖRÜ ─────────────────────────
function scInitSdtSimulator(){
  var sim = document.getElementById('sc-sdt-sim');
  if(!sim) return;

  var slDprime = sim.querySelector('#sdt-dprime');
  var slBeta = sim.querySelector('#sdt-beta');
  var vDprime = sim.querySelector('#val-dprime');
  var vBeta = sim.querySelector('#val-beta');
  var vCritName = sim.querySelector('#val-crit-name');

  var pHit = sim.querySelector('#sdt-pct-hit');
  var pFa = sim.querySelector('#sdt-pct-fa');
  var pMiss = sim.querySelector('#sdt-pct-miss');
  var pCr = sim.querySelector('#sdt-pct-cr');

  // Approximation of Normal CDF
  function phi(x){
    var a1 =  0.254829592, a2 = -0.284496736, a3 =  1.421413741;
    var a4 = -1.453152027, a5 =  1.061405429, p  =  0.3275911;
    var sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2.0);
    var t = 1.0 / (1.0 + p * x);
    var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return 0.5 * (1.0 + sign * y);
  }

  function updateSdt(){
    var d = parseFloat(slDprime.value);
    var c = parseFloat(slBeta.value);

    if(vDprime) vDprime.textContent = d.toFixed(1);
    if(vBeta) vBeta.textContent = c.toFixed(1);

    if(vCritName){
      if(c < -0.4) vCritName.textContent = 'Mülayim / Serbest (Her şeye "Evet")';
      else if(c > 0.4) vCritName.textContent = 'Kevser / Tutucu (Kasıntı / "Hayır")';
      else vCritName.textContent = 'Nötr / Rasyonel';
    }

    var hitRate = phi(d / 2 - c);
    var faRate = phi(-d / 2 - c);
    var missRate = 1 - hitRate;
    var crRate = 1 - faRate;

    if(pHit) pHit.textContent = '%' + Math.round(hitRate * 100);
    if(pFa) pFa.textContent = '%' + Math.round(faRate * 100);
    if(pMiss) pMiss.textContent = '%' + Math.round(missRate * 100);
    if(pCr) pCr.textContent = '%' + Math.round(crRate * 100);
  }

  if(slDprime) slDprime.addEventListener('input', updateSdt);
  if(slBeta) slBeta.addEventListener('input', updateSdt);
  updateSdt();
}

document.addEventListener('keydown', function(e){
  if(e.key === 'Escape' || e.key === 'Esc'){
    scCloseGlossary();
    scCloseDiagramModal();
    var mm = document.getElementById('sc-media-modal');
    if(mm) mm.classList.remove('sc-active');
  }
});

  scInitAccordions();
  scInitDiagramModal();
  scInitMediaZoom();
  scInitSdtSimulator();
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
