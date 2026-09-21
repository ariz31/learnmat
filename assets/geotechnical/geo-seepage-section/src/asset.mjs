import{DEFAULTS,computeSeepage,validateSeepageParameters}from'./model.mjs';
const fmt=(v,d=5)=>Number(v).toLocaleString(undefined,{maximumFractionDigits:d});
export function createAsset(context){
 if(!context||!context.container||typeof context.container.appendChild!=='function')throw new TypeError('context.container must be a DOM element.');
 const root=document.createElement('section');root.className='lm-seepage';root.setAttribute('aria-label','One-dimensional Darcy seepage visualization');context.container.appendChild(root);
 let parameters={...DEFAULTS},timeSeconds=0,disposed=false,width=760,height=420,state=computeSeepage(parameters);
 const active=()=>{if(disposed)throw new Error('Seepage asset has been disposed.');};
 const render=()=>{
  const s=state,p=parameters,arrow=s.direction>0?'→':s.direction<0?'←':'—';
  const minH=Math.min(p.upstreamHead,p.downstreamHead),maxH=Math.max(p.upstreamHead,p.downstreamHead),span=Math.max(1,maxH-minH);
  const hy=h=>135-(h-minH)/span*70;
  root.innerHTML='<style>.lm-seepage{font:14px/1.35 system-ui,sans-serif;color:#10212b;display:grid;gap:10px;max-width:100%}.lm-seepage *{box-sizing:border-box}.lm-seepage svg{width:100%;height:auto;border:1px solid #c8d5dc;border-radius:14px;background:#fff}.lm-seepage .m{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:8px}.lm-seepage .c{padding:8px 10px;border:1px solid #dbe5ea;border-radius:10px;background:#fff}.lm-seepage b{display:block;font-size:12px;color:#48616e}.lm-seepage .v{font-weight:700}</style>'+
  '<svg viewBox="0 0 760 360" role="img" aria-label="One-dimensional Darcy seepage, hydraulic gradient '+fmt(s.hydraulicGradient,4)+', discharge '+fmt(s.discharge,8)+' cubic metres per second">'+
  '<rect x="145" y="170" width="470" height="120" fill="#c7a77b" stroke="#6b5a48" stroke-width="3"/>'+
  '<text x="380" y="235" text-anchor="middle" font-size="32" fill="#1686b0">'+arrow+'</text><text x="380" y="260" text-anchor="middle" font-size="14">Darcy seepage through homogeneous section</text>'+
  '<line x1="145" y1="'+hy(p.upstreamHead)+'" x2="615" y2="'+hy(p.downstreamHead)+'" stroke="#1686b0" stroke-width="4"/>'+
  '<circle cx="145" cy="'+hy(p.upstreamHead)+'" r="6" fill="#1686b0"/><circle cx="615" cy="'+hy(p.downstreamHead)+'" r="6" fill="#1686b0"/>'+
  '<text x="145" y="45" text-anchor="middle" font-size="14">Upstream fixed head h₁='+fmt(p.upstreamHead,2)+' m</text><text x="615" y="45" text-anchor="middle" font-size="14">Downstream fixed head h₂='+fmt(p.downstreamHead,2)+' m</text>'+
  '<text x="380" y="330" text-anchor="middle" font-size="13">1-D model only — the blue line is total head, not a 2-D flow net</text></svg>'+
  '<div class="m"><div class="c"><b>Head drop h₁−h₂</b><span class="v">'+fmt(s.headDrop,3)+' m</span></div><div class="c"><b>Gradient i</b><span class="v">'+fmt(s.hydraulicGradient,5)+'</span></div><div class="c"><b>Darcy flux q</b><span class="v">'+fmt(s.darcyFlux,8)+' m/s</span></div><div class="c"><b>Area</b><span class="v">'+fmt(s.area,3)+' m²</span></div><div class="c"><b>Discharge Q</b><span class="v">'+fmt(s.discharge,8)+' m³/s</span></div><div class="c"><b>Midpoint head</b><span class="v">'+fmt(s.headAtMidpoint,3)+' m</span></div></div>';
 };
 const recalc=()=>{state=computeSeepage(parameters);render();};render();
 return{
  setParameters(v){active();parameters=validateSeepageParameters({...parameters,...v});recalc();},
  update(t){active();if(!Number.isFinite(t)||t<0)throw new RangeError('timeSeconds must be finite and non-negative.');timeSeconds=t;},
  reset(){active();parameters={...DEFAULTS};timeSeconds=0;recalc();},
  resize(w,h,pixelRatio){active();if(![w,h,pixelRatio].every(Number.isFinite)||w<=0||h<=0||pixelRatio<=0)throw new RangeError('resize values must be finite and positive.');width=w;height=h;root.style.maxWidth=w+'px';},
  snapshot(){active();return{timeSeconds,parameters:{...parameters},state:JSON.parse(JSON.stringify(state)),viewport:{width,height}};},
  dispose(){if(disposed)return;disposed=true;root.remove();}
 };
}
