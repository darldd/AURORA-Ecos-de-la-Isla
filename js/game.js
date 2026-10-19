import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
// AURORA vertical slice: procedural island, quest state, pickups, NPC, combat and local save.
const $=id=>document.getElementById(id);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9ac8d0);scene.fog=new THREE.Fog(0x9ac8d0,38,115);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,220);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;$('world').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xc8efff,0x47624e,2));
const sun=new THREE.DirectionalLight(0xffe2b0,3);sun.position.set(-22,35,14);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.88,...extra});
const M={grass:mat(0x568b68),grass2:mat(0x709b71),sand:mat(0xd9c38f),stone:mat(0x7d918f),dark:mat(0x425b62),wood:mat(0x79543b),leaf:mat(0x2e6955),leaf2:mat(0x4b8b64),gold:mat(0xf0cc7b,{metalness:.25,roughness:.32,emissive:0x7d4e13,emissiveIntensity:.4}),crystal:mat(0x8ef5df,{metalness:.15,roughness:.2,emissive:0x35c8ac,emissiveIntensity:1.8}),skin:mat(0xb97959),cloth:mat(0xd3d4b8),enemy:mat(0x493f63,{emissive:0x241a3b,emissiveIntensity:.5})};
const cylinder=new THREE.CylinderGeometry(1,1,1,8),sphere=new THREE.SphereGeometry(1,12,10),box=new THREE.BoxGeometry(1,1,1);
function mesh(geo,material,x,y,z,sx=1,sy=1,sz=1,parent=scene){const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function group(x=0,y=0,z=0){const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);return g}
mesh(new THREE.CylinderGeometry(43,47,5,64),M.grass,0,-2.6,0);mesh(new THREE.CylinderGeometry(46,49,2.3,64),M.sand,0,-4.5,0);
const ocean=mesh(new THREE.CircleGeometry(180,64),mat(0x3c9aa7,{roughness:.24,metalness:.1}),0,-4.95,0);ocean.rotation.x=-Math.PI/2;
const ground=mesh(new THREE.CircleGeometry(41.7,64),M.grass2,0,-.02,0);ground.rotation.x=-Math.PI/2;
function path(x,z,sx,sz,rot=0){const p=mesh(new THREE.CircleGeometry(1,24),M.sand,x,.012,z,sx,sz,1);p.rotation.x=-Math.PI/2;p.rotation.z=rot}
path(-1,1,2.2,20,.02);path(1,-12,14,1.5,-.15);path(12,-13,1.5,10,.25);path(-9,9,9,1.4,-.55);
for(let i=0;i<9;i++){const a=i/9*Math.PI*2;mesh(new THREE.ConeGeometry(10,20,8),M.dark,Math.cos(a)*42,4,Math.sin(a)*42)}
for(let i=0;i<5;i++){const a=i*Math.PI*2/5;mesh(cylinder,M.stone,Math.cos(a)*5,.9,Math.sin(a)*5,.65,3.2,.65)}
mesh(new THREE.TorusGeometry(3.8,.25,8,24),M.gold,0,3.3,0).rotation.x=Math.PI/2;mesh(new THREE.CylinderGeometry(3.3,4.2,.6,8),M.dark,0,.3,0);
const trees=[];
function tree(x,z,s=1){const g=group(x,0,z);mesh(cylinder,M.wood,0,1.1*s,0,.34*s,2.2*s,.34*s,g);mesh(new THREE.ConeGeometry(1.6*s,3.3*s,7),M.leaf,0,3*s,0,1,1,1,g);mesh(new THREE.ConeGeometry(1.25*s,2.7*s,7),M.leaf2,0,4*s,0,1,1,1,g);trees.push({x,z,r:.8*s})}
for(let i=0;i<40;i++){const a=i*2.399,r=17+(i%7)*3,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.hypot(x,z)<35&&Math.hypot(x+2,z-2)>7)tree(x,z,.7+(i%4)*.13)}
for(let i=0;i<34;i++){const a=i*2.4,r=8+(i%8)*3;mesh(new THREE.DodecahedronGeometry(.45+(i%3)*.16),i%2?M.stone:M.sand,Math.cos(a)*r,.25,Math.sin(a)*r,1,.7,1)}
for(let i=0;i<55;i++){const a=i*2.17,r=5+(i%10)*2.8,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.hypot(x,z)<38)mesh(sphere,mat(i%2?0xf1d49a:0xb8e3b3),x,.18,z,.09,.12,.09)}
const player=group(0,0,8);mesh(cylinder,mat(0x314b5a),0,.7,0,.42,.9,.42,player);mesh(sphere,M.skin,0,1.45,0,.31,.34,.3,player);mesh(cylinder,M.cloth,0,.94,0,.44,.55,.43,player);mesh(box,M.gold,.22,.95,.02,.1,.52,.12,player);mesh(cylinder,M.wood,-.47,.88,0,.07,.7,.07,player).rotation.z=-.3;
const pos=player.position,keys={};let yaw=0,health=100,started=false,paused=false,dialogueOpen=false,velocityY=0,onGround=true,toastTime=0,last=performance.now();
const itemDefs={sunCrystal:{name:'Cristal del alba',icon:'✧'},herb:{name:'Hierba curativa',icon:'❋'},oldCoin:{name:'Moneda antigua',icon:'◉'},sword:{name:'Espada de viaje',icon:'⚔'}};
let inventory={sword:1,herb:1,oldCoin:0,sunCrystal:0},questStage=0,crystals=0,enemyHP=3,enemyAlive=true;
const pickups=[];
function crystalAt(x,z){const g=group(x,0,z);mesh(new THREE.OctahedronGeometry(.7),M.crystal,0,1.2,0,.75,1.5,.75,g);mesh(new THREE.TorusGeometry(.8,.035,6,20),M.gold,0,1.2,0).rotation.x=Math.PI/2;const light=new THREE.PointLight(0x65e7d1,2.2,7);light.position.y=1.4;g.add(light);pickups.push({type:'sunCrystal',group:g,x,z,active:true})}
crystalAt(-13,3);crystalAt(15,-3);crystalAt(5,-21);
function npcAt(x,z){const g=group(x,0,z);mesh(cylinder,M.cloth,0,.85,0,.42,.9,.42,g);mesh(sphere,M.skin,0,1.52,0,.3,.32,.3,g);mesh(new THREE.ConeGeometry(.34,.6,5),M.gold,0,1.92,0);mesh(cylinder,M.gold,.42,.9,0,.045,.8,.045,g);return {group:g,x,z,kind:'npc'}}
const npc=npcAt(-4,4),enemy=group(13,0,7),enemyStart=new THREE.Vector3(13,0,7);
mesh(sphere,M.enemy,0,1,0,.65,.8,.65,enemy);mesh(sphere,M.gold,-.2,1.15,-.48,.11,.11,.08,enemy);mesh(sphere,M.gold,.2,1.15,-.48,.11,.11,.08,enemy);mesh(new THREE.TorusGeometry(.75,.055,6,16),M.enemy,0,.55,0).rotation.x=Math.PI/2;
const colliders=trees.map(t=>({x:t.x,z:t.z,r:t.r}));
function toast(s){$('toast').textContent=s;$('toast').classList.remove('hidden');toastTime=2.5}
function setQuest(title,desc,pct,label){$('questTitle').textContent=title;$('questDesc').textContent=desc;$('progress').style.width=pct+'%';$('journalTitle').textContent=title;$('journalDesc').textContent=desc;$('journalStatus').textContent=label}
function updateHUD(){$('health').textContent=Math.round(health);$('healthText').textContent=`${Math.round(health)} / 100`;$('healthbar').style.width=health+'%';$('crystals').textContent=`${crystals}/3`;if(questStage===0)setQuest('Una luz en la distancia','Habla con Lyra junto al campamento.',0,'EN CURSO');if(questStage===1)setQuest('Fragmentos de aurora','Encuentra los 3 cristales que brillan en la isla.',crystals/3*100,`${crystals}/3 CRISTALES`);if(questStage===2)setQuest('La isla despierta','Has reunido los fragmentos. Vuelve a Lyra.',100,'REGRESA CON LYRA');if(questStage===3)setQuest('Ecos de la Isla','La luz ha despertado. La aventura continúa…',100,'COMPLETADA')}
function renderInventory(){const root=$('items');root.innerHTML='';for(const [id,it] of Object.entries(itemDefs)){const el=document.createElement('div');el.className='item';el.innerHTML=`<i>${it.icon}</i><b>${it.name}</b><small>× ${inventory[id]||0}</small>`;root.appendChild(el)}}
function nearby(){let best=null,d=3.2;const list=[npc,...pickups.filter(p=>p.active),...(enemyAlive?[{x:enemy.position.x,z:enemy.position.z,kind:'enemy'}]:[])];for(const o of list){const n=Math.hypot(pos.x-o.x,pos.z-o.z);if(n<d){d=n;best=o}}return best}
let target=null;
function interact(){if(!started||paused)return;if(dialogueOpen){nextDialogue();return}target=nearby();if(!target){toast('No hay nada con lo que interactuar cerca.');return}if(target.kind==='npc'){startDialogue();return}if(target.type==='sunCrystal'){target.active=false;target.group.visible=false;inventory.sunCrystal++;crystals++;updateHUD();renderInventory();toast('Cristal del alba recogido · +1');if(crystals===3&&questStage===1)questStage=2;updateHUD();return}if(target.kind==='enemy')attack()}
let lines=[],line=0;
function startDialogue(){dialogueOpen=true;$('dialogue').classList.remove('hidden');if(questStage===0)lines=['Viajero, la isla está perdiendo su luz. Tres cristales mantienen viva la aurora.','Encuentra los tres fragmentos y tráeme su energía. Sigue los senderos hasta las ruinas.'];else if(questStage===1)lines=[`Llevas ${crystals} de los 3 cristales. Escucha su brillo y sigue los senderos.`];else if(questStage===2)lines=['¡Lo conseguiste! Los fragmentos vuelven a cantar. La aurora despierta.','Este es solo el comienzo. Más allá de la costa hay historias por descubrir.'];else lines=['La isla vuelve a respirar. Gracias por ayudar a protegerla.'];line=0;$('dialogueText').textContent=lines[0]}
function nextDialogue(){line++;if(line<lines.length){$('dialogueText').textContent=lines[line];return}dialogueOpen=false;$('dialogue').classList.add('hidden');if(questStage===0){questStage=1;toast('Nueva misión: encuentra los 3 cristales.')}else if(questStage===2){questStage=3;inventory.oldCoin++;toast('MISIÓN COMPLETADA · +1 moneda antigua')}updateHUD();saveGame(false)}
function attack(){if(!enemyAlive)return;enemyHP--;toast(enemyHP>0?'Golpe certero. La criatura retrocede.':'¡La sombra se disipa! · +1 moneda');if(enemyHP<=0){enemyAlive=false;enemy.visible=false;inventory.oldCoin++;renderInventory()}else{enemy.position.x+=Math.sign(enemy.position.x-pos.x)*1.2;enemy.position.z+=Math.sign(enemy.position.z-pos.z)*1.2}}
document.addEventListener('mousedown',e=>{if(e.button===0&&started&&!paused&&!dialogueOpen&&enemyAlive&&Math.hypot(pos.x-enemy.position.x,pos.z-enemy.position.z)<3.5)attack()});
function togglePanel(id){const el=$(id),open=el.classList.contains('hidden');$('inventoryPanel').classList.add('hidden');$('journalPanel').classList.add('hidden');if(open)el.classList.remove('hidden');document.exitPointerLock?.()}
function togglePause(force){paused=typeof force==='boolean'?force:!paused;$('pausePanel').classList.toggle('hidden',!paused);if(paused)document.exitPointerLock?.();else if(started)renderer.domElement.requestPointerLock?.()}
function saveGame(show=true){try{localStorage.setItem('aurora-save',JSON.stringify({version:1,position:{x:pos.x,z:pos.z},health,inventory,crystals,questStage,enemyAlive,enemyHP}));if(show)toast('Partida guardada en este dispositivo.')}catch(e){if(show)toast('No se pudo guardar la partida.')}}
function loadGame(){try{const d=JSON.parse(localStorage.getItem('aurora-save'));if(!d||d.version!==1)return false;pos.x=THREE.MathUtils.clamp(d.position.x,-37,37);pos.z=THREE.MathUtils.clamp(d.position.z,-37,37);health=THREE.MathUtils.clamp(d.health,0,100);inventory={...inventory,...d.inventory};crystals=THREE.MathUtils.clamp(d.crystals,0,3);questStage=THREE.MathUtils.clamp(d.questStage,0,3);enemyAlive=d.enemyAlive;enemyHP=d.enemyHP;enemy.visible=enemyAlive;pickups.forEach((p,i)=>{p.active=i>=crystals;p.group.visible=p.active});updateHUD();renderInventory();return true}catch{return false}}
function startGame(){started=true;paused=false;$('menu').classList.add('hidden');$('pausePanel').classList.add('hidden');updateHUD();renderInventory();renderer.domElement.requestPointerLock?.();toast('Explora la isla. Acércate a Lyra y pulsa E.')}
$('play').onclick=()=>{questStage=0;crystals=0;health=100;inventory={sword:1,herb:1,oldCoin:0,sunCrystal:0};pickups.forEach(p=>{p.active=true;p.group.visible=true});enemyAlive=true;enemyHP=3;enemy.visible=true;enemy.position.copy(enemyStart);pos.set(0,0,8);startGame()};
$('continue').onclick=()=>{if(!loadGame()){toast('No hay una partida guardada todavía.');return}startGame()};
$('pause').onclick=()=>togglePause();$('resume').onclick=()=>togglePause(false);$('saveBtn').onclick=()=>saveGame();$('inventoryBtn').onclick=()=>togglePanel('inventoryPanel');$('journalBtn').onclick=()=>togglePanel('journalPanel');$('dialogueNext').onclick=nextDialogue;
$('exitMenu').onclick=()=>{saveGame(false);togglePause(false);started=false;document.exitPointerLock?.();$('menu').classList.remove('hidden')};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).classList.add('hidden'));
document.addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='KeyI')togglePanel('inventoryPanel');if(e.code==='KeyJ')togglePanel('journalPanel');if(e.code==='KeyK')saveGame();if(e.code==='Escape'&&started&&!dialogueOpen)togglePause();if(e.code==='KeyE')interact();if(e.code==='Space'&&onGround&&started&&!paused){velocityY=7;onGround=false}});
document.addEventListener('keyup',e=>keys[e.code]=false);window.addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));
renderer.domElement.addEventListener('click',()=>{if(started&&!paused&&!dialogueOpen)renderer.domElement.requestPointerLock?.()});
document.addEventListener('mousemove',e=>{if(document.pointerLockElement===renderer.domElement&&!paused&&!dialogueOpen)yaw-=e.movementX*.0025});
function update(dt){if(!started||paused)return;const f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),s=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),moving=f!==0||s!==0,speed=(keys.ShiftLeft||keys.ShiftRight)?10:6;if(moving&&!dialogueOpen){const l=Math.hypot(f,s),dx=(-Math.sin(yaw)*f/l+Math.cos(yaw)*s/l)*speed*dt,dz=(-Math.cos(yaw)*f/l-Math.sin(yaw)*s/l)*speed*dt,nx=pos.x+dx,nz=pos.z+dz;if(Math.hypot(nx,nz)<39&&!colliders.some(c=>Math.hypot(nx-c.x,nz-c.z)<c.r+.45)){pos.x=nx;pos.z=nz}player.rotation.y=Math.atan2(-dx,-dz)}
if(!onGround){velocityY-=18*dt;pos.y+=velocityY*dt;if(pos.y<=0){pos.y=0;velocityY=0;onGround=true}}
const r=Math.hypot(pos.x,pos.z);if(r>38){pos.x*=38/r;pos.z*=38/r}
if(enemyAlive){const t=performance.now()*.0007;enemy.position.x=enemyStart.x+Math.sin(t)*2;enemy.position.z=enemyStart.z+Math.cos(t*1.2)*2;if(Math.hypot(pos.x-enemy.position.x,pos.z-enemy.position.z)<1.5&&Math.random()<dt*.55){health=Math.max(0,health-8);updateHUD();toast('La sombra te ha herido. ¡Contraataca!');if(health<=0){health=100;pos.set(0,0,8);updateHUD();toast('Te recuperaste en el campamento.')}}}
pickups.forEach((p,i)=>{if(p.active){p.group.rotation.y+=dt*.5;p.group.position.y=Math.sin(performance.now()*.0018+i)*.12}});
target=nearby();if(target&&!dialogueOpen){$('prompt').classList.remove('hidden');$('promptText').textContent=target.kind==='npc'?'Hablar con Lyra':target.type==='sunCrystal'?'Recoger cristal':'Atacar sombra'}else $('prompt').classList.add('hidden');
if(toastTime>0){toastTime-=dt;if(toastTime<=0)$('toast').classList.add('hidden')}
}
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.04);last=now;update(dt);camera.position.lerp(new THREE.Vector3(pos.x-Math.sin(yaw)*8,5.5+pos.y,pos.z+Math.cos(yaw)*8),.12);camera.lookAt(pos.x,1.2+pos.y,pos.z);renderer.render(scene,camera)}
updateHUD();renderInventory();requestAnimationFrame(frame);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});