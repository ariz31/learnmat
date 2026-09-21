import{DEFAULTS,computePumpSystem,validatePumpParameters,pumpHead,systemHead}from'./model.mjs';
const fmt=(v,d=3)=>v==null?'—':Number(v).toLocaleString(undefined,{maximumFractionDigits:d});
export function createAsset(context){
 if(!context||!context.container||typeof context.container.appendChild!=='function')throw new TypeError('context.container must be a DOM element.');
 const root=document.createElement('section');root.className='lm-pump-system';root.setAttribute('aria-label','Pump and system curve operating-point visualization');context.container.appendChild(root);
 let parameters={...DEFAULTS},timeSeconds=0,disposed=false,width=760,height=420,state=computePumpSystem(parameters);
 const active=()=>{if(disposed)throw new Error('Pump-system asset has been disposed.');};
 const render=()=>{
  const s=state,p=parameters,W=760,H=360,left=72,right=710,top=40,bottom=292;
  const hMax=1.12*Math.max(p.shutoffHead,systemHead(p,s.qMax),1);
  const x=q=>left+(right-left)*q/s.qMax, y=h=>bottom-(bottom-top)*Math.max(0,h)/hMax;
  const path=(fn)=>Array.from({length:61},(_,i)=>{const q=s.qMax*i/60;return(i?'L':'M')+x(q).toFixed(1)+' '+y(fn(p,q)).toFixed(1)}).join(' ');
  const op=s.operatingPoint.exists?'<circle cx="'+x(s.operatingPoint.flow)+'" cy="'+y(s.operatingPoint.head)+'" r="7" fill="#b23b2a"/><text x="'+(x(s.operatingPoint.flow)+12)+'" y="'+(y(s.operatingPoint.head)-10)+'" font-size="13">Q*='+fmt(s.operatingPoint.flow,4)+' m³/s, H*='+fmt(s.operatingPoint.head,2)+' m</text>':'<text x="390" y="170" text-anchor="middle" font-size="17" font-weight="700" fill="#8d2b20">No non-negative curve intersection</text>';
  root.innerHTML='<style>.lm-pump-system{font:14px/1.35 system-ui,sans-serif;color:#10212b;display:grid;gap:10px;max-width:100%}.lm-pump-system *{box-sizing:border-box}.lm-pump-system svg{width:100%;height:auto;border:1px solid #c8d5dc;border-radius:14px;background:#fff}.lm-pump-system .m{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:8px}.lm-pump-system .c{padding:8px 10px;border:1px solid #dbe5ea;border-radius:10px;background:#fff}.lm-pump-system b{display:block;font-size:12px;color:#48616e}.lm-pump-system .v{font-weight:700}</style>'+
  '<svg viewBox="0 0 760 360" role="img" aria-label="'+(s.operatingPoint.exists?'Operating flow '+fmt(s.operatingPoint.flow,4)+' cubic metres per second at '+fmt(s.operatingPoint.head,2)+' metres head':'No non-negative pump and system curve intersection')+'">'+
  '<line x1="'+left+'" y1="'+bottom+'" x2="'+right+'" y2="'+bottom+'" stroke="#607d8b"/><line x1="'+left+'" y1="'+top+'" x2="'+left+'" y2="'+bottom+'" stroke="#607d8b"/>'+
  '<path d="'+path(pumpHead)+'" fill="none" stroke="#1686b0" stroke-width="4"/><path d="'+path(systemHead)+'" fill="none" stroke="#d07a24" stroke-width="4"/>'+op+
  '<text x="390" y="330" text-anchor="middle" font-size="14">Discharge Q (m³/s)</text><text x="24" y="170" text-anchor="middle" transform="rotate(-90 24 170)" font-size="14">Head H (m)</text>'+
  '<text x="105" y="70" fill="#1686b0" font-size="13">Pump: H = H₀ − kₚQ²</text><text x="105" y="92" fill="#d07a24" font-size="13">System: H = Hs + KsQ²</text></svg>'+
  '<div class="m"><div class="c"><b>Operating flow</b><span class="v">'+fmt(s.operatingPoint.flow,5)+' m³/s</span></div><div class="c"><b>Operating head</b><span class="v">'+fmt(s.operatingPoint.head,3)+' m</span></div><div class="c"><b>Hydraulic power</b><span class="v">'+fmt(s.hydraulicPower/1000,2)+' kW</span></div><div class="c"><b>Estimated shaft power</b><span class="v">'+fmt(s.shaftPower/1000,2)+' kW</span></div></div>';
 };
 const recalc=()=>{state=computePumpSystem(parameters);render();};render();
 return{
  setParameters(v){active();parameters=validatePumpParameters({...parameters,...v});recalc();},
  update(t){active();if(!Number.isFinite(t)||t<0)throw new RangeError('timeSeconds must be finite and non-negative.');timeSeconds=t;},
  reset(){active();parameters={...DEFAULTS};timeSeconds=0;recalc();},
  resize(w,h,pixelRatio){active();if(![w,h,pixelRatio].every(Number.isFinite)||w<=0||h<=0||pixelRatio<=0)throw new RangeError('resize values must be finite and positive.');width=w;height=h;root.style.maxWidth=w+'px';},
  snapshot(){active();return{timeSeconds,parameters:{...parameters},state:JSON.parse(JSON.stringify(state)),viewport:{width,height}};},
  dispose(){if(disposed)return;disposed=true;root.remove();}
 };
}
