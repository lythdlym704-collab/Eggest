// EGG HEIST - low-poly stealth arcade. Edit the Z table to tweak zones.
const $=id=>document.getElementById(id),cv=$('cv');
// g=ground s=sky/fog mov=moving blocks haz=fast hazards laser=tripwires cam=tracking cameras
// slip=floor slide bridge=narrow lane wind=side push fov=view width agg=aggressive pair=synced guards
const Z=[
{n:'The Outskirts',g:0x4caf50,s:0x87ceeb},
{n:'The Dusty Path',g:0xc2a368,s:0xe6d3a3,fov:1.25},
{n:'The Iron Outpost',g:0x777c80,s:0x9aa5ad,fov:1.25,mov:3},
{n:'The Abandoned Factory',g:0x6b4a3a,s:0x4a3b33,fov:1.25,mov:2,pair:1},
{n:'The Neon Alley',g:0x1a1030,s:0x2a0a4a,fov:1.25,laser:4,pair:1},
{n:'The Crystal Cavern',g:0x1d4f8c,s:0x0a1f3c,slip:1,bridge:1,laser:2},
{n:'The Volcanic Ridge',g:0x2b1a17,s:0x5a1a0a,haz:5},
{n:'The High-Tech Facility',g:0xeeeeee,s:0xcfd8dc,cam:3},
{n:'The Frozen Tundra',g:0xcfeaf5,s:0xeaf6fb,slip:1,agg:1},
{n:'The Sky Bridge',g:0x9fb6cd,s:0x6fb1ff,wind:1,bridge:1,haz:0},
{n:'The Shadow Swamp',g:0x2f4a2f,s:0x1a2a1a,fog:.09,agg:1},
{n:'The Royal Vault',g:0xd4af37,s:0x3a2d0a,heavy:1,laser:3,cam:2},
{n:'The Core Abyss',g:0x200010,s:0x000000,chase:1,haz:6,fog:.05,agg:1}];
let S=Object.assign({c:0,sp:0,st:0,u:1},JSON.parse(localStorage.eh||'{}'));
const save=()=>localStorage.eh=JSON.stringify(S);
const R=new THREE.WebGLRenderer({canvas:cv,antialias:false,powerPreference:'high-performance'});
R.setPixelRatio(1);
const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(60,1,.1,150);
sc.add(new THREE.HemisphereLight(0xffffff,0x666666,1.3));
const rs=()=>{R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};
addEventListener('resize',rs);rs();
const GB=new THREE.BoxGeometry(1,1,1),GS=new THREE.SphereGeometry(.5,6,5),mats={};
const mat=c=>mats[c]||(mats[c]=new THREE.MeshLambertMaterial({color:c,flatShading:true}));
const rnd=(a,b)=>a+Math.random()*(b-a);
let G,zi=0,Zc,n=1,D=0,hw=16,t=0,run=false,carry=0,banked=0,px=0,pz=0,sel=0,md=0;
let eggs=[],obs=[],movs=[],lasers=[],gs=[];const pv={x:0,z:0};
const pl=new THREE.Mesh(GB,mat(0x00e676));pl.scale.set(.9,1.5,.9);sc.add(pl);
function box(x,y,z,w,h,d,c,sph){const m=new THREE.Mesh(sph?GS:GB,mat(c));m.scale.set(w,h,d);m.position.set(x,y,z);G.add(m);return m}
function mk(c){const m=new THREE.Group(),b=new THREE.Mesh(GB,mat(c)),nz=new THREE.Mesh(GB,mat(0xffeb3b));
 b.scale.set(1,1.6,1);b.position.y=.8;nz.scale.set(.35,.35,.7);nz.position.set(0,1.1,.7);m.add(b,nz);G.add(m);return m}
