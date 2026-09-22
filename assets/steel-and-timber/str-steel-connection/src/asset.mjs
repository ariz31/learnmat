import {DEFAULT_CONNECTION_PARAMETERS,solveSteelConnection,validateConnectionParameters} from './model.mjs';
import {requireThreeRuntime,premiumMaterials,makeCylinderBetween,makeLabelSprite,clearGroup,disposeGroup} from './three-utils.mjs';

function addColumn(THREE,root,m,x,height=2.7){
 const web=new THREE.Mesh(new THREE.BoxGeometry(.035,height,.58),m.steel);web.position.set(x,height/2,0);web.castShadow=true;root.add(web);
 for(const z of[-.31,.31]){const flange=new THREE.Mesh(new THREE.BoxGeometry(.36,height,.035),m.steel);flange.position.set(x,height/2,z);flange.castShadow=true;root.add(flange);}
}
function addBeam(THREE,root,m,startX,length,y,z=0){
 const cx=startX+length/2;const web=new THREE.Mesh(new THREE.BoxGeometry(length,.48,.025),m.steel);web.position.set(cx,y,z);web.castShadow=true;root.add(web);
 for(const yy of[y-.255,y+.255]){const flange=new THREE.Mesh(new THREE.BoxGeometry(length,.035,.3),m.steel);flange.position.set(cx,yy,z);flange.castShadow=true;root.add(flange);}
}
export function createAsset(context){
 const {THREE,scene}=requireThreeRuntime(context);let disposed=false,parameters={...DEFAULT_CONNECTION_PARAMETERS},timeSeconds=0,viewport={width:1,height:1,pixelRatio:1};
 const root=new THREE.Group();root.name='str-steel-connection';root.position.y=-.66;scene.add(root);
 function rebuild(){
  clearGroup(root);const s=solveSteelConnection(parameters),m=premiumMaterials(THREE),p=parameters;
  const supportX=-1.05,faceX=-.86,plateX=faceX+.07+s.assemblyOffsetsM.plate,beamStart=faceX+.16+s.assemblyOffsetsM.beamWeb,beamY=1.38,beamLength=2.65;
  addColumn(THREE,root,m,supportX,2.8);addBeam(THREE,root,m,beamStart,beamLength,beamY,0);
  const plate=new THREE.Mesh(new THREE.BoxGeometry(p.plateThicknessM,p.plateHeightM,p.plateWidthM),m.teal);plate.position.set(plateX,beamY,0);plate.castShadow=true;root.add(plate);const weldMat=new THREE.MeshStandardMaterial({color:0x54636a,metalness:.72,roughness:.32});for(const z of[-p.plateWidthM/2,p.plateWidthM/2]){const weld=makeCylinderBetween(THREE,new THREE.Vector3(plateX-p.plateThicknessM*.55,beamY-p.plateHeightM/2,z),new THREE.Vector3(plateX-p.plateThicknessM*.55,beamY+p.plateHeightM/2,z),Math.max(.006,p.plateThicknessM*.16),weldMat,12);root.add(weld)}
  const yBottom=beamY-p.plateHeightM/2;for(const bc of s.boltCentersM){const y=yBottom+bc.y,z=bc.x-p.plateWidthM/2;const a=new THREE.Vector3(plateX-.08,y,z),b=new THREE.Vector3(beamStart+.09,y,z);root.add(makeCylinderBetween(THREE,a,b,p.boltDiameterM/2,m.bolt,20));for(const x of[plateX-.06,beamStart+.07]){const washer=new THREE.Mesh(new THREE.CylinderGeometry(p.boltDiameterM*.9,p.boltDiameterM*.9,.018,22),m.dark);washer.rotation.z=Math.PI/2;washer.position.set(x,y,z);washer.castShadow=true;root.add(washer);}const nut=new THREE.Mesh(new THREE.CylinderGeometry(p.boltDiameterM*.82,p.boltDiameterM*.82,p.boltDiameterM*.55,6),m.bolt);nut.rotation.z=Math.PI/2;nut.position.set(beamStart+.13,y,z);nut.castShadow=true;root.add(nut);const thread=new THREE.Mesh(new THREE.CylinderGeometry(p.boltDiameterM*.43,p.boltDiameterM*.43,p.boltDiameterM*.18,16),m.bolt);thread.rotation.z=Math.PI/2;thread.position.set(beamStart+.13+p.boltDiameterM*.36,y,z);root.add(thread);}
  const l1=makeLabelSprite(THREE,'support',{scale:.48});l1.position.set(supportX,2.95,.42);root.add(l1);const l2=makeLabelSprite(THREE,'shear plate',{color:'#007d80',scale:.52});l2.position.set(plateX,2.22,.42);root.add(l2);const l3=makeLabelSprite(THREE,'beam',{scale:.48});l3.position.set(beamStart+1.5,2.1,.42);root.add(l3);
  const info=makeLabelSprite(THREE,'explode '+(p.explodeM*1000).toFixed(0)+' mm / step',{color:'#8a451f',scale:.5});info.position.set(.3,.45,.42);root.add(info);
 }
 rebuild();return{setParameters(next={}){if(disposed)throw new Error('Asset is disposed');parameters=validateConnectionParameters(next,parameters);rebuild();},update(t){if(disposed)throw new Error('Asset is disposed');if(!Number.isFinite(t)||t<0)throw new RangeError('timeSeconds must be finite and nonnegative');timeSeconds=t;},reset(){if(disposed)throw new Error('Asset is disposed');parameters={...DEFAULT_CONNECTION_PARAMETERS};timeSeconds=0;rebuild();},resize(w,h,p=1){if(disposed)throw new Error('Asset is disposed');if(![w,h,p].every(v=>Number.isFinite(v)&&v>0))throw new RangeError('resize values must be finite and positive');viewport={width:w,height:h,pixelRatio:p};},snapshot(){return{...solveSteelConnection(parameters),timeSeconds,viewport:{...viewport},rendering:'Three.js 0.185.1 host scene'};},dispose(){if(disposed)return;disposed=true;disposeGroup(root,scene);}};
}
