import { DEFAULTS, computeTankState, validateTankParameters } from './model.mjs';
const fmt=(v,d=3)=>Number(v).toLocaleString(undefined,{maximumFractionDigits:d});
export function createAsset(context){
  if(!context||!context.container||typeof context.container.appendChild!=='function') throw new TypeError('context.container must be a DOM element.');
  const root=document.createElement('section');root.className='lm-tank-reservoir';root.setAttribute('aria-label','Tank storage mass-balance visualization');context.container.appendChild(root);
  let parameters={...DEFAULTS},timeSeconds=0,disposed=false,width=760,height=360,state=computeTankState(parameters,0);
  const active=()=>{if(disposed) throw new Error('Tank asset has been disposed.');};
  const render=()=>{
    const s=state,top=225-Math.round(160*s.fillFraction),waterHeight=225-top;
    const condition=s.atUpperLimit?'overflowing':(s.atLowerLimit?'empty with outlet shortfall':'within storage range');
    root.innerHTML='<style>.lm-tank-reservoir{font:14px/1.35 system-ui,sans-serif;color:#10212b;display:grid;gap:10px;max-width:100%}.lm-tank-reservoir *{box-sizing:border-box}.lm-tank-reservoir svg{width:100%;height:auto;display:block;border:1px solid #c8d5dc;border-radius:14px;background:#f7fbfd}.lm-tank-reservoir .m{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:8px}.lm-tank-reservoir .c{padding:8px 10px;border:1px solid #dbe5ea;border-radius:10px;background:#fff}.lm-tank-reservoir b{display:block;font-size:12px;color:#48616e}.lm-tank-reservoir .v{font-weight:700;font-variant-numeric:tabular-nums}</style>'+
    '<svg viewBox="0 0 760 310" role="img" aria-label="Tank level '+fmt(s.level)+' metres at '+fmt(timeSeconds,1)+' seconds; '+condition+'">'+
    '<path d="M250 55V235H510V55" fill="none" stroke="#536d79" stroke-width="8"/>'+
    '<rect x="254" y="'+top+'" width="252" height="'+waterHeight+'" fill="#9edcf2"/>'+
    '<line x1="254" y1="'+top+'" x2="506" y2="'+top+'" stroke="#1686b0" stroke-width="4"/>'+
    '<path d="M130 92h120" stroke="#1686b0" stroke-width="8"/><path d="M235 75l24 17-24 17z" fill="#1686b0"/>'+
    '<path d="M510 205h120" stroke="#1686b0" stroke-width="8"/><path d="M615 188l24 17-24 17z" fill="#1686b0"/>'+
    '<text x="150" y="75" font-size="15">Qin = '+fmt(parameters.inflow,3)+' m³/s</text><text x="530" y="245" font-size="15">Qout demand = '+fmt(parameters.outflowDemand,3)+' m³/s</text>'+
    '<text x="380" y="36" text-anchor="middle" font-size="18" font-weight="700">A·dh/dt = Qin − Qout</text>'+
    '<text x="380" y="275" text-anchor="middle" font-size="16">h = '+fmt(s.level,3)+' m · '+condition+'</text></svg>'+
    '<div class="m"><div class="c"><b>Stored volume</b><span class="v">'+fmt(s.volume,3)+' m³</span></div><div class="c"><b>Level</b><span class="v">'+fmt(s.level,3)+' m</span></div><div class="c"><b>Storage rate</b><span class="v">'+fmt(s.storageRate,3)+' m³/s</span></div><div class="c"><b>Actual outlet</b><span class="v">'+fmt(s.actualOutflow,3)+' m³/s</span></div><div class="c"><b>Overflow</b><span class="v">'+fmt(s.overflowRate,3)+' m³/s</span></div><div class="c"><b>Outlet shortfall</b><span class="v">'+fmt(s.supplyShortfall,3)+' m³/s</span></div></div>';
  };
  const recalc=()=>{state=computeTankState(parameters,timeSeconds);render();}; render();
  return {
    setParameters(values){active();parameters=validateTankParameters({...parameters,...values});recalc();},
    update(value){active();if(!Number.isFinite(value)||value<0) throw new RangeError('timeSeconds must be finite and non-negative.');timeSeconds=value;recalc();},
    reset(){active();parameters={...DEFAULTS};timeSeconds=0;recalc();},
    resize(w,h,pixelRatio){active();if(![w,h,pixelRatio].every(Number.isFinite)||w<=0||h<=0||pixelRatio<=0) throw new RangeError('resize values must be finite and greater than zero.');width=w;height=h;root.style.maxWidth=w+'px';},
    snapshot(){active();return {timeSeconds,parameters:{...parameters},state:{...state,parameters:{...state.parameters}},viewport:{width,height}};},
    dispose(){if(disposed)return;disposed=true;root.remove();}
  };
}
