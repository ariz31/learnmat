import {DEFAULT_BEAM_PARAMETERS,beamResponseAt,solveBeam,validateBeamParameters} from './model.mjs';
import {requireThreeRuntime,premiumMaterials,makeBoxBetween,makeCylinderBetween,makeArrow,makeLabelSprite,lineFromPoints,clearGroup,disposeGroup} from './three-utils.mjs';

function pinSupport(THREE,m,x,root){
 const body=new THREE.Mesh(new THREE.ConeGeometry(.38,.48,4,1,false,Math.PI/4),m.concrete);body.position.set(x,.2,0);body.castShadow=true;root.add(body);
 const hinge=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.62,20),m.teal);hinge.rotation.x=Math.PI/2;hinge.position.set(x,.48,0);hinge.castShadow=true;root.add(hinge);
}
function rollerSupport(THREE,m,x,root){
 const block=new THREE.Mesh(new THREE.BoxGeometry(.65,.18,.55),m.concrete);block.position.set(x,.34,0);root.add(block);
 for(const dx of[-.18,.18]){const r=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.5,20),m.teal);r.rotation.x=Math.PI/2;r.position.set(x+dx,.17,0);r.castShadow=true;root.add(r);}
}
export function createAsset(context){
 const {THREE,scene}=requireThreeRuntime(context);let disposed=false,parameters={...DEFAULT_BEAM_PARAMETERS},timeSeconds=0,viewport={width:1,height:1,pixelRatio:1};
 const root=new THREE.Group();root.name='str-beam-deflection';scene.add(root);
 function rebuild(){
  clearGroup(root);const s=solveBeam(parameters),m=premiumMaterials(THREE),L=parameters.spanM,half=L/2;
  const y0=1.0,z0=0,maxV=Math.abs(s.maxDeflectionM);const vex=maxV>0?Math.min(120,Math.max(1,.78/maxV)):1;
  const ghost=new THREE.Mesh(new THREE.BoxGeometry(L,.16,.34),m.ghost);ghost.position.set(0,y0,z0);root.add(ghost);
  const segs=40;
  for(let i=0;i<segs;i++){const xa=-half+L*i/segs,xb=-half+L*(i+1)/segs;const ra=beamResponseAt(xa+half,parameters),rb=beamResponseAt(xb+half,parameters);const a=new THREE.Vector3(xa,y0+ra.deflectionM*vex,z0),b=new THREE.Vector3(xb,y0+rb.deflectionM*vex,z0);root.add(makeBoxBetween(THREE,a,b,.2,.38,m.steel));}
  pinSupport(THREE,m,-half,root);rollerSupport(THREE,m,half,root);
  if(parameters.loadN>0){root.add(makeArrow(THREE,new THREE.Vector3(0,2.8,.15),new THREE.Vector3(0,1.22,.15),0xb54a4a));root.add(makeArrow(THREE,new THREE.Vector3(-half,.54,.22),new THREE.Vector3(-half,1.5,.22),0x007d80));root.add(makeArrow(THREE,new THREE.Vector3(half,.54,.22),new THREE.Vector3(half,1.5,.22),0x007d80));}
  const loadLabel=makeLabelSprite(THREE,'P = '+(parameters.loadN/1000).toFixed(1)+' kN',{color:'#8d3333',scale:.72});loadLabel.position.set(0,3.05,.15);root.add(loadLabel);
  const shearPts=[],momentPts=[];const Vmax=Math.max(Math.abs(s.reactionsN.left),1),Mmax=Math.max(Math.abs(s.maxMomentNm),1);
  for(let i=0;i<=60;i++){const x=L*i/60,r=beamResponseAt(x,parameters),wx=x-half;shearPts.push(new THREE.Vector3(wx,-.52+r.shearN/Vmax*.28,.28));momentPts.push(new THREE.Vector3(wx,-1.22+r.momentNm/Mmax*.34,.28));}
  root.add(lineFromPoints(THREE,shearPts,0x007d80));root.add(lineFromPoints(THREE,momentPts,0xc26a30));
  const vl=makeLabelSprite(THREE,'V  shear',{color:'#007d80',scale:.58});vl.position.set(-half-.8,-.52,.28);root.add(vl);const ml=makeLabelSprite(THREE,'M  moment',{color:'#8a451f',scale:.58});ml.position.set(-half-.8,-1.2,.28);root.add(ml);
  const dl=makeLabelSprite(THREE,'deflection display ×'+vex.toFixed(1),{scale:.62});dl.position.set(0,-1.75,0);root.add(dl);
 }
 rebuild();
 return{setParameters(next={}){if(disposed)throw new Error('Asset is disposed');parameters=validateBeamParameters(next,parameters);rebuild();},update(t){if(disposed)throw new Error('Asset is disposed');if(!Number.isFinite(t)||t<0)throw new RangeError('timeSeconds must be finite and nonnegative');timeSeconds=t;},reset(){if(disposed)throw new Error('Asset is disposed');parameters={...DEFAULT_BEAM_PARAMETERS};timeSeconds=0;rebuild();},resize(w,h,p=1){if(disposed)throw new Error('Asset is disposed');if(![w,h,p].every(v=>Number.isFinite(v)&&v>0))throw new RangeError('resize values must be finite and positive');viewport={width:w,height:h,pixelRatio:p};},snapshot(){const s=solveBeam(parameters);const vex=Math.abs(s.maxDeflectionM)>0?Math.min(120,Math.max(1,.78/Math.abs(s.maxDeflectionM))):1;return{...s,displayDeflectionExaggeration:vex,timeSeconds,viewport:{...viewport},rendering:'Three.js 0.185.1 host scene'};},dispose(){if(disposed)return;disposed=true;disposeGroup(root,scene);}};
}
