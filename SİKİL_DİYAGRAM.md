# 📐 SİKİL_DİYAGRAM.md — `sayko.ch` Diyagram Standartları ve Şablon Kütüphanesi

Bu belge, `sayko.ch` üzerindeki tüm makalelerde yer alacak görsel zihin modelleri, akış şemaları ve akademik diyagramların **standart başvuru kılavuzudur**.

---

## İçindekiler

- [[#1. Felsefe: Ne Zaman Diyagram Yapılır?]]
- [[#2. Standart Çerçeve (Kapsayıcı Callout ve Çifte Anlatı)]]
- [[#3. Semantik Renk Paleti ve classDef Kuralları]]
- [[#4. Çizgi ve Bağlantı Semantiği]]
- [[#5. 4 Temel Şablon Kütüphanesi]]
  - [[#Şablon A: Kısırdöngü & Geri Bildirim (Feedback Loop)]]
  - [[#Şablon B: İç İçe Ekolojik / Sistemik Katmanlar (Concentric Layers)]]
  - [[#Şablon C: Aşamalı Eşik / Rubikon Geçişi (Stage & Rubicon)]]
  - [[#Şablon D: Ayırıcı Karar Ağacı (Diagnostic Decision Tree)]]
- [[#6. Yerleşim, Wikilink ve Entegrasyon Kuralları]]

---

## 1. Felsefe: Ne Zaman Diyagram Yapılır?

Diyagram bir süs veya boşluk doldurma aracı değildir. Metnin sunduğu soyut teorik mekanizmayı okurun zihninde tek bakışta kristalleştiren **bilişsel bir zihin haritasıdır (Mental Model)**.

### ✅ Kesinlikle Diyagram Yapılacak Durumlar:
1. **Döngüler & Kısır Döngüler:** Bir davranışın kendi kendini beslediği veya bozduğu geri bildirim ağları (örn. Marlatt AVE Geri Düşüş Döngüsü, Bağımlılık Karşıt-Süreç Modeli).
2. **Eşik & Faz Geçişleri:** Geri dönüşsüz kırılma noktaları ve irade sınırları (örn. HAPA Rubikon çizgisi, TTM 6 Aşamalı Değişim Spiral Modeli).
3. **İç İçe Katmanlar & Sistemik Modeller:** Bireyin çevreyle katman katman etkileştiği çok düzeyli yapılar (örn. Bronfenbrenner Ekolojik Sistemleri, Biyopsikososyal Model).
4. **Karar & Ayırıcı Tanı Ağaçları:** Klinik durumların filtrelendiği eşik algoritmaları (örn. Normal vs. Anormal kararı, HiTOP hiyerarşik boyutları).

### ❌ Diyagram Yapılmayacak Durumlar:
- Düz 2-3 maddelik doğrusal basit listeler.
- Metinde zaten yalın bir paragrafla anlatılmış ve hiçbir çatallanma/döngü içermeyen tek yönlü tanımlar.

---

## 2. Standart Çerçeve (Kapsayıcı Callout ve Çifte Anlatı)

Her diyagram, makale gövdesine çıplak olarak bırakılmaz. Mutlaka standart bir parşömen çağrı kutusu (`> [!abstract]`) içine alınır ve şu 3 zorunlu öğeyi barındırır:

```markdown
> [!abstract] 📜 [Modelin Tam Adı] ([Yazar], [Yıl])
> *Kaynak: [APA 7 formatında tam makale/kitap referansı ve DOI linki]*
>
> ```mermaid
> flowchart TD
>   %% ... semantik mermaid kodu ...
> ```
>
> **Açıklama:** *[1. Cümle: Sistemin teorik / nörobiyolojik mekanizmasının özeti]. [2. Cümle: Sokak diliyle / sezgisel olarak günlük hayattaki karşılığı ve ana çıkarım].*
```

---

## 3. Semantik Renk Paleti ve `classDef` Kuralları

Tüm Mermaid diyagramlarında jenerik varsayılan renkler **kesinlikle kullanılmaz**. Her şemada en üste aşağıdaki semantik `classDef` sınıfları tanımlanır:

```mermaid
classDef cardinal fill:none,stroke:#C8102E,stroke-width:2.2px,color:#C8102E,font-weight:bold;
classDef sepia fill:none,stroke:#c79a6d,stroke-width:1.8px,color:#c79a6d;
classDef sage fill:none,stroke:#96c46c,stroke-width:1.8px,color:#96c46c;
classDef charcoal fill:none,stroke:#8a8275,stroke-width:1.2px,color:#d8cfc0;
```

| Renk Sınıfı | HEX Kodu | Semantik Anlamı & Kullanım Alanı |
| :--- | :--- | :--- |
| **`cardinal`** | `#C8102E` | Kriz anları, patoloji, merkezi tetikleyici, tökezleme (lapse), geri düşüş (relapse), yüksek risk. |
| **`sepia`** | `#c79a6d` | Bilişsel filtreler, inançlar, öz-yeterlilik, niyet, zihinsel arabulucu değişkenler. |
| **`sage`** | `#96c46c` | Adaptif eylem, sağlıklı davranış, koruyucu faktör, toparlanma, perhizin korunması. |
| **`charcoal`** | `#8a8275` | Makro bağlam, dış çevre katmanları, pasif girdiler, nötr sistemler. |

---

## 4. Çizgi ve Bağlantı Semantiği

| Ok / Çizgi Tipi | Sentaks | Anlamı ve Kullanımı |
| :--- | :---: | :--- |
| **Kalın / Baskın Ok** | `==>` | Otomatik sürüklenme, baskın nedensel akış, nörokimyasal zorunluluk veya yüksek riskli sapma. |
| **Standart Ok** | `-->` | Bilinçli adım, planlı eylem, standart evre ilerlemesi. |
| **Kesikli Ok** | `-.->` | Geri bildirim döngüsü (feedback loop), bastırılmış etki veya gecikmeli koşullu sonuç. |
| **Etiketli Bağlantı** | `-->|Koşul / Biliş|` | Düğümden geçerken tetiklenen inanç, şüphe veya çevresel engel. |

---

## 5. 4 Temel Şablon Kütüphanesi

### Şablon A: Kısırdöngü & Geri Bildirim (Feedback Loop)

```markdown
> [!abstract] 📜 Bağımlılıkta Karşıt-Süreç Teorisi (Solomon & Corbit, 1974)
> *Kaynak: Solomon, R. L., & Corbit, J. D. (1974). An opponent-process theory of motivation. Psychological Review, 81(2), 119–145.*
>
> ```mermaid
> flowchart TD
>   classDef cardinal fill:none,stroke:#C8102E,stroke-width:2.2px,color:#C8102E,font-weight:bold;
>   classDef sepia fill:none,stroke:#c79a6d,stroke-width:1.8px,color:#c79a6d;
>   classDef default fill:none,stroke:#ece8e1,stroke-width:1.2px,color:#d8cfc0;
>
>   Madde([Tetikleyici / Madde Alımı]):::cardinal --> A_Sureci([A-Süreci: Anlık Haz & Dopamin]):::sepia
>   A_Sureci --> Dengeleme{{Homeostatik Karşı Tepki}}:::sepia
>   Dengeleme ==> B_Sureci([B-Süreci: Gecikmeli Çekilme & Disfori]):::cardinal
>   
>   B_Sureci -.->|Zamanla Derinleşir| Tolerans((Tiryakilik & Tolerans)):::cardinal
>   Tolerans ==>|Yoksunluğu Dindirmek İçin| Madde
> ```
>
> **Açıklama:** *İlk dönemde keyif almak için yapılan eylemin, zihnin homeostatik dengelenmesi sonucu zamanla sadece yoksunluk acısını dindirmek için bir zorunluluğa dönüşmesini açıklar.*
```

---

### Şablon B: İç İçe Ekolojik / Sistemik Katmanlar (Concentric Layers)

```markdown
> [!abstract] 📜 Bronfenbrenner'in Biyoekolojik Gelişim Modeli (Bronfenbrenner, 1979)
> *Kaynak: Bronfenbrenner, U. (1979). The ecology of human development: Experiments by nature and design. Harvard University Press.*
>
> ```mermaid
> flowchart TD
>   classDef cardinal fill:none,stroke:#C8102E,stroke-width:2.2px,color:#C8102E,font-weight:bold;
>   classDef sepia fill:none,stroke:#c79a6d,stroke-width:1.8px,color:#c79a6d;
>   classDef sage fill:none,stroke:#96c46c,stroke-width:1.8px,color:#96c46c;
>   classDef charcoal fill:none,stroke:#8a8275,stroke-width:1.2px,color:#d8cfc0;
>
>   Birey((Birey: Biyoloji & Mizaç)):::cardinal
>
>   subgraph Mikro [1. Mikrosistem: Günlük Temas Alanı]
>     Aile[Aile & Ev]:::sepia
>     Okul[Okul & Akranlar]:::sepia
>   end
>
>   subgraph Mezo [2. Mezosistem: Sistemler Arası Etkileşim]
>     Aile_Okul{{Aile-Okul İletişimi}}:::sepia
>   end
>
>   subgraph Ekzo [3. Ekzosistem: Dolaylı Etki Eden Kurumlar]
>     IsYeri[Ebeveyn İş Yeri]:::charcoal
>     Saglik[Sağlık Sistemi]:::charcoal
>   end
>
>   subgraph Makro [4. Makrosistem: Kültür, Kanunlar & İdeoloji]
>     Kultur[Kültürel Değerler & Sosyoekonomik Yapı]:::charcoal
>   end
>
>   Birey <==> Mikro
>   Mikro <--> Mezo
>   Mezo -.-> Ekzo
>   Ekzo -.-> Makro
> ```
>
> **Açıklama:** *İnsan gelişiminin sadece bireysel biyolojiden ibaret olmadığını; iç içe geçmiş aile, kurum ve kültür katmanlarının birbirini besleyerek bireyin kimliğini inşa ettiğini gösterir.*
```

---

### Şablon C: Aşamalı Eşik / Rubikon Geçişi (Stage & Rubicon)

```markdown
> [!abstract] 📜 Sağlık Eylemi Süreci Yaklaşımı / HAPA Modeli (Schwarzer, 1992)
> *Kaynak: Schwarzer, R. (1992). Self-efficacy in the adoption and maintenance of health behaviors. Hemisphere Publishing.*
>
> ```mermaid
> flowchart LR
>   classDef cardinal fill:none,stroke:#C8102E,stroke-width:2.2px,color:#C8102E,font-weight:bold;
>   classDef sepia fill:none,stroke:#c79a6d,stroke-width:1.8px,color:#c79a6d;
>   classDef sage fill:none,stroke:#96c46c,stroke-width:1.8px,color:#96c46c;
>   classDef charcoal fill:none,stroke:#8a8275,stroke-width:1.2px,color:#d8cfc0;
>
>   subgraph Motivasyon [1. Motivasyonel Faz]
>     Risk[Risk & Tehdit Algısı]:::charcoal --> Niyet([Eylem Niyeti]):::sepia
>     Beklenti[Sonuç Beklentisi]:::charcoal --> Niyet
>     OzYet_Baslangic[Başlangıç Öz-Yeterliliği]:::sepia --> Niyet
>   end
>
>   Niyet ==>|Rubikon Geçişi| Planlama
>
>   subgraph Volisyon [2. Volisyonel Eylem Fazı]
>     Planlama{{Eylem & Başa Çıkma Planı}}:::sepia ==> Eylem([Sağlıklı Eylem]):::sage
>     Eylem -.->|Engel / Tökezleme| BasaCikma[Başa Çıkma Öz-Yeterliliği]:::sepia
>     BasaCikma ==> Eylem
>   end
> ```
>
> **Açıklama:** *Kişinin 'biliyorum ama yapamıyorum' dediği motivasyon aşamasından, planlama ve başa çıkma iradesiyle eyleme geçtiği Rubikon köprüsünü resmeder.*
```

---

### Şablon D: Ayırıcı Karar Ağacı (Diagnostic Decision Tree)

```markdown
> [!abstract] 📜 Ruhsal Belirti Değerlendirme & Ayırıcı Tanı Karar Matrisi
> *Kaynak: American Psychiatric Association. (2013). Diagnostic and statistical manual of mental disorders (5th ed.).*
>
> ```mermaid
> flowchart TD
>   classDef cardinal fill:none,stroke:#C8102E,stroke-width:2.2px,color:#C8102E,font-weight:bold;
>   classDef sepia fill:none,stroke:#c79a6d,stroke-width:1.8px,color:#c79a6d;
>   classDef sage fill:none,stroke:#96c46c,stroke-width:1.8px,color:#96c46c;
>
>   Girdi([Belirti / Yoğun Stres Yaşantısı]):::sepia --> Soru1{Kültürel & Durumsal Olarak Kabul Gören Bir Tepki mi?}
>   
>   Soru1 -- Evet --> Normal[Uyum Tepkisi / Normal Yaşantı]:::sage
>   Soru1 -- Hayır --> Soru2{Belirgin İşlev Kaybı ve Acı / Distres Var mı?}
>   
>   Soru2 -- Hayır --> Subklinik[Subklinik Zorlanma / Takip]:::sepia
>   Soru2 -- Evet --> Soru3{Belirtiler Süre ve Sendrom Kriterini Karşılıyor mu?}
>   
>   Soru3 -- Hayır --> GeciciKriz[Akut Yaşam Krizi]:::sepia
>   Soru3 -- Evet ==> Bozukluk([Klinik Ruhsal Bozukluk Tanısı]):::cardinal
> ```
>
> **Açıklama:** *Her duygusal acının bir bozukluk olmadığını; tanı koyabilmek için bağlam, işlev kaybı ve zaman eşiklerinin adım adım sorgulanması gerektiğini ortaya koyar.*
```

---

## 6. Yerleşim, Wikilink ve Entegrasyon Kuralları

1. **Konum:** Diyagram, ilgili `### Alt Başlık` konusunun en vurucu argümanının hemen altına, bir önceki ve sonraki metinden `---` ayraçları ile izole edilerek eklenir.
2. **Düğüm İsimlendirmeleri:** Mermaid düğümlerindeki terimler (`[[Etiyoloji]]`, `[[Öz-Etkililik]]` gibi) metin içindeki Wikilink terminolojisiyle birebir tutarlı tutulur.
3. **Mobil ve Tema Uyumu:** Düğümlerde uzun paragraflar yerine 2-4 kelimelik keskin başlıklar kullanılır; alt açıklamalar callout'un `**Açıklama:**` kısmına bırakılır.
