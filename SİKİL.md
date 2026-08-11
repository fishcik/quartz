# SİKİL — sayko.ch Obsidian Markdown Kuralları

> **name:** sayko-obsidian-markdown  
> **description:** sayko.ch vault'u için Obsidian Flavored Markdown formatlaması. Wikilink, callout, frontmatter, TOC, akademik kaynak formatı ve graph view uyumu için kullan.  
> **DOKUNULMAZ:** yazının edebi tonu, noktalama tercihleri, cümle yapısı, anlatım biçimi, kelime seçimi.

---

## İçindekiler
- [[#DOKUNULMAZ ALAN — Yazının Sesi]]
- [[#Frontmatter]]
- [[#TOC — İçindekiler]]
- [[#Wikilinks]]
- [[#Callouts]]
- [[#Akademik Kaynak Formatı]]
- [[#Highlight ve Vurgu]]
- [[#Ayırıcılar]]
- [[#Embeds]]
- [[#Graph View Uyumu]]
- [[#Formatlama Workflow]]

---

## DOKUNULMAZ ALAN — Yazının Sesi

Formatlama yaparken aşağıdakilere hiç müdahale edilmez:
* **Noktalama tercihleri:** `......`, `—`, virgülsüz akış, kesik cümleler — hepsi kasıtlıdır.
* **Kelime seçimi ve sıralaması**
* **İtalik / bold dengeleri** — yazar koymuşsa, orada durur.
* **Cümle uzunluğu ve ritmi**
* **Kişisel ses:** `"tabi"`, `"bi"`, `"yani:"`, sokak dili, akademik kayma — hepsi korunur.
* **Paragraf sınırları** — yazar nerede bölmüşse orada kalır.

> **Tek kural:** Eğer bir değişiklik içeriğe/metne dokunuyorsa, **yapılmaz**.

---

## Frontmatter

Sadece üç alan. Fazlası yok:

```yaml
---
title: Notun Başlığı
date: 2026-01-15
tags:
  - ders-adı
  - konu-etiketi
---
```

* `date` her zaman ISO 8601: `YYYY-MM-DD`
* `tags` YAML list formatı — tek satırda değil, her etiket ayrı satırda `- etiket`
* `aliases`, `cssclasses`, `status` gibi alanlar **eklenmez**.

---

## TOC — İçindekiler

Uzun notlarda (3+ başlık) notun en üstüne, frontmatter'dan hemen sonra eklenir. Obsidian'ın same-note heading link syntax'ıyla:

```markdown
## İçindekiler

- [[#1. Birinci Başlık]]
- [[#2. İkinci Başlık]]
- [[#3. Üçüncü Başlık]]
```

* **Max 7 Kuralı:** TOC **en fazla 7 başlık** içerebilir. Çok detaylı notlar 3–7 ana `##` bölüme ayrıştırılır; alt konular `###` seviyesinde yapılandırılır.
* TOC başlığının kendisi `##` seviyesinde olur.
* TOC içindeki linkler her zaman `[[#Başlık]]` formatında — dış link değil.

---

## Wikilinks

```markdown
[[Not Adı]]                        Vault içi link
[[Not Adı|Görünen Metin]]          Özel görünen metin
[[Not Adı#Başlık]]                 Başlığa link
[[Not Adı#^blok-id]]               Bloğa link
[[#Aynı notta başlık]]             Aynı not içi link
```

* **Kritik:** Wikilink hedefi vault'taki gerçek dosya adıyla birebir eşleşmeli. Tek karakter farkı = broken link = graph view'da kopuk düğüm.
* Emin olunmayan linkleri değiştirme — Obsidian yorumunun içine al:
  ```markdown
  %%KONTROL: bu dosya vault'ta var mı?%%
  [[Sağlık Modelleri; Bilmek Neden Yetmiyor?]]
  ```

---

## Callouts

### Syntax
```markdown
> [!tip] Başlık
> İçerik.

> [!note]
> Başlıksız callout.

> [!warning]- Varsayılan kapalı
> Foldable callout (- = kapalı, + = açık).
```

### sayko.ch Callout Haritası
| Tip | Ne zaman |
| :--- | :--- |
| `[!info]` | Bağlamsal açıklama — "yani şu demek", tanım genişletme |
| `[!note]` | Yan gözlem — parantez gibi, akışı kesmeden |
| `[!tip]` | Pratik çıkarım, uygulama önerisi — soyut gözlem için değil |
| `[!example]` | Somut örnek, analoji, senaryo |
| `[!warning]` | Gerçek uyarı — metodolojik tuzak, yaygın yanlış anlama |
| `[!quote]` | Dışarıdan alıntı ya da özet yargı |
| `[!abstract]` | Bölüm özeti, süperözet |
| `[!question]` | Açık soru, tartışmaya davet |
| `[!danger]` | Kritik hata riski, ciddi uyarı |
| `[!success]` | Doğru yaklaşım, iyi uygulama örneği |

**İlkeler:**
* Callout tipi içerikle semantik olarak eşleşmeli — rastgele seçilmez.
* Başlık kısa ve işlevsel; soru işareti zorunlu değil.
* Callout içindeki ses de yazarın sesi — ton değiştirilmez.

---

## Akademik Kaynak Formatı (APA 7)

sayko.ch'de birincil tercih gövde içi APA 7 standartlarına uygun yazar-yıl atıfıdır:
```markdown
Sheeran ve ark. (1999) 121 çalışmayı inceleyen meta-analizinde...
```
* **Tek yazar:** `Freud (1923)...` veya `(Freud, 1923)`
* **İki yazar:** `Baumann ve Perrez (2005)...` veya `(Baumann & Perrez, 2005)`
* **Üç ve daha fazla yazar:** İlk atıftan itibaren doğrudan "ve ark." kullanılır: `Holmes ve ark. (2018)...` veya `(Holmes ve ark., 2018)`

Dipnot tercih edilirse Obsidian footnote syntax'ı:
```markdown
...kondom kullanımıyla pozitif ilişkilidir.[^sheeran1999]

[^sheeran1999]: Sheeran, P., Abraham, C., & Orbell, S. (1999). Psychosocial correlates of heterosexual condom use. *Psychological Bulletin*, 125(1), 90–132.
```

* **Kural:** Kaynaksız iddia eklenmez. Metinde olmayan bir bulgu eklenecekse açıkça işaretlenir:
  ```markdown
  %%EKLENTI — kaynak doğrulanmadı: ...%%
  ```

---

## Sözlük Syntax'ı (Glossary)

Metin içinde geçen kritik terimler için satır içi tooltip ve `/sozluk` altyapısına bağlanan sözlük syntax'ı:
```markdown
[[term::Nozoloji|Hastalıkları sınıflandırma ve tanımlama bilimi]]
```
* `TermName` terimin adı, `Definition` ise kısa, net tanımıdır.

---

## Highlight ve Vurgu

```markdown
==vurgulanan metin==
```
* `==...==` yazara aittir — ekleme yapılmaz, silinmez. Formatlama sırasında mevcut highlight'lara dokunulmaz.

---

## Ayırıcılar

* `---` tematik geçişler için. Fazla kullanım yazının nefesini keser.
* Konu değişiyorsa → `---` uygun.
* Sadece "bir şey bitti" hissi → gerekmez, boş satır yeter.
* Arka arkaya iki `---` neredeyse hiçbir zaman doğru değildir.

---

## Embeds

```markdown
![[Not Adı]]                       Tam not embed
![[Not Adı#Başlık]]                Bölüm embed
![[görsel.png]]                    Görsel embed
![[görsel.png|300]]                Genişlik belirtilmiş görsel
```

---

## Graph View Uyumu

Her sayko.ch notu vault'ta bir düğümdür. Graph view'ın çalışması için:
1. Wikilink hedefleri gerçek vault dosyalarına işaret etmeli.
2. `tags` dolu olmalı — graph filtreleme için.
3. Broken link bırakılmaz — şüpheli linkler `%%KONTROL%%` ile işaretlenir.

---

## Formatlama Workflow

1. **Frontmatter** — sadece `title`, `date`, `tags` var mı?
2. **TOC** — 3+ başlık varsa ekle (`## İçindekiler` + `[[#Başlık]]`).
3. **Wikilink'ler** — yazım hatası var mı, vault'ta karşılığı var mı?
4. **Callout tipleri** — semantik uyum var mı? (10 onaylı tip)
5. **`---` fazlalığı** — gereksiz olanları kaldır.
6. **DUR.** İçeriğe, tona, noktalamaya dokunma.

---

## Mermaid Diyagramları ve Tasarım Kimliği (CD/CI)

Tüm şemalar ve akış diyagramları, sitenin aydınlık/karanlık tema geçişlerine uyumlu olmalı ve sade (2D) kalmalıdır. Renkler doğrudan CSS değişkenleri üzerinden verilerek tasarım tutarlılığı korunur.

### Standart Stil Şablonu

Her Mermaid diyagramının sonuna veya başına aşağıdaki CSS sınıfları eklenmeli ve düğümler bu sınıflarla işaretlenmelidir:

```markdown
```mermaid
graph TD
  %% Sınıf Tanımlamaları %%
  classDef default fill:none,stroke:var(--lightgray),stroke-width:1.5px,color:var(--darkgray),font-family:Source Serif 4, Georgia, serif;
  classDef accent fill:none,stroke:var(--accent),stroke-width:2px,color:var(--accent),font-weight:bold,font-family:Source Serif 4, Georgia, serif;
  classDef highlight fill:none,stroke:var(--secondary),stroke-width:1.5px,color:var(--secondary),font-family:Source Serif 4, Georgia, serif;

  A[Kritik Başlangıç]:::accent --> B[Önemli Ara Aşama]:::highlight
  B --> C[Sıradan Düğüm]
```
```

*   `:::accent` (Kırmızı/Altın): Başlangıç, odak veya tetikleyici düğümler için kullanılır.
*   `:::highlight` (İkincil Tema Rengi): Önemli kararlar veya geçiş durumları için kullanılır.
*   Diyagramlar karmaşık görseller yerine, teorik akışları ve süreç şemalarını sade bir biçimde yansıtmalıdır.

---

## Geliştirme Takvimi ve Sınırlar

* **Geliştirme Son Tarihi (15 Ağustos):** Sitenin genel görünümü, tasarımı, yerleşimi (layout), CSS ayarları, işlevselliği (fonksiyonalite) ve teknik geliştirmeleri en geç **15 Ağustos 2026** tarihine kadar yapılabilir.
* **Yazım Dönemi (16 Ağustos ve sonrası):** 16 Ağustos 2026 itibarıyla site üzerinde hiçbir teknik geliştirme, tasarım/layout editi veya CSS düzenlemesi yapılmayacaktır. Analiz felcine (analysis paralysis) kapılmamak adına tüm süreç sadece yeni psikoloji yazılarının yazılmasına ve içerik üretimine ayrılacaktır.
