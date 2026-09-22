const G=9.80665,DEFAULTS=Object.freeze({horizontalSpan:20,massPerLength:.02,horizontalTension:60,sagEnabled:true});
const LIMITS=Object.freeze({horizontalSpan:[2,50],massPerLength:[.005,.1],horizontalTension:[20,300]});
function normalize(next){const p={...DEFAULTS,...next};for(const[k,[min,max]]of Object.entries(LIMITS)){if(!Number.isFinite(p[k])||p[k]<min||p[k]>max)throw new RangeError(k+' must be finite and between '+min+' and '+max+'.')}if(typeof p.sagEnabled!=='boolean')throw new TypeError('sagEnabled must be boolean.');return p}
export function catenaryState(parameters={}){const p=normalize(parameters),L=p.horizontalSpan;if(!p.sagEnabled)return{parameterA:null,sag:0,curveLength:L,lengthExcess:0};const w=p.massPerLength*G,a=p.horizontalTension/w,h=L/(2*a),sag=a*(Math.cosh(h)-1),curveLength=2*a*Math.sinh(h);return{parameterA:a,sag,curveLength,lengthExcess:curveLength-L}}
function mat(T,c,r=.78,metal=.04){return new T.MeshStandardMaterial({color:c,roughness:r,metalness:metal})}
function mesh(T,g,m){const x=new T.Mesh(g,m);x.castShadow=true;x.receiveShadow=true;return x}
function human(T,vestColor=0xf07638){
 const g=new T.Group(),skin=mat(T,0xc98e67,.84),cloth=mat(T,0x39444b,.9),pants=mat(T,0x7a7568,.94),vest=mat(T,vestColor,.73),hat=mat(T,0xf2f3ef,.56);
 const torso=mesh(T,new T.BoxGeometry(.46,.60,.27),cloth);torso.position.y=1.25;g.add(torso);const v=mesh(T,new T.BoxGeometry(.49,.39,.29),vest);v.position.y=1.27;g.add(v);
 const head=mesh(T,new T.SphereGeometry(.15,18,14),skin);head.position.y=1.72;g.add(head);const brim=mesh(T,new T.CylinderGeometry(.19,.19,.035,20),hat);brim.position.y=1.875;g.add(brim);const dome=mesh(T,new T.SphereGeometry(.165,20,12,0,Math.PI*2,0,Math.PI/2),hat);dome.position.y=1.875;g.add(dome);
 function limb(x,y,len,r,mtrl,rot=0){const j=new T.Group();j.position.set(x,y,0);j.rotation.z=rot;const q=mesh(T,new T.CylinderGeometry(r,r,len,12),mtrl);q.position.y=-len/2;j.add(q);g.add(j);return j}
 limb(-.12,.94,.86,.07,pants,.06);limb(.12,.94,.86,.07,pants,-.06);const a1=limb(.28,1.47,.48,.055,skin,-.65),a2=limb(-.28,1.47,.48,.055,skin,.65);g.userData={a1,a2};return g
}
function dispose(o){o.traverse(n=>{if(n.geometry)n.geometry.dispose();if(n.material)(Array.isArray(n.material)?n.material:[n.material]).forEach(x=>x.dispose())})}
export function createAsset(context={}){
 const T=context.THREE,scene=context.scene;if(!T||!scene)throw new TypeError('sur-tape-team requires context.THREE and context.scene.');
 let disposed=false,time=0,p=normalize({}),tapeGeometry=null;
 const root=new T.Group();scene.add(root);const left=human(T,0xef7a35),right=human(T,0xe9d83b);root.add(left,right);
 const endpointMat=mat(T,0xdcd5bf,.82),markerMat=mat(T,0x223038,.66),tapeMat=mat(T,0xf5c53a,.42,.16);
 const stakeL=mesh(T,new T.CylinderGeometry(.028,.035,.55,12),endpointMat),stakeR=stakeL.clone();stakeL.position.y=.275;stakeR.position.y=.275;root.add(stakeL,stakeR);
 const reel=mesh(T,new T.TorusGeometry(.22,.055,12,30),markerMat);reel.rotation.x=Math.PI/2;reel.position.y=.28;root.add(reel);
 const tape=mesh(T,new T.TubeGeometry(new T.LineCurve3(new T.Vector3(0,1.2,0),new T.Vector3(1,1.2,0)),16,.012,8,false),tapeMat);root.add(tape);
 const straightMat=new T.LineDashedMaterial({color:0x537c78,dashSize:.25,gapSize:.18,transparent:true,opacity:.55});const straight=new T.Line(new T.BufferGeometry(),straightMat);root.add(straight);
 function state(){return catenaryState(p)}
 function rebuildTape(){
   if(tapeGeometry)tapeGeometry.dispose();const pts=[],L=p.horizontalSpan,s=state();for(let i=0;i<=64;i++){const x=L*i/64;let y=1.2;if(p.sagEnabled){const a=s.parameterA;y+=a*Math.cosh((x-L/2)/a)-a*Math.cosh(L/(2*a))}pts.push(new T.Vector3(x,y,0))}
   const curve=new T.CatmullRomCurve3(pts,false,'centripetal');tapeGeometry=new T.TubeGeometry(curve,96,.012,8,false);tape.geometry=tapeGeometry;
   straight.geometry.dispose();straight.geometry=new T.BufferGeometry().setFromPoints([new T.Vector3(0,1.2,0),new T.Vector3(L,1.2,0)]);straight.computeLineDistances();
 }
 function render(){left.position.set(-.52,0,0);right.position.set(p.horizontalSpan+.52,0,0);right.rotation.y=Math.PI;stakeL.position.x=0;stakeR.position.x=p.horizontalSpan;reel.position.x=-.5;rebuildTape();if(!context.reducedMotion){const q=Math.sin(time*1.5)*.035;left.rotation.z=q;right.rotation.z=-q}else{left.rotation.z=right.rotation.z=0}}
 function snap(){if(disposed)throw new Error('Asset has been disposed.');const s=state();return{id:'sur-tape-team',timeSeconds:Math.max(0,time),parameters:{...p},result:{...s,weightPerLength:p.massPerLength*G},pose:{leftEndpoint:{x:0,y:1.2,z:0},rightEndpoint:{x:p.horizontalSpan,y:1.2,z:0}}}}
 render();return{
 setParameters(next={}){if(disposed)throw new Error('Asset has been disposed.');p=normalize({...p,...next});render();return snap()},
 update(t){if(disposed)throw new Error('Asset has been disposed.');if(!Number.isFinite(t))throw new TypeError('timeSeconds must be finite.');time=Math.max(0,t);render();return snap()},
 reset(){if(disposed)throw new Error('Asset has been disposed.');p=normalize({});time=0;render();return snap()},
 resize(w,h,pr=1){if(disposed)throw new Error('Asset has been disposed.');if(![w,h,pr].every(Number.isFinite)||w<=0||h<=0||pr<=0)throw new RangeError('resize requires positive finite values.');return snap()},
 snapshot:snap,dispose(){if(disposed)return;disposed=true;scene.remove(root);dispose(root);straight.geometry.dispose();straight.material.dispose()}
 };
}