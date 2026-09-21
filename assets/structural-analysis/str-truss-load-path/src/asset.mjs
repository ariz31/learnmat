const SVG_NS = 'http://www.w3.org/2000/svg';
const DEFAULTS = Object.freeze({ spanM: 8, riseM: 3, loadN: 40000 });
const LIMITS = { spanM:[2,30], riseM:[0.5,15], loadN:[0,1e6] };

function svgEl(name, attrs = {}, text = '') {
  const node=document.createElementNS(SVG_NS,name);
  for (const [key,value] of Object.entries(attrs)) node.setAttribute(key,String(value));
  if (text) node.textContent=text;
  return node;
}

function validate(next,current) {
  for (const key of Object.keys(next)) if (!Object.hasOwn(DEFAULTS,key)) throw new TypeError('Unknown parameter: '+key);
  const merged={...current,...next};
  for (const [key,[min,max]] of Object.entries(LIMITS)) {
    const value=merged[key];
    if (!Number.isFinite(value) || value<min || value>max) throw new RangeError(key+' must be finite and within ['+min+', '+max+']');
  }
  return merged;
}

function solve(p) {
  const half=p.spanM/2;
  const length=Math.hypot(half,p.riseM);
  const sinTheta=p.riseM/length;
  const cosTheta=half/length;
  const tanTheta=p.riseM/half;
  const compressionMagnitude=p.loadN===0?0:p.loadN/(2*sinTheta);
  const bottomTension=p.loadN===0?0:p.loadN/(2*tanTheta);
  return {
    thetaRad:Math.atan2(p.riseM,half),
    reactionsN:{Ax:0,Ay:p.loadN/2,Cy:p.loadN/2},
    memberForcesN:{AB:-compressionMagnitude,BC:-compressionMagnitude,AC:bottomTension},
    geometryM:{A:{x:0,y:0},B:{x:half,y:p.riseM},C:{x:p.spanM,y:0}},
    directionCosines:{diagonal:{cos:cosTheta,sin:sinTheta}}
  };
}

