import{DEFAULT_CAGE_PARAMETERS,solveReinforcementCage,validateCageParameters}from'./model.mjs';
const NS='http://www.w3.org/2000/svg';function e(n,a={},t=''){const x=document.createElementNS(NS,n);for(const[k,v]of Object.entries(a))x.setAttribute(k,String(v));if(t)x.textContent=t;return x;}
export function createAsset(context){
 if(!context||!(context.container instanceof Element))throw new TypeError('context.container must be a DOM Element');
 let disposed=false,p={...DEFAULT_CAGE_PARAMETERS},timeSeconds=0,viewport={width:820,height:500,pixelRatio:1};
 const host=document.createElement('div'),shadow=host.attachShadow({mode:'open'}),style=document.createElement('style'),card=document.createElement('div'),svg=e('svg',{viewBox:'0 0 820 500',role:'img'}),note=document.createElement('p');
 style.textContent=':host{display:block}.card{font:13px/1.4 system-ui,sans-serif;color:#111827;background:#fff;border:1px solid #d1d5db;border-radius:12px;padding:10px}svg{display:block;width:100%;height:auto}.note{margin:.5rem 0 0}';card.className='card';note.className='note';shadow.append(style,card);card.append(svg,note);context.container.append(host);
 const line=(x1,y1,x2,y2,a={})=>svg.append(e('line',{x1,y1,x2,y2,stroke:'currentColor','stroke-width':2.5,...a}));const text=(x,y,t,a='middle',s=12,w=500)=>svg.append(e('text',{x,y,'text-anchor':a,'font-size':s,'font-family':'system-ui,sans-serif','font-weight':w,fill:'currentColor'},t));
 function draw(){
  svg.replaceChildren();const s=solveReinforcementCage(p);text(410,28,'Parametric reinforcement cage','middle',21,750);
  const sx=290/Math.max(p.widthM,p.depthM),ox=70,oy=105;
  svg.append(e('rect',{x:ox,y:oy,width:p.widthM*sx,height:p.depthM*sx,fill:'none',stroke:'currentColor','stroke-width':3}));
  const tr=s.tieRectangleM;svg.append(e('rect',{x:ox+tr.xMin*sx,y:oy+tr.zMin*sx,width:(tr.xMax-tr.xMin)*sx,height:(tr.zMax-tr.zMin)*sx,fill:'none',stroke:'currentColor','stroke-width':3,'stroke-dasharray':'8 5'}));
  for(const b of s.longitudinalBars)svg.append(e('circle',{cx:ox+b.x*sx,cy:oy+b.z*sx,r:Math.max(3,p.longitudinalBarDiameterM*sx/2),fill:'currentColor'}));
  text(ox+p.widthM*sx/2,oy+p.depthM*sx+28,'Section','middle',14,700);
  text(ox+p.widthM*sx/2,oy+p.depthM*sx+48,'cover = '+(p.clearCoverM*1000).toFixed(0)+' mm · bars = '+s.longitudinalBarCount,'middle',11,600);
  const ex=505,ey=90,ew=190,eh=330,scaleY=eh/p.heightM;
  svg.append(e('rect',{x:ex,y:ey,width:ew,height:eh,fill:'none',stroke:'currentColor','stroke-width':3}));
  const xLeft=ex+36,xRight=ex+ew-36;line(xLeft,ey+12,xLeft,ey+eh-12,{'stroke-width':6});line(xRight,ey+12,xRight,ey+eh-12,{'stroke-width':6});
  for(const yM of s.tieElevationsM){const y=ey+eh-yM*scaleY;line(ex+18,y,ex+ew-18,y,{'stroke-width':2});}
  text(ex+ew/2,ey+eh+28,'Elevation','middle',14,700);
  text(ex+ew/2,ey+eh+48,'ties = '+s.tieCount+' · actual spacing = '+(s.actualTieSpacingM*1000).toFixed(1)+' mm','middle',11,600);
  note.textContent='Geometry convention: clear cover is measured to the outside of the transverse tie. This asset does not evaluate minimum reinforcement, confinement, lap splices, seismic detailing, or any design-code requirement.';
  svg.setAttribute('aria-label','Rectangular reinforcement cage '+(p.widthM*1000).toFixed(0)+' by '+(p.depthM*1000).toFixed(0)+' millimetres with '+s.longitudinalBarCount+' longitudinal bars, '+(p.clearCoverM*1000).toFixed(0)+' millimetres clear cover to outside of ties, and actual tie spacing '+(s.actualTieSpacingM*1000).toFixed(1)+' millimetres.');
 }
 draw();return{
  setParameters(next={}){if(disposed)throw new Error('Asset is disposed');p=validateCageParameters(next,p);draw();},
  update(t){if(disposed)throw new Error('Asset is disposed');if(!Number.isFinite(t)||t<0)throw new RangeError('timeSeconds must be finite and nonnegative');timeSeconds=t;},
  reset(){if(disposed)throw new Error('Asset is disposed');p={...DEFAULT_CAGE_PARAMETERS};timeSeconds=0;draw();},
  resize(width,height,pixelRatio=1){if(disposed)throw new Error('Asset is disposed');for(const v of[width,height,pixelRatio])if(!Number.isFinite(v)||v<=0)throw new RangeError('resize values must be finite and positive');viewport={width,height,pixelRatio};host.style.width=width+'px';host.style.maxWidth='100%';},
  snapshot(){return{...solveReinforcementCage(p),timeSeconds,viewport:{...viewport}};},
  dispose(){if(disposed)return;disposed=true;host.remove();}
 };
}
