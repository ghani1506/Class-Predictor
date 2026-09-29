/* ============================================================
   YEAR 7 and 8 STREAMING PREDICTOR
   Based on Criteria for Streaming to Year 9
   ============================================================ */

const PROGRAMMES = [
  {
    code: "P1",
    name: "Prog 1",
    title: "General Education Science",
    duration: "4 Years",
    stream: "Year 9 ADV",
    colour: "#f78b8f",

    ranges: {
      bm: [70, 100],
      mib: [70, 100],
      irk: [70, 100],
      english: [70, 100],
      maths: [70, 100],
      science: [70, 100],
      nonCore: [60, 100]
    }
  },

  {
    code: "P2",
    name: "Prog 2",
    title: "General Education Science",
    duration: "5 Years",
    stream: "Year 9 O Level - Science",
    colour: "#45cf59",

    ranges: {
      bm: [60, 100],
      mib: [60, 100],
      irk: [60, 100],
      english: [60, 100],
      maths: [60, 100],
      science: [60, 100],
      nonCore: [50, 100]
    }
  },

  {
    code: "P3",
    name: "Prog 3",
    title: "General Education Art",
    duration: "5 Years",
    stream: "Year 9 O Level - Art",
    colour: "#bff3bf",

    ranges: {
      bm: [40, 59.999],
      mib: [40, 59.999],
      irk: [40, 59.999],
      english: [40, 49.999],
      maths: [40, 49.999],
      science: [40, 49.999],
      nonCore: [20, 49.999]
    }
  },

  {
    code: "P4",
    name: "Prog 4",
    title: "Applied Programme",
    duration: "5 Years",
    stream: "Year 9 IGCSE",
    colour: "#d8b5f4",

    ranges: {
      bm: [40, 59.999],
      mib: [40, 59.999],
      irk: [40, 59.999],
      english: [20, 39.999],
      maths: [20, 39.999],
      science: [20, 39.999],
      nonCore: [20, 49.999]
    }
  },

  {
    code: "P5",
    name: "Prog 5",
    title: "Special Applied Programme",
    duration: "5 Years",
    stream: "Year 9 SAP",
    colour: "#fff98c",

    ranges: {
      bm: [0, 39.999],
      mib: [0, 39.999],
      irk: [0, 39.999],
      english: [0, 19.999],
      maths: [0, 19.999],
      science: [0, 19.999],
      nonCore: [0, 19.999]
    }
  }
];


/* ============================================================
   READ MARK
   ============================================================ */

function valNum(id) {
  const el = document.getElementById(id);

  if (!el) {
    throw new Error(`Input "${id}" was not found.`);
  }

  const raw = el.value.trim();

  if (raw === "") {
    throw new Error(`Please enter a mark for ${id}.`);
  }

  const v = Number(raw);

  if (Number.isNaN(v) || v < 0 || v > 100) {
    throw new Error(`Please enter a valid mark between 0 and 100 for ${id}.`);
  }

  return v;
}


/* ============================================================
   RANGE CHECK
   ============================================================ */

function inRange(value, range) {
  return value >= range[0] && value <= range[1];
}


/* ============================================================
   NON-CORE CHECK
   Any 3 subjects from SS, Arabic, Drama, BAT
   ============================================================ */

function getBestThreeNonCore(scores) {
  const nonCoreSubjects = [
    { name: "Social Studies", mark: scores.ss },
    { name: "Arabic", mark: scores.arabic },
    { name: "Drama", mark: scores.drama },
    { name: "BAT", mark: scores.bat }
  ];

  return nonCoreSubjects
    .sort((a, b) => b.mark - a.mark)
    .slice(0, 3);
}


/* ============================================================
   CHECK ONE PROGRAMME
   ============================================================ */

