import {DEFAULT_FRAME_PARAMETERS,solveFrameSway,validateFrameParameters} from './model.mjs';
import {requireThreeRuntime,premiumMaterials,makeBoxBetween,makeArrow,makeLabelSprite,clearGroup,disposeGroup} from './three-utils.mjs';
export function createAsset(context){
 const {THREE,scene}=requireThreeRuntime(context);let disposed=false,parameters={...DEFAULT_FRAME_PARAMETERS},timeSeconds=0,viewport={width:1,height:1,pixelRatio:1};
 const root=new THREE.Group();root.name='str-frame-sway';scene.add(root);
 function rebuild(){
  clearGroup(root);const s=solveFrameSway(parameters),m=premiumMaterials(THREE),w=parameters.bayWidthM,h=parameters.storyHeightM,dx=s.deltaXM*parameters.exaggeration;
  const U={A:new THREE.Vector3(-w/2,0,0),B:new THREE.Vector3(w/2,0,0),C:new THREE.Vector3(-w/2,h,0),D:new THREE.Vector3(w/2,h,0)};
  const D={A:U.A.clone(),B:U.B.clone(),C:new THREE.Vector3(-w/2+dx,h,0),D:new THREE.Vector3(w/2+dx,h,0)};
  root.add(makeBoxBetween(THREE,U.A,U.C,.22,.36,m.ghost),makeBoxBetween(THREE,U.C,U.D,.22,.36,m.ghost),makeBoxBetween(THREE,U.B,U.D,.22,.36,m.ghost));
  root.add(makeBoxBetween(THREE,D.A,D.C,.25,.4,m.steel),makeBoxBetween(THREE,D.C,D.D,.25,.4,m.steel),makeBoxBetween(THREE,D.B,D.D,.25,.4,m.steel));
  for(const p of[D.A,D.B]){const plate=new THREE.Mesh(new THREE.BoxGeometry(.75,.08,.68),m.dark);plate.position.set(p.x,.02,0);plate.castShadow=true;root.add(plate);for(const z of[-.24,.24])for(const xoff of[-.24,.24]){const bolt=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.1,16),m.bolt);bolt.position.set(p.x+xoff,.09,z);bolt.castShadow=true;root.add(bolt);}}
  const from=new THREE.Vector3(0,h+.75,.28),to=new THREE.Vector3(Math.sign(dx||1)*1.45,h+.75,.28);root.add(makeArrow(THREE,from,to,0xb54a4a));
  const trueL=makeLabelSprite(THREE,'true Δ = '+(s.deltaXM*1000).toFixed(1)+' mm',{scale:.65});trueL.position.set(dx/2,h+.28,.32);root.add(trueL);
  const exL=makeLabelSprite(THREE,'display ×'+parameters.exaggeration,{color:'#8a451f',scale:.55});exL.position.set(dx/2,h-.25,.32);root.add(exL);
  const gh=makeLabelSprite(THREE,'undeformed',{color:'#65787a',scale:.52});gh.position.set(-w/2-.85,h*.55,.15);root.add(gh);
 }
 rebuild();return{setParameters(next={}){if(disposed)throw new Error('Asset is disposed');parameters=validateFrameParameters(next,parameters);rebuild();},update(t){if(disposed)throw new Error('Asset is disposed');if(!Number.isFinite(t)||t<0)throw new RangeError('timeSeconds must be finite and nonnegative');timeSeconds=t;},reset(){if(disposed)throw new Error('Asset is disposed');parameters={...DEFAULT_FRAME_PARAMETERS};timeSeconds=0;rebuild();},resize(w,h,p=1){if(disposed)throw new Error('Asset is disposed');if(![w,h,p].every(v=>Number.isFinite(v)&&v>0))throw new RangeError('resize values must be finite and positive');viewport={width:w,height:h,pixelRatio:p};},snapshot(){return{...solveFrameSway(parameters),displayDeltaXM:solveFrameSway(parameters).deltaXM*parameters.exaggeration,timeSeconds,viewport:{...viewport},rendering:'Three.js 0.185.1 host scene'};},dispose(){if(disposed)return;disposed=true;disposeGroup(root,scene);}};
}
