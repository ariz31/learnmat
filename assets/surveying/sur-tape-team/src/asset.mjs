const SVG_NS='http://www.w3.org/2000/svg';
const G=9.80665;
const DEFAULTS=Object.freeze({horizontalSpan:20,supportHeight:1.2,massPerLength:0.02,horizontalTension:60,sagEnabled:true});
const LIMITS=Object.freeze({horizontalSpan:[2,50],supportHeight:[0.5,2],massPerLength:[0.005,0.1],horizontalTension:[20,300]});

function node(name,attrs={}){const el=document.createElementNS(SVG_NS,name);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));return el}
function validateNumber(name,value){const [min,max]=LIMITS[name];if(!Number.isFinite(value)||value<min||value>max)throw new RangeError(name+' must be finite and between '+min+' and '+max+'.')}
function normalize(next){const merged={...DEFAULTS,...next};for(const key of Object.keys(LIMITS))validateNumber(key,merged[key]);if(typeof merged.sagEnabled!=='boolean')throw new TypeError('sagEnabled must be boolean.');return merged}

export function catenaryState(parameters){
  const p=normalize(parameters);
  const span=p.horizontalSpan;
  if(!p.sagEnabled)return {parameterA:null,sag:0,curveLength:span,lengthExcess:0};
  const weightPerLength=p.massPerLength*G;
  const a=p.horizontalTension/weightPerLength;
  const half=span/(2*a);
  const sag=a*(Math.cosh(half)-1);
  const curveLength=2*a*Math.sinh(half);
  return {parameterA:a,sag,curveLength,lengthExcess:curveLength-span};
}

export function createAsset(context={}){
  const container=context.container;
  if(!container||typeof container.appendChild!=='function')throw new TypeError('createAsset requires a DOM container.');
  let disposed=false,timeSeconds=0,params=normalize({});
  const root=document.createElement('div');
  root.setAttribute('data-learnmat-asset','sur-tape-team');
  root.style.width='100%';root.style.maxWidth='820px';root.style.fontFamily='system-ui,sans-serif';root.style.color='CanvasText';

  const svg=node('svg',{viewBox:'0 0 800 430',role:'img','aria-label':'Two survey crew members holding a measuring tape with straight reference and catenary sag'});
  svg.style.width='100%';svg.style.height='auto';svg.style.display='block';
  const ground=node('line',{x1:60,y1:345,x2:740,y2:345,stroke:'currentColor','stroke-width':3});
  const straight=node('line',{stroke:'currentColor','stroke-width':2,'stroke-dasharray':'8 6',opacity:.55});
  const tape=node('path',{fill:'none',stroke:'currentColor','stroke-width':5,'stroke-linecap':'round'});
  const leftPerson=node('g'),rightPerson=node('g');

  function buildPerson(group,facing){
    const sx=facing;
    group.append(
      node('circle',{cx:0,cy:-125,r:15,fill:'none',stroke:'currentColor','stroke-width':5}),
      node('line',{x1:0,y1:-108,x2:0,y2:-55,stroke:'currentColor','stroke-width':7,'stroke-linecap':'round'}),
      node('line',{x1:0,y1:-55,x2:-18,y2:0,stroke:'currentColor','stroke-width':7,'stroke-linecap':'round'}),
      node('line',{x1:0,y1:-55,x2:18,y2:0,stroke:'currentColor','stroke-width':7,'stroke-linecap':'round'}),
      node('polyline',{points:'0,-96 '+(28*sx)+',-78 '+(48*sx)+',-66',fill:'none',stroke:'currentColor','stroke-width':6,'stroke-linejoin':'round','stroke-linecap':'round'})
    );
  }
  buildPerson(leftPerson,1);buildPerson(rightPerson,-1);

  const heading=node('text',{x:400,y:38,'text-anchor':'middle','font-size':18,fill:'currentColor'});
  const metrics=node('text',{x:400,y:402,'text-anchor':'middle','font-size':16,fill:'currentColor'});
  const leftLabel=node('text',{x:100,y:370,'text-anchor':'middle','font-size':14,fill:'currentColor'});
  const rightLabel=node('text',{x:700,y:370,'text-anchor':'middle','font-size':14,fill:'currentColor'});
  leftLabel.textContent='rear tapeman';rightLabel.textContent='forward tapeman';
  svg.append(ground,straight,tape,leftPerson,rightPerson,heading,metrics,leftLabel,rightLabel);
  root.appendChild(svg);container.appendChild(root);

  function ensure(){if(disposed)throw new Error('Asset has been disposed.')}
  function geometry(){return catenaryState(params)}
  function render(){
    const x0=130,x1=670,spanPx=x1-x0;
    const supportY=230;
    leftPerson.setAttribute('transform','translate('+(x0-45)+' 345)');
    rightPerson.setAttribute('transform','translate('+(x1+45)+' 345)');
    straight.setAttribute('x1',x0);straight.setAttribute('x2',x1);straight.setAttribute('y1',supportY);straight.setAttribute('y2',supportY);
    const state=geometry();
    if(!params.sagEnabled){
      tape.setAttribute('d','M '+x0+' '+supportY+' L '+x1+' '+supportY);
    }else{
      const a=state.parameterA,L=params.horizontalSpan;
      const points=[];
      for(let i=0;i<=40;i++){
        const x=L*i/40;
        const y=a*Math.cosh((x-L/2)/a)-a*Math.cosh(L/(2*a));
        const px=x0+spanPx*(x/L);
        const visualScale=Math.min(900,260/Math.max(state.sag,0.001));
        const py=supportY-y*visualScale;
        points.push((i===0?'M ':'L ')+px.toFixed(2)+' '+py.toFixed(2));
      }
      tape.setAttribute('d',points.join(' '));
    }
    heading.textContent=(params.sagEnabled?'Catenary tape':'Straight tape')+' · span '+params.horizontalSpan.toFixed(2)+' m';
    metrics.textContent='sag '+state.sag.toFixed(4)+' m · tape curve length '+state.curveLength.toFixed(4)+' m · excess '+state.lengthExcess.toFixed(4)+' m';
  }
  function snapshot(){
    ensure();const state=geometry();
    return {id:'sur-tape-team',timeSeconds:Math.max(0,timeSeconds),parameters:{...params},result:{...state,weightPerLength:params.massPerLength*G},pose:{leftEndpoint:{x:0,y:params.supportHeight,z:0},rightEndpoint:{x:params.horizontalSpan,y:params.supportHeight,z:0}}};
  }
  render();
  return {
    setParameters(next={}){ensure();params=normalize({...params,...next});render();return snapshot()},
    update(t){ensure();if(!Number.isFinite(t))throw new TypeError('timeSeconds must be finite.');timeSeconds=Math.max(0,t);return snapshot()},
    reset(){ensure();params=normalize({});timeSeconds=0;render();return snapshot()},
    resize(width,height,pixelRatio=1){ensure();if(![width,height,pixelRatio].every(Number.isFinite)||width<=0||height<=0||pixelRatio<=0)throw new RangeError('resize requires positive finite values.');root.style.width=width+'px';root.style.maxWidth='100%';root.style.aspectRatio=width+' / '+height;return snapshot()},
    snapshot,
    dispose(){if(disposed)return;disposed=true;root.remove()}
  };
}
