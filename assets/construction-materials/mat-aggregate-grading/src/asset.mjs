import {DEFAULT_PARAMETERS,SIEVE_OPENINGS_MM,GRADING_PRESETS,computeGrading,validateParameters} from './model.mjs';
const NS='http://www.w3.org/2000/svg';
const el=(n,a={})=>{const x=document.createElementNS(NS,n);for(const[k,v]of Object.entries(a))x.setAttribute(k,String(v));return x;};
function txt(svg,v,x,y,a={}){const n=el('text',{x,y,...a});n.textContent=v;svg.append(n);return n;}
function seeded(seed){let s=(Math.trunc(seed)>>>0)||1;return()=>{s=(1664525*s+1013904223)>>>0;return s/4294967296;};}
function assertContext(c){if(!c||typeof c!=='object')throw new TypeError('context is required.');if(!(c.container instanceof HTMLElement))throw new TypeError('context.container must be an HTMLElement.');if(!Number.isFinite(c.seed))throw new TypeError('context.seed must be finite.');}
const presetLabel=p=>p==='balanced'?'illustrative balanced':p==='coarse-heavy'?'illustrative coarse-heavy':'illustrative fine-heavy';

function curvePoint(openingMm,passing,x,y,w,h){
  const min=Math.log10(0.15),max=Math.log10(37.5);
  const px=x+(Math.log10(openingMm)-min)/(max-min)*w;
  const py=y+h-(passing/100)*h;
  return [px,py];
}

function drawCurve(svg,p,result){
  const x=292,y=62,w=315,h=250;
  svg.append(el('rect',{x,y,width:w,height:h,class:'lm-plot-bg'}));
  for(let value=0;value<=100;value+=20){
    const py=y+h-value/100*h;
    svg.append(el('line',{x1:x,y1:py,x2:x+w,y2:py,class:'lm-grid'}));
    txt(svg,String(value),x-12,py+4,{'text-anchor':'end',class:'lm-axis-text'});
  }
  const ticks=[0.15,0.3,0.6,1.18,2.36,4.75,9.5,19,37.5];
  for(const opening of ticks){
    const [px]=curvePoint(opening,0,x,y,w,h);
    svg.append(el('line',{x1:px,y1:y,x2:px,y2:y+h,class:'lm-grid'}));
    txt(svg,String(opening),px,y+h+20,{'text-anchor':'middle',class:'lm-axis-small'});
  }
  txt(svg,'% passing',x-46,y+h/2,{'text-anchor':'middle',class:'lm-axis-title',transform:`rotate(-90 ${x-46} ${y+h/2})`});
  txt(svg,'sieve opening (mm, logarithmic axis)',x+w/2,y+h+46,{'text-anchor':'middle',class:'lm-axis-title'});

  const passing=GRADING_PRESETS[p.gradingPreset];
  const pts=[];
  for(let i=SIEVE_OPENINGS_MM.length-1;i>=0;i-=1){
    const [px,py]=curvePoint(SIEVE_OPENINGS_MM[i],passing[i],x,y,w,h);
    pts.push(px+','+py);
  }
  svg.append(el('polyline',{points:pts.join(' '),class:'lm-curve'}));
  for(let i=0;i<SIEVE_OPENINGS_MM.length;i+=1){
    const [px,py]=curvePoint(SIEVE_OPENINGS_MM[i],passing[i],x,y,w,h);
    svg.append(el('circle',{cx:px,cy:py,r:3.5,class:'lm-point'}));
  }
  txt(svg,presetLabel(p.gradingPreset),x+w/2,y-20,{'text-anchor':'middle',class:'lm-title'});
  if(p.showRetainedMass){
    const maxRow=result.rows.reduce((a,b)=>b.percentRetained>a.percentRetained?b:a,result.rows[0]);
    txt(svg,`largest retained interval: ${maxRow.openingMm} mm sieve · ${maxRow.percentRetained.toFixed(0)}% · ${maxRow.retainedMassKg.toFixed(2)} kg`,x+w/2,382,{'text-anchor':'middle',class:'lm-note'});
  }
}

function particleRadiusFromPreset(random,preset){
  const r=random();
  if(preset==='coarse-heavy') return r<0.65?8+random()*11:3+random()*6;
  if(preset==='fine-heavy') return r<0.72?2+random()*5:6+random()*7;
  return r<0.45?3+random()*6:7+random()*9;
}
function drawParticles(svg,p,seed){
  const x=35,y=77,w=210,h=220;
  svg.append(el('rect',{x,y,width:w,height:h,rx:14,class:'lm-bin'}));
  txt(svg,'illustrative aggregate sample',x+w/2,y-15,{'text-anchor':'middle',class:'lm-title'});
  if(!p.showParticles){
    txt(svg,'particle view hidden',x+w/2,y+h/2,{'text-anchor':'middle',class:'lm-note'});
    return;
  }
  const random=seeded(seed);
  const circles=[];
  let attempts=0;
  while(circles.length<45&&attempts<700){
    attempts+=1;
    const r=particleRadiusFromPreset(random,p.gradingPreset);
    const cx=x+r+5+random()*(w-2*r-10);
    const cy=y+r+5+random()*(h-2*r-10);
    const overlap=circles.some(c=>Math.hypot(c.cx-cx,c.cy-cy)<c.r+r+1);
    if(!overlap)circles.push({cx,cy,r});
  }
  circles.sort((a,b)=>b.r-a.r);
  for(const c of circles)svg.append(el('circle',{cx:c.cx,cy:c.cy,r:c.r,class:'lm-particle'}));
  txt(svg,'symbol sizes are visual only',x+w/2,y+h+25,{'text-anchor':'middle',class:'lm-axis-small'});
}

