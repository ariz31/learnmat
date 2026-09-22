const DEFAULTS=Object.freeze({sightDistance:30,rodStationDistance:15,crossTrackOffset:.25,alignmentTolerance:.05,rodHeight:2});
const LIMITS=Object.freeze({sightDistance:[5,100],rodStationDistance:[1,99],crossTrackOffset:[-2,2],alignmentTolerance:[.005,.25],rodHeight:[1.5,3]});
function normalize(next){const p={...DEFAULTS,...next};for(const[k,[min,max]]of Object.entries(LIMITS)){if(!Number.isFinite(p[k])||p[k]<min||p[k]>max)throw new RangeError(k+' must be finite and between '+min+' and '+max+'.')}if(p.rodStationDistance>=p.sightDistance)throw new RangeError('rodStationDistance must be less than sightDistance.');return p}
export function alignmentState(parameters={}){const p=normalize(parameters),e=Math.abs(p.crossTrackOffset);return{crossTrackError:e,aligned:e<=p.alignmentTolerance,signedOffset:p.crossTrackOffset}}
function mat(T,c,r=.76,metal=.05){return new T.MeshStandardMaterial({color:c,roughness:r,metalness:metal})}
function mesh(T,g,m){const x=new T.Mesh(g,m);x.castShadow=true;x.receiveShadow=true;return x}
function rod(T,striped=true){
 const g=new T.Group(),shaft=mesh(T,new T.CylinderGeometry(.03,.03,1,16),mat(T,0xe9ece9,.55,.15));shaft.position.y=.5;g.add(shaft);
 if(striped)for(let i=0;i<10;i++){const b=mesh(T,new T.CylinderGeometry(.033,.033,.075,16),mat(T,i%2?0xf0f1ed:0xd74238,.62));b.position.y=.07+i*.095;g.add(b)}
 const tip=mesh(T,new T.ConeGeometry(.045,.16,14),mat(T,0x24292b,.7,.15));tip.position.y=-.08;g.add(tip);const cap=mesh(T,new T.CylinderGeometry(.045,.045,.05,16),mat(T,0x24292b,.55,.2));cap.position.y=1.025;g.add(cap);return g
}
function observer(T){
 const g=new T.Group(),skin=mat(T,0xc98e67,.84),cloth=mat(T,0x39444b,.9),vest=mat(T,0xd9ef3c,.72),pants=mat(T,0x9a8062,.93),hat=mat(T,0xf2f3ef,.55);
 const torso=mesh(T,new T.BoxGeometry(.46,.60,.27),cloth);torso.position.y=1.25;g.add(torso);const v=mesh(T,new T.BoxGeometry(.49,.40,.29),vest);v.position.y=1.27;g.add(v);const head=mesh(T,new T.SphereGeometry(.15,18,14),skin);head.position.y=1.72;g.add(head);const brim=mesh(T,new T.CylinderGeometry(.19,.19,.035,20),hat);brim.position.y=1.875;g.add(brim);const dome=mesh(T,new T.SphereGeometry(.165,20,12,0,Math.PI*2,0,Math.PI/2),hat);dome.position.y=1.875;g.add(dome);
 function limb(x,y,len,r,mtrl,rot=0){const j=new T.Group();j.position.set(x,y,0);j.rotation.z=rot;const q=mesh(T,new T.CylinderGeometry(r,r,len,12),mtrl);q.position.y=-len/2;j.add(q);g.add(j)}
 limb(-.12,.94,.86,.07,pants,.05);limb(.12,.94,.86,.07,pants,-.05);limb(-.29,1.47,.60,.055,skin,.12);limb(.29,1.47,.60,.055,skin,-.12);g.rotation.y=Math.PI;return g
}
function disposeObj(o){o.traverse(n=>{if(n.geometry)n.geometry.dispose();if(n.material)(Array.isArray(n.material)?n.material:[n.material]).forEach(x=>x.dispose())})}
export function createAsset(context={}){
 const T=context.THREE,scene=context.scene;if(!T||!scene)throw new TypeError('sur-ranging-rod requires context.THREE and context.scene.');
 let disposed=false,time=0,p=normalize({});
 const root=new T.Group();scene.add(root);const person=observer(T);person.position.set(-.65,0,.8);root.add(person);
 const intermediate=rod(T,true),target=rod(T,true);root.add(intermediate,target);
 const observerMark=mesh(T,new T.CylinderGeometry(.08,.10,.025,20),mat(T,0xe6dcc7,.9));observerMark.position.y=.0125;root.add(observerMark);
 const guideMat=new T.LineDashedMaterial({color:0x198d91,dashSize:.45,gapSize:.25,transparent:true,opacity:.82});const guide=new T.Line(new T.BufferGeometry(),guideMat);root.add(guide);
 const crossMat=new T.LineBasicMaterial({color:0xd55343});const cross=new T.Line(new T.BufferGeometry(),crossMat);root.add(cross);
 const tolerance=mesh(T,new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({color:0x4c9a78,transparent:true,opacity:.16,side:T.DoubleSide,depthWrite:false}));tolerance.rotation.x=-Math.PI/2;tolerance.position.y=.012;root.add(tolerance);
 const stationMarker=mesh(T,new T.TorusGeometry(.12,.018,10,28),mat(T,0xd55343,.6));stationMarker.rotation.x=Math.PI/2;stationMarker.position.y=.025;root.add(stationMarker);
 function state(){return alignmentState(p)}
 function render(){
   intermediate.position.set(p.crossTrackOffset,0,-p.rodStationDistance);intermediate.scale.set(1,p.rodHeight,1);
   target.position.set(0,0,-p.sightDistance);target.scale.set(1,p.rodHeight,1);
   guide.geometry.dispose();guide.geometry=new T.BufferGeometry().setFromPoints([new T.Vector3(0,.06,0),new T.Vector3(0,.06,-p.sightDistance)]);guide.computeLineDistances();
   cross.geometry.dispose();cross.geometry=new T.BufferGeometry().setFromPoints([new T.Vector3(0,.035,-p.rodStationDistance),new T.Vector3(p.crossTrackOffset,.035,-p.rodStationDistance)]);
   tolerance.scale.set(p.alignmentTolerance*2,p.sightDistance,1);tolerance.position.set(0,.012,-p.sightDistance/2);
   stationMarker.position.set(p.crossTrackOffset,.025,-p.rodStationDistance);
   const s=state();const c=s.aligned?0x3c9a6d:0xd55343;stationMarker.material.color.setHex(c);
   if(!context.reducedMotion)stationMarker.rotation.z=time*.4;else stationMarker.rotation.z=0;
 }
 function snap(){if(disposed)throw new Error('Asset has been disposed.');const s=state();return{id:'sur-ranging-rod',timeSeconds:Math.max(0,time),parameters:{...p},result:s,pose:{observer:{x:0,y:0,z:0},target:{x:0,y:0,z:-p.sightDistance},rodBase:{x:p.crossTrackOffset,y:0,z:-p.rodStationDistance},rodTop:{x:p.crossTrackOffset,y:p.rodHeight,z:-p.rodStationDistance}}}}
 render();return{
 setParameters(next={}){if(disposed)throw new Error('Asset has been disposed.');p=normalize({...p,...next});render();return snap()},
 update(t){if(disposed)throw new Error('Asset has been disposed.');if(!Number.isFinite(t))throw new TypeError('timeSeconds must be finite.');time=Math.max(0,t);render();return snap()},
 reset(){if(disposed)throw new Error('Asset has been disposed.');p=normalize({});time=0;render();return snap()},
 resize(w,h,pr=1){if(disposed)throw new Error('Asset has been disposed.');if(![w,h,pr].every(Number.isFinite)||w<=0||h<=0||pr<=0)throw new RangeError('resize requires positive finite values.');return snap()},
 snapshot:snap,dispose(){if(disposed)return;disposed=true;scene.remove(root);disposeObj(root);guide.geometry.dispose();guide.material.dispose();cross.geometry.dispose();cross.material.dispose()}
 };
}