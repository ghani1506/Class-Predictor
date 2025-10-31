/* UI glue for the Year 8 Streaming Predictor */
const CLASSES = ["Express","Science","General","Applied","Special Applied"];

let RF = null;
let MODEL = null;

async function loadModel(){
  const resp = await fetch('model.json', {cache:'no-store'});
  MODEL = await resp.json();
  RF = new RandomForest(MODEL.trees, MODEL.classes);
}

function valNum(id){
  const el = document.getElementById(id);
  const v = Number(el.value);
  if (Number.isNaN(v) || v<0 || v>100) throw new Error(`Invalid score for ${id}`);
  return v;
}

function coreAverages(x){
  const avgCore = (x[0]+x[1]+x[2]+x[3])/4;
  const avgAll  = (x.reduce((a,b)=>a+b,0))/x.length;
  return {avgCore, avgAll};
}

function probBarRow(label, p){
  const pct = Math.round(p*100);
  return `
    <div class="prob">
      <div><strong>${label}</strong> — ${pct}%</div>
      <div class="bar"><div class="fill" style="width:${pct}%"></div></div>
    </div>`;
}

function badgeColor(label){
  switch(label){
    case "Express": return "#10b981";
    case "Science": return "#3b82f6";
    case "General": return "#6b7280";
    case "Applied": return "#f59e0b";
    case "Special Applied": return "#ef4444";
    default: return "#2563eb";
  }
}

function explainText(x, proba, topIdx){
  const {avgCore, avgAll} = coreAverages(x);
  const tips = [];
  tips.push(`Core average: <strong>${avgCore.toFixed(1)}</strong> • Overall average: <strong>${avgAll.toFixed(1)}</strong>`);
  if (x[0] >= 85 && x[2] >= 85) tips.push("Strong Maths + Science pulled prediction upward.");
  if (x[1] < 65) tips.push("English below 65 may push towards General/Applied in this demo.");
  if (x[3] < 60) tips.push("Malay below 60 may push towards Applied/Special Applied in this demo.");
  if (x[0] < 60 || x[2] < 60) tips.push("Low Maths/Science tends to reduce placement in the demo.");
  const cls = CLASSES[topIdx];
  return `<p>Top class: <strong>${cls}</strong>. This demo random forest aggregates 5 shallow trees focusing on core subjects (Maths, English, Science, Malay). Replace <code>model.json</code> with your trained trees for production.</p>
  <ul>${tips.map(t=>`<li>${t}</li>`).join("")}</ul>`;
}

function fillSample(){
  document.getElementById('maths').value = 86;
  document.getElementById('english').value = 78;
  document.getElementById('science').value = 88;
  document.getElementById('malay').value = 74;
  document.getElementById('sub5').value = 70;
  document.getElementById('sub6').value = 65;
  document.getElementById('sub7').value = 72;
}

async function main(){
  document.getElementById('year').textContent = new Date().getFullYear();
  await loadModel();

  document.getElementById('btnSample').addEventListener('click', fillSample);

  document.getElementById('scoreForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    try{
      const x = [
        valNum('maths'),
        valNum('english'),
        valNum('science'),
        valNum('malay'),
        valNum('sub5'),
        valNum('sub6'),
        valNum('sub7')
      ];
      const {label, proba, idx} = RF.predict(x);
      const resCard = document.getElementById('resultCard');
      const predBox = document.getElementById('predLabel');
      const probs = document.getElementById('probBars');
      const explain = document.getElementById('explainPanel');

      resCard.hidden = false;
      predBox.textContent = label;
      predBox.style.background = badgeColor(label);
      predBox.style.border = "1px solid rgba(0,0,0,.05)";
      predBox.style.color = "#fff";

      probs.innerHTML = CLASSES.map((c,i)=>probBarRow(c, proba[i])).join("");
      explain.innerHTML = explainText(x, proba, idx);
      resCard.scrollIntoView({behavior:"smooth", block:"center"});
    }catch(err){
      alert(err.message);
    }
  });
}

window.addEventListener('DOMContentLoaded', main);