function build(i){
 if(G)sc.remove(G);G=new THREE.Group();sc.add(G);
 zi=i;Zc=Z[i];n=i+1;D=50+n*6;hw=Zc.bridge?4:16;
 eggs=[];obs=[];movs=[];lasers=[];gs=[];carry=banked=0;px=0;pz=D-3;pv.x=pv.z=0;
 sc.background=new THREE.Color(Zc.s);sc.fog=new THREE.FogExp2(Zc.s,Zc.fog||.02);
 box(0,-.1,D/2,hw*2+6,.2,D+16,Zc.g);
 box(0,.02,D-3,10,.1,10,0x2196f3);
 for(let k=0;k<5;k++){const x=rnd(-hw+2,hw-2),z=rnd(6,D-20);eggs.push({m:box(x,.7,z,.7,.9,.7,0xfff3d0,1),x,z,s:0})}
 const dc=new THREE.Color(Zc.g).multiplyScalar(.55).getHex();
 if(!Zc.bridge)for(let k=0;k<6+n;k++){const w=rnd(2,4),d=rnd(2,4),x=rnd(-hw+2,hw-2),z=rnd(8,D-16);box(x,1,z,w,2,d,dc);obs.push({x,z,w,d})}
 const nm=Zc.mov||0;
 for(let k=0;k<nm+(Zc.haz||0);k++)movs.push({m:box(0,.8,rnd(10,D-16),2.4,1.6,2.4,k>=nm?0xff4400:0xb0b0b0),a:hw-2,w:rnd(.6,1.2)*(1+n*.08),ph:rnd(0,6)});
 for(let k=0;k<(Zc.laser||0);k++){const z=rnd(10,D-16);lasers.push({m:box(0,.6,z,hw*2,.1,.1,0xff0044),z,ph:rnd(0,6)})}
 const cnt=2+(n>>1)+(Zc.heavy?2:0),pr=Zc.pair;
 for(let k=0;k<cnt;k++){const ln=pr?k>>1:k,ls=pr?Math.ceil(cnt/2):cnt;
  gs.push({m:mk(0xff3344),z:10+ln*((D-28)/ls)+3,ph:pr?ln*2:rnd(0,6),A:hw-1,sg:pr&&k%2?-1:1,st:0,d:0,x:0,fx:1,fz:0})}
 for(let k=0;k<(Zc.cam||0);k++)gs.push({cam:1,m:mk(0xffd600),x:k%2?hw:-hw,z:12+k*((D-30)/Zc.cam),st:0,d:0,fx:0,fz:1});
 if(Zc.chase)for(let k=0;k<2;k++)gs.push({el:1,m:mk(0x9c27b0),x:k?6:-6,z:6,st:0,d:0,fx:0,fz:1});
 hud();
}
function hud(){$('zn').textContent='Z'+n+' '+Zc.n;$('co').textContent='🪙'+S.c;$('eg').textContent='🥚'+carry+'/3 ✔'+banked+'/5'}
function msg(s){const m=$('msg');m.textContent=s;m.style.opacity=1;setTimeout(()=>m.style.opacity=0,900)}
function caught(){msg('Caught!');eggs.forEach(e=>{if(e.s==1){e.s=0;e.m.visible=true}});carry=0;px=0;pz=D-3;pv.x=pv.z=0;
 gs.forEach(g=>{g.st=0;g.d=0});hud()}
