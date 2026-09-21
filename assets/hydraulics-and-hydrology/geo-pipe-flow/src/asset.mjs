import { DEFAULTS, computePipeFlow, validatePipeFlowParameters } from './model.mjs';

const THREE_VERSION='185';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export function createAsset(context={}){
  const T=context.three;
  if(!T||String(T.REVISION)!==THREE_VERSION) throw new Error('geo-pipe-flow requires host Three.js r185.');
  if(!context.scene||typeof context.scene.add!=='function') throw new TypeError('geo-pipe-flow requires a host-owned THREE.Scene.');
  let disposed=false,timeSeconds=0,parameters={...DEFAULTS},state=computePipeFlow(parameters);
  const root=new T.Group(); root.name='geo-pipe-flow';
  context.scene.add(root);
  const ownedGeometries=[],ownedMaterials=[],particles=[];
  const material=(opts)=>{const m=new T.MeshPhysicalMaterial(opts);ownedMaterials.push(m);return m};
  const basic=(opts)=>{const m=new T.MeshStandardMaterial(opts);ownedMaterials.push(m);return m};
  const addMesh=(g,m,parent=root)=>{ownedGeometries.push(g);const mesh=new T.Mesh(g,m);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh};
  const steel=material({color:0xb8c4c9,metalness:.72,roughness:.26,transparent:true,opacity:.34,side:T.DoubleSide,depthWrite:false});
  const dark=basic({color:0x26343b,metalness:.62,roughness:.3});
  const water=material({color:0x1b9ed0,roughness:.08,transmission:.34,transparent:true,opacity:.64,depthWrite:false});
  const teal=basic({color:0x46d8ff,emissive:0x0c4e61,emissiveIntensity:.42,roughness:.28});
  const amber=basic({color:0xffb64a,emissive:0x6b3d08,emissiveIntensity:.32});
  const ground=addMesh(new T.BoxGeometry(10,.12,4.4),basic({color:0x27343a,roughness:.95}));
  ground.position.set(0,-.7,0);

  const curve=new T.CatmullRomCurve3([
    new T.Vector3(-4,.15,0),new T.Vector3(-2.8,.15,0),new T.Vector3(-1.9,.35,0),
    new T.Vector3(-.5,.35,0),new T.Vector3(1.1,.35,0),new T.Vector3(2.7,.42,0),new T.Vector3(4,.75,0)
  ]);
  addMesh(new T.TubeGeometry(curve,96,.38,24,false),steel);
  addMesh(new T.TubeGeometry(curve,96,.255,20,false),water);
  const ringGeo=new T.TorusGeometry(.48,.075,10,32);
  for(const u of [.02,.31,.67,.97]){
    const p=curve.getPointAt(u),tan=curve.getTangentAt(u);
    const ring=addMesh(ringGeo.clone(),dark); ownedGeometries.push(ring.geometry);
    ring.position.copy(p);
    ring.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),tan.clone().normalize());
  }
  for(const u of [.22,.76]){
    const p=curve.getPointAt(u);
    const stem=addMesh(new T.CylinderGeometry(.055,.055,.72,14),dark);stem.position.set(p.x,p.y+.48,p.z);
    const gauge=addMesh(new T.CylinderGeometry(.24,.24,.11,32),basic({color:0xe8f2f4,metalness:.2,roughness:.38}));
    gauge.rotation.x=Math.PI/2;gauge.position.set(p.x,p.y+.88,p.z);
    const face=addMesh(new T.CylinderGeometry(.19,.19,.012,32),basic({color:0x10232c,roughness:.32}));
    face.rotation.x=Math.PI/2;face.position.set(p.x,p.y+.88,p.z+.061);
  }
  const p0=curve.getPointAt(.08),p1=curve.getPointAt(.9);
  const hScale=2.8;
  const makePylon=(p,colorMat)=>{
    const post=addMesh(new T.CylinderGeometry(.035,.035,hScale,10),colorMat);post.position.set(p.x,.7,p.z);
    const cap=addMesh(new T.SphereGeometry(.11,16,12),colorMat);cap.position.set(p.x,2.1,p.z);
    return {post,cap};
  };
  const upstream=makePylon(p0,teal),downstream=makePylon(p1,amber);
  const particleGeo=new T.SphereGeometry(.065,12,8);ownedGeometries.push(particleGeo);
  for(let i=0;i<34;i++){const mesh=new T.Mesh(particleGeo,teal);mesh.castShadow=false;root.add(mesh);particles.push(mesh);}
  const arrow=new T.ArrowHelper(new T.Vector3(1,0,0),curve.getPointAt(.5),1.25,0x68e4ff,.28,.13);root.add(arrow);

  function ensure(){if(disposed)throw new Error('geo-pipe-flow has been disposed.')}
  function renderAt(t){
    const dir=state.flowDirection||1;
    const visualSpeed=state.speed===0?0:clamp(.06+state.speed*.055,.06,.24);
    particles.forEach((mesh,i)=>{
      let u=(i/particles.length+dir*t*visualSpeed)%1;if(u<0)u+=1;
      mesh.position.copy(curve.getPointAt(u));
      mesh.visible=state.speed>0;
    });
    const exaggeratedDrop=clamp(state.headLoss*2.6,0,1.65);
    upstream.cap.position.y=2.25;
    downstream.cap.position.y=2.25-exaggeratedDrop;
    upstream.post.scale.y=1;
    downstream.post.scale.y=Math.max(.35,(2.95-exaggeratedDrop)/2.8);
    arrow.setDirection(curve.getTangentAt(.52).multiplyScalar(dir).normalize());
    arrow.visible=state.speed>0;
  }
  function snapshot(){ensure();return{id:'geo-pipe-flow',timeSeconds,parameters:{...parameters},state:{...state,parameters:{...state.parameters}},presentation:{headLossDisplayExaggeration:true,particleSpeedDisplayScaled:true}};}
  renderAt(0);
  return{
    setParameters(next={}){ensure();parameters=validatePipeFlowParameters({...parameters,...next});state=computePipeFlow(parameters);renderAt(timeSeconds);return snapshot();},
    update(t){ensure();if(!Number.isFinite(t)||t<0)throw new RangeError('timeSeconds must be finite and non-negative.');timeSeconds=t;renderAt(t);return snapshot();},
    reset(){ensure();parameters={...DEFAULTS};state=computePipeFlow(parameters);timeSeconds=0;renderAt(0);return snapshot();},
    resize(width,height,pixelRatio=1){ensure();if(![width,height,pixelRatio].every(Number.isFinite)||width<=0||height<=0||pixelRatio<=0)throw new RangeError('resize values must be positive finite numbers.');return snapshot();},
    snapshot,
    dispose(){if(disposed)return;disposed=true;context.scene.remove(root);root.traverse(o=>{if(o.geometry&&!ownedGeometries.includes(o.geometry))o.geometry.dispose?.()});ownedGeometries.forEach(g=>g.dispose?.());ownedMaterials.forEach(m=>m.dispose?.());root.clear();}
  };
}
