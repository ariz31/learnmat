const PI=Math.PI;
const DEFAULTS=Object.freeze({instrumentHeight:1.5,legSpread:.8,sightAzimuthRad:0,sightElevationRad:0});
const LIMITS=Object.freeze({instrumentHeight:[1,2.2],legSpread:[.4,1.2],sightAzimuthRad:[-PI,PI],sightElevationRad:[-0.0872665,0.0872665]});
function normalize(next){const p={...DEFAULTS,...next};for(const[k,[min,max]]of Object.entries(LIMITS)){if(!Number.isFinite(p[k])||p[k]<min||p[k]>max)throw new RangeError(k+' must be finite and between '+min+' and '+max+'.')}return p}
function material(T,c,r=.62,metal=.15){return new T.MeshStandardMaterial({color:c,roughness:r,metalness:metal})}
function mesh(T,g,m){const x=new T.Mesh(g,m);x.castShadow=true;x.receiveShadow=true;return x}
function placeCylinder(T,obj,a,b){const mid=new T.Vector3().addVectors(a,b).multiplyScalar(.5),v=new T.Vector3().subVectors(b,a),len=v.length();obj.position.copy(mid);obj.scale.set(1,len,1);obj.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize())}
function dispose(o){o.traverse(n=>{if(n.geometry)n.geometry.dispose();if(n.material)(Array.isArray(n.material)?n.material:[n.material]).forEach(x=>x.dispose())})}
export function createAsset(context={}){
 const T=context.THREE,scene=context.scene;if(!T||!scene)throw new TypeError('sur-tripod-level requires context.THREE and context.scene.');
 let disposed=false,time=0,p=normalize({});
 const root=new T.Group();root.name='sur-tripod-level';scene.add(root);
 const yellow=material(T,0xe9b72d,.48,.18),dark=material(T,0x22282b,.46,.35),aluminum=material(T,0xbec6c8,.34,.72),glass=material(T,0x214a63,.18,.25),rubber=material(T,0x171b1d,.86,.02);
 const station=mesh(T,new T.CylinderGeometry(.075,.09,.025,24),material(T,0xe7e1cf,.9));station.position.y=.0125;root.add(station);
 const head=mesh(T,new T.CylinderGeometry(.18,.21,.12,28),yellow);root.add(head);
 const feet=[],legs=[];
 for(let i=0;i<3;i++){const leg=mesh(T,new T.CylinderGeometry(.026,.034,1,12),aluminum);root.add(leg);legs.push(leg);const foot=mesh(T,new T.ConeGeometry(.055,.18,12),rubber);root.add(foot);feet.push(foot)}
 const instrument=new T.Group();root.add(instrument);
 const tribrach=mesh(T,new T.CylinderGeometry(.19,.19,.10,28),dark);tribrach.position.y=-.28;instrument.add(tribrach);
 for(let i=0;i<3;i++){const s=mesh(T,new T.CylinderGeometry(.025,.025,.08,12),rubber);const a=i*2*PI/3;s.position.set(.12*Math.cos(a),-.36,.12*Math.sin(a));instrument.add(s)}
 const body=mesh(T,new T.BoxGeometry(.64,.27,.28),yellow);body.position.y=-.05;instrument.add(body);
 const cradle=mesh(T,new T.CylinderGeometry(.11,.13,.18,20),dark);cradle.position.y=-.18;instrument.add(cradle);
 const telescope=new T.Group();instrument.add(telescope);
 const tube=mesh(T,new T.CylinderGeometry(.075,.085,.78,24),yellow);tube.rotation.x=PI/2;tube.position.z=-.03;telescope.add(tube);
 const objective=mesh(T,new T.CylinderGeometry(.10,.10,.07,24),dark);objective.rotation.x=PI/2;objective.position.z=-.43;telescope.add(objective);
 const lens=mesh(T,new T.CylinderGeometry(.076,.076,.012,24),glass);lens.rotation.x=PI/2;lens.position.z=-.47;telescope.add(lens);
 const eyepiece=mesh(T,new T.CylinderGeometry(.065,.055,.13,20),dark);eyepiece.rotation.x=PI/2;eyepiece.position.z=.44;telescope.add(eyepiece);
 const focusKnob=mesh(T,new T.CylinderGeometry(.07,.07,.08,20),dark);focusKnob.rotation.z=PI/2;focusKnob.position.set(.20,.09,.08);instrument.add(focusKnob);
 const bubble=mesh(T,new T.CylinderGeometry(.045,.045,.26,18),glass);bubble.rotation.z=PI/2;bubble.position.set(0,-.16,.20);instrument.add(bubble);
 const sightGeo=new T.BufferGeometry();const sightMat=new T.LineDashedMaterial({color:0x18a7b9,dashSize:.24,gapSize:.12,transparent:true,opacity:.9});const sight=new T.Line(sightGeo,sightMat);root.add(sight);
 const sightTip=mesh(T,new T.ConeGeometry(.055,.18,18),material(T,0x18a7b9,.45));root.add(sightTip);
 const axisMarker=mesh(T,new T.SphereGeometry(.045,18,14),material(T,0xd64d3b,.5));root.add(axisMarker);
 function vector(){const a=p.sightAzimuthRad,e=p.sightElevationRad,c=Math.cos(e);return new T.Vector3(c*Math.sin(a),Math.sin(e),-c*Math.cos(a))}
 function render(){
   const topY=Math.max(.42,p.instrumentHeight-.40),top=new T.Vector3(0,topY,0);
   head.position.set(0,topY-.02,0);
   for(let i=0;i<3;i++){const a=-PI/2+i*2*PI/3,foot=new T.Vector3(p.legSpread*Math.cos(a),0,p.legSpread*Math.sin(a));placeCylinder(T,legs[i],new T.Vector3(0,topY-.05,0),new T.Vector3(foot.x,.10,foot.z));feet[i].position.set(foot.x,.09,foot.z);feet[i].rotation.z=0}
   instrument.position.set(0,p.instrumentHeight,0);
   instrument.rotation.y=-p.sightAzimuthRad;
   telescope.rotation.x=p.sightElevationRad;
   const dir=vector(),origin=new T.Vector3(0,p.instrumentHeight,0),end=origin.clone().addScaledVector(dir,6.0);
   sight.geometry.dispose();sight.geometry=new T.BufferGeometry().setFromPoints([origin,end]);sight.computeLineDistances();
   axisMarker.position.copy(origin);sightTip.position.copy(end);sightTip.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir);
 }
 function snap(){if(disposed)throw new Error('Asset has been disposed.');const d=vector();return{id:'sur-tripod-level',timeSeconds:Math.max(0,time),parameters:{...p},result:{instrumentStation:{x:0,y:p.instrumentHeight,z:0},sightDirection:{x:d.x,y:d.y,z:d.z}},pose:{legSpread:p.legSpread}}}
 render();return{
 setParameters(next={}){if(disposed)throw new Error('Asset has been disposed.');p=normalize({...p,...next});render();return snap()},
 update(t){if(disposed)throw new Error('Asset has been disposed.');if(!Number.isFinite(t))throw new TypeError('timeSeconds must be finite.');time=Math.max(0,t);return snap()},
 reset(){if(disposed)throw new Error('Asset has been disposed.');p=normalize({});time=0;render();return snap()},
 resize(w,h,pr=1){if(disposed)throw new Error('Asset has been disposed.');if(![w,h,pr].every(Number.isFinite)||w<=0||h<=0||pr<=0)throw new RangeError('resize requires positive finite values.');return snap()},
 snapshot:snap,dispose(){if(disposed)return;disposed=true;scene.remove(root);dispose(root);sight.geometry.dispose();sight.material.dispose()}
 }};
}