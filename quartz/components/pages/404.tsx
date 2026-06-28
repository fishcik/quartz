import fs from "fs"
import path from "path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

// Build-time: SERPENTBRAIN logosunu oku (404'ün "0"ı + LSD hover oyuncağı)
function readSvg(rel: string): string {
  try {
    return fs
      .readFileSync(path.join(process.cwd(), rel), "utf8")
      .replace(/<\?xml[^>]*\?>/, "")
      .replace(/<!DOCTYPE[^>]*>/, "")
      .trim()
  } catch {
    return ""
  }
}
const SC_SB_SVG = readSvg("quartz/static/serpentbrain.svg")

// ── SAYKO.ch 404: EVIL SERPENT PLAYGROUND ──────────────────────────────────
// Boşta: serpent, "404"ün 0'ı olan SERPENTBRAIN logosu etrafında ouroboros gibi
// ağır ağır döner. İmleç oynayınca snake oyunu başlar; ekrana saçılmış beyinleri
// yiyince büyür. Yılan tek-parça dolgulu, ipeksi, "evil" çizilir.
const NotFound: QuartzComponent = ({ cfg, ctx }: QuartzComponentProps) => {
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = ctx.argv.serve ? "/" : url.pathname

  return (
    <article class="sc-404">
      {/* Tam sayfa canvas — yılan tüm sayfada gezer / 0 etrafında döner */}
      <canvas id="sc-404-field" aria-hidden="true"></canvas>
      {/* "4 [SERPENTBRAIN=0] 4" — orta logo, LSD hover oyuncağı */}
      <div class="sc-404-row">
        <span class="sc-404-d" aria-hidden="true">4</span>
        <div
          class="sc-404-zero"
          id="sc-404-zero"
          aria-label="SERPENTBRAIN"
          dangerouslySetInnerHTML={{ __html: SC_SB_SVG }}
        />
        <span class="sc-404-d" aria-hidden="true">4</span>
      </div>
      <h1 class="sc-404-title">Bu sayfa henüz keşfedilmedi.</h1>
      <p class="sc-404-quote" id="sc-404-quote">
        Aradığın şey burada değil. Belki de henüz keşfedilmeyi bekliyor.
      </p>
      <p class="sc-404-hint" id="sc-404-hint">
        İmleci gezdir — yılan peşinden gelir, beyinleri yer, büyür. Durunca 0'ın etrafında uyur.
      </p>
      <div class="sc-404-score" id="sc-404-score">
        <span class="sc-404-score-lbl">Beyin:</span>
        <span id="sc-404-score-val">0</span>
      </div>
      <a class="sc-404-home" href={baseDir}>
        <span class="sc-404-home-psi">ψ</span> Bilince geri dön
      </a>
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  var Q=[
    "Aradığın şey burada değil. Belki de hiç olmadı.",
    "Sen kaybolmadın — sadece yanlış nöral yolu izledin.",
    "Teori biter, 404 başlar.",
    "Bu sayfa, bilinçaltına geri bastırıldı.",
    "Yanlış-anı mı? Sayfanın var olduğuna emin misin?",
    "Bağlantı koptu. Aktarım devam ediyor.",
    "Kitapta durduğu gibi durmaz; bu link de durmadı.",
    "Uyaran yok. Tepki de yok. Sadece boşluk.",
    "Şema uyuşmazlığı: beklediğin sayfa mevcut değil.",
    "Büyüdükçe, daha da kaybolursun.",
    "Yılan, kuyruğunu ısırır; sen linki ararsın.",
    "Her 404 bir keşfedilmemiş bölgedir."
  ];
  var qEl=document.getElementById('sc-404-quote');
  function newQuote(){ if(qEl){ var i=Math.floor(Math.random()*Q.length); qEl.style.opacity='0'; setTimeout(function(){qEl.textContent=Q[i];qEl.style.opacity='1';},220); } }

  var cnv=document.getElementById('sc-404-field');
  if(!cnv||!cnv.getContext)return;
  var ctx=cnv.getContext('2d');
  var W=0,H=0,DPR=Math.min(window.devicePixelRatio||1,2);
  function resize(){
    W=window.innerWidth;H=window.innerHeight;
    cnv.width=Math.round(W*DPR);cnv.height=Math.round(H*DPR);
    cnv.style.width=W+'px';cnv.style.height=H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }

  // ── EVIL serpent + brain paleti — KARANLIK gövde, olivine yalnız sırt/desende ──
  // (SERPENTBRAIN'deki mürekkep yılanı gibi: kara, parlak, cute değil)
  function palette(){
    var dk=document.documentElement.getAttribute('saved-theme')==='dark';
    return dk
      ? {hi:'150,196,108', body:'40,50,38', belly:'12,16,12', pat:'rgba(150,196,108,0.55)',
         eye:'255,52,40', tongue:'225,40,40', brain:'150,140,122', gyri:'110,100,84', food:'210,28,32'}
      : {hi:'140,186,100', body:'34,42,32', belly:'10,12,10', pat:'rgba(140,186,100,0.5)',
         eye:'225,28,28', tongue:'200,16,46', brain:'112,98,80', gyri:'142,126,106', food:'200,16,46'};
  }

  // ── state ──
  var SEGLEN=15, SEG_W=10, score=0;
  var seg=[], t=0, mode='ouro', lastMove=-999, oro=0;
  var mx=W/2,my=H/2,mIn=false;
  var FOOD=[],MAX_FOOD=6, eatAnim=[];

  // "0" (SERPENTBRAIN logosu) merkezi — CANVAS-YEREL koordinatta (ox,oy çıkarılır)
  // ki dönüştürülmüş ata eleman olsa bile ouroboros tam logonun üstünde döner.
  function zero(ox,oy){
    var z=document.getElementById('sc-404-zero');
    if(z){var r=z.getBoundingClientRect();if(r.width)return {x:r.left+r.width/2-ox,y:r.top+r.height/2-oy,R:Math.max(r.width,r.height)*0.66};}
    return {x:W/2,y:H*0.42,R:90};
  }

  function initSnake(ox,oy){
    seg=[];var c=zero(ox,oy);var N=16;
    for(var i=0;i<N;i++){var a=-i*0.36;seg.push({x:c.x+Math.cos(a)*c.R,y:c.y+Math.sin(a)*c.R});}
  }
  function snakeRadius(){return SEG_W*0.5+score*0.16;}

  // ── beyin yiyecekleri ──
  function spawnFood(){
    if(FOOD.length>=MAX_FOOD)return;
    var m=70;var fx=m+Math.random()*(W-2*m),fy=m+Math.random()*(H-2*m);
    if(seg.length&&Math.hypot(fx-seg[0].x,fy-seg[0].y)<110)return;
    FOOD.push({x:fx,y:fy,r:12+Math.random()*6,pulse:Math.random()*6.28,alpha:0});
  }
  function drawBrain(f,col){
    var r=f.r*(0.95+0.05*Math.sin(f.pulse+t*2))*Math.min(1,f.alpha);
    if(r<0.5)return;
    ctx.save();ctx.translate(f.x,f.y);ctx.scale(r/60,r/60);
    ctx.lineWidth=2.0/(r/60);ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();
    ctx.moveTo(-2,-44);ctx.bezierCurveTo(-30,-46,-52,-26,-44,-6);
    ctx.bezierCurveTo(-58,4,-50,30,-30,30);ctx.bezierCurveTo(-26,44,-4,46,2,34);
    ctx.bezierCurveTo(8,46,30,46,34,30);ctx.bezierCurveTo(54,30,60,6,46,-6);
    ctx.bezierCurveTo(56,-26,34,-48,8,-42);ctx.bezierCurveTo(6,-46,0,-46,-2,-44);
    ctx.closePath();
    ctx.fillStyle='rgba('+col.brain+','+(0.14*f.alpha)+')';ctx.fill();
    ctx.strokeStyle='rgba('+col.brain+','+f.alpha+')';ctx.stroke();
    ctx.beginPath();ctx.moveTo(1,-42);ctx.lineTo(2,34);ctx.stroke();
    ctx.strokeStyle='rgba('+col.gyri+','+(f.alpha*0.6)+')';ctx.lineWidth=1.3/(r/60);
    var g=[[-30,-20,-18,-12],[-38,2,-24,8],[-26,18,-14,22],[14,-22,28,-14],[18,4,34,8]];
    for(var i=0;i<g.length;i++){ctx.beginPath();ctx.moveTo(g[i][0],g[i][1]);ctx.quadraticCurveTo((g[i][0]+g[i][2])/2,g[i][1]-8,g[i][2],g[i][3]);ctx.stroke();}
    ctx.restore();
  }
  function checkEat(col){
    var hr=snakeRadius()+10,hx=seg[0].x,hy=seg[0].y;
    for(var i=FOOD.length-1;i>=0;i--){
      var f=FOOD[i];var dx=hx-f.x,dy=hy-f.y;
      if(dx*dx+dy*dy<(hr+f.r)*(hr+f.r)){
        score++;var sv=document.getElementById('sc-404-score-val');if(sv)sv.textContent=String(score);
        newQuote();
        var last=seg[seg.length-1];for(var j=0;j<5;j++)seg.push({x:last.x,y:last.y});
        eatAnim.push({x:f.x,y:f.y,r:0,life:1,col:col.food});
        FOOD.splice(i,1);
      }
    }
  }

  // ── EVIL serpent çizimi: tek parça dolgulu ipeksi gövde ──
  function drawSnake(col){
    var N=seg.length;if(N<3)return;
    var baseR=snakeRadius();
    function radAt(i){
      var s=i/(N-1); // 0 baş → 1 kuyruk
      var r;
      if(s>0.86)r=baseR*(1-(s-0.86)/0.14);
      else r=baseR*(0.80+0.20*Math.cos(s*1.15));
      return Math.max(0.6,r);
    }
    var top=[],bot=[];
    for(var i=0;i<N;i++){
      var pa=seg[Math.max(0,i-1)],pb=seg[Math.min(N-1,i+1)];
      var tx=pb.x-pa.x,ty=pb.y-pa.y,tl=Math.hypot(tx,ty)||1;
      var nx=-ty/tl,ny=tx/tl,r=radAt(i);
      top.push([seg[i].x+nx*r,seg[i].y+ny*r]);bot.push([seg[i].x-nx*r,seg[i].y-ny*r]);
    }
    ctx.lineCap='round';ctx.lineJoin='round';
    // dolgulu gövde
    ctx.beginPath();ctx.moveTo(top[0][0],top[0][1]);
    for(var i=1;i<N;i++)ctx.lineTo(top[i][0],top[i][1]);
    for(var i=N-1;i>=0;i--)ctx.lineTo(bot[i][0],bot[i][1]);
    ctx.closePath();
    var h=seg[0],n=seg[1]||seg[0];
    var ang=Math.atan2(h.y-n.y,h.x-n.x);
    var gx=Math.cos(ang+1.5708),gy=Math.sin(ang+1.5708);
    var grad=ctx.createLinearGradient(h.x-gx*baseR,h.y-gy*baseR,h.x+gx*baseR,h.y+gy*baseR);
    grad.addColorStop(0,'rgba('+col.hi+',0.97)');grad.addColorStop(0.5,'rgba('+col.body+',0.97)');grad.addColorStop(1,'rgba('+col.belly+',0.97)');
    ctx.fillStyle=grad;ctx.fill();
    // sırt deseni
    ctx.fillStyle=col.pat;
    for(var i=5;i<N-3;i+=3){
      var p=seg[i],rr=radAt(i)*0.46;
      var pa=seg[i-1],pb=seg[i+1];var aa=Math.atan2(pb.y-pa.y,pb.x-pa.x);
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(aa);
      ctx.beginPath();ctx.moveTo(0,-rr);ctx.lineTo(rr*1.1,0);ctx.lineTo(0,rr);ctx.lineTo(-rr*1.1,0);ctx.closePath();ctx.fill();
      ctx.restore();
    }
    // ── baş (sivri, evil) ──
    var hr=baseR*1.12+2;
    ctx.save();ctx.translate(h.x,h.y);ctx.rotate(ang);
    var hg=ctx.createLinearGradient(0,-hr,0,hr);
    hg.addColorStop(0,'rgba('+col.hi+',1)');hg.addColorStop(1,'rgba('+col.belly+',1)');
    ctx.fillStyle=hg;
    ctx.beginPath();
    ctx.moveTo(hr*1.7,0);
    ctx.quadraticCurveTo(hr*0.5,-hr*1.15,-hr*0.9,-hr*0.85);
    ctx.quadraticCurveTo(-hr*1.2,0,-hr*0.9,hr*0.85);
    ctx.quadraticCurveTo(hr*0.5,hr*1.15,hr*1.7,0);
    ctx.closePath();ctx.fill();
    ctx.lineWidth=1;ctx.strokeStyle='rgba('+col.belly+',0.8)';ctx.stroke();
    // gözler — küçük, kötücül kırmızı, dikey yarık (cute değil; parıltı yok)
    var pul=0.65+0.35*Math.sin(t*3.5);
    var eyes=[[hr*0.12,-hr*0.50],[hr*0.12,hr*0.50]];
    for(var e=0;e<2;e++){
      var ex=eyes[e][0],ey=eyes[e][1];
      ctx.save();
      ctx.shadowColor='rgba('+col.eye+','+pul+')';ctx.shadowBlur=5;
      ctx.fillStyle='rgba('+col.eye+',1)';
      ctx.beginPath();ctx.ellipse(ex,ey,hr*0.34,hr*0.26,0,0,6.2832);ctx.fill();
      ctx.restore();
      ctx.fillStyle='rgba(8,5,3,0.95)';
      ctx.beginPath();ctx.ellipse(ex+hr*0.05,ey,hr*0.09,hr*0.20,0,0,6.2832);ctx.fill();
    }
    ctx.restore();
    // ── çatal dil (titreyerek) ──
    var fl=Math.sin(t*5);
    if(fl>0.3){
      var f=(fl-0.3)/0.7,t0=hr*1.7,tl2=hr*(1.1+f*1.7);
      var bx=h.x+Math.cos(ang)*t0,by=h.y+Math.sin(ang)*t0;
      var ttx=h.x+Math.cos(ang)*(t0+tl2),tty=h.y+Math.sin(ang)*(t0+tl2);
      var wob=Math.sin(t*9)*1.4;
      var mxp=(bx+ttx)/2+Math.cos(ang+1.5708)*wob,myp=(by+tty)/2+Math.sin(ang+1.5708)*wob;
      ctx.strokeStyle='rgba('+col.tongue+',0.95)';ctx.lineWidth=Math.max(0.9,hr*0.14);ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(mxp,myp,ttx,tty);
      ctx.lineTo(ttx+Math.cos(ang+0.42)*hr*0.6,tty+Math.sin(ang+0.42)*hr*0.6);
      ctx.moveTo(ttx,tty);
      ctx.lineTo(ttx+Math.cos(ang-0.42)*hr*0.6,tty+Math.sin(ang-0.42)*hr*0.6);
      ctx.stroke();
    }
  }

  // ── ouroboros: 0'ın etrafında ağır ağır dön (baş kuyruğa yaklaşır) ──
  function ouroStep(ox,oy){
    var c=zero(ox,oy);oro+=0.0055;
    var N=seg.length,wrap=0.97;
    for(var i=0;i<N;i++){
      var a=oro-i*(6.2832*wrap/N);
      var tx=c.x+Math.cos(a)*c.R,ty=c.y+Math.sin(a)*c.R;
      seg[i].x+=(tx-seg[i].x)*0.10;seg[i].y+=(ty-seg[i].y)*0.10;
    }
  }
  // ── oyun: imleci takip et, ye, büyü (imleç canvas-yerel) ──
  function gameStep(col,ox,oy){
    var tx=mIn?(mx-ox):seg[0].x,ty=mIn?(my-oy):seg[0].y;
    seg[0].x+=(tx-seg[0].x)*0.18;seg[0].y+=(ty-seg[0].y)*0.18;
    for(var i=1;i<seg.length;i++){
      var dx=seg[i].x-seg[i-1].x,dy=seg[i].y-seg[i-1].y,d=Math.hypot(dx,dy)||0.001;
      if(d>SEGLEN){seg[i].x=seg[i-1].x+dx/d*SEGLEN;seg[i].y=seg[i-1].y+dy/d*SEGLEN;}
    }
    var m=18;
    if(seg[0].x<m)seg[0].x=m;if(seg[0].x>W-m)seg[0].x=W-m;
    if(seg[0].y<m)seg[0].y=m;if(seg[0].y>H-m)seg[0].y=H-m;
    if(FOOD.length<MAX_FOOD&&Math.random()<0.02)spawnFood();
    checkEat(col);
  }

  function draw(){
    window.__sc404Raf=requestAnimationFrame(draw);
    if(W===0)resize();
    var crect=cnv.getBoundingClientRect();var ox=crect.left,oy=crect.top;
    if(seg.length===0)initSnake(ox,oy);
    t+=0.016;
    var col=palette();
    mode=(mIn&&(t-lastMove)<3.2)?'game':'ouro';
    ctx.clearRect(0,0,W,H);
    if(mode==='game'){
      gameStep(col,ox,oy);
      for(var i=0;i<FOOD.length;i++){FOOD[i].alpha=Math.min(1,FOOD[i].alpha+0.04);FOOD[i].pulse+=0.02;drawBrain(FOOD[i],col);}
      eatAnim=eatAnim.filter(function(a){a.r+=2.6;a.life-=0.045;if(a.life<=0)return false;ctx.strokeStyle='rgba('+a.col+','+a.life+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,6.2832);ctx.stroke();return true;});
    } else {
      // boşta: beyinleri sönümle, ouroboros'a dön
      for(var i=FOOD.length-1;i>=0;i--){FOOD[i].alpha-=0.05;if(FOOD[i].alpha<=0)FOOD.splice(i,1);else drawBrain(FOOD[i],col);}
      ouroStep(ox,oy);
    }
    drawSnake(col);
  }

  if(!window.__sc404Raf){resize();draw();}
  window.addEventListener('resize',function(){resize();},{passive:true});
  window.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;mIn=true;lastMove=t;},{passive:true});
  window.addEventListener('mouseleave',function(){mIn=false;});
  window.addEventListener('touchmove',function(e){if(e.touches&&e.touches[0]){mx=e.touches[0].clientX;my=e.touches[0].clientY;mIn=true;lastMove=t;}},{passive:true});

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
