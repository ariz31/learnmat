import {DEFAULT_SUPPORT_PARAMETERS,describeSupport,validateSupportParameters} from './model.mjs';
import {requireThreeRuntime,premiumMaterials,makeBoxBetween,makeCylinderBetween,makeArrow,makeLabelSprite,makeMomentArc,clearGroup,disposeGroup} from './three-utils.mjs';

export function createAsset(context){
 const {THREE,scene}=requireThreeRuntime(context);let disposed=false,parameters={...DEFAULT_SUPPORT_PARAMETERS},timeSeconds=0,viewport={width:1,height:1,pixelRatio:1};
 const root=new THREE.Group();root.name='str-support-reactions';scene.add(root);
 function rebuild(){
  clearGroup(root);const s=describeSupport(parameters),m=premiumMaterials(THREE);
  const beam=new THREE.Mesh(new THREE.BoxGeometry(5,.34,.52),m.steel);beam.position.set(0,1.35,0);beam.castShadow=beam.receiveShadow=true;root.add(beam);
  const cap=new THREE.Mesh(new THREE.BoxGeometry(1.15,.14,.92),m.dark);cap.position.set(0,1.1,0);cap.castShadow=true;root.add(cap);
  if(s.supportType==='pin'){
    const body=new THREE.Mesh(new THREE.ConeGeometry(.58,.78,4,1,false,Math.PI/4),m.concrete);body.position.set(0,.66,0);body.castShadow=true;root.add(body);
    const hinge=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.95,28),m.teal);hinge.rotation.x=Math.PI/2;hinge.position.set(0,1.08,0);hinge.castShadow=true;root.add(hinge);
  }else if(s.supportType==='roller'){
    const block=new THREE.Mesh(new THREE.BoxGeometry(1.05,.32,.82),m.concrete);block.position.set(0,.82,0);block.castShadow=true;root.add(block);
    for(const x of[-.32,0,.32]){const r=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.78,24),m.teal);r.rotation.x=Math.PI/2;r.position.set(x,.51,0);r.castShadow=true;root.add(r);}
    const plate=new THREE.Mesh(new THREE.BoxGeometry(1.4,.12,1.05),m.dark);plate.position.set(0,.31,0);plate.receiveShadow=true;root.add(plate);
  }else{
    const wall=new THREE.Mesh(new THREE.BoxGeometry(.5,1.35,1.4),m.concrete);wall.position.set(0,.63,0);wall.castShadow=wall.receiveShadow=true;root.add(wall);
    for(const z of[-.52,-.26,0,.26,.52]){const rib=new THREE.Mesh(new THREE.BoxGeometry(.72,.055,.055),m.dark);rib.rotation.z=-.42;rib.position.set(.18,.63,z);root.add(rib);}
  }
  const point=new THREE.Vector3(0,1.42,.42);
  if(s.showReactionDirections&&s.possibleReactions.includes('Rx')){root.add(makeArrow(THREE,point,new THREE.Vector3(1.45,1.42,.42),0x007d80));const l=makeLabelSprite(THREE,'Rx');l.position.set(1.35,1.72,.42);root.add(l);}
  if(s.showReactionDirections&&s.possibleReactions.includes('Ry')){root.add(makeArrow(THREE,point,new THREE.Vector3(0,2.85,.42),0x007d80));const l=makeLabelSprite(THREE,'Ry');l.position.set(.55,2.65,.42);root.add(l);}
  if(s.showReactionDirections&&s.possibleReactions.includes('Mz')){const a=makeMomentArc(THREE,new THREE.Vector3(0,1.45,.5),.78,0xc26a30);root.add(a);const l=makeLabelSprite(THREE,'Mz',{color:'#8a451f'});l.position.set(-1,2.1,.52);root.add(l);}
  const title=makeLabelSprite(THREE,s.label,{scale:.82});title.position.set(0,3.35,0);root.add(title);
  const dof=makeLabelSprite(THREE,'Restrained: '+s.restrainedDofs.join(', '),{scale:.72});dof.position.set(0,-.05,0);root.add(dof);
 }
 rebuild();
 return{setParameters(next={}){if(disposed)throw new Error('Asset is disposed');parameters=validateSupportParameters(next,parameters);rebuild();},update(t){if(disposed)throw new Error('Asset is disposed');if(!Number.isFinite(t)||t<0)throw new RangeError('timeSeconds must be finite and nonnegative');timeSeconds=t;},reset(){if(disposed)throw new Error('Asset is disposed');parameters={...DEFAULT_SUPPORT_PARAMETERS};timeSeconds=0;rebuild();},resize(w,h,p=1){if(disposed)throw new Error('Asset is disposed');if(![w,h,p].every(v=>Number.isFinite(v)&&v>0))throw new RangeError('resize values must be finite and positive');viewport={width:w,height:h,pixelRatio:p};},snapshot(){return{...describeSupport(parameters),timeSeconds,viewport:{...viewport},rendering:'Three.js 0.185.1 host scene'};},dispose(){if(disposed)return;disposed=true;disposeGroup(root,scene);}};
}
