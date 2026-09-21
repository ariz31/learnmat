export const DEFAULT_CAGE_PARAMETERS=Object.freeze({
  widthM:.45,depthM:.45,heightM:3,clearCoverM:.04,
  longitudinalBarDiameterM:.02,tieDiameterM:.01,
  barsAlongWidth:3,barsAlongDepth:3,maxTieSpacingM:.2
});
const LIMITS=Object.freeze({
  widthM:[.2,1.5],depthM:[.2,1.5],heightM:[1,8],clearCoverM:[.015,.1],
  longitudinalBarDiameterM:[.008,.05],tieDiameterM:[.006,.025],
  barsAlongWidth:[2,8],barsAlongDepth:[2,8],maxTieSpacingM:[.05,.5]
});
export function validateCageParameters(next={},current=DEFAULT_CAGE_PARAMETERS){
  for(const k of Object.keys(next))if(!Object.hasOwn(DEFAULT_CAGE_PARAMETERS,k))throw new TypeError('Unknown parameter: '+k);
  const p={...current,...next};
  for(const[k,[min,max]]of Object.entries(LIMITS)){
    const v=p[k];if(!Number.isFinite(v)||v<min||v>max)throw new RangeError(k+' must be finite and within ['+min+', '+max+']');
  }
  for(const k of ['barsAlongWidth','barsAlongDepth'])if(!Number.isInteger(p[k]))throw new RangeError(k+' must be an integer');
  const barInset=p.clearCoverM+p.tieDiameterM+p.longitudinalBarDiameterM/2;
  const tieInset=p.clearCoverM+p.tieDiameterM/2;
  if(2*barInset>=p.widthM||2*barInset>=p.depthM)throw new RangeError('cover and bar/tie diameters leave no valid longitudinal-bar cage');
  if(2*tieInset>=p.widthM||2*tieInset>=p.depthM)throw new RangeError('cover and tie diameter leave no valid tie rectangle');
  const yStart=tieInset,yEnd=p.heightM-tieInset;
  if(yEnd<=yStart)throw new RangeError('height is too small for the specified end cover');
  return p;
}
function interpolate(a,b,count){if(count===1)return[(a+b)/2];return Array.from({length:count},(_,i)=>a+(b-a)*i/(count-1));}
export function solveReinforcementCage(parameters){
  const p=validateCageParameters(parameters,DEFAULT_CAGE_PARAMETERS);
  const tieInset=p.clearCoverM+p.tieDiameterM/2;
  const barInset=p.clearCoverM+p.tieDiameterM+p.longitudinalBarDiameterM/2;
  const xValues=interpolate(barInset,p.widthM-barInset,p.barsAlongWidth);
  const zValues=interpolate(barInset,p.depthM-barInset,p.barsAlongDepth);
  const longitudinalBars=[];
  for(const x of xValues){longitudinalBars.push({x,z:barInset});longitudinalBars.push({x,z:p.depthM-barInset});}
  for(const z of zValues.slice(1,-1)){longitudinalBars.push({x:barInset,z});longitudinalBars.push({x:p.widthM-barInset,z});}
  const yStart=tieInset,yEnd=p.heightM-tieInset,available=yEnd-yStart;
  const intervalCount=Math.max(1,Math.ceil(available/p.maxTieSpacingM));
  const actualTieSpacingM=available/intervalCount;
  const tieElevationsM=Array.from({length:intervalCount+1},(_,i)=>yStart+i*actualTieSpacingM);
  return{
    parameters:{...p},
    conventions:{
      clearCover:'concrete face to outer surface of transverse tie',
      longitudinalBarCenterlineInsetM:barInset,
      tieCenterlineInsetM:tieInset,
      codeCompliance:'not evaluated'
    },
    tieRectangleM:{xMin:tieInset,xMax:p.widthM-tieInset,zMin:tieInset,zMax:p.depthM-tieInset},
    longitudinalBars,
    longitudinalBarCount:longitudinalBars.length,
    tieElevationsM,
    tieCount:tieElevationsM.length,
    actualTieSpacingM,
    maximumRequestedTieSpacingM:p.maxTieSpacingM
  };
}
