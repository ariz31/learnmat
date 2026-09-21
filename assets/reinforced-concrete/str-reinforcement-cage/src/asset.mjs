import {DEFAULT_CAGE_PARAMETERS,solveReinforcementCage,validateCageParameters} from './model.mjs';
import {requireThreeRuntime,premiumMaterials,makeCylinderBetween,makeArrow,makeLabelSprite,clearGroup,disposeGroup} from './three-utils.mjs';
export function createAsset(context){
 const {THREE,scene}=requireThreeRuntime(context);let disposed=false,parameters={...DEFAULT_CAGE_PARAMETERS},timeSeconds=0,viewport={width:1,height:1,pixelRatio:1};
 const root=new THREE.Group();root.name='str-reinforcement-cage';root.position.y=-.66;scene.add(root);
 function rebuild(){
  clearGroup(root);const s=solveReinforcementCage(parameters),m=premiumMaterials(THREE),p=parameters,w=p.widthM,d=p.depthM,h=p.heightM;
  const shell=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m.glass);shell.position.set(0,h/2,0);shell.castShadow=false;shell.receiveShadow=true;root.add(shell);
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w,h,d)),new THREE.LineBasicMaterial({color:0x7d908b,transparent:true,opacity:.42}));edges.position.set(0,h/2,0);root.add(edges);
  for(const b of s.longitudinalBars){const x=b.x-w/2,z=b.z-d/2;root.add(makeCylinderBetween(THREE,new THREE.Vector3(x,.02,z),new THREE.Vector3(x,h-.02,z),p.longitudinalBarDiameterM/2,m.rebar,18));}
  const tr=s.tieRectangleM,x1=tr.xMin-w/2,x2=tr.xMax-w/2,z1=tr.zMin-d/2,z2=tr.zMax-d/2,r=p.tieDiameterM/2;
  for(const y of s.tieElevationsM){root.add(makeCylinderBetween(THREE,new THREE.Vector3(x1,y,z1),new THREE.Vector3(x2,y,z1),r,m.rebar,14),makeCylinderBetween(THREE,new THREE.Vector3(x2,y,z1),new THREE.Vector3(x2,y,z2),r,m.rebar,14),makeCylinderBetween(THREE,new THREE.Vector3(x2,y,z2),new THREE.Vector3(x1,y,z2),r,m.rebar,14),makeCylinderBetween(THREE,new THREE.Vector3(x1,y,z2),new THREE.Vector3(x1,y,z1),r,m.rebar,14));}
  const coverY=Math.min(h*.7,1.2);root.add(makeArrow(THREE,new THREE.Vector3(-w/2-.28,coverY,d/2+.08),new THREE.Vector3(-w/2,coverY,d/2+.08),0x007d80));const cl=makeLabelSprite(THREE,'cover '+(p.clearCoverM*1000).toFixed(0)+' mm',{scale:.52});cl.position.set(-w/2-.75,coverY+.25,d/2+.08);root.add(cl);
  const top=makeLabelSprite(THREE,s.longitudinalBarCount+' longitudinal bars',{scale:.58});top.position.set(0,h+.35,0);root.add(top);const tie=makeLabelSprite(THREE,'tie spacing '+(s.actualTieSpacingM*1000).toFixed(1)+' mm',{color:'#8a451f',scale:.55});tie.position.set(w*.9,h*.42,d*.7);root.add(tie);
 }
 rebuild();return{setParameters(next={}){if(disposed)throw new Error('Asset is disposed');parameters=validateCageParameters(next,parameters);rebuild();},update(t){if(disposed)throw new Error('Asset is disposed');if(!Number.isFinite(t)||t<0)throw new RangeError('timeSeconds must be finite and nonnegative');timeSeconds=t;},reset(){if(disposed)throw new Error('Asset is disposed');parameters={...DEFAULT_CAGE_PARAMETERS};timeSeconds=0;rebuild();},resize(w,h,p=1){if(disposed)throw new Error('Asset is disposed');if(![w,h,p].every(v=>Number.isFinite(v)&&v>0))throw new RangeError('resize values must be finite and positive');viewport={width:w,height:h,pixelRatio:p};},snapshot(){return{...solveReinforcementCage(parameters),timeSeconds,viewport:{...viewport},rendering:'Three.js 0.185.1 host scene'};},dispose(){if(disposed)return;disposed=true;disposeGroup(root,scene);}};
}
