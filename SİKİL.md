# SİKİL v2 — sayko.ch Obsidian Markdown Kuralları

## İçindekiler

- [[#DOKUNULMAZ ALAN — Yazının Sesi ve Ruhu]]
- [[#Frontmatter Standardı]]
- [[#Tipografi ve Başlık Hiyerarşisi]]
- [[#TOC — İçindekiler Yapısı]]
- [[#Graph View ve Wikilink Ağı]]
- [[#Görsel Estetik, Vurgular ve Callout Haritası]]
- [[#Footnotes — Kavram Sözlüğü ve Derinlik]]
- [[#Akademik Kaynakça — APA 7 Standardı]]
- [[#Ayırıcılar ve Embeds]]
- [[#Formatlama Workflow]]
- [[#Geliştirme Takvimi ve Sınırlar]]

---

## DOKUNULMAZ ALAN — Yazının Sesi ve Ruhu

Formatlama yapılırken metnin **özüne, üslubuna, edebi ritmine ve sesine kesinlikle müdahale edilmez:**

- **Noktalama Özgürlüğü:** `......`, `—`, virgülsüz akış, kesik cümleler — hepsi kasıtlıdır; düzeltilmez.
- **Kelime Seçimi ve Sıralaması:** Sokak dili, akademik kaymalar, "tabi", "bi", "yani:" gibi samimi ve otantik ifadeler aynen korunur.
- **Cümle ve Paragraf Yapısı:** Yazar nerede nefes almış, nerede bölmüşse orada kalır. Cümleler birleştirilmez veya bölünmez.
- **Mevcut Vurgular:** Yazarın koyduğu `==highlight==`, `*italik*` veya `**bold**` dengelerine dokunulmaz.
- **Sadece Sentaks Temizliği:** Hatalı veya yapışık yazılan Markdown kodları düzeltilir (Örn: `ben**bugün**` yerine `ben **bugün**`). Kelimeler ve cümle yapısı değişmez.

> [!danger] Altın Kural
> Eğer bir değişiklik yazının içeriğine, tona, söz dizimine veya kelime seçimine dokunuyorsa **ASLA YAPILMAZ**. Sadece formatlama ve görsel düzenleme yapılır.

---

## Frontmatter Standardı

Vault veri düzenini ve filtrelemeyi temiz tutmak için sadece üç alan kullanılır:

```yaml
---
title: Notun Başlığı
date: 2026-08-12
tags:
  - ders-adı
  - konu-etiketi
---
```

- `date`: Her zaman ISO 8601 formatında (`YYYY-MM-DD`). Yazının gerçek yazım tarihi kesinlikle korunur!
- `tags`: YAML list formatında — tek satırda değil, her etiket ayrı satırda `- etiket` şeklinde.
- `aliases`, `cssclasses`, `status` gibi ekstra kalabalık alanlar eklenmez.

---

## Tipografi ve Başlık Hiyerarşisi

Sitedeki tüm yazılar otantik bir edebi/akademik kimlikle render edilir:

| Öğe / Seviye | Font Ailesi | Renk & Stil | Açıklama |
| :--- | :--- | :--- | :--- |
| **`h1` (Sayfa Başlığı)** | `Playfair Display` | Normal Metin Rengi | Büyük, ağırbaşlı ana makale başlığı |
| **`h2` (Ana Bölümler & TOC)** | `Manufacturing Consent` | Cardinal Kırmızı (`#C8102E`) | Gotik/blackletter asil bölüm durakları (`## 1. Konu...`, `## İçindekiler`) |
| **`h3` / `h4` (Alt Başlıklar)** | `Source Serif 4` / `Libre Baskerville` | İtalik / Yarı-Kalın | Akışı kesmeyen okunaklı alt konu başlıkları |
| **Gövde Metni & Tanımlar** | `Libre Baskerville` | Nötr Gövde Rengi | Yüksek okunurluklu klasik serif gövde |
| **K&K ve Kaynakça Başlıkları** | `Manufacturing Consent` | Cardinal Kırmızı (`#C8102E`) | Akordiyon ve modal başlıkları |
| **Metin İçi Vurgu & Renkler** | Inline HTML / CSS | İsteğe Bağlı | İhtiyaç halinde `<span style="color:#C8102E">...</span>` serbesttir |

---

## TOC — İçindekiler Yapısı

Uzun notlarda (3 veya daha fazla başlık içeren) frontmatter'dan hemen sonra eklenir:

```markdown
## İçindekiler

- [[#Birinci Başlık]]
- [[#İkinci Başlık]]
  - [[#Alt Başlık]]
- [[#Üçüncü Başlık]]
```

- TOC başlığının kendisi `##` seviyesinde olur ve otomatik olarak **Manufacturing Consent + Cardinal Kırmızı** ile stillendirilir.
- TOC içindeki linkler her zaman aynı not içi syntax olan `[[#Başlık]]` formatındadır.

---

## Graph View ve Wikilink Ağı

`sayko.ch` vault'u yaşayan bir nöral ağdır. Graph View'ın tam kapasite çalışması, ilişkisel ağın beslenmesi ve kopuk düğüm oluşmaması için:

### Wikilink Kullanımı
```markdown
[[Not Adı]]                        Vault içi doğrudan link
[[Not Adı|Görünen Metin]]          Özel görünen metin ile bağlamsal link
[[Not Adı#Başlık]]                 Spesifik başlığa yönlendirme
[[Not Adı#^blok-id]]               Spesifik bloğa yönlendirme
[[#Aynı notta başlık]]             Aynı not içi başlık linki
```

### Kurallar
1. **Birebir Eşleşme:** Wikilink hedefi vault'taki gerçek dosya adıyla harfi harfine eşleşmelidir. Tek karakter farkı graph view'da kopuk düğüm (broken link) yaratır.
2. **Çifte Linkleme Stratejisi:** Hem kavramların ham halleri (`[[Bilişsel Dissonans]]`) hem de cümle akışındaki bağlamsal ifadeler (`[[Sağlık Modelleri|modellere yaklaşımımız]]`) wikilink ile beslenir.
3. **Şüphe Durumu:** Vault'ta karşılığı olup olmadığından emin olunmayan linkler Obsidian yorumu içine alınır:

```markdown
%%KONTROL: bu dosya vault'ta var mı?%%
[[Klinik Psikolojide Metotlar]]
```

---

## Görsel Estetik, Vurgular ve Callout Haritası

Yazının "dümdüz bir blok metin" gibi görünmesini engellemek, okuma ritmini artırmak ve otantik `sayko.ch` ruhunu yansıtmak için Obsidian görsel ögeleri dengeli bir şekilde kullanılır.

### Callout Haritası

| Callout Tipi | Ne Zaman Kullanılır? |
| :--- | :--- |
| `[!info]` | Bağlamsal açıklama — "yani şu demek", tanım genişletme. |
| `[!note]` | Yan gözlem — parantez içi parlamaları dışarı alma, akışı kesmeyen notlar. |
| `[!tip]` | Pratik çıkarım, uygulama önerisi — soyut gözlem için değil. |
| `[!example]` | Somut örnek, analoji, senaryo. |
| `[!warning]` | Metodolojik tuzak, yaygın yanlış anlama, dikkat edilmesi gereken nokta. |
| `[!quote]` | Dışarıdan alıntı ya da yazarın vurucu özet yargısı. |
| `[!abstract]` | Bölüm özeti, süperözet. |
| `[!question]` | Açık soru, okuyucuyu kışkırtan düşünce, tartışmaya davet. |
| `[!danger]` | Kritik hata riski, ciddi uyarı. |
| `[!success]` | Doğru yaklaşım, iyi uygulama örneği. |

### Callout İlkeleri
- Callout tipi içerikle semantik olarak birebir eşleşmelidir.
- Başlık kısa, öz ve işlevsel olmalıdır.
- Callout içindeki dil de yazarın özgün sesidir; ton değiştirilmez.

### Highlight ve Vurgu
- `==vurgulanan metin==`: Yazarın doğrudan altını çizdiği kilit fikirler.
- Var olan highlight ve bold/italik tercihlerine dokunulmaz, ekstra aşırı vurgu eklenerek metin çöplüğüne dönüştürülmez.

---

## Footnotes — Kavram Sözlüğü ve Derinlik

Her yazının içinde geçen; genel okuyucunun veya psikolojiye/ilgili alana daha az aşina olanların tam bilemeyeceği, kafa karıştırma ihtimali olan kavramlar, tanılar, terimler ve jargonlar dipnot (footnote) olarak işaretlenir.

### Kurallar
- **Sayı Dengesi:** Yazının uzunluğuna, yoğunluğuna ve durumuna göre **en az 3, en fazla 7-8 civarı** kavram seçilir.
- **Konum:** Metin içinde kavramın hemen ardına `[^kavram]` eklenir. Açıklamalar ise yazının sonunda, **Kaynakça bölümünden hemen önce** yer alır.
- **İçerik:** Kuru bir ansiklopedi tanımı değil; kısa, net, `sayko.ch` diline uyumlu akademik/profesyonel açıklama.

```markdown
Metin içerisinde geçen anhedoni[^anhedoni] durumu ve alexithymia[^alexithymia] tablosu...

---

[^anhedoni]: **Anhedoni**: Kişinin eskiden keyif aldığı aktivitelerden zevk alamama, haz duyusunun körelmesi durumu.
[^alexithymia]: **Aleksitimi**: Kendi duygularını tanıma, tanımlama ve ifade etmede yaşanan güçlük; duygu körlüğü.
```

---

## Akademik Kaynakça — APA 7 Standardı

`sayko.ch`'nin bilimsel omurgası ve akademik doğruluğudur. Yazının dokunduğu, işaret ettiği, anlattığı, dayandığı veya tartıştığı tüm teorik/akademik altyapı metnin **en sonuna (Footnotes bölümünün de altına)** eklenir.

### Kurallar
- **Hard Limit Yok:** Min/max sınırı yoktur. Yazının ihtiyacı neyse (1 kaynak da olabilir, 15 kaynak da) tam doğrulukla eklenir.
- **Tam Örtüşme:** Verilen kaynak ile metinde bağlanan kısım birebir akademik olarak örtüşmelidir. Bilimsellik ve doğruluk esastır.
- **Format:** Bütün kaynaklar **APA 7** formatında yazılır.
- **Metin İçi Atıf:** Metin içinde ihtiyaç duyulduğunda `Sheeran ve ark. (1999)` veya `(Beck, 1979)` şeklinde referans verilebilir.

```markdown
## Kaynakça

* Beck, A. T. (1979). *Cognitive therapy of depression*. Guilford Press.
* Sheeran, P., Abraham, C., & Orbell, S. (1999). Psychosocial correlates of heterosexual condom use. *Psychological Bulletin*, 125(1), 90–132.
```

> [!warning] Doğrulanmayan Kaynak
> Metinde geçen fakat kaynağı henüz tam doğrulanmamış bulgular/iddialar için şu yorum eklenir:
> `%%EKLENTI — kaynak doğrulanmadı: ...%%`

---

## Ayırıcılar ve Embeds

### Ayırıcılar (`---`)
- Tematik geçişlerde kullanılır.
- Arka arkaya iki `---` kullanılmaz.
- Sadece konu değiştiğinde veya büyük bölüm sonlarında (örneğin Footnotes ve Kaynakça öncesinde) eklenir.

### Embeds
```markdown
![[Not Adı]]                       Tam not embed
![[Not Adı#Başlık]]                Bölüm embed
![[görsel.png]]                    Görsel embed
![[görsel.png|300]]                Genişlik belirtilmiş görsel
```

---

## Formatlama Workflow

Bir yazı düzenlenirken adım adım şu rehber izlenir:

1. **Frontmatter Check:** `title`, `date` (ISO 8601 - orijinal tarih kesinlikle korunur) ve `tags` alanları doğru formatta mı?
2. **TOC Ekleme:** 3 veya daha fazla başlık varsa frontmatter altına TOC ekle.
3. **MD Sentaks Temizliği:** Hatalı bitişik bold/italik/boşluk kodlarını düzelt. Kelimelere, noktalara, tona KESİNLİKLE DOKUNMA.
4. **Graph View & Wikilinks:** Metindeki terimleri ve ilişkili kavramları `[[Not Adı]]` veya `[[Not Adı|Metin]]` şeklinde bağla. Emin olmadıklarını `%%KONTROL%%` içine al.
5. **Görsel Estetik & Callout:** Blok görünümü kırmak için uygun yerlere `[!note]`, `[!quote]`, `[!tip]` vb. ekle.
6. **Footnotes (Kavram Sözlüğü):** Metinden 3-8 kritik terim tespit et; metin içinde `[^kavram]` ekle, açıklamalarını yazının sonuna koy.
7. **Kaynakça (APA 7):** Yazının dayandığı akademik kaynakları tam APA 7 formatında en alt bölüme `## Kaynakça` olarak yerleştir.
8. **Son Kontrol:** Yazının edebi sesi, üslubu veya özgün kelimeleri değişti mi? Cevap HAYIR ise işlem tamamlanmıştır!

---

## Geliştirme Takvimi ve Sınırlar

* **Geliştirme Son Tarihi (15 Ağustos):** Sitenin genel görünümü, tasarımı, yerleşimi (layout), CSS ayarları, işlevselliği (fonksiyonalite) ve teknik geliştirmeleri en geç **15 Ağustos 2026** tarihine kadar yapılabilir.
* **Yazım Dönemi (16 Ağustos ve sonrası):** 16 Ağustos 2026 itibarıyla site üzerinde hiçbir teknik geliştirme, tasarım/layout editi veya CSS düzenlemesi yapılmayacaktır. Analiz felcine (analysis paralysis) kapılmamak adına tüm süreç sadece yeni psikoloji yazılarının yazılmasına ve içerik üretimine ayrılacaktır.
