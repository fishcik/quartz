---
trigger: always_on
description: sayko.ch tipografi, hiyeroglif, emoji yasağı, CommonMark delimiter ve Quartz CI kuralları
---

# sayko.ch Agent Guardrails & Invariants

Bu kurallar `sayko.ch` projesi kapsamında çalışan her asistan için koşulsuz ve kalıcı davranış kılavuzudur:

1. **Dokunulmaz Alan (Sıfır Yeniden Yazım / Sıfır Özetleme):** 
   - Yazarın metnine, argosuna, üslubuna, paragraflarına ve edebi sesine harfi harfine sadık kalınır.
   - Kelime sayısını azaltacak veya metni özetleyecek her müdahale yasaktır.

2. **Sıfır Emoji (Zero-Emoji Invariant):** 
   - Sitedeki hiçbir başlıkta, callout kutusunda, içerikte, listede veya dipnotta emoji kullanılamaz (`scripts/verify_no_emojis.py` her derlemede %100 temiz geçmelidir).

3. **Otantik Hiyeroglif Matrisi (`SC_GLYPHS`):** 
   - Ders ve konu hiyeroglifleri rastgele uydurulamaz. Yalnızca `Head.tsx` / `quartz.layout.ts` içindeki `SC_GLYPHS` matrisindeki otantik glifler kullanılır (Kondom $\rightarrow$ `𓂺`, Beslenme $\rightarrow$ `𓏏`, Sigara $\rightarrow$ `𓆑`, Sağlık Modelleri $\rightarrow$ `𓀁`, Geri Düşüş $\rightarrow$ `𓀒`, Kuramlar $\rightarrow$ `𓀗`, Görsel Korteks $\rightarrow$ `𓁹`, Giriş $\rightarrow$ `𓉐`).

4. **CommonMark Delimiter Disiplini (Sıfır Ham Asteriks):** 
   - Açılış `**` öncesinde ve kapanış `**` sonrasında daima boşluk veya noktalama olmalıdır: `kelime. **vurgu** kelime`.
   - Etiketin içinde asla kenar boşluğu bırakılmaz: `**vurgu**`.
   - HTML span/mark ile iç içe vurgularda `<strong>` tercih edilir.
   - Her `quartz build` sonrasında `public/` altındaki 600+ HTML dosyasında ham `**` kalmadığı doğrulanır.

5. **Local Plugins & CI/CD Kalıcılığı:** 
   - Davranışı özelleştirilen tüm Quartz eklentileri `./local-plugins/<eklenti-adı>` altında tutulur ve Git'e eklenir; böylece GitHub Actions CI ortamında vanilla paketlerle ezilmez.
