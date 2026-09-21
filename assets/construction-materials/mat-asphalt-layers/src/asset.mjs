import{DEFAULT_PARAMETERS,computeAsphaltLayers,validateParameters}from'./model.mjs';
const NS='http://www.w3.org/2000/svg';
const el=(n,a={})=>{const x=document.createElementNS(NS,n);for(const[k,v]of Object.entries(a))x.setAttribute(k,String(v));return x;};
const mm=m=>Math.round(m*1000);
function text(svg,v,x,y,a={}){const n=el('text',{x,y,...a});n.textContent=v;svg.append(n);return n;}
function line(svg,x1,y1,x2,y2,cls='lm-dim'){svg.append(el('line',{x1,y1,x2,y2,class:cls}));}
function seeded(seed){let s=(Math.trunc(seed)>>>0)||1;return()=>{s=(1664525*s+1013904223)>>>0;return s/4294967296;};}
function assertContext(c){if(!c||typeof c!=='object')throw new TypeError('context is required.');if(!(c.container instanceof HTMLElement))throw new TypeError('context.container must be an HTMLElement.');if(!Number.isFinite(c.seed))throw new TypeError('context.seed must be finite.');}
const layerNames=['Layer A (top)','Layer B (middle)','Layer C (bottom)'];
const fills=['#4b5563','#606974','#747d87'];

function texture(svg,seed,x,y,w,h,count){
  const r=seeded(seed);
  for(let i=0;i<count;i+=1){
    const radius=1.3+r()*3.2;
    const cx=x+radius+r()*Math.max(1,w-2*radius);
    const cy=y+radius+r()*Math.max(1,h-2*radius);
    svg.append(el('circle',{cx,cy,r:radius,class:'lm-stone',opacity:(0.25+r()*0.28).toFixed(2)}));
  }
}

function drawSlab(svg,p,result,seed){
  const x=115,y=74,w=420,totalH=220;
  let cursor=y;
  for(let i=0;i<3;i+=1){
    const h=totalH*result.thicknessFractions[i];
    svg.append(el('rect',{x,y:cursor,width:w,height:h,fill:fills[i],class:'lm-layer'}));
    if(p.showTexture)texture(svg,seed+i*173,x,cursor,w,h,10+i*5);
    text(svg,`${layerNames[i]} · ${mm(result.thicknessesM[i])} mm`,x+18,cursor+h/2+5,{class:'lm-layer-label'});
    cursor+=h;
  }
  if(p.showDimensions){
    line(svg,x+w+32,y,x+w+32,y+totalH);line(svg,x+w+24,y,x+w+40,y);line(svg,x+w+24,y+totalH,x+w+40,y+totalH);
    const t=text(svg,`${mm(result.totalThicknessM)} mm total`,x+w+55,y+totalH/2,{'text-anchor':'middle',class:'lm-dim-text'});
    t.setAttribute('transform',`rotate(90 ${x+w+55} ${y+totalH/2})`);
    line(svg,x,y+totalH+30,x+w,y+totalH+30);line(svg,x,y+totalH+22,x,y+totalH+38);line(svg,x+w,y+totalH+22,x+w,y+totalH+38);
    text(svg,`${mm(p.sampleLengthM)} mm sample length`,x+w/2,y+totalH+51,{'text-anchor':'middle',class:'lm-dim-text'});
  }
  text(svg,`plan width: ${mm(p.sampleWidthM)} mm`,x,y+totalH+82,{class:'lm-note'});
}

function drawCore(svg,p,result,seed){
  const cx=325,top=70,totalH=250,diameterPx=190,left=cx-diameterPx/2;
  let cursor=top;
  for(let i=0;i<3;i+=1){
    const h=totalH*result.thicknessFractions[i];
    svg.append(el('rect',{x:left,y:cursor,width:diameterPx,height:h,fill:fills[i],class:'lm-core-layer'}));
    if(p.showTexture)texture(svg,seed+i*211,left,cursor,diameterPx,h,8+i*4);
    text(svg,`${layerNames[i]} · ${mm(result.thicknessesM[i])} mm`,cx,cursor+h/2+5,{'text-anchor':'middle',class:'lm-layer-label'});
    cursor+=h;
  }
  svg.append(el('ellipse',{cx,cy:top,rx:diameterPx/2,ry:22,class:'lm-core-top'}));
  svg.append(el('path',{d:`M${left},${top+totalH} A${diameterPx/2},22 0 0 0 ${left+diameterPx},${top+totalH}`,class:'lm-core-bottom'}));
  if(p.showDimensions){
    line(svg,left,top-38,left+diameterPx,top-38);line(svg,left,top-46,left,top-30);line(svg,left+diameterPx,top-46,left+diameterPx,top-30);
    text(svg,`Ø ${mm(p.coreDiameterM)} mm`,cx,top-52,{'text-anchor':'middle',class:'lm-dim-text'});
    line(svg,left+diameterPx+34,top,left+diameterPx+34,top+totalH);line(svg,left+diameterPx+26,top,left+diameterPx+42,top);line(svg,left+diameterPx+26,top+totalH,left+diameterPx+42,top+totalH);
    const t=text(svg,`${mm(result.totalThicknessM)} mm total`,left+diameterPx+57,top+totalH/2,{'text-anchor':'middle',class:'lm-dim-text'});
    t.setAttribute('transform',`rotate(90 ${left+diameterPx+57} ${top+totalH/2})`);
  }
  text(svg,'Cylindrical core specimen view',cx,365,{'text-anchor':'middle',class:'lm-note'});
}

