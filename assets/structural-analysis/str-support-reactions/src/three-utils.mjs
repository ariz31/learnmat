export const THREE_PEER_VERSION='0.185.1';

export function requireThreeRuntime(context){
  if(!context || !(context.container instanceof Element)) throw new TypeError('context.container must be a DOM Element');
  if(!context.THREE) throw new Error('Three.js 0.185.1 must be provided as context.THREE by the host');
  if(!context.scene || context.scene.isScene!==true) throw new Error('A host-owned THREE.Scene must be provided as context.scene');
  return {THREE:context.THREE,scene:context.scene};
}

export function premiumMaterials(THREE){
  return {
    steel:new THREE.MeshStandardMaterial({color:0x405158,metalness:.78,roughness:.25}),
    dark:new THREE.MeshStandardMaterial({color:0x233d42,metalness:.42,roughness:.34}),
    teal:new THREE.MeshStandardMaterial({color:0x007d80,metalness:.34,roughness:.28}),
    amber:new THREE.MeshStandardMaterial({color:0xc26a30,metalness:.2,roughness:.38}),
    red:new THREE.MeshStandardMaterial({color:0xb54a4a,metalness:.18,roughness:.4}),
    concrete:new THREE.MeshStandardMaterial({color:0xc9c7bd,roughness:.88,metalness:0}),
    ghost:new THREE.MeshStandardMaterial({color:0x81928f,transparent:true,opacity:.18,depthWrite:false,roughness:.7}),
    glass:new THREE.MeshStandardMaterial({color:0xbfd1cd,transparent:true,opacity:.14,depthWrite:false,roughness:.35,metalness:.05}),
    rebar:new THREE.MeshStandardMaterial({color:0x6d4335,metalness:.48,roughness:.42})
  };
}

export function makeCylinderBetween(THREE,a,b,radius,material,radialSegments=20){
  const va=a.isVector3?a.clone():new THREE.Vector3(a.x,a.y,a.z||0);
  const vb=b.isVector3?b.clone():new THREE.Vector3(b.x,b.y,b.z||0);
  const delta=vb.clone().sub(va), length=delta.length();
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,length,radialSegments,1,false),material);
  mesh.position.copy(va).add(vb).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());
  mesh.castShadow=true;mesh.receiveShadow=true;
  return mesh;
}

export function makeBoxBetween(THREE,a,b,height,depth,material){
  const va=a.isVector3?a.clone():new THREE.Vector3(a.x,a.y,a.z||0);
  const vb=b.isVector3?b.clone():new THREE.Vector3(b.x,b.y,b.z||0);
  const delta=vb.clone().sub(va), length=delta.length();
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(length,height,depth),material);
  mesh.position.copy(va).add(vb).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),delta.clone().normalize());
  mesh.castShadow=true;mesh.receiveShadow=true;
  return mesh;
}

export function makeArrow(THREE,from,to,color=0x007d80,label=null){
  const a=from.isVector3?from.clone():new THREE.Vector3(from.x,from.y,from.z||0);
  const b=to.isVector3?to.clone():new THREE.Vector3(to.x,to.y,to.z||0);
  const delta=b.clone().sub(a), len=delta.length();
  const arrow=new THREE.ArrowHelper(delta.clone().normalize(),a,len,color,Math.min(.32,len*.23),Math.min(.15,len*.11));
  arrow.line.material.transparent=false;
  arrow.cone.castShadow=true;
  return arrow;
}

export function makeLabelSprite(THREE,text,{color='#233d42',background='rgba(255,254,250,.94)',scale=1}={}){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle=background;
  const r=34,x=8,y=18,w=752,h=156;
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();
  ctx.strokeStyle='rgba(35,61,66,.16)';ctx.lineWidth=4;ctx.stroke();
  ctx.fillStyle=color;ctx.font='600 52px system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(text,384,98,700);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false});
  const sprite=new THREE.Sprite(material);sprite.scale.set(3.2*scale,.8*scale,1);sprite.renderOrder=20;
  return sprite;
}

export function makeMomentArc(THREE,center,radius,color=0xc26a30){
  const pts=[];const start=-Math.PI*.15,end=Math.PI*1.25;
  for(let i=0;i<=48;i++){const a=start+(end-start)*i/48;pts.push(new THREE.Vector3(center.x+Math.cos(a)*radius,center.y+Math.sin(a)*radius,center.z));}
  const curve=new THREE.CatmullRomCurve3(pts);
  const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,64,.035,10,false),new THREE.MeshStandardMaterial({color,metalness:.2,roughness:.35}));
  tube.castShadow=true;
  const tip=pts[pts.length-1],prev=pts[pts.length-2],dir=tip.clone().sub(prev).normalize();
  const cone=new THREE.Mesh(new THREE.ConeGeometry(.11,.28,18),new THREE.MeshStandardMaterial({color,metalness:.2,roughness:.35}));
  cone.position.copy(tip);cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);cone.castShadow=true;
  const g=new THREE.Group();g.add(tube,cone);return g;
}

export function lineFromPoints(THREE,points,color=0x233d42){
  const geometry=new THREE.BufferGeometry().setFromPoints(points);
  const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color}));
  return line;
}

export function clearGroup(group){
  const geometries=new Set(),materials=new Set(),textures=new Set();
  group.traverse(obj=>{
    if(obj.geometry) geometries.add(obj.geometry);
    const mats=obj.material?(Array.isArray(obj.material)?obj.material:[obj.material]):[];
    for(const mat of mats){materials.add(mat);if(mat.map)textures.add(mat.map);}
  });
  while(group.children.length) group.remove(group.children[0]);
  for(const t of textures)t.dispose();
  for(const m of materials)m.dispose();
  for(const g of geometries)g.dispose();
}

export function disposeGroup(group,scene){
  clearGroup(group);if(group.parent)group.parent.remove(group);else if(scene)scene.remove(group);
}
