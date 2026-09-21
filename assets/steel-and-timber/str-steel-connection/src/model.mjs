export const DEFAULT_CONNECTION_PARAMETERS=Object.freeze({
  plateWidthM:.14,plateHeightM:.34,plateThicknessM:.012,boltDiameterM:.02,
  boltCount:4,boltSpacingM:.075,minimumEdgeDistanceM:.045,explodeM:.08
});
const LIMITS=Object.freeze({
  plateWidthM:[.08,.4],plateHeightM:[.15,.8],plateThicknessM:[.006,.03],
  boltDiameterM:[.012,.036],boltCount:[2,8],boltSpacingM:[.04,.15],
  minimumEdgeDistanceM:[.02,.1],explodeM:[0,.3]
});
export function validateConnectionParameters(next={},current=DEFAULT_CONNECTION_PARAMETERS){
  for(const k of Object.keys(next))if(!Object.hasOwn(DEFAULT_CONNECTION_PARAMETERS,k))throw new TypeError('Unknown parameter: '+k);
  const p={...current,...next};
  for(const[k,[min,max]]of Object.entries(LIMITS)){const v=p[k];if(!Number.isFinite(v)||v<min||v>max)throw new RangeError(k+' must be finite and within ['+min+', '+max+']');}
  if(!Number.isInteger(p.boltCount))throw new RangeError('boltCount must be an integer');
  if(p.boltSpacingM<=p.boltDiameterM)throw new RangeError('boltSpacingM must exceed boltDiameterM');
  const groupLength=(p.boltCount-1)*p.boltSpacingM;
  const verticalEdge=(p.plateHeightM-groupLength)/2;
  if(verticalEdge<p.minimumEdgeDistanceM)throw new RangeError('bolt group does not satisfy the requested vertical edge distance within the plate height');
  if(p.plateWidthM/2<p.minimumEdgeDistanceM)throw new RangeError('plate width does not satisfy the requested horizontal edge distance to the centered bolt line');
  if(p.minimumEdgeDistanceM<=p.boltDiameterM/2)throw new RangeError('minimumEdgeDistanceM must exceed the bolt radius');
  return p;
}
export function solveSteelConnection(parameters){
  const p=validateConnectionParameters(parameters,DEFAULT_CONNECTION_PARAMETERS);
  const groupLength=(p.boltCount-1)*p.boltSpacingM;
  const verticalEdgeDistanceM=(p.plateHeightM-groupLength)/2;
  const x=p.plateWidthM/2;
  const boltCentersM=Array.from({length:p.boltCount},(_,i)=>({x,y:verticalEdgeDistanceM+i*p.boltSpacingM}));
  return{
    parameters:{...p},
    plate:{widthM:p.plateWidthM,heightM:p.plateHeightM,thicknessM:p.plateThicknessM},
    boltCentersM,
    boltGroupLengthM:groupLength,
    actualVerticalEdgeDistanceM:verticalEdgeDistanceM,
    actualHorizontalEdgeDistanceM:p.plateWidthM/2,
    assemblyOffsetsM:{support:0,plate:p.explodeM,beamWeb:2*p.explodeM},
    checks:{
      requestedMinimumEdgeDistanceM:p.minimumEdgeDistanceM,
      spacingExceedsBoltDiameter:p.boltSpacingM>p.boltDiameterM,
      verticalEdgeMeetsRequested:verticalEdgeDistanceM>=p.minimumEdgeDistanceM,
      horizontalEdgeMeetsRequested:p.plateWidthM/2>=p.minimumEdgeDistanceM
    },
    scope:'assembly geometry only; no bolt, plate, weld, block-shear, bearing, slip, prying, or code strength check'
  };
}
