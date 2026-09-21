import { DEFAULT_PARAMETERS, computeMasonryUnit, validateParameters } from './model.mjs';

const NS = 'http://www.w3.org/2000/svg';
const el = (name, attrs={}) => {
  const n = document.createElementNS(NS, name);
  for (const [k,v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
};
const mm = (m) => Math.round(m * 1000);

function text(svg, value, x, y, attrs={}) {
  const n = el('text', {x,y,...attrs});
  n.textContent = value;
  svg.append(n);
  return n;
}
function line(svg,x1,y1,x2,y2,cls='lm-dim-line') {
  svg.append(el('line',{x1,y1,x2,y2,class:cls}));
}
function assertContext(context) {
  if (!context || typeof context !== 'object') throw new TypeError('context is required.');
  if (!(context.container instanceof HTMLElement)) throw new TypeError('context.container must be an HTMLElement.');
  if (!Number.isFinite(context.seed)) throw new TypeError('context.seed must be finite.');
}

function voidBoxes(p, x, y, w, h) {
  const totalVoid = p.voidCount * p.voidLengthM;
  const leftover = p.lengthM - totalVoid;
  const gap = leftover / (p.voidCount + 1);
  const scaleX = w / p.lengthM;
  const scaleY = h / p.depthM;
  const boxes = [];
  let cursor = gap;
  for (let i=0;i<p.voidCount;i+=1) {
    boxes.push({
      x: x + cursor * scaleX,
      y: y + (p.depthM - p.voidDepthM) * scaleY / 2,
      w: p.voidLengthM * scaleX,
      h: p.voidDepthM * scaleY,
    });
    cursor += p.voidLengthM + gap;
  }
  return boxes;
}

function drawUnit(svg, p) {
  const x=100, y=95, w=430, h=165;
  svg.append(el('rect',{x,y,width:w,height:h,rx:4,class:'lm-unit'}));
  const boxes = voidBoxes(p,x,y,w,h);
  for (const b of boxes) {
    svg.append(el('rect',{x:b.x,y:b.y,width:b.w,height:b.h,rx:5,class:'lm-void'}));
  }

  if (p.showDimensions) {
    line(svg,x,y-30,x+w,y-30);
    line(svg,x,y-38,x,y-22); line(svg,x+w,y-38,x+w,y-22);
    text(svg, mm(p.lengthM)+' mm nominal length', x+w/2, y-43, {'text-anchor':'middle',class:'lm-dim-text'});

    line(svg,x-30,y,x-30,y+h);
    line(svg,x-38,y,x-22,y); line(svg,x-38,y+h,x-22,y+h);
    const t=text(svg,mm(p.depthM)+' mm nominal depth',x-48,y+h/2,{'text-anchor':'middle',class:'lm-dim-text'});
    t.setAttribute('transform',`rotate(-90 ${x-48} ${y+h/2})`);

    if (boxes[0]) {
      const b=boxes[0];
      line(svg,b.x,b.y+b.h+24,b.x+b.w,b.y+b.h+24);
      line(svg,b.x,b.y+b.h+17,b.x,b.y+b.h+31);
      line(svg,b.x+b.w,b.y+b.h+17,b.x+b.w,b.y+b.h+31);
      text(svg,mm(p.voidLengthM)+' mm void',b.x+b.w/2,b.y+b.h+43,{'text-anchor':'middle',class:'lm-small'});
    }
  }
  text(svg,'Top view · rectangular through-void idealization',315,302,{'text-anchor':'middle',class:'lm-note'});
}

function drawBond(svg, p) {
  const scale = 720;
  const unitW = Math.min(250, p.lengthM * scale);
  const unitH = Math.min(105, p.heightM * scale);
  const joint = Math.max(2, Math.min(12, p.mortarJointM * scale));
  const startX = 68;
  const baseY = 295;

  const rows = [
    {y: baseY-unitH*2-joint, offset: unitW/2+joint/2},
    {y: baseY-unitH, offset: 0},
  ];
  rows.forEach((row, rowIndex) => {
    for (let i=-1;i<4;i+=1) {
      const x = startX + row.offset + i*(unitW+joint);
      if (x+unitW < 45 || x > 595) continue;
      svg.append(el('rect',{x,y:row.y,width:unitW,height:unitH,class:'lm-bond-unit'}));
      text(svg,rowIndex===0 && i===0 ? '½-unit offset' : '',x+unitW/2,row.y+unitH/2+5,{'text-anchor':'middle',class:'lm-bond-label'});
    }
  });
  line(svg,48,baseY,602,baseY,'lm-base-line');
  text(svg,'Schematic running bond · joint shown at '+mm(p.mortarJointM)+' mm',325,338,{'text-anchor':'middle',class:'lm-note'});
  text(svg,'Bond view demonstrates offset only; it is not a reinforcement, mortar, or code-compliance detail.',325,367,{'text-anchor':'middle',class:'lm-note'});
}

function summary(p, result) {
  return `Generic hollow masonry unit ${mm(p.lengthM)} × ${mm(p.heightM)} × ${mm(p.depthM)} mm with ${p.voidCount} idealized rectangular through-void${p.voidCount===1?'':'s'}. Gross geometric volume ${(result.grossVolumeM3*1000).toFixed(2)} L; idealized solid volume ${(result.netSolidVolumeM3*1000).toFixed(2)} L. Dimensions are generic, not a standard product designation.`;
}

export function createAsset(context) {
  assertContext(context);
  let disposed=false;
  let parameters={...DEFAULT_PARAMETERS};
  let timeSeconds=0;
  let viewport={width:null,height:null,pixelRatio:null};

  const root=document.createElement('section');
  root.className='lm-mat-masonry-units';
  root.setAttribute('role','group');
  root.setAttribute('aria-label','Masonry unit geometry and bond demonstration');
  context.container.append(root);

  const style=document.createElement('style');
  style.textContent=[
    '.lm-mat-masonry-units{box-sizing:border-box;width:100%;min-width:260px;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#0f172a}',
    '.lm-mat-masonry-units *{box-sizing:border-box}',
    '.lm-mat-masonry-units .lm-frame{border:1px solid #d7dde5;border-radius:18px;background:#f8fafc;padding:12px;box-shadow:0 12px 28px rgba(15,23,42,.08)}',
    '.lm-mat-masonry-units svg{display:block;width:100%;height:auto;max-height:520px}',
    '.lm-mat-masonry-units .lm-unit,.lm-mat-masonry-units .lm-bond-unit{fill:#c8c6c0;stroke:#4b5563;stroke-width:2}',
    '.lm-mat-masonry-units .lm-void{fill:#f8fafc;stroke:#4b5563;stroke-width:2}',
    '.lm-mat-masonry-units .lm-dim-line{stroke:#334155;stroke-width:1.4}',
    '.lm-mat-masonry-units .lm-base-line{stroke:#475569;stroke-width:2}',
    '.lm-mat-masonry-units .lm-dim-text{fill:#0f172a;font-size:14px;font-weight:650}',
    '.lm-mat-masonry-units .lm-small{fill:#334155;font-size:12px;font-weight:650}',
    '.lm-mat-masonry-units .lm-note{fill:#64748b;font-size:13px}',
    '.lm-mat-masonry-units .lm-bond-label{fill:#334155;font-size:12px;font-weight:650}',
    '.lm-mat-masonry-units .lm-summary{margin:8px 6px 2px;font-size:14px;line-height:1.5;color:#334155}',
  ].join('');
  root.append(style);

  const frame=document.createElement('div');
  frame.className='lm-frame';
  const svg=el('svg',{viewBox:'0 0 650 400',role:'img'});
  const description=document.createElement('p');
  description.className='lm-summary';
  frame.append(svg,description);
  root.append(frame);

  const ensureLive=()=>{ if(disposed) throw new Error('Masonry unit asset has been disposed.'); };
  const render=()=>{
    ensureLive();
    const result=computeMasonryUnit(parameters);
    svg.replaceChildren();
    svg.setAttribute('aria-label', parameters.view==='unit'
      ? 'Dimensioned top view of a generic hollow masonry unit'
      : 'Schematic running-bond arrangement of masonry units');
    if (parameters.view==='unit') drawUnit(svg,parameters);
    else drawBond(svg,parameters);
    description.textContent=summary(parameters,result);
  };
  render();

  return {
    setParameters(values){ ensureLive(); parameters=validateParameters({...parameters,...values}); render(); },
    update(value){ ensureLive(); if(!Number.isFinite(value)||value<0) throw new RangeError('timeSeconds must be finite and non-negative.'); timeSeconds=value; },
    reset(){ ensureLive(); parameters={...DEFAULT_PARAMETERS}; timeSeconds=0; render(); },
    resize(width,height,pixelRatio){
      ensureLive();
      if (![width,height,pixelRatio].every(v=>Number.isFinite(v)&&v>0)) throw new RangeError('resize values must be finite and positive.');
      viewport={width,height,pixelRatio};
    },
    snapshot(){
      ensureLive();
      return {timeSeconds,parameters:{...parameters},state:{geometry:computeMasonryUnit(parameters),seed:context.seed,reducedMotion:Boolean(context.reducedMotion),viewport:{...viewport}}};
    },
    dispose(){ if(disposed) return; disposed=true; root.remove(); },
  };
}
