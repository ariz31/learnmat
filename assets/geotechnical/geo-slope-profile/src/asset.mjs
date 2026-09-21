import{DEFAULTS,computeSlope,validateSlopeParameters}from'./model.mjs';
const fmt=(v,d=3)=>Number(v).toLocaleString(undefined,{maximumFractionDigits:d});
export function createAsset(context){
 if(!context||!context.container||typeof context.container.appendChild!=='function')throw new TypeError('context.container must be a DOM element.');
 const root=document.createElement('section');root.className='lm-slope-profile';root.setAttribute('aria-label','Slope profile and scoped infinite-slope stability visualization');context.container.appendChild(root);
 let parameters={...DEFAULTS},timeSeconds=0,disposed=false,width=760,height=440,state=computeSlope(parameters);
 const active=()=>{if(disposed)throw new Error('Slope asset has been disposed.');};
 const render=()=>{
  const s=state,p=parameters,deg=s.slopeAngle*180/Math.PI,phiDeg=p.frictionAngle*180/Math.PI;
  root.innerHTML='<style>.lm-slope-profile{font:14px/1.35 system-ui,sans-serif;color:#10212b;display:grid;gap:10px;max-width:100%}.lm-slope-profile *{box-sizing:border-box}.lm-slope-profile svg{width:100%;height:auto;border:1px solid #c8d5dc;border-radius:14px;background:#fff}.lm-slope-profile .m{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:8px}.lm-slope-profile .c{padding:8px 10px;border:1px solid #dbe5ea;border-radius:10px;background:#fff}.lm-slope-profile b{display:block;font-size:12px;color:#48616e}.lm-slope-profile .v{font-weight:700}</style>'+
  '<svg viewBox="0 0 760 380" role="img" aria-label="Slope angle '+fmt(deg,2)+' degrees and simplified planar infinite-slope factor of safety '+fmt(s.factorOfSafety,3)+'">'+
  '<polygon points="120,305 120,95 620,305" fill="#c7a77b" stroke="#6b5a48" stroke-width="3"/><line x1="120" y1="95" x2="620" y2="305" stroke="#536d79" stroke-width="5"/>'+
  '<line x1="330" y1="185" x2="430" y2="227" stroke="#b23b2a" stroke-width="5"/><path d="M410 207l27 23-35 4z" fill="#b23b2a"/><text x="330" y="165" font-size="13">downslope driving direction</text>'+
  '<text x="120" y="75" font-size="14">H='+fmt(p.height,2)+' m</text><text x="370" y="330" text-anchor="middle" font-size="14">run='+fmt(p.horizontalRun,2)+' m · β='+fmt(deg,2)+'°</text>'+
  '<text x="380" y="360" text-anchor="middle" font-size="13">Planar infinite-slope slice only — not a circular-slip or general limit-equilibrium analysis</text></svg>'+
  '<div class="m"><div class="c"><b>Slope length</b><span class="v">'+fmt(s.slopeLength,3)+' m</span></div><div class="c"><b>β</b><span class="v">'+fmt(deg,2)+'°</span></div><div class="c"><b>φ′ input</b><span class="v">'+fmt(phiDeg,2)+'°</span></div><div class="c"><b>Driving τ</b><span class="v">'+fmt(s.drivingShearStress,3)+' kPa</span></div><div class="c"><b>Effective σ′n</b><span class="v">'+fmt(s.effectiveNormalStress,3)+' kPa</span></div><div class="c"><b>Model FS</b><span class="v">'+fmt(s.factorOfSafety,3)+'</span></div></div>';
 };
 const recalc=()=>{state=computeSlope(parameters);render();};render();
 return{
  setParameters(v){active();parameters=validateSlopeParameters({...parameters,...v});recalc();},
  update(t){active();if(!Number.isFinite(t)||t<0)throw new RangeError('timeSeconds must be finite and non-negative.');timeSeconds=t;},
  reset(){active();parameters={...DEFAULTS};timeSeconds=0;recalc();},
  resize(w,h,pixelRatio){active();if(![w,h,pixelRatio].every(Number.isFinite)||w<=0||h<=0||pixelRatio<=0)throw new RangeError('resize values must be finite and positive.');width=w;height=h;root.style.maxWidth=w+'px';},
  snapshot(){active();return{timeSeconds,parameters:{...parameters},state:JSON.parse(JSON.stringify(state)),viewport:{width,height}};},
  dispose(){if(disposed)return;disposed=true;root.remove();}
 };
}
