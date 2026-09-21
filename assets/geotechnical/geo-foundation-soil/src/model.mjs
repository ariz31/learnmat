export const DEFAULTS=Object.freeze({footingWidth:2,footingLength:3,verticalLoad:1200,moment:100});
export function validateFoundationParameters(values){
 const p={...DEFAULTS,...values};
 for(const [name,value] of Object.entries(p))if(!Number.isFinite(value))throw new TypeError(name+' must be finite.');
 if(p.footingWidth<=0||p.footingLength<=0||p.verticalLoad<=0)throw new RangeError('footingWidth, footingLength, and verticalLoad must be greater than zero.');
 return p;
}
export function computeFoundationContact(values={}){
 const p=validateFoundationParameters(values);
 const area=p.footingWidth*p.footingLength;
 const averagePressure=p.verticalLoad/area;
 const eccentricity=p.moment/p.verticalLoad;
 const pressureDelta=6*p.moment/(p.footingLength*p.footingWidth*p.footingWidth);
 const leftPressure=averagePressure-pressureDelta;
 const rightPressure=averagePressure+pressureDelta;
 const minPressure=Math.min(leftPressure,rightPressure),maxPressure=Math.max(leftPressure,rightPressure);
 const kernLimit=p.footingWidth/6;
 const fullContact=minPressure>=0;
 return{parameters:p,area,averagePressure,eccentricity,kernLimit,leftPressure,rightPressure,minPressure,maxPressure,fullContact,assumption:fullContact?'linear-full-contact-valid':'linear-full-contact-predicts-tension-no-tension-redistribution-not-solved'};
}
