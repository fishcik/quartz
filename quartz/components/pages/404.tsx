import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

// ── SAYKO.ch 404: SERPENT SNAKE OYUNU ──────────────────────────────────────
// Tam sayfa playground. Yılan imleci takip eder; oyalanınca kendi kendine
// dolaşır. Ekrana saçılmış stilize beyinleri yiyince büyür (Snake mantığı).
const NotFound: QuartzComponent = ({ cfg, ctx }: QuartzComponentProps) => {
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = ctx.argv.serve ? "/" : url.pathname

  return (
    <article class="sc-404">
      {/* Tam sayfa canvas — yılan tüm sayfada gezebilsin */}
      <canvas id="sc-404-field" aria-hidden="true"></canvas>
      {/* "4 BEYİN 4" üst başlık — canvas'ın üstünde z-index ile */}
      <div class="sc-404-row">
        <span class="sc-404-d" aria-hidden="true">4</span>
        <div class="sc-404-brainstage" aria-label="Serpent brain canvas" />
        <span class="sc-404-d" aria-hidden="true">4</span>
      </div>
      <h1 class="sc-404-title">Bu sayfa henüz keşfedilmedi.</h1>
      <p class="sc-404-quote" id="sc-404-quote">
        Aradığın şey burada değil. Belki de henüz keşfedilmeyi bekliyor.
      </p>
      <p class="sc-404-hint" id="sc-404-hint">İmleci gezdir — yılan peşinden gelsin. Beyinleri ye, büyü.</p>
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
    "Bu bir Rorschach testi değil. Ama yine de bir şey anlatıyor.",
    "Teori biter, 404 başlar.",
    "Bu sayfa, bilinçaltına geri bastırıldı.",
    "Yanlış-anı mı? Sayfanın var olduğuna emin misin?",
    "Bağlantı koptu. Aktarım devam ediyor.",
    "Kitapta durduğu gibi durmaz; bu link de durmadı.",
    "Uyaran yok. Tepki de yok. Sadece boşluk.",
    "Şema uyuşmazlığı: beklediğin sayfa mevcut değil.",
    "Büyüdükçe, daha da kaybolursun.",
    "Beyin yemek bilgi kazanmak değildir. Ama nöral yoğunluğu artırır.",
    "Her 404 bir keşfedilmemiş bölgedir."
  ];
  var qEl=document.getElementById('sc-404-quote');
  function newQuote(){ if(qEl){ var i=Math.floor(Math.random()*Q.length); qEl.style.opacity='0'; setTimeout(function(){qEl.textContent=Q[i];qEl.style.opacity='1';},220); } }

  // ── TAM SAYFA CANVAS ──
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

  function palette(){
    var dk=document.documentElement.getAttribute('saved-theme')==='dark';
    return dk
      ? {body:'145,198,108', outline:'80,140,55', acc:'210,24,30', eye:'255,255,255',
         brain:'160,148,128', gyri:'120,108,90', food:'210,24,30', bg:'10,10,10'}
      : {body:'100,160,65',  outline:'60,110,35', acc:'200,16,46', eye:'255,255,255',
         brain:'110,96,78',  gyri:'140,124,104',  food:'200,16,46', bg:'245,242,235'};
  }

  // ── YILAN STATE ──
  var SEGLEN=14;         // segment arası mesafe (px) — küçük başlar
  var SEG_W=9;           // başlangıç gövde kalınlığı
  var seg=[];            // [{x,y}]
  var score=0;
  var t=0,idle=0,mIn=false,mx=W/2,my=H/2;
  var eatAnim=[];        // yeme animasyonu patlamaları

  function initSnake(){
    seg=[];
    var startX=W*0.5, startY=H*0.5;
    for(var i=0;i<12;i++)seg.push({x:startX+i*SEGLEN,y:startY});
    mx=startX-80;my=startY;
  }

  function snakeRadius(){ return SEG_W*0.5+score*0.18; } // büyüdükçe kalınlaşır

  // ── BEYİN YİYECEKLERİ (food items) ──
  var FOOD=[], MAX_FOOD=6;
  function spawnFood(){
    if(FOOD.length>=MAX_FOOD)return;
    var margin=60;
    var fx=margin+Math.random()*(W-2*margin);
    var fy=margin+Math.random()*(H-2*margin);
    // başlangıç konumundan çok yakın koyma
    if(seg.length&&Math.sqrt((fx-seg[0].x)*(fx-seg[0].x)+(fy-seg[0].y)*(fy-seg[0].y))<100)return;
    FOOD.push({x:fx,y:fy,r:12+Math.random()*6,pulse:Math.random()*6.28,eaten:false,alpha:1});
  }

  function drawFood(f,col){
    var r=f.r*(0.95+0.05*Math.sin(f.pulse+t*2))*f.alpha;
    ctx.save();ctx.translate(f.x,f.y);ctx.scale(r/60,r/60);
    ctx.lineWidth=1.8/(r/60);ctx.lineCap='round';ctx.lineJoin='round';
    ctx.strokeStyle='rgba('+col.brain+','+f.alpha+')';
    ctx.beginPath();
    ctx.moveTo(-2,-44);ctx.bezierCurveTo(-30,-46,-52,-26,-44,-6);
    ctx.bezierCurveTo(-58,4,-50,30,-30,30);ctx.bezierCurveTo(-26,44,-4,46,2,34);
    ctx.bezierCurveTo(8,46,30,46,34,30);ctx.bezierCurveTo(54,30,60,6,46,-6);
    ctx.bezierCurveTo(56,-26,34,-48,8,-42);ctx.bezierCurveTo(6,-46,0,-46,-2,-44);
    ctx.stroke();
    ctx.beginPath();ctx.moveTo(1,-42);ctx.lineTo(2,34);ctx.stroke();
    ctx.strokeStyle='rgba('+col.gyri+','+f.alpha*0.6+')';ctx.lineWidth=1.2/(r/60);
    var g=[[-30,-20,-18,-12],[-38,2,-24,8],[-26,18,-14,22],[14,-22,28,-14],[18,4,34,8]];
    for(var i=0;i<g.length;i++){
      ctx.beginPath();ctx.moveTo(g[i][0],g[i][1]);
      ctx.quadraticCurveTo((g[i][0]+g[i][2])/2,g[i][1]-8,g[i][2],g[i][3]);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── YEME KONTROLÜ ──
  function checkEat(col){
    var hr=snakeRadius()+8;
    var hx=seg[0].x,hy=seg[0].y;
    for(var i=FOOD.length-1;i>=0;i--){
      var f=FOOD[i];if(f.eaten)continue;
      var dx=hx-f.x,dy=hy-f.y;
      if(dx*dx+dy*dy<(hr+f.r)*(hr+f.r)){
        f.eaten=true;score++;
        var sv=document.getElementById('sc-404-score-val');if(sv)sv.textContent=String(score);
        newQuote();
        // gövdeye segment ekle (kuyruktan)
        var last=seg[seg.length-1];
        for(var j=0;j<5;j++)seg.push({x:last.x,y:last.y});
        // patlama animasyonu
        eatAnim.push({x:f.x,y:f.y,r:0,maxR:f.r*4,life:1,col:col.food});
        FOOD.splice(i,1);
      }
    }
  }

  // ── YILAN ÇİZİMİ ──
  function drawSnake(col){
    if(seg.length<2)return;
    var baseR=snakeRadius();
    ctx.lineCap='round';ctx.lineJoin='round';

    // gövde: her segment arası kalın çizgi, kuyruğa doğru incelir
    for(var i=seg.length-2;i>=0;i--){
      var a=seg[i+1],b=seg[i];
      var ratio=1-i/(seg.length-1);      // 0 (kuyruk) → 1 (baş)
      var lw=Math.max(1.5,baseR*2*ratio);
      var alpha=0.55+ratio*0.45;
      // deri efekti: hafif yeşil geçişi
      var g2=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
      g2.addColorStop(0,'rgba('+col.body+','+alpha+')');
      g2.addColorStop(1,'rgba('+col.outline+','+alpha+')');
      ctx.strokeStyle=g2;
      ctx.lineWidth=lw;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    }

    // skales efekti (her 4 segmentte gölge nokta)
    for(var i=4;i<seg.length;i+=4){
      var s=seg[i];
      var r2=Math.max(1,(baseR*2*(1-i/(seg.length-1)))*0.2);
      ctx.fillStyle='rgba('+col.outline+',0.25)';
      ctx.beginPath();ctx.arc(s.x,s.y,r2,0,6.2832);ctx.fill();
    }

    // baş
    var h=seg[0],n=seg[1]||seg[0];
    var ang=Math.atan2(h.y-n.y,h.x-n.x);
    var hr=baseR;
    ctx.fillStyle='rgba('+col.body+',1)';
    ctx.beginPath();ctx.ellipse(h.x,h.y,hr*1.4,hr,ang,0,6.2832);ctx.fill();
    // outline
    ctx.strokeStyle='rgba('+col.outline+',0.8)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.ellipse(h.x,h.y,hr*1.4,hr,ang,0,6.2832);ctx.stroke();

    // gözler
    var eyeOff=hr*0.65;
    var ex1=h.x+Math.cos(ang+1.2)*eyeOff, ey1=h.y+Math.sin(ang+1.2)*eyeOff;
    var ex2=h.x+Math.cos(ang-1.2)*eyeOff, ey2=h.y+Math.sin(ang-1.2)*eyeOff;
    var er=hr*0.28;
    ctx.fillStyle='rgba('+col.eye+',0.95)';
    ctx.beginPath();ctx.arc(ex1,ey1,er,0,6.2832);ctx.fill();
    ctx.beginPath();ctx.arc(ex2,ey2,er,0,6.2832);ctx.fill();
    // gözbebekleri — kardinal kırmızı
    var pu=0.6+0.4*Math.sin(t*4);
    ctx.fillStyle='rgba('+col.acc+','+pu+')';
    ctx.beginPath();ctx.arc(ex1+Math.cos(ang)*er*0.3,ey1+Math.sin(ang)*er*0.3,er*0.52,0,6.2832);ctx.fill();
    ctx.beginPath();ctx.arc(ex2+Math.cos(ang)*er*0.3,ey2+Math.sin(ang)*er*0.3,er*0.52,0,6.2832);ctx.fill();

    // çatal dil
    var tBase=hr*1.35, tFork=hr*0.6;
    var tx0=h.x+Math.cos(ang)*hr*1.3, ty0=h.y+Math.sin(ang)*hr*1.3;
    var tx1=h.x+Math.cos(ang)*hr*(1.3+tBase/hr), ty1=h.y+Math.sin(ang)*hr*(1.3+tBase/hr);
    ctx.strokeStyle='rgba('+col.acc+',0.92)';ctx.lineWidth=Math.max(0.8,hr*0.15);
    ctx.beginPath();ctx.moveTo(tx0,ty0);ctx.lineTo(tx1,ty1);
    ctx.lineTo(tx1+Math.cos(ang+0.42)*tFork,ty1+Math.sin(ang+0.42)*tFork);
    ctx.moveTo(tx1,ty1);
    ctx.lineTo(tx1+Math.cos(ang-0.42)*tFork,ty1+Math.sin(ang-0.42)*tFork);
    ctx.stroke();
  }

  // ── AI: İmleç yokken kendi kendine güzel bir yol çizer ──
  var aiTarget={x:0,y:0}, aiTimer=0;
  function updateAI(){
    aiTimer-=0.016;
    if(aiTimer<=0||Math.sqrt((seg[0].x-aiTarget.x)*(seg[0].x-aiTarget.x)+(seg[0].y-aiTarget.y)*(seg[0].y-aiTarget.y))<60){
      // En yakın food'a git (varsa), yoksa rastgele bir kenar noktası
      var best=null, bestD=1e9;
      for(var i=0;i<FOOD.length;i++){
        var dx=FOOD[i].x-seg[0].x,dy=FOOD[i].y-seg[0].y;
        var d=dx*dx+dy*dy;if(d<bestD){bestD=d;best=FOOD[i];}
      }
      if(best){aiTarget.x=best.x+((Math.random()-0.5)*30);aiTarget.y=best.y+((Math.random()-0.5)*30);}
      else{
        var margin=80;
        aiTarget.x=margin+Math.random()*(W-2*margin);
        aiTarget.y=margin+Math.random()*(H-2*margin);
      }
      aiTimer=2+Math.random()*3;
    }
  }

  // ── ANA DÖNGÜ ──
  function draw(){
    window.__sc404Raf=requestAnimationFrame(draw);
    if(W===0){resize();initSnake();for(var k=0;k<4;k++)spawnFood();}
    t+=0.016;
    var col=palette();

    // yönlendirme
    var tx,ty;
    if(mIn){tx=mx;ty=my;}
    else{updateAI();tx=aiTarget.x;ty=aiTarget.y;}

    // baş hareketi
    var speed=mIn?0.14:0.11;
    seg[0].x+=(tx-seg[0].x)*speed;
    seg[0].y+=(ty-seg[0].y)*speed;

    // zincir kısıtı
    for(var i=1;i<seg.length;i++){
      var dx=seg[i].x-seg[i-1].x,dy=seg[i].y-seg[i-1].y;
      var d=Math.sqrt(dx*dx+dy*dy)||0.001;
      if(d>SEGLEN){seg[i].x=seg[i-1].x+dx/d*SEGLEN;seg[i].y=seg[i-1].y+dy/d*SEGLEN;}
    }

    // ekranda tut
    var margin=20;
    if(seg[0].x<margin)seg[0].x=margin;if(seg[0].x>W-margin)seg[0].x=W-margin;
    if(seg[0].y<margin)seg[0].y=margin;if(seg[0].y>H-margin)seg[0].y=H-margin;

    // yeme kontrolü
    checkEat(col);

    // yeni beyin doğur
    if(FOOD.length<MAX_FOOD&&Math.random()<0.012)spawnFood();

    // çiz
    ctx.clearRect(0,0,W,H);

    // food
    for(var i=0;i<FOOD.length;i++)drawFood(FOOD[i],col);

    // yeme patlamaları
    eatAnim=eatAnim.filter(function(a){
      a.r+=2.5; a.life-=0.04;
      if(a.life<=0)return false;
      ctx.strokeStyle='rgba('+a.col+','+a.life+')';
      ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,6.2832);ctx.stroke();
      return true;
    });

    drawSnake(col);
  }

  if(!window.__sc404Raf){resize();initSnake();for(var k=0;k<4;k++)spawnFood();draw();}

  window.addEventListener('resize',function(){resize();},{passive:true});
  window.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;mIn=true;},{passive:true});
  window.addEventListener('mouseleave',function(){mIn=false;});
  document.getElementById('sc-404-field').style.cursor='crosshair';

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
