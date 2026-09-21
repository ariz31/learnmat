const DEFAULTS=Object.freeze({staffHeight:3,staffTiltRad:0,readingHeight:1.5,personHeight:1.7});
const LIMITS=Object.freeze({staffHeight:[2,5],staffTiltRad:[-0.0872665,0.0872665],readingHeight:[0,5],personHeight:[1.4,2.1]});
function normalize(next){const p={...DEFAULTS,...next};for(const [k,[min,max]] of Object.entries(LIMITS)){if(!Number.isFinite(p[k])||p[k]<min||p[k]>max)throw new RangeError(k+' must be finite and between '+min+' and '+max+'.');}if(p.readingHeight>p.staffHeight)throw new RangeError('readingHeight cannot exceed staffHeight.');return p;}
function m(T,c,r=.76,metal=.04){return new T.MeshStandardMaterial({color:c,roughness:r,metalness:metal});}
function mesh(T,g,mat){const x=new T.Mesh(g,mat);x.castShadow=true;x.receiveShadow=true;return x;}
function human(T){
 const root=new T.Group(),skin=m(T,0xc99068,.85),cloth=m(T,0x37434a,.9),pants=m(T,0xb99b73,.92),vest=m(T,0xdaf138,.74),white=m(T,0xf4f5f2,.55);
 const torso=mesh(T,new T.BoxGeometry(.46,.62,.26),cloth);torso.position.set(-.58,1.25,0);root.add(torso);
 const vestBox=mesh(T,new T.BoxGeometry(.49,.40,.285),vest);vestBox.position.set(-.58,1.27,0);root.add(vestBox);
 const head=mesh(T,new T.SphereGeometry(.15,20,16),skin);head.position.set(-.58,1.72,0);root.add(head);
 const brim=mesh(T,new T.CylinderGeometry(.19,.19,.035,24),white);brim.position.set(-.58,1.875,0);root.add(brim);
 const dome=mesh(T,new T.SphereGeometry(.165,20,12,0,Math.PI*2,0,Math.PI/2),white);dome.position.set(-.58,1.875,0);root.add(dome);
 function limb(x,y,len,r,mat,angle=0){const j=new T.Group();j.position.set(x,y,0);j.rotation.z=angle;const l=mesh(T,new T.CylinderGeometry(r,r,len,14),mat);l.position.y=-len/2;j.add(l);root.add(j);return j;}
 limb(-.69,.94,.86,.07,pants,.08);limb(-.47,.94,.86,.07,pants,-.08);
 const arm=limb(-.34,1.48,.55,.055,skin,-.72);const fore=new T.Group();fore.position.set(0,-.52,0);fore.rotation.z=.72;const fm=mesh(T,new T.CylinderGeometry(.05,.05,.42,14),skin);fm.position.y=-.21;fore.add(fm);arm.add(fore);
 limb(-.82,1.48,.64,.055,skin,.18);
 root.userData={torso};return root;
}
function staff(T){
 const g=new T.Group(),shaft=mesh(T,new T.BoxGeometry(.055,1,.038),m(T,0xf2f2ee,.6,.1));shaft.position.y=.5;g.add(shaft);
 for(let i=0;i<20;i++){const band=mesh(T,new T.BoxGeometry(.063,.035,.045),m(T,i%5===0?0xd63b32:0x22292d,.7));band.position.set(.004,(i+.5)/20,.004);g.add(band);}
 const cap=mesh(T,new T.BoxGeometry(.075,.04,.055),m(T,0x171b1c,.6));cap.position.y=1.01;g.add(cap);return g;
}
function dispose(o){o.traverse(n=>{if(n.geometry)n.geometry.dispose();if(n.material)(Array.isArray(n.material)?n.material:[n.material]).forEach(x=>x.dispose())});}
export function createAsset(context={}){
 const T=context.THREE,scene=context.scene;if(!T||!scene)throw new TypeError('sur-staff-holder requires context.THREE and context.scene.');
 let disposed=false,time=0,p=normalize({});
 const root=new T.Group();scene.add(root);const person=human(T);root.add(person);const pole=staff(T);root.add(pole);
 const base=mesh(T,new T.CylinderGeometry(.08,.10,.035,24),m(T,0x59645d,.85));base.position.y=.0175;root.add(base);
 const reading=mesh(T,new T.TorusGeometry(.065,.008,10,24),m(T,0xe65b3e,.55));reading.rotation.x=Math.PI/2;pole.add(reading);
 const plumbMat=new T.LineBasicMaterial({color:0x3d7a77,transparent:true,opacity:.55});const plumbGeo=new T.BufferGeometry().setFromPoints([new T.Vector3(0,0,0),new T.Vector3(0,5.2,0)]);const plumb=new T.Line(plumbGeo,plumbMat);root.add(plumb);
 function geometry(){return {topOffsetX:p.staffHeight*Math.sin(p.staffTiltRad),topVerticalProjection:p.staffHeight*Math.cos(p.staffTiltRad),verticalityErrorRad:p.staffTiltRad,verticalityErrorDeg:p.staffTiltRad*180/Math.PI};}
 function render(){pole.scale.set(1,p.staffHeight,1);pole.rotation.z=-p.staffTiltRad;reading.position.y=p.readingHeight/p.staffHeight;person.scale.setScalar(p.personHeight/1.7);if(!context.reducedMotion)person.position.y=Math.sin(time*1.4)*.004;else person.position.y=0;}
 function snap(){if(disposed)throw new Error('Asset has been disposed.');const g=geometry();return{id:'sur-staff-holder',timeSeconds:Math.max(0,time),parameters:{...p},result:g,pose:{staffBase:{x:0,y:0,z:0},staffTop:{x:g.topOffsetX,y:g.topVerticalProjection,z:0}}};}
 render();return{
 setParameters(next={}){if(disposed)throw new Error('Asset has been disposed.');p=normalize({...p,...next});render();return snap();},
 update(t){if(disposed)throw new Error('Asset has been disposed.');if(!Number.isFinite(t))throw new TypeError('timeSeconds must be finite.');time=Math.max(0,t);render();return snap();},
 reset(){if(disposed)throw new Error('Asset has been disposed.');p=normalize({});time=0;render();return snap();},
 resize(w,h,pr=1){if(disposed)throw new Error('Asset has been disposed.');if(![w,h,pr].every(Number.isFinite)||w<=0||h<=0||pr<=0)throw new RangeError('resize requires positive finite values.');return snap();},
 snapshot:snap,dispose(){if(disposed)return;disposed=true;scene.remove(root);dispose(root);plumb.geometry.dispose();plumb.material.dispose();}
 }};
}