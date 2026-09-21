const ALLOWED_KEYS=new Set([
  'topThicknessM','middleThicknessM','bottomThicknessM','sampleLengthM','sampleWidthM',
  'coreDiameterM','view','showTexture','showDimensions'
]);

export const DEFAULT_PARAMETERS=Object.freeze({
  topThicknessM:0.04,
  middleThicknessM:0.06,
  bottomThicknessM:0.08,
  sampleLengthM:0.40,
  sampleWidthM:0.30,
  coreDiameterM:0.10,
  view:'layered-slab',
  showTexture:true,
  showDimensions:true,
});

function finiteRange(name,value,min,max){
  if(!Number.isFinite(value)||value<min||value>max){
    throw new RangeError(`${name} must be finite and in [${min}, ${max}] m.`);
  }
}

export function validateParameters(values={}){
  if(!values||typeof values!=='object'||Array.isArray(values))throw new TypeError('Parameters must be an object.');
  for(const key of Object.keys(values))if(!ALLOWED_KEYS.has(key))throw new TypeError('Unknown parameter: '+key);
  const p={...DEFAULT_PARAMETERS,...values};
  finiteRange('topThicknessM',p.topThicknessM,0.01,0.15);
  finiteRange('middleThicknessM',p.middleThicknessM,0.01,0.20);
  finiteRange('bottomThicknessM',p.bottomThicknessM,0.01,0.25);
  finiteRange('sampleLengthM',p.sampleLengthM,0.10,1.00);
  finiteRange('sampleWidthM',p.sampleWidthM,0.10,1.00);
  finiteRange('coreDiameterM',p.coreDiameterM,0.05,0.20);
  if(!['layered-slab','core'].includes(p.view))throw new RangeError('view must be "layered-slab" or "core".');
  if(typeof p.showTexture!=='boolean'||typeof p.showDimensions!=='boolean')throw new TypeError('showTexture and showDimensions must be boolean.');
  return p;
}

export function computeAsphaltLayers(values={}){
  const p=validateParameters(values);
  const thicknesses=[p.topThicknessM,p.middleThicknessM,p.bottomThicknessM];
  const totalThicknessM=thicknesses.reduce((a,b)=>a+b,0);
  const slabAreaM2=p.sampleLengthM*p.sampleWidthM;
  const slabVolumesM3=thicknesses.map(t=>slabAreaM2*t);
  const slabTotalVolumeM3=slabVolumesM3.reduce((a,b)=>a+b,0);
  const coreAreaM2=Math.PI*(p.coreDiameterM/2)**2;
  const coreVolumesM3=thicknesses.map(t=>coreAreaM2*t);
  const coreTotalVolumeM3=coreVolumesM3.reduce((a,b)=>a+b,0);
  const thicknessFractions=thicknesses.map(t=>t/totalThicknessM);
  return{
    thicknessesM:thicknesses,
    totalThicknessM,
    thicknessFractions,
    slab:{lengthM:p.sampleLengthM,widthM:p.sampleWidthM,areaM2:slabAreaM2,layerVolumesM3:slabVolumesM3,totalVolumeM3:slabTotalVolumeM3},
    core:{diameterM:p.coreDiameterM,areaM2:coreAreaM2,layerVolumesM3:coreVolumesM3,totalVolumeM3:coreTotalVolumeM3},
    interpretation:'Generic three-lift asphalt sample geometry only; no pavement design, mix designation, compaction, density, binder content, temperature, or material-property claim is encoded.'
  };
}
