const PROGRAMMES={
P1:{name:"Prog 1",title:"General Education Science",stream:"Year 9 EXP",duration:"4 Years",colour:"#f78b8f"},
P2:{name:"Prog 2",title:"General Education Science",stream:"Year 9 O Level - Science",duration:"5 Years",colour:"#45cf59"},
P3:{name:"Prog 3",title:"General Education Art",stream:"Year 9 O Level - Art",duration:"5 Years",colour:"#bff3bf"},
P4:{name:"Prog 4",title:"Applied Programme",stream:"Year 9 IGCSE",duration:"5 Years",colour:"#d8b5f4"},
P5:{name:"Prog 5",title:"Special Applied Programme",stream:"Year 9 SAP",duration:"5 Years",colour:"#fff98c"}
};

let forest=null;

function req(id,label){
  const raw=document.getElementById(id).value.trim();
  if(raw==="") throw new Error(`Please enter a mark for ${label}.`);
  const v=Number(raw);
  if(Number.isNaN(v)||v<0||v>100) throw new Error(`${label} must be between 0 and 100.`);
  return v;
}

function opt(id,label){
  const raw=document.getElementById(id).value.trim();
  if(raw==="") return null;
  const v=Number(raw);
  if(Number.isNaN(v)||v<0||v>100) throw new Error(`${label} must be between 0 and 100.`);
  return v;
}

function avg(a){return a.reduce((s,v)=>s+v,0)/a.length;}

function best3(scores){
  const a=[
    {name:"Social Studies",mark:scores.ss},
    {name:"Arabic",mark:scores.arabic},
    {name:"Drama",mark:scores.drama},
    {name:"BAT",mark:scores.bat}
  ].filter(x=>x.mark!==null);
  if(a.length<3) throw new Error("At least 3 non-core marks are required. Enter Arabic or Drama if the other is blank.");
  return a.sort((x,y)=>y.mark-x.mark).slice(0,3);
}

function buildFeatures(s){
  const b=best3(s);
  const bmGroupAvg=avg([s.bm,s.mib,s.irk]);
  const coreAvg=avg([s.english,s.maths,s.science]);
  const nonCoreAvg=avg(b.map(x=>x.mark));
  const weightedAvg=(s.bm+s.mib+s.irk+2*s.english+2*s.maths+2*s.science+b.reduce((z,x)=>z+x.mark,0))/12;
  return {...s,arabic:s.arabic??0,drama:s.drama??0,bmGroupAvg,coreAvg,nonCoreAvg,weightedAvg,bestThree:b};
}

function bars(p){
  return Object.entries(p).sort((a,b)=>b[1]-a[1]).map(([k,v])=>{
    const pct=Math.round(v*100);
    return `<div class="probability-row"><strong>${PROGRAMMES[k].name}</strong><div class="probability-track"><div class="probability-fill" style="width:${pct}%"></div></div><span>${pct}%</span></div>`;
  }).join("");
}

function explain(r,f){
  const p=PROGRAMMES[r.label];
  const used=f.bestThree.map(x=>`${x.name}: ${x.mark.toFixed(1)}%`).join("<br>");
  return `<h3>Recommended Streaming</h3>
  <p><strong>${p.stream}</strong><br>${p.title} · ${p.duration}</p>
  <div class="feature-grid">
    <div class="feature-card"><strong>BM / MIB / IRK Average</strong>${f.bmGroupAvg.toFixed(1)}%</div>
    <div class="feature-card"><strong>Core Average</strong>${f.coreAvg.toFixed(1)}%</div>
    <div class="feature-card"><strong>Best 3 Non-Core Average</strong>${f.nonCoreAvg.toFixed(1)}%</div>
    <div class="feature-card"><strong>Weighted Average</strong>${f.weightedAvg.toFixed(1)}%</div>
  </div>
  <h3 style="margin-top:22px">Best 3 Non-Core Used</h3><p>${used}</p>
  <p class="small-note">The included forest is a demo model. Replace <code>model.json</code> with your trained trees before formal use.</p>`;
}

async function loadModel(){
  const res=await fetch("model.json",{cache:"no-store"});
  if(!res.ok) throw new Error("Could not load model.json. Use GitHub Pages or a local web server.");
  forest=new RandomForestEvaluator(await res.json());
}

function sample(){
  const v={bm:65,mib:63,irk:61,english:58,maths:62,science:64,ss:55,arabic:"",drama:52,bat:58};
  Object.entries(v).forEach(([k,x])=>document.getElementById(k).value=x);
}

window.addEventListener("DOMContentLoaded",async()=>{
  document.getElementById("year").textContent=new Date().getFullYear();
  try{await loadModel();}catch(e){console.error(e);alert(e.message);}

  document.getElementById("btnSample").addEventListener("click",()=>{sample();document.getElementById("resultCard").hidden=true;});
  document.getElementById("scoreForm").addEventListener("reset",()=>document.getElementById("resultCard").hidden=true);

  document.getElementById("scoreForm").addEventListener("submit",e=>{
    e.preventDefault();
    try{
      if(!forest) throw new Error("The Random Forest model has not loaded.");
      const s={
        bm:req("bm","Bahasa Melayu"),mib:req("mib","MIB"),irk:req("irk","IRK"),
        english:req("english","English"),maths:req("maths","Mathematics"),science:req("science","Science"),
        ss:req("ss","Social Studies"),arabic:opt("arabic","Arabic"),drama:opt("drama","Drama"),bat:req("bat","BAT")
      };
      const f=buildFeatures(s),r=forest.predict(f),p=PROGRAMMES[r.label];
      const card=document.getElementById("resultCard");
      card.hidden=false;
      const label=document.getElementById("predLabel");
      label.textContent=`${p.name} — ${p.stream}`;
      label.style.background=p.colour;
      document.getElementById("confidenceBox").innerHTML=`<div class="confidence"><strong>Forest confidence: ${Math.round(r.confidence*100)}%</strong>${bars(r.probabilities)}</div>`;
      document.getElementById("explainPanel").innerHTML=explain(r,f);
      card.scrollIntoView({behavior:"smooth",block:"start"});
    }catch(err){console.error(err);alert(err.message);}
  });
});
