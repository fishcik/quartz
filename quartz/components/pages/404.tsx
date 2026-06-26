import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

// ── SAYKO.ch özel 404 ──────────────────────────────────────────────
// "4 [3D BEYİN] 4" — ortadaki "0", imleçle etkileşime giren 3 boyutlu bir
// nöral beyin nokta-bulutu. Otomatik döner, imlece doğru yönelir; tıklayınca
// yeni bir düşünce (alıntı) belirir. Psikoloji + Nöral Ağ estetiği.
const NotFound: QuartzComponent = ({ cfg, ctx }: QuartzComponentProps) => {
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = ctx.argv.serve ? "/" : url.pathname

  return (
    <article class="sc-404">
      <div class="sc-404-row">
        <span class="sc-404-d" aria-hidden="true">4</span>
        <div class="sc-404-brainstage">
          <canvas id="sc-404-brain" aria-hidden="true"></canvas>
        </div>
        <span class="sc-404-d" aria-hidden="true">4</span>
      </div>
      <h1 class="sc-404-title">Bu sayfa bastırıldı.</h1>
      <p class="sc-404-quote" id="sc-404-quote">
        Aradığın şey burada değil. Belki de hiç olmadı.
      </p>
      <p class="sc-404-hint">Beyni imleçle çevir. Tıkla, yeni bir düşünce belirsin.</p>
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

  // ── 3D nöral beyin nokta-bulutu (canvas) ──
  var cnv=document.getElementById('sc-404-brain');
  if(cnv&&cnv.getContext){
    var ctx=cnv.getContext('2d');
    var W=0,H=0,DPR=Math.min(window.devicePixelRatio||1,2);
    var N=540;                       // nokta sayısı
    var pts=[],edges=[];
    function rnd(a,b){return a+Math.random()*(b-a);}
    // Fibonacci küresi → eşit dağılım, sonra beyin oranlarına deforme
    function build(){
      pts=[];edges=[];
      var ga=Math.PI*(3-Math.sqrt(5));
      for(var i=0;i<N;i++){
        var y=1-(i/(N-1))*2;          // -1..1
        var rad=Math.sqrt(Math.max(0,1-y*y));
        var th=ga*i;
        var x=Math.cos(th)*rad, z=Math.sin(th)*rad;
        // Beyin oranı: enli, basık; önden arkaya hafif uzun
        var px=x*1.32, py=y*0.92, pz=z*1.12;
        // Girus/sulkus kıvrımları → yüzey dalgalanması (normal yönünde)
        var wob=0.09*Math.sin(5.0*th+3.0*y)+0.06*Math.sin(8.0*y)+0.05*Math.cos(6.5*x);
        var L=Math.sqrt(px*px+py*py+pz*pz)||1;
        px+=px/L*wob; py+=py/L*wob; pz+=pz/L*wob;
        // Longitudinal fissür: üstte (py>0) orta hatta vadi → iki yarımküre
        var midGap=Math.exp(-(px*px)*7.0)*Math.max(0,py)*0.5;
        px+=(px>=0?1:-1)*midGap*0.5;
        py-=midGap*0.55;
        // Beyin sapı ipucu: alt-arka hafif sarkma
        if(py<-0.45&&pz<0){ py-=0.06; }
        pts.push({x:px,y:py,z:pz,sx:0,sy:0,sz:0,pulse:Math.random()<0.10});
      }
      // Komşu kenarları (3D mesafe eşiği) — nöral bağlar
      var TH=0.40;
      for(var a=0;a<pts.length;a++){
        var cntE=0;
        for(var b=a+1;b<pts.length&&cntE<3;b++){
          var dx=pts[a].x-pts[b].x,dy=pts[a].y-pts[b].y,dz=pts[a].z-pts[b].z;
          if(dx*dx+dy*dy+dz*dz<TH*TH){edges.push([a,b]);cntE++;}
        }
      }
    }
    build();
    function resize(){
      var rect=cnv.getBoundingClientRect();
      W=rect.width;H=rect.height;
      cnv.width=Math.round(W*DPR);cnv.height=Math.round(H*DPR);
      ctx.setTransform(DPR,0,0,DPR,0,0);
    }
    // Renkler: tema duyarlı (aydınlık koyu mürekkep / karanlık cardinal-krem)
    function palette(){
      var dk=document.documentElement.getAttribute('saved-theme')==='dark';
      return dk
        ? {node:'232,224,210', acc:'210,21,26', line:'180,170,150'}
        : {node:'40,32,26',    acc:'200,16,46', line:'120,104,86'};
    }
    var rotY=0.4,rotX=-0.15,tgtY=0.4,tgtX=-0.15,spin=0.0035,t=0,mIn=false;
    function project(){
      var cy=Math.cos(rotY),sy=Math.sin(rotY),cx=Math.cos(rotX),sx=Math.sin(rotX);
      var S=Math.min(W,H)*0.40, cxp=W/2, cyp=H/2, FOV=3.0;
      for(var i=0;i<pts.length;i++){
        var p=pts[i];
        var x1=p.x*cy - p.z*sy;
        var z1=p.x*sy + p.z*cy;
        var y1=p.y*cx - z1*sx;
        var z2=p.y*sx + z1*cx;
        var persp=FOV/(FOV - z2);
        p.sx=cxp + x1*S*persp;
        p.sy=cyp + y1*S*persp;
        p.sz=z2;                       // derinlik (-..+, +öne)
      }
    }
    function draw(){
      window.__sc404Raf=requestAnimationFrame(draw);
      if(W===0)resize();
      t+=0.016;
      // İmleç yoksa yavaş otomatik dönüş; varsa hedefe yönel
      if(!mIn){ tgtY+=spin; }
      rotY+=(tgtY-rotY)*0.06;
      rotX+=(tgtX-rotX)*0.06;
      project();
      ctx.clearRect(0,0,W,H);
      var col=palette();
      // Nöral bağlar (derinliğe göre soluk)
      ctx.lineWidth=0.7;
      for(var e=0;e<edges.length;e++){
        var pa=pts[edges[e][0]],pb=pts[edges[e][1]];
        var dep=(pa.sz+pb.sz)*0.5;          // -..+
        var a=0.10+Math.max(0,dep)*0.22;
        ctx.strokeStyle='rgba('+col.line+','+a.toFixed(3)+')';
        ctx.beginPath();ctx.moveTo(pa.sx,pa.sy);ctx.lineTo(pb.sx,pb.sy);ctx.stroke();
      }
      // Düğümler — derinliğe göre boyut/opaklık; bazıları kırmızı nabız atar
      for(var i=0;i<pts.length;i++){
        var p=pts[i];
        var d=(p.sz+1)/2;                    // 0..1
        var r=0.7+d*2.0;
        var al=0.25+d*0.65;
        var c=col.node;
        if(p.pulse){ var pl=0.5+0.5*Math.sin(t*2.2+i); r+=pl*1.3; al=0.5+pl*0.5; c=col.acc; }
        ctx.fillStyle='rgba('+c+','+al.toFixed(3)+')';
        ctx.beginPath();ctx.arc(p.sx,p.sy,r,0,6.2832);ctx.fill();
      }
    }
    if(!window.__sc404Raf)draw();
    window.addEventListener('resize',resize,{passive:true});
    cnv.addEventListener('mousemove',function(e){
      var r=cnv.getBoundingClientRect();
      var nx=(e.clientX-r.left)/r.width-0.5, ny=(e.clientY-r.top)/r.height-0.5;
      mIn=true; tgtY=0.4+nx*2.2; tgtX=-0.15+ny*1.6;
    });
    cnv.addEventListener('mouseleave',function(){ mIn=false; tgtX=-0.15; });
    var stage=cnv.parentElement;
    if(stage){ stage.style.cursor='pointer'; stage.addEventListener('click',function(){ tgtY+=Math.PI; newQuote(); }); }
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
