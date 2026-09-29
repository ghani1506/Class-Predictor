/* ============================================================
   YEAR 8 STREAMING PREDICTOR
   Based on MOE Streaming Criteria
   ============================================================ */

const PROGRAMMES = {
  P4: {
    name: "Programme 4",
    stream: "Year 9 ADV",
    pathway: "Year 9 ADV → Year 10 ADV",
    duration: "4 Years",
    colour: "#22c55e"
  },

  P5: {
    name: "Programme 5",
    stream: "5-Year Programme",
    pathway: "Year 9 O Level / Year 9 IGCSE / Year 9 SAP",
    duration: "5 Years",
    colour: "#f59e0b"
  }
};


/* ============================================================
   READ MARK
   ============================================================ */

function valNum(id) {
  const el = document.getElementById(id);

  if (!el) {
    throw new Error(`Input "${id}" was not found.`);
  }

  const v = Number(el.value);

  if (Number.isNaN(v) || v < 0 || v > 100) {
    throw new Error(`Please enter a valid mark between 0 and 100 for ${id}.`);
  }

  return v;
}


/* ============================================================
   MOE STREAMING CRITERIA

   PROGRAMME 4

   BM, MIB, IRK       = 40% and above
   ENG, MATH, SCI     = 20% and above
   SS, ARAB, DRAMA,
   BAT                 = 20% and above

   PROGRAMME 5
   Students falling below the above criteria.
   ============================================================ */

function evaluateStreaming(scores) {

  const {
    bm,
    mib,
    irk,
    english,
    maths,
    science,
    ss,
    arabic,
    drama,
    bat
  } = scores;


  const criteria = [

    {
      group: "BM / MIB / IRK",
      required: "≥ 40%",
      passed:
        bm >= 40 &&
        mib >= 40 &&
        irk >= 40,

      subjects: [
        { name: "Bahasa Melayu", mark: bm, required: 40 },
        { name: "MIB", mark: mib, required: 40 },
        { name: "IRK", mark: irk, required: 40 }
      ]
    },


    {
      group: "English / Mathematics / Science",
      required: "≥ 20%",
      passed:
        english >= 20 &&
        maths >= 20 &&
        science >= 20,

      subjects: [
        { name: "English", mark: english, required: 20 },
        { name: "Mathematics", mark: maths, required: 20 },
        { name: "Science", mark: science, required: 20 }
      ]
    },


    {
      group: "SS / Arabic / Drama / BAT",
      required: "≥ 20%",
      passed:
        ss >= 20 &&
        arabic >= 20 &&
        drama >= 20 &&
        bat >= 20,

      subjects: [
        { name: "Social Studies", mark: ss, required: 20 },
        { name: "Arabic", mark: arabic, required: 20 },
        { name: "Drama", mark: drama, required: 20 },
        { name: "BAT", mark: bat, required: 20 }
      ]
    }

  ];


  const qualifiesProgramme4 =
    criteria.every(c => c.passed);


  return {
    programme:
      qualifiesProgramme4
        ? PROGRAMMES.P4
        : PROGRAMMES.P5,

    criteria
  };
}


/* ============================================================
   CRITERIA DISPLAY
   ============================================================ */

function criteriaRow(subject) {

  const passed = subject.mark >= subject.required;

  return `
    <div class="criteria-row ${passed ? "pass" : "fail"}">

      <div class="criteria-subject">
        ${subject.name}
      </div>

      <div class="criteria-mark">
        ${subject.mark.toFixed(1)}%
      </div>

      <div class="criteria-required">
        ≥ ${subject.required}%
      </div>

      <div class="criteria-status">
        ${passed ? "✓ Meets" : "✕ Below"}
      </div>

    </div>
  `;
}


/* ============================================================
   EXPLANATION
   ============================================================ */