function summary(p,result){
  return `${presetLabel(p.gradingPreset)} grading for a ${p.sampleMassKg.toFixed(2)} kg sample. Retained fractions sum to ${result.retainedPercentTotal.toFixed(1)}% including pan. The curve is illustrative and is not a specification envelope or acceptance result.`;
}

export function createAsset(context){
  assertContext(context);let disposed=false,parameters={...DEFAULT_PARAMETERS},timeSeconds=0,viewport={width:null,height:null,pixelRatio:null};
  const root=document.createElement('section');root.className='lm-mat-aggregate-grading';root.setAttribute('role','group');root.setAttribute('aria-label','Aggregate grading visualization');context.container.append(root);
  const style=document.createElement('style');style.textContent=[
    '.lm-mat-aggregate-grading{box-sizing:border-box;width:100%;min-width:260px;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#0f172a}',
    '.lm-mat-aggregate-grading *{box-sizing:border-box}.lm-mat-aggregate-grading .lm-frame{border:1px solid #d7dde5;border-radius:18px;background:#f8fafc;padding:12px;box-shadow:0 12px 28px rgba(15,23,42,.08)}',
    '.lm-mat-aggregate-grading svg{display:block;width:100%;height:auto;max-height:520px}.lm-mat-aggregate-grading .lm-plot-bg,.lm-mat-aggregate-grading .lm-bin{fill:#fff;stroke:#cbd5e1;stroke-width:1.5}',
    '.lm-mat-aggregate-grading .lm-grid{stroke:#e2e8f0;stroke-width:1}.lm-mat-aggregate-grading .lm-curve{fill:none;stroke:#0f172a;stroke-width:3;stroke-linejoin:round}.lm-mat-aggregate-grading .lm-point{fill:#fff;stroke:#0f172a;stroke-width:2}',
    '.lm-mat-aggregate-grading .lm-particle{fill:#94a3b8;stroke:#475569;stroke-width:1.2}.lm-mat-aggregate-grading .lm-title{fill:#0f172a;font-size:14px;font-weight:700}.lm-mat-aggregate-grading .lm-axis-title{fill:#334155;font-size:12px;font-weight:650}',
    '.lm-mat-aggregate-grading .lm-axis-text{fill:#475569;font-size:11px}.lm-mat-aggregate-grading .lm-axis-small{fill:#64748b;font-size:10px}.lm-mat-aggregate-grading .lm-note{fill:#64748b;font-size:11px}.lm-mat-aggregate-grading .lm-summary{margin:8px 6px 2px;font-size:14px;line-height:1.5;color:#334155}'
  ].join('');root.append(style);
  const frame=document.createElement('div');frame.className='lm-frame';const svg=el('svg',{viewBox:'0 0 650 410',role:'img','aria-label':'Illustrative aggregate sample and percent-passing grading curve'});const desc=document.createElement('p');desc.className='lm-summary';frame.append(svg,desc);root.append(frame);
  const live=()=>{if(disposed)throw new Error('Aggregate grading asset has been disposed.');};
  const render=()=>{live();const result=computeGrading(parameters);svg.replaceChildren();drawParticles(svg,parameters,context.seed);drawCurve(svg,parameters,result);desc.textContent=summary(parameters,result);};
  render();
  return{
    setParameters(values){live();parameters=validateParameters({...parameters,...values});render();},
    update(v){live();if(!Number.isFinite(v)||v<0)throw new RangeError('timeSeconds must be finite and non-negative.');timeSeconds=v;},
    reset(){live();parameters={...DEFAULT_PARAMETERS};timeSeconds=0;render();},
    resize(width,height,pixelRatio){live();if(![width,height,pixelRatio].every(v=>Number.isFinite(v)&&v>0))throw new RangeError('resize values must be finite and positive.');viewport={width,height,pixelRatio};},
    snapshot(){live();return{timeSeconds,parameters:{...parameters},state:{grading:computeGrading(parameters),seed:context.seed,reducedMotion:Boolean(context.reducedMotion),viewport:{...viewport}}};},
    dispose(){if(disposed)return;disposed=true;root.remove();}
  };
}
