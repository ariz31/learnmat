const SVG_NS='http://www.w3.org/2000/svg';
const DEFAULTS=Object.freeze({staffHeight:3,staffTiltRad:0,readingHeight:1.5,personHeight:1.7});
const LIMITS=Object.freeze({staffHeight:[2,5],staffTiltRad:[-0.0872665,0.0872665],readingHeight:[0,5],personHeight:[1.4,2.1]});

function node(name,attrs={}){const el=document.createElementNS(SVG_NS,name);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));return el}
function validate(name,value){const [min,max]=LIMITS[name];if(!Number.isFinite(value)||value<min||value>max)throw new RangeError(name+' must be finite and between '+min+' and '+max+'.')}
function normalize(next){const merged={...DEFAULTS,...next};for(const key of Object.keys(LIMITS))validate(key,merged[key]);if(merged.readingHeight>merged.staffHeight)throw new RangeError('readingHeight cannot exceed staffHeight.');return merged}

export function createAsset(context={}){
  const container=context.container;
  if(!container||typeof container.appendChild!=='function')throw new TypeError('createAsset requires a DOM container.');
  let disposed=false,timeSeconds=0,params=normalize({});
  const reducedMotion=Boolean(context.reducedMotion);
  const root=document.createElement('div');
  root.setAttribute('data-learnmat-asset','sur-staff-holder');
  root.style.width='100%';root.style.maxWidth='720px';root.style.fontFamily='system-ui,sans-serif';root.style.color='CanvasText';
  const svg=node('svg',{viewBox:'0 0 700 430',role:'img','aria-label':'Surveyor holding a leveling staff with visible staff verticality and reading height'});
  svg.style.width='100%';svg.style.height='auto';svg.style.display='block';
  const ground=node('line',{x1:70,y1:350,x2:630,y2:350,stroke:'currentColor','stroke-width':3});
  const staff=node('g');
  const staffLine=node('line',{x1:0,y1:0,x2:0,y2:-270,stroke:'currentColor','stroke-width':8,'stroke-linecap':'round'});
  const graduations=node('g');
  for(let i=0;i<=12;i++){graduations.appendChild(node('line',{x1:0,y1:-i*22.5,x2:i%2===0?18:11,y2:-i*22.5,stroke:'currentColor','stroke-width':2}))}
  staff.append(staffLine,graduations);
  const reading=node('line',{x1:-28,y1:0,x2:28,y2:0,stroke:'currentColor','stroke-width':3,'stroke-dasharray':'6 4'});
  staff.appendChild(reading);

  const person=node('g');
  const head=node('circle',{cx:-72,cy:-150,r:16,fill:'none',stroke:'currentColor','stroke-width':5});
  const torso=node('line',{x1:-72,y1:-132,x2:-72,y2:-72,stroke:'currentColor','stroke-width':7,'stroke-linecap':'round'});
  const legA=node('line',{x1:-72,y1:-72,x2:-92,y2:0,stroke:'currentColor','stroke-width':7,'stroke-linecap':'round'});
  const legB=node('line',{x1:-72,y1:-72,x2:-52,y2:0,stroke:'currentColor','stroke-width':7,'stroke-linecap':'round'});
  const arm=node('polyline',{points:'-72,-118 -42,-92 0,-105',fill:'none',stroke:'currentColor','stroke-width':6,'stroke-linecap':'round','stroke-linejoin':'round'});
  person.append(head,torso,legA,legB,arm);

  const title=node('text',{x:350,y:38,'text-anchor':'middle','font-size':18,fill:'currentColor'});
  const result=node('text',{x:350,y:402,'text-anchor':'middle','font-size':17,fill:'currentColor'});
  svg.append(ground,staff,person,title,result);root.appendChild(svg);container.appendChild(root);

  function ensure(){if(disposed)throw new Error('Asset has been disposed.')}
  function geometry(){
    const tilt=params.staffTiltRad;
    return {
      topOffsetX:params.staffHeight*Math.sin(tilt),
      topVerticalProjection:params.staffHeight*Math.cos(tilt),
      verticalityErrorRad:tilt,
      verticalityErrorDeg:tilt*180/Math.PI
    };
  }
  function render(){
    const scale=90;
    const breathe=reducedMotion?0:Math.sin(Math.max(0,timeSeconds)*Math.PI/2)*1.5;
    const angle=params.staffTiltRad*180/Math.PI;
    const personScale=params.personHeight/1.7;
    staff.setAttribute('transform','translate(430 350) rotate('+angle.toFixed(4)+') scale('+(params.staffHeight/3).toFixed(5)+')');
    const readingY=-270*(params.readingHeight/params.staffHeight);
    reading.setAttribute('y1',readingY.toFixed(3));reading.setAttribute('y2',readingY.toFixed(3));
    person.setAttribute('transform','translate(430 '+(350+breathe).toFixed(3)+') scale('+personScale.toFixed(5)+')');
    const g=geometry();
    title.textContent='Staff '+params.staffHeight.toFixed(2)+' m · tilt '+g.verticalityErrorDeg.toFixed(2)+'°';
    result.textContent='Top offset '+g.topOffsetX.toFixed(3)+' m · vertical projection '+g.topVerticalProjection.toFixed(3)+' m · reading '+params.readingHeight.toFixed(2)+' m';
  }
  function snapshot(){
    ensure();const g=geometry();
    return {id:'sur-staff-holder',timeSeconds:Math.max(0,timeSeconds),parameters:{...params},result:g,pose:{staffBase:{x:0,y:0,z:0},staffTop:{x:g.topOffsetX,y:g.topVerticalProjection,z:0}}};
  }
  render();
  return {
    setParameters(next={}){ensure();params=normalize({...params,...next});render();return snapshot()},
    update(t){ensure();if(!Number.isFinite(t))throw new TypeError('timeSeconds must be finite.');timeSeconds=Math.max(0,t);render();return snapshot()},
    reset(){ensure();params=normalize({});timeSeconds=0;render();return snapshot()},
    resize(width,height,pixelRatio=1){ensure();if(![width,height,pixelRatio].every(Number.isFinite)||width<=0||height<=0||pixelRatio<=0)throw new RangeError('resize requires positive finite values.');root.style.width=width+'px';root.style.maxWidth='100%';root.style.aspectRatio=width+' / '+height;return snapshot()},
    snapshot,
    dispose(){if(disposed)return;disposed=true;root.remove()}
  };
}
