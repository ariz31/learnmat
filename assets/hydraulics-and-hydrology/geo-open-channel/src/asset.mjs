import { DEFAULTS, computeOpenChannel, validateOpenChannelParameters } from './model.mjs';
const THREE_VERSION='185',clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createAsset(context={}){
 const T=context.three;if(!T||String(T.REVISION)!==THREE_VERSION)throw new Error('geo-open-channel requires host Three.js r185.');
 if(!context.scene||typeof context.scene.add!=='function')throw new TypeError('geo-open-channel requires a host-owned THREE.Scene.');
 const reducedMotion=Boolean(context.reducedMotion);let disposed=false,timeSeconds=0,parameters={...DEFAULTS},state=computeOpenChannel(parameters);
 const root=new T.Group();root.name='geo-open-channel';context.scene.add(root);let dynamic=new T.Group();root.add(dynamic);
 const ownedMaterials=[];let ownedGeometries=[],particles=[];
 const mat=(opts,physical=false)=>{const m=physical?new T.MeshPhysicalMaterial(opts):new T.MeshStandardMaterial(opts);ownedMaterials.push(m);return m};
 const concrete=mat({color:0xaab1b2,roughness:.82,metalness:.02}),water=mat({color:0x1d9dd2,transparent:true,opacity:.58,roughness:.08,transmission:.28,depthWrite:false},true),cyan=mat({color:0x6ce5ff,emissive:0x0d596d,emissiveIntensity:.5}),amber=mat({color:0xffbd59,emissive:0x5f3500,emissiveIntensity:.25}),dark=mat({color:0x253038,roughness:.62});
 const groundMat=mat({color:0x26343b,roughness:.98});
 const groundGeo=new T.BoxGeometry(10,.12,7);ownedGeometries.push(groundGeo);const ground=new T.Mesh(groundGeo,groundMat);ground.position.y=-.25;ground.receiveShadow=true;root.add(ground);
 function mesh(g,m){ownedGeometries.push(g);const x=new T.Mesh(g,m);x.castShadow=true;x.receiveShadow=true;dynamic.add(x);return x}
 function clearDynamic(){dynamic.clear();ownedGeometries.forEach(g=>g.dispose?.());ownedGeometries=[];particles=[];const gg=new T.BoxGeometry(10,.12,7);ownedGeometries.push(gg);ground.geometry=gg}
 function rebuild(){
   dynamic.traverse(o=>{if(o.geometry)o.geometry.dispose?.();if(o.userData.ownedMaterial)o.material?.dispose?.()});dynamic.clear();particles=[];ownedGeometries=ownedGeometries.filter(g=>g===ground.geometry);
   const b=parameters.width,y=parameters.depth,L=8,wallH=Math.max(1.35*y,1.45),wallT=.18;
   const floor=mesh(new T.BoxGeometry(L,.18,b+wallT*2),concrete);floor.position.y=-.09;
   const left=mesh(new T.BoxGeometry(L,wallH,wallT),concrete);left.position.set(0,wallH/2-wallT/2,-b/2-wallT/2);
   const right=mesh(new T.BoxGeometry(L,wallH,wallT),concrete);right.position.set(0,wallH/2-wallT/2,b/2+wallT/2);
   const waterBody=mesh(new T.BoxGeometry(L-.28,y,b-.05),water);waterBody.position.y=y/2+.015;waterBody.castShadow=false;
   const staff=mesh(new T.CylinderGeometry(.045,.045,wallH+.8,14),dark);staff.position.set(-2.4,(wallH+.8)/2,-b/2-.38);
   for(let i=0;i<8;i++){const band=mesh(new T.CylinderGeometry(.055,.055,.045,14),i%2?cyan:amber);band.position.set(-2.4,.18+i*(wallH+.45)/8,-b/2-.38)}
   const pgeo=new T.SphereGeometry(.055,10,8);ownedGeometries.push(pgeo);
   for(let lane=0;lane<5;lane++)for(let i=0;i<9;i++){const p=new T.Mesh(pgeo,cyan);p.castShadow=false;dynamic.add(p);particles.push({mesh:p,lane,i,b,L,y});}
   const slopeRise=clamp(parameters.bedSlope*28*L,0,.8);const pts=[new T.Vector3(-L/2,-.18,-b/2-.75),new T.Vector3(L/2,-.18-slopeRise,-b/2-.75)];
   const lineGeo=new T.BufferGeometry().setFromPoints(pts);ownedGeometries.push(lineGeo);const line=new T.Line(lineGeo,new T.LineBasicMaterial({color:0xffbd59}));line.userData.ownedMaterial=true;dynamic.add(line);
   const arrow=new T.ArrowHelper(new T.Vector3(1,0,0),new T.Vector3(-.6,y+.32,0),1.5,0x6ce5ff,.3,.16);arrow.name='flowArrow';dynamic.add(arrow);
 }
 function ensure(){if(disposed)throw new Error('geo-open-channel has been disposed.')}
 function renderAt(t){const tt=reducedMotion?0:t;const speed=state.velocity===0?0:clamp(.04+state.velocity*.065,.045,.25);particles.forEach(o=>{let u=(o.i/9+t*speed)%1;const z=-o.b*.38+(o.lane/4)*o.b*.76;o.mesh.position.set(-o.L/2+.4+u*(o.L-.8),Math.max(.12,o.y*(.25+.12*(o.lane%3))),z);o.mesh.visible=state.velocity>0});const a=dynamic.getObjectByName('flowArrow');if(a)a.visible=state.velocity>0}
 function snapshot(){ensure();return{id:'geo-open-channel',timeSeconds,parameters:{...parameters},state:{...state,parameters:{...state.parameters}},presentation:{longitudinalLengthDisplayScaled:true,bedSlopeCueExaggerated:true,particleSpeedDisplayScaled:true}}}
 rebuild();renderAt(0);
 return{setParameters(next={}){ensure();parameters=validateOpenChannelParameters({...parameters,...next});state=computeOpenChannel(parameters);rebuild();renderAt(timeSeconds);return snapshot()},update(t){ensure();if(!Number.isFinite(t)||t<0)throw new RangeError('timeSeconds must be finite and non-negative.');timeSeconds=t;renderAt(t);return snapshot()},reset(){ensure();parameters={...DEFAULTS};state=computeOpenChannel(parameters);timeSeconds=0;rebuild();renderAt(0);return snapshot()},resize(w,h,p=1){ensure();if(![w,h,p].every(Number.isFinite)||w<=0||h<=0||p<=0)throw new RangeError('resize values must be positive finite numbers.');return snapshot()},snapshot,dispose(){if(disposed)return;disposed=true;context.scene.remove(root);root.traverse(o=>{o.geometry?.dispose?.();if(o.userData.ownedMaterial)o.material?.dispose?.()});ownedMaterials.forEach(m=>m.dispose?.());root.clear()}};
}