export function createAsset(context) {
  if (!context || !(context.container instanceof Element)) throw new TypeError('context.container must be a DOM Element');
  let disposed=false;
  let parameters={...DEFAULTS};
  let timeSeconds=0;
  let viewport={width:760,height:420,pixelRatio:1};

  const host=document.createElement('div');
  const shadow=host.attachShadow({mode:'open'});
  const style=document.createElement('style');
  style.textContent=':host{display:block}.card{font:13px/1.35 system-ui,sans-serif;color:#111827;background:#fff;border:1px solid #d1d5db;border-radius:12px;padding:10px}svg{display:block;width:100%;height:auto}.summary{margin:.5rem 0 0}';
  const card=document.createElement('div');
  card.className='card';
  const svg=svgEl('svg',{viewBox:'0 0 760 420',role:'img','aria-label':'Symmetric triangular truss load path'});
  const summary=document.createElement('p');
  summary.className='summary';
  shadow.append(style,card);
  card.append(svg,summary);
  context.container.append(host);

  function line(x1,y1,x2,y2,attrs={}) {
    svg.append(svgEl('line',{x1,y1,x2,y2,stroke:'currentColor','stroke-width':3,'stroke-linecap':'round',...attrs}));
  }
  function text(x,y,value,anchor='middle',size=13,weight=500) {
    svg.append(svgEl('text',{x,y,'text-anchor':anchor,'font-size':size,'font-family':'system-ui,sans-serif','font-weight':weight,fill:'currentColor'},value));
  }
  function arrow(x,y1,y2,label) {
    line(x,y1,x,y2,{'stroke-width':3});
    const down=y2>y1;
    const tip=y2;
    svg.append(svgEl('polygon',{points:(x-8)+','+(tip+(down?-13:13))+' '+(x+8)+','+(tip+(down?-13:13))+' '+x+','+tip,fill:'currentColor'}));
    text(x+14,(y1+y2)/2,label,'start',12,700);
  }

  function draw() {
    svg.replaceChildren();
    const s=solve(parameters);
    const left=95,right=665,baseY=315,topY=90;
    const spanPx=right-left;
    const scaleX=spanPx/parameters.spanM;
    const maxRisePx=205;
    const scaleY=maxRisePx/parameters.riseM;
    const map=pt=>[left+pt.x*scaleX,baseY-pt.y*scaleY];
    const A=map(s.geometryM.A),B=map(s.geometryM.B),C=map(s.geometryM.C);

    text(380,30,'Triangular truss load path','middle',21,750);
    line(A[0],A[1],B[0],B[1],{'stroke-width':7});
    line(B[0],B[1],C[0],C[1],{'stroke-width':7});
    line(A[0],A[1],C[0],C[1],{'stroke-width':7,'stroke-dasharray':'14 7'});

    for (const [name,pt] of [['A',A],['B',B],['C',C]]) {
      svg.append(svgEl('circle',{cx:pt[0],cy:pt[1],r:8,fill:'#fff',stroke:'currentColor','stroke-width':3}));
      text(pt[0],pt[1]-14,name,'middle',13,750);
    }

    svg.append(svgEl('polygon',{points:A[0]+','+(A[1]+5)+' '+(A[0]-20)+','+(A[1]+42)+' '+(A[0]+20)+','+(A[1]+42),fill:'none',stroke:'currentColor','stroke-width':2.5}));
    svg.append(svgEl('polygon',{points:C[0]+','+(C[1]+5)+' '+(C[0]-20)+','+(C[1]+38)+' '+(C[0]+20)+','+(C[1]+38),fill:'none',stroke:'currentColor','stroke-width':2.5}));
    svg.append(svgEl('circle',{cx:C[0]-10,cy:C[1]+48,r:6,fill:'none',stroke:'currentColor','stroke-width':2}));
    svg.append(svgEl('circle',{cx:C[0]+10,cy:C[1]+48,r:6,fill:'none',stroke:'currentColor','stroke-width':2}));

    arrow(B[0],48,B[1]-10,'P '+(parameters.loadN/1000).toFixed(2)+' kN');
    if (parameters.loadN>0) {
      arrow(A[0],A[1]+86,A[1]+10,'RA '+(s.reactionsN.Ay/1000).toFixed(2)+' kN');
      arrow(C[0],C[1]+86,C[1]+10,'RC '+(s.reactionsN.Cy/1000).toFixed(2)+' kN');
    }

    const diag=Math.abs(s.memberForcesN.AB)/1000;
    const chord=Math.abs(s.memberForcesN.AC)/1000;
    text((A[0]+B[0])/2-18,(A[1]+B[1])/2-8,'AB '+diag.toFixed(2)+' kN C','middle',12,700);
    text((B[0]+C[0])/2+18,(B[1]+C[1])/2-8,'BC '+diag.toFixed(2)+' kN C','middle',12,700);
    text((A[0]+C[0])/2,baseY+28,'AC '+chord.toFixed(2)+' kN T','middle',12,700);
    text(380,397,'Solid diagonals = compression (C); dashed bottom chord = tension (T). Labels carry the meaning, not line style alone.','middle',11,550);

    summary.textContent='θ = '+(s.thetaRad*180/Math.PI).toFixed(2)+'° · RAy = RCy = '+(s.reactionsN.Ay/1000).toFixed(3)+' kN · diagonals = '+diag.toFixed(3)+' kN compression · bottom chord = '+chord.toFixed(3)+' kN tension.';
    svg.setAttribute('aria-label','Symmetric triangular truss with apex load '+(parameters.loadN/1000).toFixed(2)+' kilonewtons. Vertical reactions '+(s.reactionsN.Ay/1000).toFixed(2)+' kilonewtons each. Diagonal members '+diag.toFixed(2)+' kilonewtons compression. Bottom chord '+chord.toFixed(2)+' kilonewtons tension.');
  }

  draw();

  return {
    setParameters(next={}) {
      if (disposed) throw new Error('Asset is disposed');
      parameters=validate(next,parameters);
      draw();
    },
    update(nextTimeSeconds) {
      if (disposed) throw new Error('Asset is disposed');
      if (!Number.isFinite(nextTimeSeconds) || nextTimeSeconds<0) throw new RangeError('timeSeconds must be finite and nonnegative');
      timeSeconds=nextTimeSeconds;
    },
    reset() {
      if (disposed) throw new Error('Asset is disposed');
      parameters={...DEFAULTS};
      timeSeconds=0;
      draw();
    },
    resize(width,height,pixelRatio=1) {
      if (disposed) throw new Error('Asset is disposed');
      for (const value of [width,height,pixelRatio]) if (!Number.isFinite(value) || value<=0) throw new RangeError('resize values must be finite and positive');
      viewport={width,height,pixelRatio};
      host.style.width=width+'px';
      host.style.maxWidth='100%';
    },
    snapshot() {
      return {parameters:{...parameters},...solve(parameters),timeSeconds,viewport:{...viewport},axialForceConvention:'positive tension; negative compression'};
    },
    dispose() {
      if (disposed) return;
      disposed=true;
      host.remove();
    }
  };
}