function checkProgramme(programme, scores) {

  const bestThree = getBestThreeNonCore(scores);

  const subjectChecks = [
    {
      name: "Bahasa Melayu",
      mark: scores.bm,
      range: programme.ranges.bm,
      passed: inRange(scores.bm, programme.ranges.bm)
    },
    {
      name: "MIB",
      mark: scores.mib,
      range: programme.ranges.mib,
      passed: inRange(scores.mib, programme.ranges.mib)
    },
    {
      name: "IRK",
      mark: scores.irk,
      range: programme.ranges.irk,
      passed: inRange(scores.irk, programme.ranges.irk)
    },
    {
      name: "English",
      mark: scores.english,
      range: programme.ranges.english,
      passed: inRange(scores.english, programme.ranges.english)
    },
    {
      name: "Mathematics",
      mark: scores.maths,
      range: programme.ranges.maths,
      passed: inRange(scores.maths, programme.ranges.maths)
    },
    {
      name: "Science",
      mark: scores.science,
      range: programme.ranges.science,
      passed: inRange(scores.science, programme.ranges.science)
    }
  ];

  const nonCorePassed =
    bestThree.every(subject =>
      inRange(subject.mark, programme.ranges.nonCore)
    );

  const passed =
    subjectChecks.every(subject => subject.passed) &&
    nonCorePassed;

  return {
    programme,
    subjectChecks,
    bestThree,
    nonCorePassed,
    passed
  };
}


/* ============================================================
   FIND STREAM
   Highest matching programme wins
   ============================================================ */

function evaluateStreaming(scores) {

  for (const programme of PROGRAMMES) {

    const result =
      checkProgramme(programme, scores);

    if (result.passed) {
      return result;
    }
  }

  return null;
}


/* ============================================================
   RANGE TEXT
   ============================================================ */

function rangeText(range) {

  const min = range[0];
  const max = range[1];

  if (max >= 100) {
    return `${min}% & Above`;
  }

  if (min === 0) {
    return `Less than ${Math.ceil(max + 0.001)}%`;
  }

  return `${Math.floor(min)}% - ${Math.floor(max)}%`;
}


/* ============================================================
   SUBJECT ROW
   ============================================================ */

function subjectRow(subject) {

  return `
    <div class="criteria-row ${subject.passed ? "pass" : "fail"}">

      <div class="criteria-subject">
        ${subject.name}
      </div>

      <div class="criteria-mark">
        ${subject.mark.toFixed(1)}%
      </div>

      <div class="criteria-required">
        ${rangeText(subject.range)}
      </div>

      <div class="criteria-status">
        ${subject.passed ? "✓ Meets" : "✕ Outside Range"}
      </div>

    </div>
  `;
}


/* ============================================================
   EXPLANATION
   ============================================================ */

function explanation(result) {

  if (!result) {

    return `
      <div class="decision-message warning">
        <h3>Manual Review Required</h3>

        <p>
          The marks entered do not fit one complete programme band.
        </p>

        <p>
          This can happen when a student has mixed performance
          across subject groups.
        </p>

        <p>
          Please review the student manually using the full
          streaming criteria.
        </p>
      </div>
    `;
  }


  const programme =
    result.programme;


  return `

    <div class="prediction-summary">

      <h3>Recommended Streaming</h3>

      <div
        class="stream-badge"
        style="
          background:${programme.colour};
          color:#111;
        "
      >
        ${programme.name}
      </div>

      <h2>
        ${programme.stream}
      </h2>

      <p>
        <strong>
          ${programme.title}
        </strong>
      </p>

      <p>
        ${programme.duration}
      </p>

    </div>


    <h3>Subject Criteria</h3>

    <div class="criteria-group">

      ${result.subjectChecks
        .map(subjectRow)
        .join("")}

    </div>


    <h3>Non-Core Subjects</h3>

    <p>
      Best 3 non-core subjects used:
    </p>

    <div class="criteria-group">

      ${result.bestThree.map(subject => {

        const passed =
          inRange(
            subject.mark,
            programme.ranges.nonCore
          );

        return `
          <div class="criteria-row ${passed ? "pass" : "fail"}">

            <div class="criteria-subject">
              ${subject.name}
            </div>

            <div class="criteria-mark">
              ${subject.mark.toFixed(1)}%
            </div>

            <div class="criteria-required">
              ${rangeText(programme.ranges.nonCore)}
            </div>

            <div class="criteria-status">
              ${passed ? "✓ Meets" : "✕ Outside Range"}
            </div>

          </div>
        `;

      }).join("")}

    </div>


    ${pathwayDisplay(programme)}

  `;
}