function explanation(result) {

  const programme = result.programme;

  let html = `

    <div class="prediction-summary">

      <h3>Recommended Streaming</h3>

      <div
        class="stream-badge"
        style="background:${programme.colour}"
      >
        ${programme.stream}
      </div>

      <p>
        <strong>${programme.name}</strong>
        • ${programme.duration}
      </p>

      <p class="pathway">
        ${programme.pathway}
      </p>

    </div>

    <h3>MOE Criteria Check</h3>
  `;


  result.criteria.forEach(group => {

    html += `

      <div class="criteria-group">

        <h4>
          ${group.group}
          <span>
            ${group.passed ? "✓" : "✕"}
          </span>
        </h4>

        ${group.subjects.map(criteriaRow).join("")}

      </div>

    `;

  });


  if (programme === PROGRAMMES.P4) {

    html += `

      <div class="decision-message success">

        <strong>Programme 4 criteria achieved.</strong>

        <p>
          The student meets the minimum MOE criteria
          for the 4-year programme.
        </p>

        <p>
          Proposed pathway:
          <strong>
          Year 9 ADV → Year 10 ADV
          </strong>
        </p>

      </div>
    `;

  } else {

    html += `

      <div class="decision-message warning">

        <strong>Programme 5 criteria indicated.</strong>

        <p>
          One or more Programme 4 minimum criteria
          have not been achieved.
        </p>

        <p>
          The student should therefore be considered
          for one of the 5-year pathways:
        </p>

        <ul>
          <li>Year 9 O Level</li>
          <li>Year 9 IGCSE</li>
          <li>Year 9 SAP</li>
        </ul>

        <p>
          Additional streaming criteria are required
          to determine which of these three pathways
          is most appropriate.
        </p>

      </div>
    `;

  }

  return html;
}


/* ============================================================
   SAMPLE DATA
   ============================================================ */

function fillSample() {

  document.getElementById("bm").value = 65;
  document.getElementById("mib").value = 62;
  document.getElementById("irk").value = 60;

  document.getElementById("english").value = 72;
  document.getElementById("maths").value = 68;
  document.getElementById("science").value = 70;

  document.getElementById("ss").value = 65;
  document.getElementById("arabic").value = 60;
  document.getElementById("drama").value = 70;
  document.getElementById("bat").value = 75;
}


/* ============================================================
   MAIN
   ============================================================ */

function main() {

  const year = document.getElementById("year");

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }


  const sampleButton =
    document.getElementById("btnSample");

  if (sampleButton) {
    sampleButton.addEventListener(
      "click",
      fillSample
    );
  }


  document
    .getElementById("scoreForm")
    .addEventListener(
      "submit",
      function (e) {

        e.preventDefault();

        try {

          const scores = {

            bm: valNum("bm"),
            mib: valNum("mib"),
            irk: valNum("irk"),

            english: valNum("english"),
            maths: valNum("maths"),
            science: valNum("science"),

            ss: valNum("ss"),
            arabic: valNum("arabic"),
            drama: valNum("drama"),
            bat: valNum("bat")
          };


          const result =
            evaluateStreaming(scores);


          const resCard =
            document.getElementById(
              "resultCard"
            );

          const predBox =
            document.getElementById(
              "predLabel"
            );

          const explain =
            document.getElementById(
              "explainPanel"
            );


          resCard.hidden = false;


          predBox.textContent =
            result.programme.stream;


          predBox.style.background =
            result.programme.colour;


          predBox.style.color = "#fff";


          predBox.style.border =
            "1px solid rgba(0,0,0,.05)";


          explain.innerHTML =
            explanation(result);


          /*
          Old probability bars are no longer required,
          because this is now a criteria-based predictor.
          */

          const probs =
            document.getElementById(
              "probBars"
            );

          if (probs) {
            probs.innerHTML = "";
          }


          resCard.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

        }

        catch (err) {

          alert(err.message);

        }

      }
    );
}


window.addEventListener(
  "DOMContentLoaded",
  main
);
