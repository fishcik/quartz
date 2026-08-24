#  SİKİLDİ.md — `sayko.ch` Evrensel İçerik, Tipografi, Felsefe ve Bilimsel Görselleştirme Anayasası

> **"Psikoloji: Kitapta durduğu gibi durmaz. Teori biter, maruz kalma başlar."**

Bu anayasa; `sayko.ch` üzerindeki tüm makalelerin metin formatını, edebi/serseri üslubunu, tipografisini, nöral ağ (graph) bağlantılarını, kavram sözlüğünü (K&K), akademik kaynakçasını ve bilimsel/kavramsal modellerini tek bir atomik süreçte **İsviçre saati hassasiyetinde** üretmek ve denetlemek için oluşturulmuş **nihai süper-protokoldür**.

---

##  İçindekiler

- [[#1. DOKUNULMAZ ALAN — Yazının Sesi ve Ruhu]]
- [[#2. Felsefi Temeller: Karpathy Sadeliği & Kepano Dayanıklılığı]]
- [[#3. Frontmatter Standardı]]
- [[#4. Tipografi, Başlık ve Renk Hiyerarşisi]]
- [[#5. TOC — İçindekiler ve Sayfa Mimarisi]]
- [[#6. Nöral Ağ (Graph View) ve Wikilink Protokolü]]
- [[#7. Callout Haritası ve Görsel Ritim]]
- [[#8. K&K (Kavramlar & Kelimeler / Footnotes) Sistemi]]
- [[#9. Akademik Kaynakça — APA 7 Standardı]]
- [[#10. Görsel Felsefe: "Argue, Not Display" (İddia Et, Sergileme)]]
  - [[#10.1 İzomorfizm Testi]]
  - [[#10.2 Kutu Disiplini — < %30 Kuralı]]
  - [[#10.3 Multi-Zoom Katmanlaşması]]
- [[#11. Bilimsel Görselleştirme ve Vektör Mimarisi]]
  - [[#11.1 Alfanümerik Model Kodlama Standardı]]
  - [[#11.2 Saf Vektör (Inline Sayko SVG) İlkeleri]]
  - [[#11.3 Yüksek Kontrast ve Dinamik Tema Güvencesi]]
  - [[#11.4 Semantik Renk ve Çizgi Paleti]]
  - [[#11.5 Standart Callout Anatomisi]]
- [[#12. Tarihsel, Bilimsel ve Kültürel Orijinal Görseller / Arşiv Materyali]]
  - [[#12.1 Diyagramdan Farkı ve Kapsamı]]
  - [[#12.2 Telif ve Kamu Malı (Public Domain) Güvencesi]]
  - [[#12.3 Yerel-İlk (Local-First) Depolama Protokolü]]
  - [[#12.4 Bağlamsal Köprü ve İtalik Açıklama İlkesi]]
- [[#13. Yasaklı Tasarım Kalıpları (Forbidden Clichés)]]
- [[#14. Atomik Uygulama Workflow'u (Adım Adım)]]
- [[#15. Standart Çıktı & Değerlendirme Raporu Şablonu]]

---

## 1. DOKUNULMAZ ALAN — Yazının Sesi, Ruhu ve Bütünlüğü

> [!danger] KESİN VE TAVİZSİZ YASA: SIFIR SİLME & SIFIR YENİDEN YAZIM
> Asistan bir **YAZAR VEYA EDİTÖR DEĞİLDİR; YALNIZCA BİR DİZGİCİDİR (TYPESETTER / COMPILER)**. Yazarın metni bitmiş, kutsal ve dokunulmaz bir edebiyattır.
> 
> **Aşağıdaki eylemler KESİNLİKLE VE İSTİSNASIZ YASAKTIR:**
> 1.  **ASLA BLOK / PARAGRAF / HİKAYE / CÜMLE SİLİNEMEZ:** Metni "kartlara sığdırmak", "3 sütuna bölmek" ya da "özetlemek" bahanesiyle yazarın yazdığı tek bir paragraf, analoji, hikaye, argo, espri veya exkurs ASLA kesilemez, atılamaz veya özetlenemez.
> 2.  **ASLA YENİDEN YAZILAMAZ (NO RE-WRITING / NO PARAPHRASING):** Yazarın cümleleri "daha derli toplu olsun", "daha akıcı olsun" veya "yapay zekâ formatına uysun" diye baştan kurulamaz, sentetik jenerik metinlerle değiştirilemez.
> 3.  **ARAYA YAPAY AÇIKLAMA SIKIŞTIRILAMAZ:** Yazarın anlatmadığı hiçbir şey "bağlam kuruyorum" denilerek metnin arasına enjekte edilemez.

### 1.1 Metnin Dokunulmaz Unsurları
Formatlama yapılırken metnin **özüne, kelimelerine, üslubuna, edebi ritmine ve sesine harfi harfine sadık kalınır:**

- **Tam Metin Bütünlüğü:** Yazar 6.000 kelime verdiyse, çıktı en az 6.000 kelime olmak zorundadır. Kelime sayısını düşüren her formatlama denemesi **doğrudan sistem hatası ve kural ihlalidir**.
- **Noktalama Özgürlüğü:** `......`, `—`, virgülsüz akış, kesik cümleler — hepsi yazarın kasıtlı edebi tercihidir; düzeltilmez.
- **Kelime Seçimi ve Söz Dizimi:** Sokak dili, akademik kaymalar, "tabi", "bi", "yani:", "lan", "genco", "fiyasko", "bomba", "amına koyim" gibi samimi, sert ve otantik ifadeler harfi harfine korunur.
- **Cümle ve Paragraf Yapısı:** Yazar nerede nefes almış, nerede satır başı yapmışsa orada kalır. Paragraflar yapay olarak birleştirilmez veya bölünmez.
- **Mevcut Vurgular:** Yazarın koyduğu `==highlight==`, `*italik*` veya `**bold**` dengelerine dokunulmaz.
- **Sadece Sentaks Temizliği:** Yalnızca hatalı veya Markdown'ı kıran sentakslar temizlenir (Örn: `ben**bugün**` yerine `ben **bugün**`).

### 1.2 Asistanın Yetki Sınırı (Sadece Dizgi ve Altyapı)
Asistanın görevi yazarın metnini değiştirmek değil, metnin **etrafındaki** teknik altyapıyı kurmaktır:
1. Frontmatter eklemek (başlık, tarih, etiketler).
2. Metin başlıklarını TOC ile eşleştirmek.
3. K&K dipnotlarını (`[^kavram]`) yazarın metnindeki ilgili kelimelere iliştirmek ve tanımları en alta eklemek.
4. Kaynakçayı APA 7 standardında metnin en sonuna bağlamak.
5. Varsa istenen görseli metnin akışını bozmadan doğru konuma iliştirmek.

---

## 2. Felsefi Temeller: Karpathy Sadeliği & Kepano Dayanıklılığı

1. **Karpathy İlkesi (İlk İlkelerden Düşünme & Yalınlık):** 
   - Dışarıdan hantal kütüphaneler yükleme; yapabileceğin en hafif, en temiz ve en kararlı araçla çöz (Bkz: Kırılgan Mermaid yerine saf Inline SVG). 
   - Kodun ve şablonun her pikselinin neden orada olduğunu tam olarak bil.
2. **Kepano İlkesi (Dayanıklı Plain-Text Mimarisi):**
   - Yazılar 50 yıl sonra bile her Markdown okuyucusunda bozulmadan okunabilecek yalınlıkta olmalıdır.
   - Veri yapıları standart olmalı, platforma bağımlı karmaşık eklenti çöplüklerinden arındırılmalıdır.

---

## 3. Frontmatter Standardı

Vault veri düzenini, Quartz derleyicisini ve arama motorunu temiz tutmak için sadece üç zorunlu alan kullanılır:

```yaml
---
title: Notun Başlığı
date: 2026-06-25
tags:
  - sağlık-psikolojisi
  - beslenme-psikolojisi
---
```

- `date`: Her zaman ISO 8601 formatında (`YYYY-MM-DD`). Yazının gerçek yazım tarihi kesinlikle korunur!
- `tags`: YAML list formatında — tek satırda virgülle değil, her etiket ayrı satırda `- etiket` şeklinde.
- `aliases`, `cssclasses`, `status` gibi ekstra kalabalık alanlar eklenmez.

---

## 4. Tipografi, Başlık ve Renk Hiyerarşisi

Sitedeki tüm yazılar otantik bir edebi/akademik kimlikle render edilir:

| Öğe / Seviye | Font Ailesi | Renk & Stil | Açıklama |
| :--- | :--- | :--- | :--- |
| **Hero Başlık (`h1.article-title`)** | `Manufacturing Consent` | Normal Koyu Başlık | Glifin hemen altındaki asil sayfa başlığı (Markdown gövdesinde `#` tekrar yazılmaz). |
| **`h2` (Ana Bölüm Başlıkları)** | `Manufacturing Consent` | Cardinal Kırmızı (`#C8102E`) | Gotik/blackletter asil bölüm durakları (`## 1. Konu...`, `## 2. Konu...`). |
| **`## İçindekiler` (TOC Başlığı)** | `Playfair Display` | Sepia / Altın Vurgu | Zarif, küçük ve büyük harfli temiz içindekiler göstergesi. |
| **`h3` / `h4` (Alt Başlıklar)** | `Source Serif 4` / `Libre Baskerville` | İtalik / Yarı-Kalın | Akışı kesmeyen okunaklı alt konu başlıkları. |
| **Gövde Metni & Tanımlar** | `Libre Baskerville` | Nötr Gövde Rengi | Yüksek okunurluklu klasik serif gövde. |
| **K&K ve Kaynakça Başlıkları** | `Manufacturing Consent` | Cardinal Kırmızı (`#C8102E`) | `## Kaynaklar` veya akordiyon başlıkları. |
| **Metin İçi Vurgu & Renkler** | Inline CSS / Semantic | İsteğe Bağlı | `<span style="color:#C8102E">...</span>` veya `==highlight==`. |

---

## 5. TOC — İçindekiler ve Sayfa Mimarisi

Uzun notlarda (3 veya daha fazla ana başlık içeren) frontmatter'dan hemen sonra eklenir:

```markdown
## İçindekiler

- [[#1. Birinci Başlık]]
- [[#2. İkinci Başlık]]
  - [[#Alt Başlık]]
- [[#3. Üçüncü Başlık]]
```

- Mükerrer sayfa başlığı (`# Başlık`) gövdeye yazılmaz; Quartz doğrudan frontmatter'daki `title` alanını hero başlık olarak derler.
- TOC listesinde `1. [[#1. ...]]` yerine madde imi `- [[#1. ...]]` kullanılır.
- TOC içindeki linkler her zaman aynı not içi syntax olan `[[#Başlık]]` formatındadır.

---

## 6. Nöral Ağ (Graph View) ve Wikilink Protokolü

`sayko.ch` vault'u yaşayan bir nöral ağdır. Graph View'ın tam kapasite çalışması ve kopuk düğüm oluşmaması için:

```markdown
[[Not Adı]]                        Vault içi doğrudan link
[[Not Adı|Görünen Metin]]          Özel görünen metin ile bağlamsal link
[[Not Adı#Başlık]]                 Spesifik başlığa yönlendirme
[[#Aynı notta başlık]]             Aynı not içi başlık linki
```

1. **Birebir Eşleşme:** Wikilink hedefi vault'taki gerçek dosya adıyla harfi harfine eşleşmelidir.
2. **Çifte Linkleme:** Hem kavramların yalın halleri (`[[Öz-Yeterlilik]]`) hem de cümle akışındaki bağlamsal ifadeler (`[[Sağlık Modelleri|modellere yaklaşımımız]]`) linklenir.
3. **Şüphe Durumu:** Vault'ta karşılığı olup olmadığından emin olunmayan linkler Obsidian yorumu içine alınır: `%%KONTROL: bu dosya vault'ta var mı?%% [[Klinik Psikolojide Metotlar]]`.

---

## 7. Callout Haritası ve Görsel Ritim

Yazının "dümdüz bir metin bloku" gibi görünmesini engellemek ve okuma temposunu artırmak için uygun yerlerde semantik çağrı kutuları kullanılır:

| Callout Tipi | Ne Zaman Kullanılır? |
| :--- | :--- |
| `[!abstract]` | **Bilimsel modeller, görsel diyagramlar** ve bölüm süper-özetleri. |
| `[!info]` | Bağlamsal açıklama — "yani şu demek", tanım genişletme. |
| `[!note]` | Yan gözlem — parantez içi parlamaları dışarı alma, akışı kesmeyen notlar. |
| `[!tip]` | Pratik çıkarım, eylem ve uygulama önerisi. |
| `[!example]` | Somut vaka, analoji, senaryo. |
| `[!warning]` | Metodolojik tuzak, niyet-davranış açmazı, yaygın yanılgı. |
| `[!quote]` | Dış alıntı veya yazarın vurucu özet aforizması. |
| `[!question]` | Açık soru, okuyucuyu kışkırtan düşünce deneyi. |
| `[!danger]` | Kritik hata riski, yıkıcı kısırdöngü veya AVE uyarısı. |

---

## 8. K&K (Kavramlar & Kelimeler / Footnotes) Sistemi

Her yazının içinde geçen; genel okuyucunun veya alana daha az aşina olanların tam bilemeyeceği terimler, sendromlar ve jargonlar dipnot olarak işaretlenir:

- **Sayı Dengesi:** Yazının yoğunluğuna göre **en az 3, en fazla 11** kavram seçilir.
- **Seçim Kriteri (Altın Kural):** Metin içinde zaten ana konu olarak uzun uzadıya açıklanan/tanımlanan modeller veya kavramlar (örn. HBM, TPB, HAPA, Biyomedikal Model gibi ana başlıklar) K&K dipnotu yapılmaz. K&K dipnotları; metinde sadece ismi geçen, arka plandaki tıbbi/istatistiksel/biyolojik terimler, merak uyandıran veya okurun bilmeme ihtimali olan yan kavramlar ve jargonlar için açılır.
- **Konum:** Metin içinde kavramın hemen ardına `[^kavram]` eklenir. Açıklamalar yazının sonunda, **Kaynakça bölümünün hemen üstünde** yer alır.
- **İçerik:** Ansiklopedi kuruluğunda değil; kısa, net, `sayko.ch` üslubuna uygun akademik/profesyonel açıklama.

```markdown
Metin içerisinde geçen kısıtlayıcı yeme davranışı[^kisitlayici-yeme] ve hedonik açlık[^hedonik-aclik] mekanizması...

---

[^kisitlayici-yeme]: **Kısıtlayıcı Yeme (Restrained Eating):** Bireyin kilo kontrolü amacıyla biyolojik açlık sinyallerini bilişsel olarak bastırması; genellikle kontrol kaybı ve tıkınırcasına yeme nöbetleriyle sonuçlanan riskli örüntü.
[^hedonik-aclik]: **Hedonik Açlık (Hedonic Hunger):** Enerji ihtiyacı olmaksızın, salt ödül ve zevk merkezli (dopaminerjik) besin arayışı ve tüketimi dürtüsü.
```

---

## 9. Akademik Kaynakça — APA 7 Standardı

`sayko.ch`'nin bilimsel omurgasıdır. Yazının dayandığı tüm teorik/ampirik literatür metnin **en sonuna** `## Kaynaklar` başlığı altında eklenir.

- **Hard Limit Yok:** Min/max sınırı yoktur; metnin ihtiyacı kadar (1-15 kaynak) tam doğrulukla eklenir.
- **Format:** Bütün kaynaklar **APA 7** formatında ve DOI/URL linkiyle yazılır.
- **Metin İçi Atıf:** Metin içinde `(Bandura, 1997)` veya `Stroebe ve ark. (2013)` şeklinde referans verilir.

```markdown
## Kaynaklar

- Herman, C. P., & Polivy, J. (1980). Restrained eating. In A. J. Stunkard (Ed.), *Obesity* (pp. 208–225). Saunders.
- Stroebe, W., van Koningsbruggen, G. M., Papies, E. K., & Aarts, H. (2013). Why most dieters fail but some succeed: A goal conflict model of eating behavior. *Psychological Review*, 120(1), 110–138. https://doi.org/10.1037/a0030849
```

---

## 10. Görsel Felsefe: "Argue, Not Display" (İddia Et, Sergileme)

Görselleştirme `sayko.ch` için süs veya metin tekrarı değildir; metnin teorik çekirdeğini kanıtlayan **bilişsel bir zihin modelidir (Mental Model)**.

### 10.1 İzomorfizm Testi (The Isomorphism Test)
> *"Tüm yazıları sildiğinde, diyagramın sadece şekli bile o teoriyi anlatabiliyor mu?"*
- Bir geri düşüş şeması **düşüşü ve kısırdöngüyü**,
- Bir Rubikon modeli **nehir/köprü geçişini ve geri dönüşsüzlüğü**,
- Bir maliyet-fayda modeli **teraziyi ve ağırlık merkezini**,
- Bir triaj/tanı modeli **akış hunisini** görsel form olarak yansıtmalıdır. Formun kendisi anlam taşımıyorsa tasarım yanlıştır.

### 10.2 Kutu Disiplini — < %30 Kuralı (Container vs. Free-Floating)
- Her cümleyi dikdörtgen kutu içine hapsetme hastalığından (box-in-box cliché) kaçınılır.
- Görseldeki metinlerin **%70'i serbest metin (free-floating text)** olmalı; hiyerarşi font boyutu, kalınlığı, renkleri ve bağlayıcı çizgilerle kurulmalıdır. Kutu sadece odak noktası veya sistem sınırları için kullanılır.

### 10.3 Multi-Zoom Katmanlaşması
Kapsamlı modeller 3 düzlemde bilgi verir:
1. **Level 1 (Özet Akış):** İlk bakışta anlaşılan ana yön (Girdi $\rightarrow$ Karar $\rightarrow$ Çıktı).
2. **Level 2 (Sistem Sınırları):** Motivasyonel vs. Volisyonel faz gibi ayrım alanları.
3. **Level 3 (Somut Kanıt & Detay):** Formüller ($A \times B$), yüzde varyansları (%57 vs %20), gerçek ampirik veriler.

---

## 11. Bilimsel Görselleştirme ve Vektör Mimarisi

### 11.1 Alfanümerik Model Kodlama Standardı
Her model ve wild card için benzersiz alfanümerik kod kullanılır:
- **Kategori Harfi:** `S` (Sağlık), `K` (Klinik), `G` (Gelişim), `B` (Biliş), `İ` (İstatistik), `Y` (Yöntem), `N` (Nörobilim).
- **Makale No:** Kategorideki makale sırası (Örn: `S3` = Beslenme).
- **Model No:** O makale içindeki model sırası (Örn: `Model S3.1`, `Model S3.2`).
- **Wild Card No:** Metaforik/serseri modeller için `W` kodu (Örn: `Wild Card S3.W1`).

---

### 11.2 Saf Vektör (Inline Sayko SVG) İlkeleri
- **Sıfır Dış Bağımlılık:** Görseller kütüphane yükleme beklemez; doğrudan `<svg viewBox="..." width="100%" style="max-width: 680px; height: auto;">` olarak yerleştirilir.
- **Tek Parça XML:** Markdown parser çakışmalarını önlemek için `<svg>` etiketleri arasında boşluksuz, temiz ve geçerli XML yapısı kullanılır.
- **Çift Tıklama ile Zoom:** Sayfadaki tüm SVG modeller çift tıklama ile tam ekran inceleme modalında açılır.

---

### 11.3 Yüksek Kontrast ve Dinamik Tema Güvencesi
- **Açık/Koyu Mod Güvencesi:** Metin renkleri asla tarayıcı varsayılanına bırakılmaz. Koyu temada kaybolmayı önlemek için `fill="var(--dark)"`, `fill="#C8102E"`, `fill="#c79a6d"` veya `fill="#96c46c"` açıkça tanımlanır.
- **WCAG Seviyesi Kontrast:** Açık arka plan üzerinde koyu metin, koyu arka plan üzerinde açık metin ilkesi her düğümde zorunludur.

---

### 11.4 Semantik Renk ve Çizgi Paleti

| Renk Sınıfı | HEX Kodu | Anlamı & Kullanım Alanı |
| :--- | :--- | :--- |
| **Cardinal** | `#C8102E` | Kriz anları, patoloji, merkezi tetikleyici, tökezleme (lapse), geri düşüş (relapse), yüksek risk, sabotaj. |
| **Sepia** | `#c79a6d` | Bilişsel filtreler, inançlar, öz-yeterlilik, niyet, zihinsel teraziler, çatışmalar. |
| **Sage** | `#96c46c` | Adaptif eylem, sağlıklı davranış, koruyucu faktör, toparlanma, perhizin korunması. |
| **Charcoal** | `#8a8275` | Dış çevre, pasif girdiler, nötr sistemler, biyolojik taban. |

---

### 11.5 Standart Callout & Distill.pub Figür Anatomisi

Her model `> [!abstract]` çağrı kutusu içinde, başlıksız ve emojisiz, ortalı yazar-yıl künyesiyle ve **yalnızca hover ile beliren** alt kaynakçasıyla çerçevelenir:

- **Başlık Altı Kaynak Linki:** `<div class="sc-gfx-author"><a href="..." class="sc-gfx-link">(Yazar, Yıl)</a></div>` formatında, düz kırmızı (`#C8102E`) ve tıklanabilir linktir. Harici link ikonu (pop-out oku) CSS ile gizlenir.
- **Standart Oran:** Tüm vektör çizimler `viewBox="0 0 640 280"` (2:1 oranı) ve `max-width: 640px` standardında render edilir.
- **Hover ile Beliren APA 7 Künyesi (`fade-in on hover`):** En alttaki tam bibliyografya satırı varsayılan olarak gizlidir (`opacity: 0`). Mouse diyagram kutusunun üzerine geldiğinde yumuşakça görünür (`opacity: 1`).

```markdown
> [!abstract] Hedonik Yeme ve Hedef Çatışması Modeli
> <div class="sc-gfx-author"><a href="https://doi.org/10.1037/a0030849" target="_blank" rel="noopener noreferrer">(Stroebe ve ark., 2013)</a></div>
>
> <div style="display:flex; justify-content:center; margin: 0.2rem 0 0.6rem 0;">
> <svg viewBox="0 0 640 280" width="100%" style="max-width: 640px; height: auto;">
>   <!-- Vektörel SVG Grafiği -->
> </svg>
> </div>
>
> *Bireyin lezzetli bir yiyecek kokusu aldığında haz hedefinin nasıl anında baskın hale gelip kilo kontrolü hedefini bilişsel olarak devre dışı bıraktığını modeller.*
>
> <div class="sc-gfx-source">Stroebe, W., et al. (2013). Why most dieters fail: A goal conflict model. Psychological Review, 120(1), 110–138. https://doi.org/10.1037/a0030849</div>
```

---

### 11.6 Canlı Deney Simülatörleri (Interactive Experiment Simulators)
SİKİLDİ.md uygulanan yazılarda implementasyonu mümkün ve mantıklı olan canlı deney ve bilişsel simülasyon fırsatları (örneğin SDT duyarlılık $d'$ ve karar kriteri $\beta$ ROC eğrisi, Weber fark eşiği, Kohlrausch adaptasyon kaydırıcısı vb.) tespit edilir, **kullanıcıya önerilir/sorulur** ve onay gelirse tüy gibi hafif D3 / Observable Plot bileşeni olarak yerleştirilir.

---

## 12. Tarihsel, Bilimsel ve Kültürel Orijinal Görseller / Arşiv Materyali

### 12.1 Diyagramdan Farkı ve Kapsamı
Bu kural; kavramsal akış şemalarından (flowcharts) veya soyut Mermaid/SVG çizimlerinden **tamamen farklıdır**. Psikoloji, duyu fizyolojisi, nörobilim ve bilim tarihinin bizzat kendisine ait otantik, kanıt niteliğindeki görsel ve deneysel arşiv materyalini kapsar:
- **Tarihi Deney Cihazları ve Belgeler:** Frank Rosenblatt'ın 5 tonluk Perceptron Mark I makinesi ve orijinal şemaları, Skinner Box, Milgram şok jeneratörü, Pavlov'un tükürük ölçüm düzeneği, Little Albert deney fotoğrafları.
- **Canlı ve Biyolojik Orijinaller:** Cajal'ın el çizimi nöron ve Purkinje hücresi preparatları, Limulus (at nalı yengeci) ommatidia gözleri, Phineas Gage'in tamping iron demiri ve kafatası tomografisi.
- **Klasik Algı ve Psikofizik İllüzyonları:** Hermann Izgarası, Benary Haçı, White İllüzyonu, Kanizsa Üçgeni, Mach Bantları, Rubin Vazosu, Ames Odası.
- **Spektral ve Biyofiziksel Ölçüm Grafikleri:** Kohlrausch karanlık adaptasyon eğrileri, Purkinje kayması spektral hassasiyet eğrisi, aksiyon potansiyeli osiloskop izleri.

### 12.2 Telif ve Kamu Malı (Public Domain) Güvencesi
- Sitede kullanılan tüm fotoğraf ve arşiv materyali **Kamu Malı (Public Domain)**, **Creative Commons (CC-BY, CC0)**, **Açık Erişim Bilimsel Literatür** veya **Tarihsel Arşiv (US Gov / NIH / NASA / Wellcome Collection)** statüsünde olmalıdır.
- Asla telif hakkı ihlali yaratacak stok ajans görselleri veya yapay "AI süsleme" illüstrasyonları kullanılmaz.

### 12.3 Yerel-İlk (Local-First) Depolama Protokolü & Tek Tıkla Zoom
- Dış web sitelerindeki kırılgan CDN linkleri (hotlinking) **kesinlikle yasaktır**.
- İlgili tüm materyal indirilip optimize edilerek doğrudan `quartz/static/img/<kategori_slug>/` dizinine yerleştirilir ve standart figür çerçevesiyle gömülür.
- Görsellere **tek tıklandığında** Medium-Zoom / sayko.ch modalında tam ekran açılır.

### 12.4 Bağlamsal Köprü ve İtalik Açıklama İlkesi
- Görselin hemen altına ne olduğunu açıklayan standart tipografi eklenir:
  > *Şekil: Limulus polyphemus ommatidia göz yapısı ve yanal engelleme deney düzeneği.*

---

## 13. Yasaklı Tasarım Kalıpları (Forbidden Clichés)

Aşağıdaki klişeler Sayko.ch genelinde **KESİNLİKLE YASAKTIR**:
1. ❌ **EMOJİ KULLANMAK KESİNLİKLE YASAKTIR:** Başlıklarda, callout'larda, listelerde, metinlerde ve görsellerde hiçbir emoji kullanılamaz.
2. ❌ **Gereksiz Dashboard:** Dashboard gerektirmeyen metne panel/widget sıkıştırmak.
3. ❌ **Karanlıkta Mor/Neon:** Koyu temada mor/neon parlamalar.
4. ❌ **İlişkisiz İkon Yığını (Bento Box Cliché):** Alakasız süs ikonları doldurmak.
5. ❌ **Başlık Üstü Nabız Atan Hap (Biscuit Pill):** Başlık üzerine gereksiz noktalı hap rozetler koymak.
6. ❌ **Gradient Başlıklar:** Başlık kelimelerine ucuz CSS degrade efektleri basmak.
7. ❌ **Izgara/Mesh Arka Planlar:** Sayfa arkasına yapay grid çizgileri sermek.
8. ❌ **İç İçe 3 Kat Kart:** Kart içine kart, onun içine kart koymak.
9. ❌ **Callout Başlığında Emoji / İkon:** `[!abstract] Model` yerine sade `[!abstract] Model Adı` kullanmak.

---

## 14. Atomik Uygulama Workflow'u (Adım Adım)

Bir makaleye `SİKİLDİ.md` yedirilirken şu sıra izlenir:

```mermaid
flowchart TD
  classDef cardinal fill:none,stroke:#C8102E,stroke-width:2.2px,color:#C8102E,font-weight:bold;
  classDef sepia fill:none,stroke:#c79a6d,stroke-width:1.8px,color:#c79a6d;
  classDef sage fill:none,stroke:#96c46c,stroke-width:1.8px,color:#96c46c;

  A[1. Frontmatter & Hero Başlık Denetimi]:::sepia --> B[2. TOC & Bölüm Hiyerarşisi Kurulumu]:::sepia
  B --> C[3. MD Sentaks Temizliği — Sese Dokunmadan]:::sepia
  C --> D[4. Nöral Ağ Wikilinkleri & Callout Ritmi]:::sepia
  D --> E[5. Modellerin Tespiti & Alfanümerik SVG Üretimi]:::cardinal
  E --> F[6. Tarihsel/Bilimsel Orijinal Görsel & Arşiv Entegrasyonu]:::cardinal
  F --> G[7. K&K Dipnotları 3-11 Adet Oluşturma]:::sepia
  G --> H[8. APA 7 Kaynakça Entegrasyonu]:::sepia
  H --> I[9. Derleme, Test & Değerlendirme Raporu]:::sage
```

---

## 15. Standart Çıktı & Değerlendirme Raporu Şablonu

Her makale işlemi bittiğinde kullanıcıya aşağıdaki standart formatta kısa, öz ve net rapor sunulur:

```markdown
###  SİKİLDİ.md İcraat Raporu: [Makale Adı]

1. **Yapılan İcraat:** 
   - [Frontmatter, TOC, Wikilinkler, Callout ritmi, MD temizliği özeti]
2. **K&K ve Kaynakça:**
   - [X adet K&K dipnotu eklendi, Y adet APA 7 kaynağı bağlandı]
3. **Üretilen Bilimsel Modeller:**
   - **Model [Kod]:** [Model Adı] — (Kaynak)
   - **Model [Kod]:** [Model Adı] — (Kaynak)
4. ** Wild Card & Alternatif Öneriler:**
   - **Wild Card [Kod]:** [Serseri/Metaforik Fikir]
5. ** Hazır Olma Skoru:** `%XX` *(Realist / Akademik / Serseri Gerekçesi)*
```

---
*C.Ç. © 2026 — SAYKO.ch Anayasası*