/* ============================================================
   PATHWAY DISPLAY
   ============================================================ */

function pathwayDisplay(programme) {

  switch(programme.code) {

    case "P1":
      return `
        <div class="decision-message success">

          <h3>General Education Science</h3>

          <div class="pathway-box">

            <span>YEAR 9 ADV</span>

            <span class="arrow">→</span>

            <span>YEAR 10 ADV</span>

          </div>

          <p>
            Express pathway — 4 Years
          </p>

        </div>
      `;


    case "P2":
      return `
        <div class="decision-message success">

          <h3>General Education Science</h3>

          <div class="pathway-box">

            <span>YEAR 9 O LVL</span>

            <span class="arrow">→</span>

            <span>YEAR 10 O LVL</span>

            <span class="arrow">→</span>

            <span>YEAR 11 O LVL</span>

          </div>

        </div>
      `;


    case "P3":
      return `
        <div class="decision-message success">

          <h3>General Education Art</h3>

          <div class="pathway-box">

            <span>YEAR 9 O LVL</span>

            <span class="arrow">→</span>

            <span>YEAR 10 O LVL</span>

            <span class="arrow">→</span>

            <span>YEAR 11 O LVL</span>

          </div>

        </div>
      `;


    case "P4":
      return `
        <div class="decision-message warning">

          <h3>Applied Programme</h3>

          <div class="pathway-box">

            <span>YEAR 9 IGCSE</span>

            <span class="arrow">→</span>

            <span>YEAR 10 IGCSE</span>

            <span class="arrow">→</span>

            <span>YEAR 11 IGCSE</span>

          </div>

        </div>
      `;


    case "P5":
      return `
        <div class="decision-message warning">

          <h3>Special Applied Programme</h3>

          <div class="pathway-box">

            <span>YEAR 9 SAP</span>

            <span class="arrow">→</span>

            <span>YEAR 10 BTEC</span>

            <span class="arrow">→</span>

            <span>YEAR 11 BTEC</span>

          </div>

        </div>
      `;

  }
}


/* ============================================================
   SAMPLE DATA
   ============================================================ */

function fillSample() {

  document.getElementById("bm").value = 72;
  document.getElementById("mib").value = 75;
  document.getElementById("irk").value = 71;

  document.getElementById("english").value = 76;
  document.getElementById("maths").value = 74;
  document.getElementById("science").value = 73;

  document.getElementById("ss").value = 65;
  document.getElementById("arabic").value = 62;
  document.getElementById("drama").value = 68;
  document.getElementById("bat").value = 55;
}


/* ============================================================
   MAIN
   ============================================================ */

function main() {

  const year =
    document.getElementById("year");

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


  const scoreForm =
    document.getElementById("scoreForm");

  if (!scoreForm) {
    console.error("scoreForm was not found.");
    return;
  }


  scoreForm.addEventListener(
    "submit",
    function(e) {

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
          document.getElementById("resultCard");

        const predBox =
          document.getElementById("predLabel");

        const explain =
          document.getElementById("explainPanel");


        resCard.hidden = false;


        if (result) {

          predBox.textContent =
            `${result.programme.name} — ${result.programme.stream}`;

          predBox.style.background =
            result.programme.colour;

          predBox.style.color =
            "#111";

        }

        else {

          predBox.textContent =
            "Manual Review Required";

          predBox.style.background =
            "#6b7280";

          predBox.style.color =
            "#fff";
        }


        explain.innerHTML =
          explanation(result);


        const probs =
          document.getElementById("probBars");

        if (probs) {
          probs.innerHTML = "";
          probs.style.display = "none";
        }


        resCard.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }

      catch(err) {

        console.error(err);

        alert(err.message);

      }

    }
  );
}


window.addEventListener(
  "DOMContentLoaded",
  main
);
