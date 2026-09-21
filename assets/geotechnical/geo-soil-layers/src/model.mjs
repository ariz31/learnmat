export const DEFAULTS=Object.freeze({
 layer1Thickness:2,layer1NaturalUnitWeight:17.5,layer1SaturatedUnitWeight:19.5,
 layer2Thickness:3,layer2NaturalUnitWeight:18,layer2SaturatedUnitWeight:20,
 layer3Thickness:4,layer3NaturalUnitWeight:19,layer3SaturatedUnitWeight:21,
 waterTableDepth:2.5,queryDepth:5.5,waterUnitWeight:9.81
});
export function validateSoilParameters(values){
 const p={...DEFAULTS,...values};
 for(const [name,value] of Object.entries(p))if(!Number.isFinite(value))throw new TypeError(name+' must be finite.');
 for(const n of ['layer1Thickness','layer2Thickness','layer3Thickness','layer1NaturalUnitWeight','layer1SaturatedUnitWeight','layer2NaturalUnitWeight','layer2SaturatedUnitWeight','layer3NaturalUnitWeight','layer3SaturatedUnitWeight','waterUnitWeight'])if(p[n]<=0)throw new RangeError(n+' must be greater than zero.');
 const total=p.layer1Thickness+p.layer2Thickness+p.layer3Thickness;
 if(p.waterTableDepth<0||p.waterTableDepth>total)throw new RangeError('waterTableDepth must lie within the profile.');
 if(p.queryDepth<0||p.queryDepth>total)throw new RangeError('queryDepth must lie within the profile.');
 return p;
}
export function computeSoilProfile(values={}){
 const p=validateSoilParameters(values),layers=[
  {name:'Layer 1',thickness:p.layer1Thickness,natural:p.layer1NaturalUnitWeight,saturated:p.layer1SaturatedUnitWeight},
  {name:'Layer 2',thickness:p.layer2Thickness,natural:p.layer2NaturalUnitWeight,saturated:p.layer2SaturatedUnitWeight},
  {name:'Layer 3',thickness:p.layer3Thickness,natural:p.layer3NaturalUnitWeight,saturated:p.layer3SaturatedUnitWeight}
 ];
 let top=0,totalStress=0;
 const contributions=[];
 for(const layer of layers){
  const bottom=top+layer.thickness;
  const segBottom=Math.min(p.queryDepth,bottom);
  if(segBottom>top){
   const length=segBottom-top;
   const above=Math.max(0,Math.min(segBottom,p.waterTableDepth)-top);
   const below=length-above;
   const stress=above*layer.natural+below*layer.saturated;
   totalStress+=stress;contributions.push({name:layer.name,above,below,stress,top,bottom});
  }
  top=bottom;if(top>=p.queryDepth)break;
 }
 const porePressure=p.waterUnitWeight*Math.max(0,p.queryDepth-p.waterTableDepth);
 const effectiveStress=totalStress-porePressure;
 return{parameters:p,layers,totalDepth:p.layer1Thickness+p.layer2Thickness+p.layer3Thickness,totalStress,porePressure,effectiveStress,contributions};
}