function win(){run=false;if(zi+2>S.u&&zi<12)S.u=zi+2;save();sel=Math.min(zi+1,S.u-1,12);menu(zi==12?'You beat the Core Abyss!':'Zone cleared!')}
let jx=0,jy=0,o=null;
cv.onpointerdown=e=>{o=[e.clientX,e.clientY];$('jz').style.cssText='display:block;left:'+(o[0]-40)+'px;top:'+(o[1]-40)+'px'};
cv.onpointermove=e=>{if(!o)return;let x=(e.clientX-o[0])/40,y=(e.clientY-o[1])/40;const l=Math.hypot(x,y);if(l>1){x/=l;y/=l}jx=x;jy=y};
cv.onpointerup=cv.onpointercancel=()=>{o=null;jx=jy=0;$('jz').style.display='none'};
function upd(dt){
 t+=dt;
 const sp=6*(1+.08*S.sp),k=Zc.slip?1.2:14;
 pv.x+=(jx*sp-pv.x)*Math.min(1,k*dt);pv.z+=(jy*sp-pv.z)*Math.min(1,k*dt);
 if(Zc.wind)pv.x+=Math.sin(t*.7)*5*dt;
 px+=pv.x*dt;pz+=pv.z*dt;
 px=Math.max(-hw+.6,Math.min(hw-.6,px));pz=Math.max(0,Math.min(D+3,pz));
 for(const b of obs){const dx=px-b.x,dz=pz-b.z,ox=b.w/2+.5-Math.abs(dx),oz=b.d/2+.5-Math.abs(dz);
  if(ox>0&&oz>0){if(ox<oz)px+=dx>0?ox:-ox;else pz+=dz>0?oz:-oz}}
 for(const m of movs){const x=m.a*Math.sin(m.w*t+m.ph);m.m.position.x=x;
  if(Math.abs(px-x)<1.7&&Math.abs(pz-m.m.position.z)<1.7)return caught()}
 for(const l of lasers){const on=Math.sin(t*1.5+l.ph)>-.2;l.m.visible=on;if(on&&Math.abs(pz-l.z)<.4)return caught()}
 const inB=pz>D-8&&Math.abs(px)<5;
 for(const e of eggs)if(!e.s&&carry<3&&Math.hypot(px-e.x,pz-e.z)<1.3){e.s=1;e.m.visible=false;carry++;hud()}
 if(inB){
  if(carry){S.c+=carry*10*n;banked+=carry;eggs.forEach(e=>{if(e.s==1)e.s=2});carry=0;save();hud();if(banked>=5)return win()}
  gs.forEach(g=>{g.st=0;g.d=0});
 }
 const rt=Math.max(.1,1.5-n*.1),gsp=2.2*(1+n*.18),fv=Zc.fov||1;md=0;
 for(const g of gs){
  if(g.el&&!inB)g.st=1;
  if(g.st){const dx=px-g.x,dz=pz-g.z,dl=Math.hypot(dx,dz)||1;g.fx=dx/dl;g.fz=dz/dl;
   const v=gsp*(g.el?.85:1)*dt;g.x+=g.fx*v;g.z+=g.fz*v;if(dl<1.1)return caught()}
  else if(g.cam){const dx=px-g.x,dz=pz-g.z,dl=Math.hypot(dx,dz)||1;
   if(dl<30){g.fx=dx/dl;g.fz=dz/dl}else{g.fx=Math.cos(t*.5);g.fz=Math.sin(t*.5)}}
  else{const w=gsp/g.A,a=w*t+g.ph;g.x=g.sg*g.A*Math.sin(a);g.fx=g.sg*Math.sign(Math.cos(a))||1;g.fz=0}
  if(!g.st&&!inB){
   const dx=px-g.x,dz=pz-g.z,dl=Math.hypot(dx,dz)||1,rg=(g.cam?26:11)*fv*(Zc.agg?1.25:1)*(1-.04*S.st);
   const see=dl<rg&&(dx*g.fx+dz*g.fz)/dl>Math.cos(.55*fv);
   g.d=Math.max(0,Math.min(1,g.d+(see?dt/rt:-dt*.6)));
   if(g.d>=1){if(g.cam)gs.forEach(q=>{if(!q.cam)q.st=1});else g.st=1}
   if(g.d>md)md=g.d;
  }
  g.m.position.set(g.x,0,g.z);g.m.rotation.y=Math.atan2(g.fx,g.fz);
 }
 $('di').style.width=md*100+'%';
}
function menu(h){
 run=false;const m=$('menu');m.className='on';
 m.innerHTML='<h2>'+(h||'EGG HEIST')+'</h2><p>🪙 '+S.c+'</p><p>Zone '+(sel+1)+'/13<br>'+Z[sel].n+'</p>'+
 '<div><button data-a="p">‹</button><button data-a="n">›</button></div><button data-a="go">▶ PLAY</button>'+
 '<p>🏋 Gym treadmill</p><button data-a="sp">Speed Lv'+S.sp+' · 🪙'+50*(S.sp+1)+'</button><button data-a="st">Stealth Lv'+S.st+' · 🪙'+50*(S.st+1)+'</button>';
}
$('menu').onclick=e=>{const a=e.target.dataset.a;if(!a)return;
 if(a=='p')sel=Math.max(0,sel-1);
 else if(a=='n')sel=Math.min(S.u-1,sel+1);
 else if(a=='go'){$('menu').className='';build(sel);run=true;return}
 else{const c=50*(S[a]+1);if(S.c>=c){S.c-=c;S[a]++;save()}}
 menu()};
$('mb').onclick=()=>{sel=zi;menu('Paused')};
build(0);menu();
let last=performance.now();
(function f(now){requestAnimationFrame(f);const dt=Math.min(.05,(now-last)/1000);last=now;
 if(run)upd(dt);
 pl.position.set(px,.75,pz);cam.position.set(px,15,pz+11);cam.lookAt(px,0,pz-3);
 R.render(sc,cam)})(last);
