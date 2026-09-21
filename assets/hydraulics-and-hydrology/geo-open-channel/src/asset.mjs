import { DEFAULTS, computeOpenChannel, validateOpenChannelParameters } from './model.mjs';
const fmt=(v,d=3)=>Number(v).toLocaleString(undefined,{maximumFractionDigits:d});
export function createAsset(context){
  if(!context||!context.container||typeof context.container.appendChild!=='function') throw new TypeError('context.container must be a DOM element.');
  const root=document.createElement('section'); root.className='lm-open-channel'; root.setAttribute('aria-label','Open-channel section hydraulics visualization'); context.container.appendChild(root);
  let parameters={...DEFAULTS},timeSeconds=0,disposed=false,state=computeOpenChannel(parameters),width=760,height=360;
  const active=()=>{if(disposed) throw new Error('Open-channel asset has been disposed.');};
  const render=()=>{
    const s=state;
    const waterTop=205-Math.min(125,Math.max(16,parameters.depth/(parameters.depth+1)*145));
    const phase=context.reducedMotion?0:((timeSeconds*28)%52);
    root.innerHTML='<style>.lm-open-channel{font:14px/1.35 system-ui,sans-serif;color:#10212b;display:grid;gap:10px;max-width:100%}.lm-open-channel *{box-sizing:border-box}.lm-open-channel svg{width:100%;height:auto;display:block;border:1px solid #c8d5dc;border-radius:14px;background:#f7fbfd}.lm-open-channel .m{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:8px}.lm-open-channel .c{padding:8px 10px;border:1px solid #dbe5ea;border-radius:10px;background:#fff}.lm-open-channel b{display:block;font-size:12px;color:#48616e}.lm-open-channel .v{font-weight:700;font-variant-numeric:tabular-nums}</style>'+
    '<svg viewBox="0 0 760 300" role="img" aria-label="Rectangular open channel, depth '+fmt(parameters.depth)+' metres, Froude number '+fmt(s.froude)+', '+s.regime+' flow">'+
    '<path d="M135 62V225H625V62" fill="none" stroke="#536d79" stroke-width="8" stroke-linejoin="round"/>'+
    '<rect x="139" y="'+waterTop+'" width="482" height="'+(221-waterTop)+'" fill="#bfe8f8"/>'+
    '<line x1="145" y1="'+waterTop+'" x2="615" y2="'+waterTop+'" stroke="#1686b0" stroke-width="4" stroke-dasharray="28 24" stroke-dashoffset="'+phase+'"/>'+
    '<line x1="110" y1="'+waterTop+'" x2="110" y2="221" stroke="#8c5b3e" stroke-width="3"/>'+
    '<text x="90" y="'+((waterTop+221)/2)+'" text-anchor="end" font-size="15">y = '+fmt(parameters.depth,2)+' m</text>'+
    '<text x="380" y="252" text-anchor="middle" font-size="15">b = '+fmt(parameters.width,2)+' m</text>'+
    '<text x="380" y="36" text-anchor="middle" font-size="18" font-weight="700">Fr = '+fmt(s.froude,3)+' · '+s.regime+'</text>'+
    '<text x="380" y="282" text-anchor="middle" font-size="13">Specified-depth Manning capacity = '+fmt(s.manningCapacity,3)+' m³/s (not a solved normal depth)</text></svg>'+
    '<div class="m"><div class="c"><b>Area</b><span class="v">'+fmt(s.area,3)+' m²</span></div><div class="c"><b>Velocity</b><span class="v">'+fmt(s.velocity,3)+' m/s</span></div><div class="c"><b>Hydraulic radius</b><span class="v">'+fmt(s.hydraulicRadius,3)+' m</span></div><div class="c"><b>Froude number</b><span class="v">'+fmt(s.froude,3)+'</span></div><div class="c"><b>Specific energy</b><span class="v">'+fmt(s.specificEnergy,3)+' m</span></div><div class="c"><b>Manning capacity</b><span class="v">'+fmt(s.manningCapacity,3)+' m³/s</span></div></div>';
  };
  const recalc=()=>{state=computeOpenChannel(parameters);render();}; render();
  return {
    setParameters(values){active();parameters=validateOpenChannelParameters({...parameters,...values});recalc();},
    update(value){active();if(!Number.isFinite(value)||value<0) throw new RangeError('timeSeconds must be finite and non-negative.');timeSeconds=value;render();},
    reset(){active();parameters={...DEFAULTS};timeSeconds=0;recalc();},
    resize(w,h,pixelRatio){active();if(![w,h,pixelRatio].every(Number.isFinite)||w<=0||h<=0||pixelRatio<=0) throw new RangeError('resize values must be finite and greater than zero.');width=w;height=h;root.style.maxWidth=w+'px';},
    snapshot(){active();return {timeSeconds,parameters:{...parameters},state:{...state,parameters:{...state.parameters}},viewport:{width,height}};},
    dispose(){if(disposed)return;disposed=true;root.remove();}
  };
}
