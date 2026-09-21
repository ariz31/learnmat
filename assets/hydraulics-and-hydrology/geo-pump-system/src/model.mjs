export const DEFAULTS=Object.freeze({
  shutoffHead:36,pumpCoefficient:800,staticHead:8,systemCoefficient:1200,
  efficiency:0.75,density:1000,gravity:9.81
});
export function validatePumpParameters(values){
  const p={...DEFAULTS,...values};
  for(const [name,value] of Object.entries(p)) if(!Number.isFinite(value)) throw new TypeError(name+' must be finite.');
  if(p.shutoffHead<=0||p.pumpCoefficient<=0||p.efficiency<=0||p.efficiency>1||p.density<=0||p.gravity<=0) throw new RangeError('shutoffHead, pumpCoefficient, efficiency, density, and gravity must be positive; efficiency cannot exceed 1.');
  if(p.staticHead<0||p.systemCoefficient<0) throw new RangeError('staticHead and systemCoefficient cannot be negative.');
  return p;
}
export const pumpHead=(p,q)=>p.shutoffHead-p.pumpCoefficient*q*q;
export const systemHead=(p,q)=>p.staticHead+p.systemCoefficient*q*q;
export function computePumpSystem(values={}){
  const p=validatePumpParameters(values);
  const delta=p.shutoffHead-p.staticHead;
  const denominator=p.pumpCoefficient+p.systemCoefficient;
  const exists=delta>=0;
  const flow=exists?Math.sqrt(delta/denominator):null;
  const head=exists?pumpHead(p,flow):null;
  const hydraulicPower=exists?p.density*p.gravity*flow*head:0;
  const shaftPower=exists?hydraulicPower/p.efficiency:0;
  const zeroHeadFlow=Math.sqrt(p.shutoffHead/p.pumpCoefficient);
  const qMax=1.15*Math.max(zeroHeadFlow,flow||0,0.01);
  return {parameters:p,operatingPoint:{exists,flow,head},hydraulicPower,shaftPower,zeroHeadFlow,qMax};
}
