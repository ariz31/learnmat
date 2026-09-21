import{DEFAULTS,computeFoundationContact,validateFoundationParameters}from'./model.mjs';
const fmt=(v,d=2)=>Number(v).toLocaleString(undefined,{maximumFractionDigits:d});
export function createAsset(context){
 if(!context||!context.container||typeof context.container.appendChild!=='function')throw new TypeError('context.container must be a DOM element.');
 const root=document.createElement('section');root.className='lm-foundation-soil';root.setAttribute('aria-label','Shallow footing contact pressure visualization');context.container.appendChild(root);
 let parameters={...DEFAULTS},timeSeconds=0,disposed=false,width=760,height=440,state=computeFoundationContact(parameters);
 const active=()=>{if(disposed)throw new Error('Foundation-soil asset has been disposed.');};
 const render=()=>{
  const s=state,p=parameters,qScale=90/Math.max(s.maxPressure,1);
  const lH=Math.max(0,s.leftPressure)*qScale,rH=Math.max(0,s.rightPressure)*qScale;
  const warning=s.fullContact?'Full-contact linear pressure assumption is internally consistent.':'qmin < 0: soil tension is impossible; no-tension redistribution is NOT solved by this asset.';
  root.innerHTML='<style>.lm-foundation-soil{font:14px/1.35 system-ui,sans-serif;color:#10212b;display:grid;gap:10px;max-width:100%}.lm-foundation-soil *{box-sizing:border-box}.lm-foundation-soil svg{width:100%;height:auto;border:1px solid #c8d5dc;border-radius:14px;background:#fff}.lm-foundation-soil .m{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:8px}.lm-foundation-soil .c{padding:8px 10px;border:1px solid #dbe5ea;border-radius:10px;background:#fff}.lm-foundation-soil b{display:block;font-size:12px;color:#48616e}.lm-foundation-soil .v{font-weight:700}</style>'+
  '<svg viewBox="0 0 760 370" role="img" aria-label="Rectangular footing average pressure '+fmt(s.averagePressure)+' kilopascals, edge pressures '+fmt(s.leftPressure)+' and '+fmt(s.rightPressure)+' kilopascals; '+warning+'">'+
  '<rect x="210" y="105" width="340" height="55" fill="#aeb9bf" stroke="#536d79" stroke-width="3"/><rect x="150" y="160" width="460" height="140" fill="#d5b98a"/>'+
  '<line x1="380" y1="40" x2="380" y2="103" stroke="#b23b2a" stroke-width="5"/><path d="M366 83l14 24 14-24z" fill="#b23b2a"/><text x="400" y="62" font-size="14">P='+fmt(p.verticalLoad,1)+' kN</text>'+
  '<path d="M330 78 Q380 30 430 78" fill="none" stroke="#8d4fa3" stroke-width="4"/><text x="445" y="42" font-size="14">M='+fmt(p.moment,1)+' kN·m</text>'+
  '<polygon points="210,300 210,'+(300-lH)+' 550,'+(300-rH)+' 550,300" fill="#9edcf2" stroke="#1686b0" stroke-width="3"/>'+
  '<text x="210" y="330" text-anchor="middle" font-size="13">qL='+fmt(s.leftPressure,1)+' kPa</text><text x="550" y="330" text-anchor="middle" font-size="13">qR='+fmt(s.rightPressure,1)+' kPa</text>'+
  '<text x="380" y="355" text-anchor="middle" font-size="13">'+warning+'</text></svg>'+
  '<div class="m"><div class="c"><b>Average q=P/A</b><span class="v">'+fmt(s.averagePressure,2)+' kPa</span></div><div class="c"><b>Eccentricity e=M/P</b><span class="v">'+fmt(s.eccentricity,4)+' m</span></div><div class="c"><b>Middle-third limit B/6</b><span class="v">'+fmt(s.kernLimit,4)+' m</span></div><div class="c"><b>qmin</b><span class="v">'+fmt(s.minPressure,2)+' kPa</span></div><div class="c"><b>qmax</b><span class="v">'+fmt(s.maxPressure,2)+' kPa</span></div></div>';
 };
 const recalc=()=>{state=computeFoundationContact(parameters);render();};render();
 return{
  setParameters(v){active();parameters=validateFoundationParameters({...parameters,...v});recalc();},
  update(t){active();if(!Number.isFinite(t)||t<0)throw new RangeError('timeSeconds must be finite and non-negative.');timeSeconds=t;},
  reset(){active();parameters={...DEFAULTS};timeSeconds=0;recalc();},
  resize(w,h,pixelRatio){active();if(![w,h,pixelRatio].every(Number.isFinite)||w<=0||h<=0||pixelRatio<=0)throw new RangeError('resize values must be finite and positive.');width=w;height=h;root.style.maxWidth=w+'px';},
  snapshot(){active();return{timeSeconds,parameters:{...parameters},state:JSON.parse(JSON.stringify(state)),viewport:{width,height}};},
  dispose(){if(disposed)return;disposed=true;root.remove();}
 };
}
