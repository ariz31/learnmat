import {DEFAULT_TRUSS_PARAMETERS,solveTriangularTruss,validateTrussParameters} from './model.mjs';
import {requireThreeRuntime,premiumMaterials,makeCylinderBetween,makeArrow,makeLabelSprite,clearGroup,disposeGroup} from './three-utils.mjs';

export function createAsset(context){
 const {THREE,scene}=requireThreeRuntime(context);let disposed=false,parameters={...DEFAULT_TRUSS_PARAMETERS},timeSeconds=0,viewport={width:1,height:1,pixelRatio:1};
 const root=new THREE.Group();root.name='str-truss-load-path';scene.add(root);
 function supportPin(m,x){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.ConeGeometry(.34,.42,4,1,false,Math.PI/4),m.concrete);b.position.set(x,-.24,0);b.castShadow=true;g.add(b);const h=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.52,20),m.teal);h.rotation.x=Math.PI/2;h.position.set(x,0,0);g.add(h);return g;}
 function supportRoller(m,x){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(.58,.16,.46),m.concrete);b.position.set(x,-.19,0);g.add(b);for(const dx of[-.16,.16]){const r=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.42,18),m.teal);r.rotation.x=Math.PI/2;r.position.set(x+dx,-.34,0);g.add(r);}return g;}
 function rebuild(){
  clearGroup(root);const s=solveTriangularTruss(parameters),m=premiumMaterials(THREE),half=parameters.spanM/2;
  const pts={A:new THREE.Vector3(-half,0,0),B:new THREE.Vector3(0,parameters.riseM,0),C:new THREE.Vector3(half,0,0)};
  const forceMat=f=>Math.abs(f)<1e-9?m.steel:(f>0?m.teal:m.amber);
  root.add(makeCylinderBetween(THREE,pts.A,pts.B,.105,forceMat(s.memberForcesN.AB),24));
  root.add(makeCylinderBetween(THREE,pts.B,pts.C,.105,forceMat(s.memberForcesN.BC),24));
  root.add(makeCylinderBetween(THREE,pts.A,pts.C,.105,forceMat(s.memberForcesN.AC),24));
  root.add(supportPin(m,-half),supportRoller(m,half));
  for(const [name,p] of Object.entries(pts)){const gusset=new THREE.Mesh(new THREE.CylinderGeometry(.31,.31,.055,6),m.dark);gusset.rotation.x=Math.PI/2;gusset.position.copy(p);gusset.castShadow=true;root.add(gusset);for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,bolt=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.075,14),m.steel);bolt.rotation.x=Math.PI/2;bolt.position.copy(p).add(new THREE.Vector3(Math.cos(a)*.16,Math.sin(a)*.16,.025));bolt.castShadow=true;root.add(bolt)}const joint=new THREE.Mesh(new THREE.SphereGeometry(.13,24,16),m.teal);joint.position.copy(p);joint.castShadow=true;root.add(joint);const lab=makeLabelSprite(THREE,name,{scale:.42});lab.position.copy(p).add(new THREE.Vector3(0,.42,.26));root.add(lab);}
  if(parameters.loadN>0){root.add(makeArrow(THREE,new THREE.Vector3(0,parameters.riseM+1.5,.18),new THREE.Vector3(0,parameters.riseM+.18,.18),0xb54a4a));root.add(makeArrow(THREE,new THREE.Vector3(-half,-.05,.22),new THREE.Vector3(-half,1.0,.22),0x007d80));root.add(makeArrow(THREE,new THREE.Vector3(half,-.05,.22),new THREE.Vector3(half,1.0,.22),0x007d80));}
  const ab=(Math.abs(s.memberForcesN.AB)/1000).toFixed(2)+' kN C',ac=(Math.abs(s.memberForcesN.AC)/1000).toFixed(2)+' kN T';
  const l1=makeLabelSprite(THREE,'AB · '+ab,{color:'#8a451f',scale:.55});l1.position.copy(pts.A).lerp(pts.B,.5).add(new THREE.Vector3(-.25,.3,.24));root.add(l1);
  const l2=makeLabelSprite(THREE,'BC · '+ab,{color:'#8a451f',scale:.55});l2.position.copy(pts.B).lerp(pts.C,.5).add(new THREE.Vector3(.25,.3,.24));root.add(l2);
  const l3=makeLabelSprite(THREE,'AC · '+ac,{color:'#007d80',scale:.55});l3.position.copy(pts.A).lerp(pts.C,.5).add(new THREE.Vector3(0,-.48,.24));root.add(l3);
 }
 rebuild();
 return{setParameters(next={}){if(disposed)throw new Error('Asset is disposed');parameters=validateTrussParameters(next,parameters);rebuild();},update(t){if(disposed)throw new Error('Asset is disposed');if(!Number.isFinite(t)||t<0)throw new RangeError('timeSeconds must be finite and nonnegative');timeSeconds=t;},reset(){if(disposed)throw new Error('Asset is disposed');parameters={...DEFAULT_TRUSS_PARAMETERS};timeSeconds=0;rebuild();},resize(w,h,p=1){if(disposed)throw new Error('Asset is disposed');if(![w,h,p].every(v=>Number.isFinite(v)&&v>0))throw new RangeError('resize values must be finite and positive');viewport={width:w,height:h,pixelRatio:p};},snapshot(){return{...solveTriangularTruss(parameters),timeSeconds,viewport:{...viewport},rendering:'Three.js 0.185.1 host scene'};},dispose(){if(disposed)return;disposed=true;disposeGroup(root,scene);}};
}
