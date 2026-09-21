import{DEFAULTS,computeSoilProfile,validateSoilParameters}from'./model.mjs';
const fmt=(v,d=2)=>Number(v).toLocaleString(undefined,{maximumFractionDigits:d});
export function createAsset(context){
 if(!context||!context.container||typeof context.container.appendChild!=='function')throw new TypeError('context.container must be a DOM element.');
 const root=document.createElement('section');root.className='lm-soil-layers';root.setAttribute('aria-label','Layered soil and effective stress visualization');context.container.appendChild(root);
 let parameters={...DEFAULTS},timeSeconds=0,disposed=false,width=760,height=430,state=computeSoilProfile(parameters);
 const active=()=>{if(disposed)throw new Error('Soil-layer asset has been disposed.');};
 const render=()=>{
  const s=state,p=parameters,y0=55,y1=330,scale=(y1-y0)/s.totalDepth;
  let top=0,rects='';
  const fills=['#d7b98e','#b8976c','#8f765a'];
  s.layers.forEach((L,i)=>{const y=y0+top*scale,h=L.thickness*scale;rects+='<rect x="180" y="'+y+'" width="350" height="'+h+'" fill="'+fills[i]+'" stroke="#6b5a48"/><text x="195" y="'+(y+25)+'" font-size="14" fill="#182128">'+L.name+' · γnat '+fmt(L.natural,1)+' · γsat '+fmt(L.saturated,1)+' kN/m³</text>';top+=L.thickness;});
  const wtY=y0+p.waterTableDepth*scale,qY=y0+p.queryDepth*scale;
  root.innerHTML='<style>.lm-soil-layers{font:14px/1.35 system-ui,sans-serif;color:#10212b;display:grid;gap:10px;max-width:100%}.lm-soil-layers *{box-sizing:border-box}.lm-soil-layers svg{width:100%;height:auto;border:1px solid #c8d5dc;border-radius:14px;background:#fff}.lm-soil-layers .m{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}.lm-soil-layers .c{padding:8px 10px;border:1px solid #dbe5ea;border-radius:10px;background:#fff}.lm-soil-layers b{display:block;font-size:12px;color:#48616e}.lm-soil-layers .v{font-weight:700}</style>'+
  '<svg viewBox="0 0 760 390" role="img" aria-label="Three-layer soil profile, water table at '+fmt(p.waterTableDepth)+' metres, query depth '+fmt(p.queryDepth)+' metres, effective vertical stress '+fmt(s.effectiveStress)+' kilopascals">'+rects+
  '<line x1="145" y1="'+wtY+'" x2="560" y2="'+wtY+'" stroke="#1686b0" stroke-width="4" stroke-dasharray="12 8"/><text x="570" y="'+(wtY+5)+'" font-size="13" fill="#1686b0">water table</text>'+
  '<line x1="145" y1="'+qY+'" x2="560" y2="'+qY+'" stroke="#b23b2a" stroke-width="3"/><text x="570" y="'+(qY+5)+'" font-size="13" fill="#b23b2a">query z='+fmt(p.queryDepth)+' m</text>'+
  '<text x="355" y="28" text-anchor="middle" font-size="18" font-weight="700">σ′v = σv − u</text><text x="355" y="365" text-anchor="middle" font-size="13">Hydrostatic pore pressure below the stated water table; capillarity omitted</text></svg>'+
  '<div class="m"><div class="c"><b>Total vertical stress σv</b><span class="v">'+fmt(s.totalStress,2)+' kPa</span></div><div class="c"><b>Pore pressure u</b><span class="v">'+fmt(s.porePressure,2)+' kPa</span></div><div class="c"><b>Effective stress σ′v</b><span class="v">'+fmt(s.effectiveStress,2)+' kPa</span></div><div class="c"><b>Total profile depth</b><span class="v">'+fmt(s.totalDepth,2)+' m</span></div></div>';
 };
 const recalc=()=>{state=computeSoilProfile(parameters);render();};render();
 return{
  setParameters(v){active();parameters=validateSoilParameters({...parameters,...v});recalc();},
  update(t){active();if(!Number.isFinite(t)||t<0)throw new RangeError('timeSeconds must be finite and non-negative.');timeSeconds=t;},
  reset(){active();parameters={...DEFAULTS};timeSeconds=0;recalc();},
  resize(w,h,pixelRatio){active();if(![w,h,pixelRatio].every(Number.isFinite)||w<=0||h<=0||pixelRatio<=0)throw new RangeError('resize values must be finite and positive.');width=w;height=h;root.style.maxWidth=w+'px';},
  snapshot(){active();return{timeSeconds,parameters:{...parameters},state:JSON.parse(JSON.stringify(state)),viewport:{width,height}};},
  dispose(){if(disposed)return;disposed=true;root.remove();}
 };
}
