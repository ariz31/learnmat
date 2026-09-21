import { DEFAULT_FRAME_PARAMETERS, solveFrameSway, validateFrameParameters } from './model.mjs';

const SVG_NS='http://www.w3.org/2000/svg';
function el(name,attrs={},text=''){const n=document.createElementNS(SVG_NS,name);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text)n.textContent=text;return n;}

export function createAsset(context){
  if(!context||!(context.container instanceof Element))throw new TypeError('context.container must be a DOM Element');
  let disposed=false, parameters={...DEFAULT_FRAME_PARAMETERS}, timeSeconds=0, viewport={width:760,height:420,pixelRatio:1};
  const host=document.createElement('div'), shadow=host.attachShadow({mode:'open'}), card=document.createElement('div'), svg=el('svg',{viewBox:'0 0 760 420',role:'img'}), note=document.createElement('p'), style=document.createElement('style');
  style.textContent=':host{display:block}.card{font:13px/1.4 system-ui,sans-serif;color:#111827;background:#fff;border:1px solid #d1d5db;border-radius:12px;padding:10px}svg{display:block;width:100%;height:auto}.note{margin:.5rem 0 0}';
  card.className='card';note.className='note';shadow.append(style,card);card.append(svg,note);context.container.append(host);

  const line=(x1,y1,x2,y2,a={})=>svg.append(el('line',{x1,y1,x2,y2,stroke:'currentColor','stroke-width':5,'stroke-linecap':'round',...a}));
  const text=(x,y,t,a='middle',s=13,w=500)=>svg.append(el('text',{x,y,'text-anchor':a,'font-size':s,'font-family':'system-ui,sans-serif','font-weight':w,fill:'currentColor'},t));
  function draw(){
    svg.replaceChildren();
    const s=solveFrameSway(parameters), left=150, baseY=330, widthPx=430, heightPx=220;
    const shownDeltaM=s.deltaXM*parameters.exaggeration;
    const minX=Math.min(0,shownDeltaM), maxX=parameters.bayWidthM+Math.max(0,shownDeltaM);
    const xScale=widthPx/(maxX-minX), xOrigin=left-minX*xScale, yScale=heightPx/parameters.storyHeightM;
    const map=(pt,visual=false)=>[xOrigin+(pt.x+(visual?s.deltaXM*(parameters.exaggeration-1):0))*xScale,baseY-pt.y*yScale];
    const u=s.undeformed,d=s.deformed;
    text(380,30,'Portal frame lateral sway','middle',21,750);
    for(const [p1,p2] of [[u.A,u.C],[u.C,u.D],[u.B,u.D]]){
      const a=map(p1),b=map(p2);line(a[0],a[1],b[0],b[1],{'stroke-width':3,'stroke-dasharray':'8 7',opacity:.48});
    }
    const A=map(d.A),B=map(d.B),C=map(d.C,true),D=map(d.D,true);
    line(A[0],A[1],C[0],C[1],{'stroke-width':8});
    line(C[0],C[1],D[0],D[1],{'stroke-width':8});
    line(B[0],B[1],D[0],D[1],{'stroke-width':8});
    for(const p of [A,B]){line(p[0],p[1]-14,p[0],p[1]+22,{'stroke-width':11});for(let y=-6;y<=20;y+=10)line(p[0],p[1]+y,p[0]+22,p[1]+y-12,{'stroke-width':1.8});}
    const shownDeltaPx=shownDeltaM*xScale;
    line(xOrigin,72,xOrigin+shownDeltaPx,72,{'stroke-width':2});
    if(Math.abs(shownDeltaPx)>1){
      const tip=xOrigin+shownDeltaPx,dir=Math.sign(shownDeltaPx);
      svg.append(el('polygon',{points:tip+',72 '+(tip-12*dir)+',64 '+(tip-12*dir)+',80',fill:'currentColor'}));
    }
    text(380,105,'True Δ = '+(s.deltaXM*1000).toFixed(1)+' mm · drift = '+s.driftPercent.toFixed(3)+'% · display ×'+parameters.exaggeration,'middle',13,700);
    text(380,380,'Dashed = undeformed · solid = prescribed sway shape','middle',12,600);
    note.textContent='Kinematic visualization only: fixed bases and a rigid horizontal top beam are assumed; no member stiffness, forces, moments, or code checks are solved.';
    svg.setAttribute('aria-label','Portal frame with prescribed story drift '+s.driftPercent.toFixed(3)+' percent, corresponding to true top displacement '+(s.deltaXM*1000).toFixed(1)+' millimetres. Deformation is visually exaggerated by '+parameters.exaggeration+'.');
  }
  draw();
  return{
    setParameters(next={}){if(disposed)throw new Error('Asset is disposed');parameters=validateFrameParameters(next,parameters);draw();},
    update(t){if(disposed)throw new Error('Asset is disposed');if(!Number.isFinite(t)||t<0)throw new RangeError('timeSeconds must be finite and nonnegative');timeSeconds=t;},
    reset(){if(disposed)throw new Error('Asset is disposed');parameters={...DEFAULT_FRAME_PARAMETERS};timeSeconds=0;draw();},
    resize(width,height,pixelRatio=1){if(disposed)throw new Error('Asset is disposed');for(const v of [width,height,pixelRatio])if(!Number.isFinite(v)||v<=0)throw new RangeError('resize values must be finite and positive');viewport={width,height,pixelRatio};host.style.width=width+'px';host.style.maxWidth='100%';},
    snapshot(){return{...solveFrameSway(parameters),timeSeconds,viewport:{...viewport}};},
    dispose(){if(disposed)return;disposed=true;host.remove();}
  };
}