function summary(p,r){
  const view=p.view==='layered-slab'?'layered slab':'core';
  const volume=p.view==='layered-slab'?r.slab.totalVolumeM3:r.core.totalVolumeM3;
  return`Generic three-layer asphalt ${view}: total thickness ${mm(r.totalThicknessM)} mm. Geometric sample volume ${(volume*1000).toFixed(2)} L. Texture is illustrative only and does not encode mix gradation, density, binder content, compaction, temperature, or performance.`;
}

export function createAsset(context){
  assertContext(context);let disposed=false,parameters={...DEFAULT_PARAMETERS},timeSeconds=0,viewport={width:null,height:null,pixelRatio:null};
  const root=document.createElement('section');root.className='lm-mat-asphalt-layers';root.setAttribute('role','group');root.setAttribute('aria-label','Asphalt layered sample geometry');context.container.append(root);
  const style=document.createElement('style');style.textContent=[
    '.lm-mat-asphalt-layers{box-sizing:border-box;width:100%;min-width:260px;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#0f172a}.lm-mat-asphalt-layers *{box-sizing:border-box}',
    '.lm-mat-asphalt-layers .lm-frame{border:1px solid #d7dde5;border-radius:18px;background:#f8fafc;padding:12px;box-shadow:0 12px 28px rgba(15,23,42,.08)}.lm-mat-asphalt-layers svg{display:block;width:100%;height:auto;max-height:520px}',
    '.lm-mat-asphalt-layers .lm-layer,.lm-mat-asphalt-layers .lm-core-layer{stroke:#1f2937;stroke-width:1.5}.lm-mat-asphalt-layers .lm-stone{fill:#d1d5db;stroke:#111827;stroke-width:.5}',
    '.lm-mat-asphalt-layers .lm-layer-label{fill:#fff;font-size:13px;font-weight:700}.lm-mat-asphalt-layers .lm-dim{stroke:#334155;stroke-width:1.4}.lm-mat-asphalt-layers .lm-dim-text{fill:#0f172a;font-size:13px;font-weight:650}',
    '.lm-mat-asphalt-layers .lm-note{fill:#64748b;font-size:12px}.lm-mat-asphalt-layers .lm-core-top{fill:#6b7280;stroke:#1f2937;stroke-width:1.5}.lm-mat-asphalt-layers .lm-core-bottom{fill:none;stroke:#1f2937;stroke-width:1.5}',
    '.lm-mat-asphalt-layers .lm-summary{margin:8px 6px 2px;font-size:14px;line-height:1.5;color:#334155}'
  ].join('');root.append(style);
  const frame=document.createElement('div');frame.className='lm-frame';const svg=el('svg',{viewBox:'0 0 650 410',role:'img'});const desc=document.createElement('p');desc.className='lm-summary';frame.append(svg,desc);root.append(frame);
  const live=()=>{if(disposed)throw new Error('Asphalt layer asset has been disposed.');};
  const render=()=>{live();const r=computeAsphaltLayers(parameters);svg.replaceChildren();svg.setAttribute('aria-label',parameters.view==='layered-slab'?'Dimensioned three-layer asphalt slab sample':'Dimensioned three-layer asphalt core specimen');if(parameters.view==='layered-slab')drawSlab(svg,parameters,r,context.seed);else drawCore(svg,parameters,r,context.seed);desc.textContent=summary(parameters,r);};
  render();
  return{
    setParameters(v){live();parameters=validateParameters({...parameters,...v});render();},
    update(v){live();if(!Number.isFinite(v)||v<0)throw new RangeError('timeSeconds must be finite and non-negative.');timeSeconds=v;},
    reset(){live();parameters={...DEFAULT_PARAMETERS};timeSeconds=0;render();},
    resize(width,height,pixelRatio){live();if(![width,height,pixelRatio].every(v=>Number.isFinite(v)&&v>0))throw new RangeError('resize values must be finite and positive.');viewport={width,height,pixelRatio};},
    snapshot(){live();return{timeSeconds,parameters:{...parameters},state:{geometry:computeAsphaltLayers(parameters),seed:context.seed,reducedMotion:Boolean(context.reducedMotion),viewport:{...viewport}}};},
    dispose(){if(disposed)return;disposed=true;root.remove();}
  };
}
