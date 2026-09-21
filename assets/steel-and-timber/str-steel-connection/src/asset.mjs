import{DEFAULT_CONNECTION_PARAMETERS,solveSteelConnection,validateConnectionParameters}from'./model.mjs';
const NS='http://www.w3.org/2000/svg';function e(n,a={},t=''){const x=document.createElementNS(NS,n);for(const[k,v]of Object.entries(a))x.setAttribute(k,String(v));if(t)x.textContent=t;return x;}
export function createAsset(context){
 if(!context||!(context.container instanceof Element))throw new TypeError('context.container must be a DOM Element');
 let disposed=false,p={...DEFAULT_CONNECTION_PARAMETERS},timeSeconds=0,viewport={width:820,height:480,pixelRatio:1};
 const host=document.createElement('div'),shadow=host.attachShadow({mode:'open'}),style=document.createElement('style'),card=document.createElement('div'),svg=e('svg',{viewBox:'0 0 820 480',role:'img'}),note=document.createElement('p');
 style.textContent=':host{display:block}.card{font:13px/1.4 system-ui,sans-serif;color:#111827;background:#fff;border:1px solid #d1d5db;border-radius:12px;padding:10px}svg{display:block;width:100%;height:auto}.note{margin:.5rem 0 0}';card.className='card';note.className='note';shadow.append(style,card);card.append(svg,note);context.container.append(host);
 const line=(x1,y1,x2,y2,a={})=>svg.append(e('line',{x1,y1,x2,y2,stroke:'currentColor','stroke-width':2.5,...a}));const text=(x,y,t,a='middle',s=12,w=500)=>svg.append(e('text',{x,y,'text-anchor':a,'font-size':s,'font-family':'system-ui,sans-serif','font-weight':w,fill:'currentColor'},t));
 function draw(){
  svg.replaceChildren();const s=solveSteelConnection(p);text(410,28,'Exploded bolted steel shear connection','middle',21,750);
  const scale=Math.min(330/p.plateHeightM,190/p.plateWidthM,110/Math.max(p.explodeM,.001));
  const plateH=p.plateHeightM*scale, plateW=p.plateWidthM*scale, y0=80+(330-plateH)/2;
  const explodePx=p.explodeM*scale, supportX=150,plateX=supportX+95+explodePx,webX=plateX+plateW+70+explodePx;
  svg.append(e('rect',{x:supportX,y:70,width:55,height:350,fill:'none',stroke:'currentColor','stroke-width':5}));
  line(supportX-55,70,supportX+110,70,{'stroke-width':12});line(supportX-55,420,supportX+110,420,{'stroke-width':12});
  text(supportX+28,450,'support','middle',12,700);
  svg.append(e('rect',{x:plateX,y:y0,width:plateW,height:plateH,fill:'none',stroke:'currentColor','stroke-width':4}));
  text(plateX+plateW/2,450,'shear plate','middle',12,700);
  svg.append(e('rect',{x:webX,y:80,width:32,height:330,fill:'none',stroke:'currentColor','stroke-width':5}));
  line(webX-65,80,webX+95,80,{'stroke-width':12});line(webX-65,410,webX+95,410,{'stroke-width':12});text(webX+16,450,'beam web','middle',12,700);
  for(const b of s.boltCentersM){
    const cy=y0+plateH-b.y*scale,cx=plateX+b.x*scale;
    svg.append(e('circle',{cx,cy,r:Math.max(5,p.boltDiameterM*scale/2),fill:'none',stroke:'currentColor','stroke-width':3}));
    line(cx+8,cy,webX-8,cy,{'stroke-width':1.5,'stroke-dasharray':'6 5'});
  }
  text(410,57,'Exploded separation = '+(p.explodeM*1000).toFixed(0)+' mm per assembly step (not deformation)','middle',12,650);
  text(410,465,'Bolts Ø'+(p.boltDiameterM*1000).toFixed(0)+' mm · spacing '+(p.boltSpacingM*1000).toFixed(0)+' mm · vertical edge '+(s.actualVerticalEdgeDistanceM*1000).toFixed(1)+' mm','middle',11,600);
  note.textContent='Assembly geometry only. Plate, bolt, weld, bearing, block shear, slip, prying, and design-code capacities are not evaluated.';
  svg.setAttribute('aria-label','Exploded support, shear plate, and beam web with '+p.boltCount+' bolts of diameter '+(p.boltDiameterM*1000).toFixed(0)+' millimetres at '+(p.boltSpacingM*1000).toFixed(0)+' millimetre spacing. Actual vertical edge distance is '+(s.actualVerticalEdgeDistanceM*1000).toFixed(1)+' millimetres.');
 }
 draw();return{
  setParameters(next={}){if(disposed)throw new Error('Asset is disposed');p=validateConnectionParameters(next,p);draw();},
  update(t){if(disposed)throw new Error('Asset is disposed');if(!Number.isFinite(t)||t<0)throw new RangeError('timeSeconds must be finite and nonnegative');timeSeconds=t;},
  reset(){if(disposed)throw new Error('Asset is disposed');p={...DEFAULT_CONNECTION_PARAMETERS};timeSeconds=0;draw();},
  resize(width,height,pixelRatio=1){if(disposed)throw new Error('Asset is disposed');for(const v of[width,height,pixelRatio])if(!Number.isFinite(v)||v<=0)throw new RangeError('resize values must be finite and positive');viewport={width,height,pixelRatio};host.style.width=width+'px';host.style.maxWidth='100%';},
  snapshot(){return{...solveSteelConnection(p),timeSeconds,viewport:{...viewport}};},
  dispose(){if(disposed)return;disposed=true;host.remove();}
 };
}
