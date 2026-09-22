import {DEFAULT_SUPPORT_PARAMETERS,describeSupport,validateSupportParameters} from './model.mjs';
import {requireThreeRuntime,premiumMaterials,makeArrow,makeMomentArc,clearGroup,disposeGroup} from './three-utils.mjs';

function annotationAnchors(s){
  const supportAnchor={
    pin:[0,1.08,.54],
    roller:[0,.82,.54],
    fixed:[.28,.78,.74]
  }[s.supportType];
  const restraintAnchor={
    pin:[0,.48,.54],
    roller:[0,.31,.62],
    fixed:[.28,.34,.74]
  }[s.supportType];

  const annotations=[];
  if(s.showReactionDirections&&s.possibleReactions.includes('Ry')){
    annotations.push({
      id:'reaction-ry',role:'reaction',tone:'teal',kicker:'Reaction',label:'Ry',
      detail:'Vertical admissible component',anchor:[0,2.85,.42],rank:10
    });
  }
  if(s.showReactionDirections&&s.possibleReactions.includes('Mz')){
    annotations.push({
      id:'reaction-mz',role:'reaction',tone:'amber',kicker:'Reaction moment',label:'Mz',
      detail:'Rotational admissible component',anchor:[-.66,2.18,.52],rank:20
    });
  }
  if(s.showReactionDirections&&s.possibleReactions.includes('Rx')){
    annotations.push({
      id:'reaction-rx',role:'reaction',tone:'teal',kicker:'Reaction',label:'Rx',
      detail:'Horizontal admissible component',anchor:[1.45,1.42,.42],rank:30
    });
  }
  annotations.push({
    id:'support',role:'support',tone:'neutral',kicker:'Support',label:s.label,
    detail:'Idealized restraint condition',anchor:supportAnchor,rank:40
  });
  annotations.push({
    id:'restrained-dof',role:'restraint',tone:'neutral',kicker:'Restrained DOF',
    label:s.restrainedDofs.join(', '),detail:'Blocked planar motion',anchor:restraintAnchor,rank:50
  });
  return annotations;
}

function addEdges(THREE,root,mesh,color=0xdde8e4,opacity=.36){
  const edges=new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry,16),
    new THREE.LineBasicMaterial({color,transparent:true,opacity})
  );
  edges.position.copy(mesh.position);
  edges.quaternion.copy(mesh.quaternion);
  root.add(edges);
}

export function createAsset(context){
  const {THREE,scene}=requireThreeRuntime(context);
  let disposed=false;
  let parameters={...DEFAULT_SUPPORT_PARAMETERS};
  let timeSeconds=0;
  let viewport={width:1,height:1,pixelRatio:1};
  const root=new THREE.Group();
  root.name='str-support-reactions';
  scene.add(root);

  function rebuild(){
    clearGroup(root);
    const s=describeSupport(parameters);
    const m=premiumMaterials(THREE);

    const beam=new THREE.Mesh(new THREE.BoxGeometry(5,.34,.52),m.steel);
    beam.position.set(0,1.35,0);
    beam.castShadow=beam.receiveShadow=true;
    root.add(beam);
    addEdges(THREE,root,beam,0xcfe1df,.34);

    const cap=new THREE.Mesh(new THREE.BoxGeometry(1.15,.14,.92),m.dark);
    cap.position.set(0,1.1,0);
    cap.castShadow=true;
    root.add(cap);
    addEdges(THREE,root,cap,0xb7d3cf,.26);

    if(s.supportType==='pin'){
      const body=new THREE.Mesh(new THREE.ConeGeometry(.58,.78,4,1,false,Math.PI/4),m.concrete);
      body.position.set(0,.66,0);
      body.castShadow=body.receiveShadow=true;
      root.add(body);
      addEdges(THREE,root,body,0xffffff,.24);
      const hinge=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.95,28),m.teal);
      hinge.rotation.x=Math.PI/2;
      hinge.position.set(0,1.08,0);
      hinge.castShadow=true;
      root.add(hinge);
    }else if(s.supportType==='roller'){
      const block=new THREE.Mesh(new THREE.BoxGeometry(1.05,.32,.82),m.concrete);
      block.position.set(0,.82,0);
      block.castShadow=block.receiveShadow=true;
      root.add(block);
      addEdges(THREE,root,block,0xffffff,.22);
      for(const x of[-.32,0,.32]){
        const roller=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.78,24),m.teal);
        roller.rotation.x=Math.PI/2;
        roller.position.set(x,.51,0);
        roller.castShadow=true;
        root.add(roller);
      }
      const plate=new THREE.Mesh(new THREE.BoxGeometry(1.4,.12,1.05),m.dark);
      plate.position.set(0,.31,0);
      plate.receiveShadow=true;
      root.add(plate);
      addEdges(THREE,root,plate,0xb7d3cf,.24);
    }else{
      const wall=new THREE.Mesh(new THREE.BoxGeometry(.5,1.35,1.4),m.concrete);
      wall.position.set(0,.63,0);
      wall.castShadow=wall.receiveShadow=true;
      root.add(wall);
      addEdges(THREE,root,wall,0xffffff,.22);
      for(const z of[-.52,-.26,0,.26,.52]){
        const rib=new THREE.Mesh(new THREE.BoxGeometry(.72,.055,.055),m.dark);
        rib.rotation.z=-.42;
        rib.position.set(.18,.63,z);
        root.add(rib);
      }
    }

    const reactionPoint=new THREE.Vector3(0,1.42,.42);
    if(s.showReactionDirections&&s.possibleReactions.length){
      const node=new THREE.Mesh(new THREE.SphereGeometry(.085,20,14),m.teal);
      node.position.copy(reactionPoint);
      node.castShadow=true;
      root.add(node);
    }
    if(s.showReactionDirections&&s.possibleReactions.includes('Rx')){
      root.add(makeArrow(THREE,reactionPoint,new THREE.Vector3(1.45,1.42,.42),0x007d80));
    }
    if(s.showReactionDirections&&s.possibleReactions.includes('Ry')){
      root.add(makeArrow(THREE,reactionPoint,new THREE.Vector3(0,2.85,.42),0x007d80));
    }
    if(s.showReactionDirections&&s.possibleReactions.includes('Mz')){
      root.add(makeMomentArc(THREE,new THREE.Vector3(0,1.45,.5),.78,0xc26a30));
    }
  }

  function ensureLive(){
    if(disposed)throw new Error('Asset is disposed');
  }

  function snapshot(){
    ensureLive();
    const support=describeSupport(parameters);
    return{
      ...support,
      annotations:annotationAnchors(support),
      timeSeconds,
      viewport:{...viewport},
      rendering:'Three.js 0.185.1 host scene'
    };
  }

  rebuild();
  return{
    setParameters(next={}){
      ensureLive();
      parameters=validateSupportParameters(next,parameters);
      rebuild();
      return snapshot();
    },
    update(t){
      ensureLive();
      if(!Number.isFinite(t)||t<0)throw new RangeError('timeSeconds must be finite and nonnegative');
      timeSeconds=t;
    },
    reset(){
      ensureLive();
      parameters={...DEFAULT_SUPPORT_PARAMETERS};
      timeSeconds=0;
      rebuild();
      return snapshot();
    },
    resize(w,h,p=1){
      ensureLive();
      if(![w,h,p].every(v=>Number.isFinite(v)&&v>0))throw new RangeError('resize values must be finite and positive');
      viewport={width:w,height:h,pixelRatio:p};
    },
    snapshot,
    dispose(){
      if(disposed)return;
      disposed=true;
      disposeGroup(root,scene);
    }
  };
}
