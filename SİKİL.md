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

- [[#Birinci Başlık]]
- [[#İkinci Başlık]]
  - [[#Alt Başlık]]
- [[#Üçüncü Başlık]]
```

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

## Akademik Kaynak Formatı

sayko.ch'de kaynak gövde içinde parantez içi atıf olarak gösterilir:
```markdown
Sheeran ve ark. (1999) 121 çalışmayı inceleyen meta-analizinde...
```

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
