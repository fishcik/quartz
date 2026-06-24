import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

// ── SAYKO.ch özel 404 ──────────────────────────────────────────────
// Grafiksel + etkileşimli: simetrik Rorschach mürekkep lekesi (canvas) —
// nefes alır, imleçten kaçar, tıklayınca yeni bir leke üretir. Psikoloji
// ruhu + esprili Türkçe metin. Tasarım tamamen SAYKO.ch estetiğinde.
const NotFound: QuartzComponent = ({ cfg, ctx }: QuartzComponentProps) => {
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = ctx.argv.serve ? "/" : url.pathname

  return (
    <article class="sc-404">
      <div class="sc-404-stage">
        <canvas id="sc-404-blot" aria-hidden="true"></canvas>
        <span class="sc-404-code" aria-hidden="true">404</span>
      </div>
      <h1 class="sc-404-title">Bu sayfa bastırıldı.</h1>
      <p class="sc-404-quote" id="sc-404-quote">
        Aradığın şey burada değil. Belki de hiç olmadı.
      </p>
      <p class="sc-404-hint">Lekede ne gördüğün, kaybettiğin sayfadan çok şey anlatır. Tıkla, yeni bir leke belirsin.</p>
      <a class="sc-404-home" href={baseDir}>
        <span class="sc-404-home-psi">ψ</span> Bilince geri dön
      </a>
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  // ── Esprili, psikoloji temalı rotasyon metinleri ──
  var Q=[
    "Aradığın şey burada değil. Belki de hiç olmadı.",
    "Sen kaybolmadın — sadece yanlış nöral yolu izledin.",
    "Bu bir Rorschach testi değil. Ama yine de bir şey anlatıyor.",
    "Teori biter, 404 başlar.",
    "Bu sayfa, bilinçaltına geri bastırıldı.",
    "Yanlış-anı mı? Sayfanın var olduğuna emin misin?",
    "Bağlantı koptu. Aktarım devam ediyor.",
    "Kitapta durduğu gibi durmaz; bu link de durmadı.",
    "Uyaran yok. Tepki de yok. Sadece boşluk.",
    "Şema uyuşmazlığı: beklediğin sayfa mevcut değil."
  ];
  var qEl=document.getElementById('sc-404-quote');
  function newQuote(){ if(qEl){ var i=Math.floor(Math.random()*Q.length); qEl.style.opacity='0'; setTimeout(function(){qEl.textContent=Q[i];qEl.style.opacity='1';},220); } }

  // ── Simetrik Rorschach mürekkep lekesi (canvas, metaball-vari) ──
  var cnv=document.getElementById('sc-404-blot');
  if(cnv&&cnv.getContext){
    var ctx=cnv.getContext('2d');
    var W=0,H=0,DPR=Math.min(window.devicePixelRatio||1,2);
    var mouse={x:-9999,y:-9999};
    var blobs=[];
    function rnd(a,b){return a+Math.random()*(b-a);}
    function mkBlobs(){
      blobs=[];
      var n=Math.floor(rnd(5,8));
      for(var i=0;i<n;i++){
        blobs.push({
          x:rnd(0.02,0.42),            // sol yarı (0..0.5), sağ aynalanır
          y:rnd(0.12,0.88),
          r:rnd(0.06,0.20),
          ph:rnd(0,6.28),
          sp:rnd(0.4,1.2),
          ax:rnd(0.008,0.025),
          ay:rnd(0.008,0.025)
        });
      }
    }
    mkBlobs();
    function resize(){
      var rect=cnv.getBoundingClientRect();
      W=rect.width;H=rect.height;
      cnv.width=Math.round(W*DPR);cnv.height=Math.round(H*DPR);
      ctx.setTransform(DPR,0,0,DPR,0,0);
    }
    function inkColor(){
      var dk=document.documentElement.getAttribute('saved-theme')==='dark';
      return dk?'rgba(217,176,131,':'rgba(28,24,20,';   // dark: sepya, light: koyu mürekkep
    }
    var t=0;
    function draw(){
      window.__sc404Raf=requestAnimationFrame(draw);
      if(W===0)resize();
      t+=0.012;
      ctx.clearRect(0,0,W,H);
      var col=inkColor();
      ctx.save();
      ctx.filter='blur(6px)';
      for(var s=0;s<2;s++){            // s=0 sol, s=1 ayna sağ
        blobs.forEach(function(b){
          var bx=(b.x+Math.sin(t*b.sp+b.ph)*b.ax);
          var by=(b.y+Math.cos(t*b.sp*0.8+b.ph)*b.ay);
          // imleç etkileşimi: yakındaki blob hafifçe itilir
          var px=(s===0?bx:1-bx)*W, py=by*H;
          var dx=px-mouse.x, dy=py-mouse.y, d=Math.sqrt(dx*dx+dy*dy);
          if(d<120&&d>0.01){ var f=(120-d)/120*0.06; px+=dx/d*f*W; py+=dy/d*f*H; }
          var rr=b.r*Math.min(W,H)*(0.9+0.1*Math.sin(t*1.3+b.ph));
          var g=ctx.createRadialGradient(px,py,0,px,py,rr);
          g.addColorStop(0,col+'0.92)');
          g.addColorStop(0.6,col+'0.65)');
          g.addColorStop(1,col+'0)');
          ctx.fillStyle=g;
          ctx.beginPath();ctx.arc(px,py,rr,0,6.2832);ctx.fill();
        });
      }
      ctx.restore();
    }
    if(!window.__sc404Raf)draw();
    window.addEventListener('resize',resize,{passive:true});
    cnv.addEventListener('mousemove',function(e){var r=cnv.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;});
    cnv.addEventListener('mouseleave',function(){mouse.x=-9999;mouse.y=-9999;});
    var stage=cnv.parentElement;
    if(stage){ stage.style.cursor='pointer'; stage.addEventListener('click',function(){mkBlobs();newQuote();}); }
  }

  // ── Quartz orijinal: büyük/küçük harf URL eşleştirme yönlendirmesi ──
  if (typeof fetchData !== "undefined") {
    fetchData.then(function(index) {
      var basePath = document.body.dataset.basepath || "";
      if (basePath.length > 1 && basePath.endsWith("/")) { basePath = basePath.slice(0, -1); }
      var pathname = window.location.pathname;
      var hasBasePrefix = basePath.length > 1 && pathname.startsWith(basePath);
      if (hasBasePrefix) { pathname = pathname.slice(basePath.length); }
      if (pathname.startsWith("/")) { pathname = pathname.slice(1); }
      if (pathname.endsWith("/")) { pathname = pathname.slice(0, -1); }
      if (pathname.endsWith(".html")) { pathname = pathname.slice(0, -5); }
      if (pathname.endsWith("/index")) { pathname = pathname.slice(0, -6); }
      var lowered = pathname.toLowerCase();
      if (lowered !== pathname && index[lowered] != null) {
        var prefix = hasBasePrefix ? basePath : "";
        var target = prefix + (prefix.endsWith("/") ? "" : "/") + lowered;
        window.location.replace(target);
      }
    });
  }
})();
`,
        }}
      />
    </article>
  )
}

export default (() => NotFound) satisfies QuartzComponentConstructor
