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
      <h1 class="sc-404-title">Bu sayfa henüz keşfedilmedi.</h1>
      <p class="sc-404-quote" id="sc-404-quote">
        Aradığın şey burada değil. Belki de henüz keşfedilmeyi bekliyor.
      </p>
      <p class="sc-404-hint">İmleci gezdir — yılan peşinden gelsin. Tıkla, yeni bir düşünce belirsin.</p>
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

  // ── SERPENTBRAIN fidget oyuncağı: beyin + peşine düşen yılan (canvas) ──
  var cnv=document.getElementById('sc-404-brain');
  if(cnv&&cnv.getContext){
    var ctx=cnv.getContext('2d');
    var W=0,H=0,DPR=Math.min(window.devicePixelRatio||1,2);
    function resize(){
      var rect=cnv.getBoundingClientRect();
      W=rect.width;H=rect.height;
      cnv.width=Math.round(W*DPR);cnv.height=Math.round(H*DPR);
      ctx.setTransform(DPR,0,0,DPR,0,0);
    }
    function palette(){
      var dk=document.documentElement.getAttribute('saved-theme')==='dark';
      return dk
        ? {brain:'150,140,124', gyri:'120,112,98', snake:'232,224,210', acc:'210,24,30'}
        : {brain:'120,104,86',  gyri:'150,134,112', snake:'46,36,28',   acc:'200,16,46'};
    }
    // Yılan zinciri (baş → kuyruk), her segment öncekini takip eder
    var NS=20, seg=[], seglen=0, t=0, mIn=false, idle=0, burst=0;
    var mx=0,my=0;
    function initChain(){
      seglen=Math.min(W,H)*0.052;
      seg=[];for(var i=0;i<NS;i++)seg.push({x:W/2+i*seglen,y:H/2});
      mx=W/2;my=H/2;
    }
    // Beyin: orta noktada sabit, hafif nabız atan stilize çizim
    function drawBrain(col){
      var cx=W/2,cy=H/2,R=Math.min(W,H)*0.30, p=1+0.02*Math.sin(t*1.4);
      ctx.save();ctx.translate(cx,cy);ctx.scale(R*p/60,R*p/60);
      ctx.lineWidth=2.0/(R/60);ctx.lineCap='round';ctx.lineJoin='round';
      ctx.strokeStyle='rgba('+col.brain+',0.85)';
      // dış hat (iki yarımküre)
      ctx.beginPath();
      ctx.moveTo(-2,-44);
      ctx.bezierCurveTo(-30,-46,-52,-26,-44,-6);
      ctx.bezierCurveTo(-58,4,-50,30,-30,30);
      ctx.bezierCurveTo(-26,44,-4,46,2,34);
      ctx.bezierCurveTo(8,46,30,46,34,30);
      ctx.bezierCurveTo(54,30,60,6,46,-6);
      ctx.bezierCurveTo(56,-26,34,-48,8,-42);
      ctx.bezierCurveTo(6,-46,0,-46,-2,-44);
      ctx.stroke();
      // orta yarık
      ctx.beginPath();ctx.moveTo(1,-42);ctx.lineTo(2,34);ctx.stroke();
      // girus kıvrımları
      ctx.strokeStyle='rgba('+col.gyri+',0.7)';ctx.lineWidth=1.6/(R/60);
      var g=[[-30,-20,-18,-12],[-38,2,-24,8],[-26,18,-14,22],[14,-22,28,-14],[18,4,34,8],[14,20,26,24]];
      for(var i=0;i<g.length;i++){ctx.beginPath();ctx.moveTo(g[i][0],g[i][1]);ctx.quadraticCurveTo((g[i][0]+g[i][2])/2,g[i][1]-8,g[i][2],g[i][3]);ctx.stroke();}
      ctx.restore();
    }
    function drawSnake(col){
      // gövde — baştan kuyruğa incelir
      ctx.lineCap='round';ctx.lineJoin='round';
      for(var i=0;i<NS-1;i++){
        var a=seg[i],b=seg[i+1];
        ctx.strokeStyle='rgba('+col.snake+','+(0.92-i/NS*0.5).toFixed(2)+')';
        ctx.lineWidth=Math.max(1, (Math.min(W,H)*0.055)*(1-i/NS));
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
      // baş
      var h=seg[0],n=seg[1];
      var ang=Math.atan2(h.y-n.y,h.x-n.x);
      var hr=Math.min(W,H)*0.038;
      ctx.fillStyle='rgba('+col.snake+',1)';
      ctx.beginPath();ctx.ellipse(h.x,h.y,hr*1.25,hr,ang,0,6.2832);ctx.fill();
      // gözler (kırmızı nabız)
      var ex=Math.cos(ang+1.4)*hr*0.6,ey=Math.sin(ang+1.4)*hr*0.6;
      var pulse=0.6+0.4*Math.sin(t*4);
      ctx.fillStyle='rgba('+col.acc+','+pulse.toFixed(2)+')';
      ctx.beginPath();ctx.arc(h.x+ex,h.y+ey,hr*0.26,0,6.2832);ctx.fill();
      ctx.beginPath();ctx.arc(h.x-ex*0.3+Math.cos(ang-1.4)*hr*0.6,h.y-ey*0.3+Math.sin(ang-1.4)*hr*0.6,hr*0.26,0,6.2832);ctx.fill();
      // çatal dil
      var tx=h.x+Math.cos(ang)*hr*1.6,ty=h.y+Math.sin(ang)*hr*1.6;
      ctx.strokeStyle='rgba('+col.acc+',0.9)';ctx.lineWidth=Math.max(0.8,hr*0.12);
      ctx.beginPath();ctx.moveTo(h.x+Math.cos(ang)*hr*1.2,h.y+Math.sin(ang)*hr*1.2);ctx.lineTo(tx,ty);
      ctx.lineTo(tx+Math.cos(ang+0.5)*hr*0.5,ty+Math.sin(ang+0.5)*hr*0.5);
      ctx.moveTo(tx,ty);ctx.lineTo(tx+Math.cos(ang-0.5)*hr*0.5,ty+Math.sin(ang-0.5)*hr*0.5);
      ctx.stroke();
    }
    function draw(){
      window.__sc404Raf=requestAnimationFrame(draw);
      if(W===0){resize();initChain();}
      t+=0.016;
      var col=palette();
      // Hedef: imleç varsa imleç; yoksa beyin çevresinde yavaş yörünge
      var tx,ty;
      if(mIn){tx=mx;ty=my;}
      else{idle+=0.012;var R=Math.min(W,H)*0.40;tx=W/2+Math.cos(idle)*R;ty=H/2+Math.sin(idle*1.3)*R*0.7;}
      // Baş hedefe doğru yumuşakça (tıklayınca kısa "atılış")
      if(burst>0)burst-=0.04;
      var sp=0.16+Math.max(0,burst)*0.5;
      seg[0].x+=(tx-seg[0].x)*sp;seg[0].y+=(ty-seg[0].y)*sp;
      // Zincir kısıtı: her segment öncekinden sabit mesafede
      for(var i=1;i<NS;i++){
        var dx=seg[i].x-seg[i-1].x,dy=seg[i].y-seg[i-1].y;
        var d=Math.sqrt(dx*dx+dy*dy)||0.001;
        seg[i].x=seg[i-1].x+dx/d*seglen;
        seg[i].y=seg[i-1].y+dy/d*seglen;
      }
      ctx.clearRect(0,0,W,H);
      drawBrain(col);
      drawSnake(col);
    }
    if(!window.__sc404Raf)draw();
    window.addEventListener('resize',function(){resize();initChain();},{passive:true});
    cnv.addEventListener('mousemove',function(e){
      var r=cnv.getBoundingClientRect();
      mx=e.clientX-r.left;my=e.clientY-r.top;mIn=true;
    });
    cnv.addEventListener('mouseleave',function(){mIn=false;});
    var stage=cnv.parentElement;
    if(stage){stage.style.cursor='pointer';stage.addEventListener('click',function(){burst=1;newQuote();});}
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
