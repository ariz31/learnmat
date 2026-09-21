const DEFAULTS=Object.freeze({pathLength:10,speed:1.2,stepFrequency:1.7,personHeight:1.75});
const LIMITS=Object.freeze({pathLength:[0.5,50],speed:[0,2.5],stepFrequency:[0.5,3],personHeight:[1.4,2.1]});

function normalize(next){
  const p={...DEFAULTS,...next};
  for(const [k,[min,max]] of Object.entries(LIMITS)){
    if(!Number.isFinite(p[k])||p[k]<min||p[k]>max) throw new RangeError(k+' must be finite and between '+min+' and '+max+'.');
  }
  return p;
}
function mat(T,color,rough=.72,metal=.05){return new T.MeshStandardMaterial({color,roughness:rough,metalness:metal});}
function cylinder(T,r,len,material){
  const mesh=new T.Mesh(new T.CylinderGeometry(r,r,len,16),material);
  mesh.position.y=-len/2;
  mesh.castShadow=true; mesh.receiveShadow=true;
  return mesh;
}
function makeHuman(T){
  const root=new T.Group(), skin=mat(T,0xc98f67,.82), fabric=mat(T,0x33414a,.88), trouser=mat(T,0xb89a72,.9), vest=mat(T,0xd8ef39,.75), boot=mat(T,0x2b2927,.92), hardhat=mat(T,0xf2f4f3,.55);
  const pelvis=new T.Group(); pelvis.position.y=.92; root.add(pelvis);
  const hips=new T.Mesh(new T.BoxGeometry(.34,.18,.24),trouser); hips.castShadow=true; pelvis.add(hips);
  const torso=new T.Mesh(new T.BoxGeometry(.48,.62,.28),fabric); torso.position.y=.38; torso.castShadow=true; pelvis.add(torso);
  const vestMesh=new T.Mesh(new T.BoxGeometry(.51,.42,.30),vest); vestMesh.position.y=.39; vestMesh.castShadow=true; pelvis.add(vestMesh);
  const neck=new T.Mesh(new T.CylinderGeometry(.075,.075,.12,12),skin); neck.position.y=.75; pelvis.add(neck);
  const head=new T.Mesh(new T.SphereGeometry(.15,20,16),skin); head.position.y=.91; head.castShadow=true; pelvis.add(head);
  const brim=new T.Mesh(new T.CylinderGeometry(.19,.19,.035,24),hardhat); brim.position.y=1.055; pelvis.add(brim);
  const dome=new T.Mesh(new T.SphereGeometry(.165,20,12,0,Math.PI*2,0,Math.PI/2),hardhat); dome.position.y=1.055; pelvis.add(dome);

  function limb(x,y,z,len,r,material){
    const joint=new T.Group(); joint.position.set(x,y,z); joint.add(cylinder(T,r,len,material)); pelvis.add(joint); return joint;
  }
  const leftLeg=limb(-.12,-.02,0,.82,.075,trouser), rightLeg=limb(.12,-.02,0,.82,.075,trouser);
  const leftArm=limb(-.31,.64,0,.60,.055,skin), rightArm=limb(.31,.64,0,.60,.055,skin);
  const leftBoot=new T.Mesh(new T.BoxGeometry(.15,.10,.29),boot); leftBoot.position.set(-.12,.06,.08); root.add(leftBoot);
  const rightBoot=leftBoot.clone(); rightBoot.position.x=.12; root.add(rightBoot);
  root.userData={pelvis,leftLeg,rightLeg,leftArm,rightArm,leftBoot,rightBoot};
  return root;
}
function disposeObject(obj){
  obj.traverse(n=>{if(n.geometry)n.geometry.dispose();if(n.material){const a=Array.isArray(n.material)?n.material:[n.material];a.forEach(m=>m.dispose());}});
}

export function createAsset(context={}){
  const T=context.THREE, scene=context.scene;
  if(!T||!scene) throw new TypeError('sur-walking-person requires context.THREE and context.scene.');
  let disposed=false,timeSeconds=0,params=normalize({});
  const group=new T.Group(); group.name='sur-walking-person'; scene.add(group);
  const person=makeHuman(T); group.add(person);
  const pathMaterial=mat(T,0x0f7d80,.7,.05);
  const path=new T.Mesh(new T.BoxGeometry(1,.025,.045),pathMaterial); path.position.y=.018; path.receiveShadow=true; group.add(path);
  const startMarker=new T.Mesh(new T.CylinderGeometry(.07,.09,.22,18),mat(T,0x173042)); startMarker.position.y=.11; group.add(startMarker);
  const endMarker=startMarker.clone(); group.add(endMarker);

  function stateAt(t){
    const safe=Math.max(0,t), moving=params.speed>0, arrival=moving?params.pathLength/params.speed:Infinity;
    const active=moving?Math.min(safe,arrival):0;
    const distance=moving?Math.min(params.pathLength,params.speed*safe):0;
    return {safe,arrival,distance,phase:2*Math.PI*params.stepFrequency*active};
  }
  function render(){
    const s=stateAt(timeSeconds), scale=params.personHeight/1.75, walking=params.speed>0&&s.distance<params.pathLength&&!context.reducedMotion;
    group.scale.setScalar(scale);
    person.position.x=s.distance/scale;
    const swing=walking?Math.sin(s.phase)*.55:0;
    const u=person.userData;
    u.leftLeg.rotation.z=swing; u.rightLeg.rotation.z=-swing;
    u.leftArm.rotation.z=-swing*.82; u.rightArm.rotation.z=swing*.82;
    u.pelvis.position.y=.92+(walking?Math.abs(Math.sin(s.phase))*0.018:0);
    path.scale.x=Math.max(.001,params.pathLength/scale); path.position.x=(params.pathLength/2)/scale;
    startMarker.position.x=0; endMarker.position.x=params.pathLength/scale;
  }
  function snapshot(){
    if(disposed) throw new Error('Asset has been disposed.');
    const s=stateAt(timeSeconds);
    return {id:'sur-walking-person',timeSeconds:s.safe,parameters:{...params},result:{distanceTravelled:s.distance,arrivalTime:Number.isFinite(s.arrival)?s.arrival:null,pathFraction:s.distance/params.pathLength},pose:{x:s.distance,y:0,z:0,gaitPhaseRadians:s.phase}};
  }
  render();
  return {
    setParameters(next={}){if(disposed)throw new Error('Asset has been disposed.');params=normalize({...params,...next});render();return snapshot();},
    update(t){if(disposed)throw new Error('Asset has been disposed.');if(!Number.isFinite(t))throw new TypeError('timeSeconds must be finite.');timeSeconds=Math.max(0,t);render();return snapshot();},
    reset(){if(disposed)throw new Error('Asset has been disposed.');params=normalize({});timeSeconds=0;render();return snapshot();},
    resize(width,height,pixelRatio=1){if(disposed)throw new Error('Asset has been disposed.');if(![width,height,pixelRatio].every(Number.isFinite)||width<=0||height<=0||pixelRatio<=0)throw new RangeError('resize requires positive finite values.');return snapshot();},
    snapshot,
    dispose(){if(disposed)return;disposed=true;scene.remove(group);disposeObject(group);}
  };
}
