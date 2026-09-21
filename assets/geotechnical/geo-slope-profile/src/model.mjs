export const DEFAULTS=Object.freeze({height:6,horizontalRun:9,normalThickness:1.5,unitWeight:18,cohesion:5,frictionAngle:0.55850536064,porePressureRatioToNormal:0.2});
export function validateSlopeParameters(values){
 const p={...DEFAULTS,...values};
 for(const [name,value] of Object.entries(p))if(!Number.isFinite(value))throw new TypeError(name+' must be finite.');
 if(p.height<=0||p.horizontalRun<=0||p.normalThickness<=0||p.unitWeight<=0)throw new RangeError('height, horizontalRun, normalThickness, and unitWeight must be greater than zero.');
 if(p.cohesion<0)throw new RangeError('cohesion cannot be negative.');
 if(p.frictionAngle<0||p.frictionAngle>=Math.PI/2)throw new RangeError('frictionAngle must be in [0, pi/2) radians.');
 if(p.porePressureRatioToNormal<0||p.porePressureRatioToNormal>=1)throw new RangeError('porePressureRatioToNormal must be in [0,1).');
 return p;
}
export function computeSlope(values={}){
 const p=validateSlopeParameters(values);
 const slopeAngle=Math.atan2(p.height,p.horizontalRun);
 const slopeLength=Math.hypot(p.height,p.horizontalRun);
 const drivingShearStress=p.unitWeight*p.normalThickness*Math.sin(slopeAngle);
 const totalNormalStress=p.unitWeight*p.normalThickness*Math.cos(slopeAngle);
 const porePressure=p.porePressureRatioToNormal*totalNormalStress;
 const effectiveNormalStress=totalNormalStress-porePressure;
 const shearResistance=p.cohesion+effectiveNormalStress*Math.tan(p.frictionAngle);
 const factorOfSafety=shearResistance/drivingShearStress;
 return{parameters:p,slopeAngle,slopeLength,drivingShearStress,totalNormalStress,porePressure,effectiveNormalStress,shearResistance,factorOfSafety};
}
