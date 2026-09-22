const DEFAULTS=Object.freeze({targetHeight:2,poleTiltRad:0,personHeight:1.7}),LIMITS=Object.freeze({targetHeight:[1,3.5],poleTiltRad:[-0.1745329,0.1745329],personHeight:[1.4,2.1]});
function normalize(next){const p={...DEFAULTS,...next};for(const[k,[min,max]]of Object.entries(LIMITS)){if(!Number.isFinite(p[k])||p[k]<min||p[k]>max)throw new RangeError(k+' must be finite and between '+min+' and '+max+'.')}return p}
export function prismGeometry(parameters={}){const p=normalize(parameters);return{horizontalOffset:p.targetHeight*Math.sin(p.poleTiltRad),verticalProjection:p.targetHeight*Math.cos(p.poleTiltRad),tiltDeg:p.poleTiltRad*180/Math.PI}}
function mat(T,c,r=.72,metal=.06,opts={}){return new T.MeshStandardMaterial({color:c,roughness:r,metalness:metal,...opts})}
function mesh(T,g,m){const x=new T.Mesh(g,m);x.castShadow=true;x.receiveShadow=true;return x}
function human(T){
 const g=new T.Group(),skin=mat(T,0xc98e67,.84),cloth=mat(T,0x39444b,.9),pants=mat(T,0xaa8c67,.93),vest=mat(T,0xd9ef3c,.72),hat=mat(T,0xf4f5f2,.52);
 const torso=mesh(T,new T.BoxGeometry(.46,.60,.27),cloth);torso.position.set(-.65,1.24,0);g.add(torso);const v=mesh(T,new T.BoxGeometry(.49,.40,.29),vest);v.position.set(-.65,1.26,0);g.add(v);
 const head=mesh(T,new T.SphereGeometry(.15,20,16),skin);head.position.set(-.65,1.71,0);g.add(head);const brim=mesh(T,new T.CylinderGeometry(.19,.19,.035,24),hat);brim.position.set(-.65,1.865,0);g.add(brim);const dome=mesh(T,new T.SphereGeometry(.165,20,12,0,Math.PI*2,0,Math.PI/2),hat);dome.position.set(-.65,1.865,0);g.add(dome);
 function limb(x,y,len,r,mtrl,rot=0){const j=new T.Group();j.position.set(x,y,0);j.rotation.z=rot;const q=mesh(T,new T.CylinderGeometry(r,r,len,12),mtrl);q.position.y=-len/2;j.add(q);g.add(j);return j}
 limb(-.77,.93,.84,.07,pants,.07);limb(-.54,.93,.84,.07,pants,-.07);const arm=limb(-.39,1.46,.52,.055,skin,-.72);const fore=new T.Group();fore.position.set(0,-.49,0);fore.rotation.z=.70;const fm=mesh(T,new T.CylinderGeometry(.05,.05,.42,12),skin);fm.position.y=-.21;fore.add(fm);arm.add(fore);limb(-.90,1.46,.62,.055,skin,.18);return g
}
function disposeObj(o){o.traverse(n=>{if(n.geometry)n.geometry.dispose();if(n.material)(Array.isArray(n.material)?n.material:[n.material]).forEach(x=>x.dispose())})}
export function createAsset(context={}){
 const T=context.THREE,scene=context.scene;if(!T||!scene)throw new TypeError('sur-prism-pole requires context.THREE and context.scene.');
 let disposed=false,time=0,p=normalize({});
 const root=new T.Group();scene.add(root);const person=human(T);root.add(person);
 const poleRoot=new T.Group();root.add(poleRoot);const shaftGroup=new T.Group();poleRoot.add(shaftGroup);
 const white=mat(T,0xe7ebea,.55,.15),red=mat(T,0xd6473c,.62,.08),dark=mat(T,0x252b2d,.48,.3);
 const shaft=mesh(T,new T.CylinderGeometry(.025,.025,1,16),white);shaft.position.y=.5;shaftGroup.add(shaft);
 for(let i=0;i<8;i++){const band=mesh(T,new T.CylinderGeometry(.027,.027,.10,16),i%2?white:red);band.position.y=.10+i*.12;shaftGroup.add(band)}
 const tip=mesh(T,new T.ConeGeometry(.035,.14,14),dark);tip.position.y=-.07;poleRoot.add(tip);
 const prism=new T.Group();poleRoot.add(prism);
 const reflector=mesh(T,new T.OctahedronGeometry(.13,1),mat(T,0xf06b3d,.22,.18,{emissive:0x44140b,emissiveIntensity:.18}));prism.add(reflector);
 const frameMat=dark;for(const [x,y,w,h] of [[0,.19,.42,.045],[0,-.19,.42,.045],[-.19,0,.045,.42],[.19,0,.045,.42]]){const b=mesh(T,new T.BoxGeometry(w,h,.055),frameMat);b.position.set(x,y,0);prism.add(b)}
 const targetRing=mesh(T,new T.TorusGeometry(.09,.018,10,24),mat(T,0xffa42c,.42,.12));targetRing.rotation.y=Math.PI/2;prism.add(targetRing);
 const plumbMat=new T.LineDashedMaterial({color:0x2a7f7a,dashSize:.12,gapSize:.08,transparent:true,opacity:.55});const plumb=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0,0,0),new T.Vector3(0,3.8,0)]),plumbMat);plumb.computeLineDistances();root.add(plumb);
 const base=mesh(T,new T.CylinderGeometry(.07,.08,.025,20),mat(T,0xd9d3c3,.9));base.position.y=.0125;root.add(base);
 function geometry(){return prismGeometry(p)}
 function render(){shaftGroup.scale.y=p.targetHeight;prism.position.y=p.targetHeight;poleRoot.rotation.z=-p.poleTiltRad;person.scale.setScalar(p.personHeight/1.7);if(!context.reducedMotion)person.position.y=Math.sin(time*1.3)*.004;else person.position.y=0}
 function snap(){if(disposed)throw new Error('Asset has been disposed.');const g=geometry();return{id:'sur-prism-pole',timeSeconds:Math.max(0,time),parameters:{...p},result:g,pose:{base:{x:0,y:0,z:0},prismCenter:{x:g.horizontalOffset,y:g.verticalProjection,z:0}}}}
 render();return{
 setParameters(next={}){if(disposed)throw new Error('Asset has been disposed.');p=normalize({...p,...next});render();return snap()},
 update(t){if(disposed)throw new Error('Asset has been disposed.');if(!Number.isFinite(t))throw new TypeError('timeSeconds must be finite.');time=Math.max(0,t);render();return snap()},
 reset(){if(disposed)throw new Error('Asset has been disposed.');p=normalize({});time=0;render();return snap()},
 resize(w,h,pr=1){if(disposed)throw new Error('Asset has been disposed.');if(![w,h,pr].every(Number.isFinite)||w<=0||h<=0||pr<=0)throw new RangeError('resize requires positive finite values.');return snap()},
 snapshot:snap,dispose(){if(disposed)return;disposed=true;scene.remove(root);disposeObj(root);plumb.geometry.dispose();plumb.material.dispose()}
 };
}