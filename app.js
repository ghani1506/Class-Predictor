/* ============================================================
   YEAR 7 AND 8 STREAMING PREDICTOR
   Weighted Best-Match Model
   Arabic and Drama are optional
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
   SUBJECT WEIGHTS
   ============================================================ */

const WEIGHTS = {
  bm: 1,
  mib: 1,
  irk: 1,
  english: 2,
  maths: 2,
  science: 2,
  nonCore: 1
};


/* ============================================================
   REQUIRED INPUT
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

  const value = Number(raw);

  if (
    Number.isNaN(value) ||
    value < 0 ||
    value > 100
  ) {
    throw new Error(
      `Please enter a valid mark between 0 and 100 for ${id}.`
    );
  }

  return value;
}


/* ============================================================
   OPTIONAL INPUT
   Arabic and Drama may be blank
   ============================================================ */

function valOptionalNum(id) {
  const el = document.getElementById(id);

  if (!el) {
    throw new Error(`Input "${id}" was not found.`);
  }

  const raw = el.value.trim();

  if (raw === "") {
    return null;
  }

  const value = Number(raw);

  if (
    Number.isNaN(value) ||
    value < 0 ||
    value > 100
  ) {
    throw new Error(
      `Please enter a valid mark between 0 and 100 for ${id}.`
    );
  }

  return value;
}


/* ============================================================
   RANGE CHECK
   ============================================================ */

function inRange(value, range) {
  return (
    value >= range[0] &&
    value <= range[1]
  );
}


/* ============================================================
   DISTANCE FROM RANGE
   ============================================================ */

function distanceFromRange(value, range) {
  if (inRange(value, range)) {
    return 0;
  }

  if (value < range[0]) {
    return range[0] - value;
  }

  return value - range[1];
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
   BEST 3 AVAILABLE NON-CORE SUBJECTS

   Social Studies = required
   BAT            = required
   Arabic         = optional
   Drama          = optional

   Either Arabic OR Drama may be blank.
   If all four are entered, the best 3 are used.
   ============================================================ */

function getBestThreeNonCore(scores) {
  const subjects = [
    {
      key: "ss",
      name: "Social Studies",
      mark: scores.ss
    },
    {
      key: "arabic",
      name: "Arabic",
      mark: scores.arabic
    },
    {
      key: "drama",
      name: "Drama",
      mark: scores.drama
    },
    {
      key: "bat",
      name: "BAT",
      mark: scores.bat
    }
  ];

  const availableSubjects =
    subjects.filter(
      subject =>
        subject.mark !== null &&
        subject.mark !== undefined &&
        !Number.isNaN(subject.mark)
    );

  if (availableSubjects.length < 3) {
    throw new Error(
      "At least 3 non-core subject marks are required. Either Arabic or Drama may be left blank."
    );
  }

  return availableSubjects
    .sort((a, b) => b.mark - a.mark)
    .slice(0, 3);
}


/* ============================================================
   SCORE ONE PROGRAMME
   ============================================================ */

function scoreProgramme(programme, scores) {
  const bestThree =
    getBestThreeNonCore(scores);

  const subjects = [
    {
      key: "bm",
      name: "Bahasa Melayu",
      mark: scores.bm,
      range: programme.ranges.bm,
      weight: WEIGHTS.bm
    },
    {
      key: "mib",
      name: "MIB",
      mark: scores.mib,
      range: programme.ranges.mib,
      weight: WEIGHTS.mib
    },
    {
      key: "irk",
      name: "IRK",
      mark: scores.irk,
      range: programme.ranges.irk,
      weight: WEIGHTS.irk
    },
    {
      key: "english",
      name: "English",
      mark: scores.english,
      range: programme.ranges.english,
      weight: WEIGHTS.english
    },
    {
      key: "maths",
      name: "Mathematics",
      mark: scores.maths,
      range: programme.ranges.maths,
      weight: WEIGHTS.maths
    },
    {
      key: "science",
      name: "Science",
      mark: scores.science,
      range: programme.ranges.science,
      weight: WEIGHTS.science
    }
  ];

  let score = 0;
  let distance = 0;

  const subjectChecks =
    subjects.map(subject => {
      const passed =
        inRange(
          subject.mark,
          subject.range
        );

      if (passed) {
        score += subject.weight;
      }

      distance +=
        distanceFromRange(
          subject.mark,
          subject.range
        ) *
        subject.weight;

      return {
        ...subject,
        passed
      };
    });

  const nonCoreChecks =
    bestThree.map(subject => {
      const passed =
        inRange(
          subject.mark,
          programme.ranges.nonCore
        );

      if (passed) {
        score += WEIGHTS.nonCore;
      }

      distance +=
        distanceFromRange(
          subject.mark,
          programme.ranges.nonCore
        );

      return {
        ...subject,
        range: programme.ranges.nonCore,
        weight: WEIGHTS.nonCore,
        passed
      };
    });

  const maxScore = 12;

  const matchPercent =
    Math.round(
      (score / maxScore) * 100
    );

  return {
    programme,
    subjectChecks,
    bestThree: nonCoreChecks,
    score,
    maxScore,
    matchPercent,
    distance
  };
}


/* ============================================================
   EVALUATE STREAMING
   ============================================================ */

function evaluateStreaming(scores) {
  const results =
    PROGRAMMES.map(programme =>
      scoreProgramme(
        programme,
        scores
      )
    );

  /*
     Sort by:
     1. Highest weighted score
     2. Lowest distance from programme band
     3. Higher programme if still tied
  */

  results.sort((a, b) => {

    if (b.score !== a.score) {
      return b.score - a.score;
    }

    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }

    return (
      Number(
        a.programme.code.substring(1)
      ) -
      Number(
        b.programme.code.substring(1)
      )
    );
  });

  const best =
    results[0];

  const second =
    results[1];

  best.borderline =
    Boolean(
      second &&
      (
        best.score -
        second.score
      ) <= 1
    );

  best.secondBest =
    best.borderline
      ? second
      : null;

  best.allResults =
    results;

  return best;
}


/* ============================================================
   SUBJECT DISPLAY ROW
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
        ${
          subject.passed
            ? `✓ Match (${subject.weight} pt${subject.weight > 1 ? "s" : ""})`
            : "Outside Band"
        }
      </div>

    </div>
  `;
}


/* ============================================================
   PROGRAMME COMPARISON TABLE
   ============================================================ */

function programmeScoreTable(result) {
  const rows =
    result.allResults
      .map(item => {

        const isBest =
          item.programme.code ===
          result.programme.code;

        return `
          <tr class="${isBest ? "best-programme-row" : ""}">

            <td>
              <strong>${item.programme.name}</strong>
            </td>

            <td>
              ${item.programme.title}
            </td>

            <td>
              <strong>
                ${item.score}/${item.maxScore}
              </strong>
            </td>

            <td>
              ${item.matchPercent}%
            </td>

          </tr>
        `;
      })
      .join("");

  return `
    <h3>
      Programme Match Comparison
    </h3>

    <div class="criteria-table-wrapper">

      <table class="streaming-table match-table">

        <thead>
          <tr>
            <th>Programme</th>
            <th>Pathway</th>
            <th>Score</th>
            <th>Match</th>
          </tr>
        </thead>

        <tbody>
          ${rows}
        </tbody>

      </table>

    </div>
  `;
}


/* ============================================================
   EXPLANATION
   ============================================================ */

function explanation(result) {
  const programme =
    result.programme;

  let borderlineMessage =
    "";

  if (
    result.borderline &&
    result.secondBest
  ) {

    borderlineMessage = `
      <div class="decision-message warning">

        <h3>
          Borderline Profile
        </h3>

        <p>
          The student's strongest match is
          <strong>${programme.name}</strong>,
          but the student's profile is also close to
          <strong>${result.secondBest.programme.name}</strong>.
        </p>

        <p>
          ${programme.name}
          <strong>
            ${result.score}/${result.maxScore}
          </strong>

          &nbsp; • &nbsp;

          ${result.secondBest.programme.name}
          <strong>
            ${result.secondBest.score}/${result.secondBest.maxScore}
          </strong>
        </p>

        <p>
          The recommended programme remains
          <strong>${programme.name}</strong>,
          but teacher or school review may be useful
          before the final placement.
        </p>

      </div>
    `;
  }

  return `
    <div class="prediction-summary">

      <h3>
        Recommended Streaming
      </h3>

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

      <p>
        Programme Match:
        <strong>
          ${result.matchPercent}%
        </strong>
        (${result.score}/${result.maxScore} weighted points)
      </p>

    </div>

    ${borderlineMessage}

    <h3>
      Subject Match
    </h3>

    <div class="criteria-group">
      ${
        result.subjectChecks
          .map(subjectRow)
          .join("")
      }
    </div>

    <h3>
      Best 3 Available Non-Core Subjects
    </h3>

    <div class="criteria-group">
      ${
        result.bestThree
          .map(subjectRow)
          .join("")
      }
    </div>

    ${programmeScoreTable(result)}

    ${pathwayDisplay(programme)}
  `;
}


/* ============================================================
   PATHWAY DISPLAY
   ============================================================ */

function pathwayDisplay(programme) {
  switch (programme.code) {

    case "P1":
      return `
        <div class="decision-message success">

          <h3>
            General Education Science
          </h3>

          <div class="pathway-box">

            <span>
              YEAR 9 ADV
            </span>

            <span class="arrow">
              →
            </span>

            <span>
              YEAR 10 ADV
            </span>

          </div>

          <p>
            Express pathway — 4 Years
          </p>

        </div>
      `;


    case "P2":
      return `
        <div class="decision-message success">

          <h3>
            General Education Science
          </h3>

          <div class="pathway-box">

            <span>
              YEAR 9 O LEVEL
            </span>

            <span class="arrow">
              →
            </span>

            <span>
              YEAR 10 O LEVEL
            </span>

            <span class="arrow">
              →
            </span>

            <span>
              YEAR 11 O LEVEL
            </span>

          </div>

        </div>
      `;


    case "P3":
      return `
        <div class="decision-message success">

          <h3>
            General Education Art
          </h3>

          <div class="pathway-box">

            <span>
              YEAR 9 O LEVEL
            </span>

            <span class="arrow">
              →
            </span>

            <span>
              YEAR 10 O LEVEL
            </span>

            <span class="arrow">
              →
            </span>

            <span>
              YEAR 11 O LEVEL
            </span>

          </div>

        </div>
      `;


    case "P4":
      return `
        <div class="decision-message warning">

          <h3>
            Applied Programme
          </h3>

          <div class="pathway-box">

            <span>
              YEAR 9 IGCSE
            </span>

            <span class="arrow">
              →
            </span>

            <span>
              YEAR 10 IGCSE
            </span>

            <span class="arrow">
              →
            </span>

            <span>
              YEAR 11 IGCSE
            </span>

          </div>

        </div>
      `;


    case "P5":
      return `
        <div class="decision-message warning">

          <h3>
            Special Applied Programme
          </h3>

          <div class="pathway-box">

            <span>
              YEAR 9 SAP
            </span>

            <span class="arrow">
              →
            </span>

            <span>
              YEAR 10 BTEC
            </span>

            <span class="arrow">
              →
            </span>

            <span>
              YEAR 11 BTEC
            </span>

          </div>

        </div>
      `;
  }

  return "";
}


/* ============================================================
   SAMPLE DATA
   ============================================================ */

function fillSample() {
  document.getElementById("bm").value =
    65;

  document.getElementById("mib").value =
    63;

  document.getElementById("irk").value =
    61;

  document.getElementById("english").value =
    58;

  document.getElementById("maths").value =
    62;

  document.getElementById("science").value =
    64;

  document.getElementById("ss").value =
    55;

  /* Arabic blank = optional */
  document.getElementById("arabic").value =
    "";

  document.getElementById("drama").value =
    52;

  document.getElementById("bat").value =
    58;
}


/* ============================================================
   RESET RESULT
   ============================================================ */

function resetResult() {
  const resultCard =
    document.getElementById(
      "resultCard"
    );

  if (resultCard) {
    resultCard.hidden =
      true;
  }
}


/* ============================================================
   MAIN
   ============================================================ */

function main() {
  const year =
    document.getElementById(
      "year"
    );

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }


  const sampleButton =
    document.getElementById(
      "btnSample"
    );

  if (sampleButton) {
    sampleButton.addEventListener(
      "click",
      function() {
        fillSample();
        resetResult();
      }
    );
  }


  const scoreForm =
    document.getElementById(
      "scoreForm"
    );

  if (!scoreForm) {
    console.error(
      "scoreForm was not found."
    );

    return;
  }


  scoreForm.addEventListener(
    "reset",
    resetResult
  );


  scoreForm.addEventListener(
    "submit",
    function(e) {
      e.preventDefault();

      try {

        const scores = {
          bm:
            valNum("bm"),

          mib:
            valNum("mib"),

          irk:
            valNum("irk"),

          english:
            valNum("english"),

          maths:
            valNum("maths"),

          science:
            valNum("science"),

          ss:
            valNum("ss"),

          /* OPTIONAL */
          arabic:
            valOptionalNum("arabic"),

          /* OPTIONAL */
          drama:
            valOptionalNum("drama"),

          bat:
            valNum("bat")
        };


        const result =
          evaluateStreaming(scores);


        const resultCard =
          document.getElementById(
            "resultCard"
          );

        const predLabel =
          document.getElementById(
            "predLabel"
          );

        const explainPanel =
          document.getElementById(
            "explainPanel"
          );


        if (
          !resultCard ||
          !predLabel ||
          !explainPanel
        ) {
          throw new Error(
            "One or more result elements are missing from index.html."
          );
        }


        resultCard.hidden =
          false;


        predLabel.textContent =
          `${result.programme.name} — ${result.programme.stream}`;


        predLabel.style.background =
          result.programme.colour;


        predLabel.style.color =
          "#111";


        explainPanel.innerHTML =
          explanation(result);


        const probs =
          document.getElementById(
            "probBars"
          );

        if (probs) {
          probs.innerHTML =
            "";

          probs.style.display =
            "none";
        }


        resultCard.scrollIntoView({
          behavior:
            "smooth",
          block:
            "start"
        });

      }

      catch(error) {

        console.error(error);

        alert(
          error.message
        );

      }
    }
  );
}


/* ============================================================
   START
   ============================================================ */

window.addEventListener(
  "DOMContentLoaded",
  main
);];


/* ============================================================
   SUBJECT WEIGHTS
   ============================================================ */

const WEIGHTS = {
  bm: 1,
  mib: 1,
  irk: 1,
  english: 2,
  maths: 2,
  science: 2,
  nonCore: 1
};


/* ============================================================
   REQUIRED INPUT
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

  const value = Number(raw);

  if (
    Number.isNaN(value) ||
    value < 0 ||
    value > 100
  ) {
    throw new Error(
      `Please enter a valid mark between 0 and 100 for ${id}.`
    );
  }

  return value;
}


/* ============================================================
   OPTIONAL INPUT
   Arabic and Drama may be left blank.
   ============================================================ */

function valOptionalNum(id) {
  const el = document.getElementById(id);

  if (!el) {
    throw new Error(`Input "${id}" was not found.`);
  }

  const raw = el.value.trim();

  if (raw === "") {
    return null;
  }

  const value = Number(raw);

  if (
    Number.isNaN(value) ||
    value < 0 ||
    value > 100
  ) {
    throw new Error(
      `Please enter a valid mark between 0 and 100 for ${id}.`
    );
  }

  return value;
}


/* ============================================================
   RANGE CHECK
   ============================================================ */

function inRange(value, range) {
  return (
    value >= range[0] &&
    value <= range[1]
  );
}


/* ============================================================
   DISTANCE FROM RANGE
   Used as a tie-breaker.
   ============================================================ */

function distanceFromRange(value, range) {

  if (inRange(value, range)) {
    return 0;
  }

  if (value < range[0]) {
    return range[0] - value;
  }

  return value - range[1];
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
   BEST 3 AVAILABLE NON-CORE SUBJECTS

   Social Studies = required
   BAT            = required
   Arabic         = optional
   Drama          = optional

   Either Arabic OR Drama may be blank.
   If all four are entered, the best 3 are used.
   ============================================================ */

function getBestThreeNonCore(scores) {

  const nonCoreSubjects = [
    {
      key: "ss",
      name: "Social Studies",
      mark: scores.ss
    },
    {
      key: "arabic",
      name: "Arabic",
      mark: scores.arabic
    },
    {
      key: "drama",
      name: "Drama",
      mark: scores.drama
    },
    {
      key: "bat",
      name: "BAT",
      mark: scores.bat
    }
  ];

  const availableSubjects =
    nonCoreSubjects.filter(
      subject =>
        subject.mark !== null &&
        subject.mark !== undefined &&
        !Number.isNaN(subject.mark)
    );

  if (availableSubjects.length < 3) {
    throw new Error(
      "At least 3 non-core marks are required. Either Arabic or Drama may be left blank."
    );
  }

  return availableSubjects
    .sort((a, b) => b.mark - a.mark)
    .slice(0, 3);
}


/* ============================================================
   SCORE ONE PROGRAMME
   ============================================================ */

function scoreProgramme(programme, scores) {

  const bestThree =
    getBestThreeNonCore(scores);

  const checks = [
    {
      key: "bm",
      name: "Bahasa Melayu",
      mark: scores.bm,
      range: programme.ranges.bm,
      weight: WEIGHTS.bm
    },

    {
      key: "mib",
      name: "MIB",
      mark: scores.mib,
      range: programme.ranges.mib,
      weight: WEIGHTS.mib
    },

    {
      key: "irk",
      name: "IRK",
      mark: scores.irk,
      range: programme.ranges.irk,
      weight: WEIGHTS.irk
    },

    {
      key: "english",
      name: "English",
      mark: scores.english,
      range: programme.ranges.english,
      weight: WEIGHTS.english
    },

    {
      key: "maths",
      name: "Mathematics",
      mark: scores.maths,
      range: programme.ranges.maths,
      weight: WEIGHTS.maths
    },

    {
      key: "science",
      name: "Science",
      mark: scores.science,
      range: programme.ranges.science,
      weight: WEIGHTS.science
    }
  ];


  let score = 0;
  let distance = 0;


  const subjectChecks =
    checks.map(subject => {

      const passed =
        inRange(
          subject.mark,
          subject.range
        );

      if (passed) {
        score += subject.weight;
      }

      distance +=
        distanceFromRange(
          subject.mark,
          subject.range
        ) *
        subject.weight;

      return {
        ...subject,
        passed
      };

    });


  const nonCoreChecks =
    bestThree.map(subject => {

      const passed =
        inRange(
          subject.mark,
          programme.ranges.nonCore
        );

      if (passed) {
        score += WEIGHTS.nonCore;
      }

      distance +=
        distanceFromRange(
          subject.mark,
          programme.ranges.nonCore
        );

      return {
        ...subject,
        range: programme.ranges.nonCore,
        weight: WEIGHTS.nonCore,
        passed
      };

    });


  const maxScore = 12;

  const matchPercent =
    Math.round(
      (score / maxScore) * 100
    );


  return {
    programme,
    subjectChecks,
    bestThree: nonCoreChecks,
    score,
    maxScore,
    matchPercent,
    distance
  };
}


/* ============================================================
   EVALUATE STREAMING
   ============================================================ */

function evaluateStreaming(scores) {

  const results =
    PROGRAMMES.map(
      programme =>
        scoreProgramme(
          programme,
          scores
        )
    );


  /*
     Ranking priority:

     1. Highest weighted score
     2. Lowest distance from programme band
     3. Higher programme on an exact tie
  */

  results.sort(
    (a, b) => {

      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }

      return (
        Number(
          a.programme.code.substring(1)
        ) -
        Number(
          b.programme.code.substring(1)
        )
      );

    }
  );


  const best =
    results[0];

  const second =
    results[1];


  best.borderline =
    second &&
    (
      best.score -
      second.score
    ) <= 1;


  best.secondBest =
    best.borderline
      ? second
      : null;


  best.allResults =
    results;


  return best;
}


/* ============================================================
   SUBJECT DISPLAY ROW
   ============================================================ */

function subjectRow(subject) {

  return `

    <div
      class="criteria-row
      ${subject.passed ? "pass" : "fail"}"
    >

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

        ${
          subject.passed
            ? `✓ Match (${subject.weight} pt${subject.weight > 1 ? "s" : ""})`
            : "Outside Band"
        }

      </div>

    </div>

  `;
}


/* ============================================================
   PROGRAMME COMPARISON TABLE
   ============================================================ */

function programmeScoreTable(result) {

  const rows =
    result.allResults
      .map(item => {

        const isBest =
          item.programme.code ===
          result.programme.code;

        return `

          <tr
            class="${isBest ? "best-programme-row" : ""}"
          >

            <td>
              <strong>
                ${item.programme.name}
              </strong>
            </td>


            <td>
              ${item.programme.title}
            </td>


            <td>
              <strong>
                ${item.score}/${item.maxScore}
              </strong>
            </td>


            <td>
              ${item.matchPercent}%
            </td>

          </tr>

        `;

      })
      .join("");


  return `

    <h3>
      Programme Match Comparison
    </h3>


    <div class="criteria-table-wrapper">

      <table
        class="streaming-table match-table"
      >

        <thead>

          <tr>

            <th>
              Programme
            </th>

            <th>
              Pathway
            </th>

            <th>
              Score
            </th>

            <th>
              Match
            </th>

          </tr>

        </thead>


        <tbody>

          ${rows}

        </tbody>

      </table>

    </div>

  `;
}


/* ============================================================
   EXPLANATION
   ============================================================ */

function explanation(result) {

  const programme =
    result.programme;


  let borderlineMessage =
    "";


  if (
    result.borderline &&
    result.secondBest
  ) {

    borderlineMessage = `

      <div
        class="decision-message warning"
      >

        <h3>
          Borderline Profile
        </h3>


        <p>

          The student's strongest match is

          <strong>
            ${programme.name}
          </strong>,

          but the profile is close to

          <strong>
            ${result.secondBest.programme.name}
          </strong>.

        </p>


        <p>

          ${programme.name}:

          <strong>
            ${result.score}/${result.maxScore}
          </strong>

          &nbsp; • &nbsp;

          ${result.secondBest.programme.name}:

          <strong>
            ${result.secondBest.score}/${result.secondBest.maxScore}
          </strong>

        </p>


        <p>
          Teacher or school review may be useful
          before final placement.
        </p>

      </div>

    `;

  }


  return `

    <div
      class="prediction-summary"
    >

      <h3>
        Recommended Streaming
      </h3>


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


      <p>

        Programme Match:

        <strong>
          ${result.matchPercent}%
        </strong>

        (${result.score}/${result.maxScore} weighted points)

      </p>

    </div>


    ${borderlineMessage}


    <h3>
      Subject Match
    </h3>


    <div
      class="criteria-group"
    >

      ${
        result.subjectChecks
          .map(subjectRow)
          .join("")
      }

    </div>


    <h3>
      Best 3 Available Non-Core Subjects
    </h3>


    <div
      class="criteria-group"
    >

      ${
        result.bestThree
          .map(subjectRow)
          .join("")
      }

    </div>


    ${programmeScoreTable(result)}


    ${pathwayDisplay(programme)}

  `;
}


/* ============================================================
   PATHWAY DISPLAY
   ============================================================ */

function pathwayDisplay(programme) {

  switch (programme.code) {


    case "P1":

      return `

        <div
          class="decision-message success"
        >

          <h3>
            General Education Science
          </h3>


          <div
            class="pathway-box"
          >

            <span>
              YEAR 9 ADV
            </span>

            <span
              class="arrow"
            >
              →
            </span>

            <span>
              YEAR 10 ADV
            </span>

          </div>


          <p>
            Express pathway — 4 Years
          </p>

        </div>

      `;


    case "P2":

      return `

        <div
          class="decision-message success"
        >

          <h3>
            General Education Science
          </h3>


          <div
            class="pathway-box"
          >

            <span>
              YEAR 9 O LEVEL
            </span>

            <span
              class="arrow"
            >
              →
            </span>

            <span>
              YEAR 10 O LEVEL
            </span>

            <span
              class="arrow"
            >
              →
            </span>

            <span>
              YEAR 11 O LEVEL
            </span>

          </div>

        </div>

      `;


    case "P3":

      return `

        <div
          class="decision-message success"
        >

          <h3>
            General Education Art
          </h3>


          <div
            class="pathway-box"
          >

            <span>
              YEAR 9 O LEVEL
            </span>

            <span
              class="arrow"
            >
              →
            </span>

            <span>
              YEAR 10 O LEVEL
            </span>

            <span
              class="arrow"
            >
              →
            </span>

            <span>
              YEAR 11 O LEVEL
            </span>

          </div>

        </div>

      `;


    case "P4":

      return `

        <div
          class="decision-message warning"
        >

          <h3>
            Applied Programme
          </h3>


          <div
            class="pathway-box"
          >

            <span>
              YEAR 9 IGCSE
            </span>

            <span
              class="arrow"
            >
              →
            </span>

            <span>
              YEAR 10 IGCSE
            </span>

            <span
              class="arrow"
            >
              →
            </span>

            <span>
              YEAR 11 IGCSE
            </span>

          </div>

        </div>

      `;


    case "P5":

      return `

        <div
          class="decision-message warning"
        >

          <h3>
            Special Applied Programme
          </h3>


          <div
            class="pathway-box"
          >

            <span>
              YEAR 9 SAP
            </span>

            <span
              class="arrow"
            >
              →
            </span>

            <span>
              YEAR 10 BTEC
            </span>

            <span
              class="arrow"
            >
              →
            </span>

            <span>
              YEAR 11 BTEC
            </span>

          </div>

        </div>

      `;

  }


  return "";
}


/* ============================================================
   SAMPLE DATA
   ============================================================ */

function fillSample() {

  document.getElementById("bm").value =
    65;

  document.getElementById("mib").value =
    63;

  document.getElementById("irk").value =
    61;


  document.getElementById("english").value =
    58;

  document.getElementById("maths").value =
    62;

  document.getElementById("science").value =
    64;


  document.getElementById("ss").value =
    55;


  /*
     Arabic left blank to demonstrate
     that it is optional.
  */

  document.getElementById("arabic").value =
    "";


  document.getElementById("drama").value =
    52;

  document.getElementById("bat").value =
    58;

}


/* ============================================================
   RESET RESULT
   ============================================================ */

function resetResult() {

  const resultCard =
    document.getElementById(
      "resultCard"
    );


  if (resultCard) {

    resultCard.hidden =
      true;

  }

}


/* ============================================================
   MAIN
   ============================================================ */

function main() {


  const year =
    document.getElementById(
      "year"
    );


  if (year) {

    year.textContent =
      new Date().getFullYear();

  }



  const sampleButton =
    document.getElementById(
      "btnSample"
    );


  if (sampleButton) {

    sampleButton.addEventListener(
      "click",
      function() {

        fillSample();

        resetResult();

      }
    );

  }



  const scoreForm =
    document.getElementById(
      "scoreForm"
    );


  if (!scoreForm) {

    console.error(
      "scoreForm was not found."
    );

    return;

  }



  scoreForm.addEventListener(
    "reset",
    resetResult
  );



  scoreForm.addEventListener(

    "submit",

    function(e) {


      e.preventDefault();


      try {


        const scores = {

          bm:
            valNum("bm"),

          mib:
            valNum("mib"),

          irk:
            valNum("irk"),


          english:
            valNum("english"),

          maths:
            valNum("maths"),

          science:
            valNum("science"),


          ss:
            valNum("ss"),


          /* Arabic is optional */

          arabic:
            valOptionalNum(
              "arabic"
            ),


          /* Drama is optional */

          drama:
            valOptionalNum(
              "drama"
            ),


          bat:
            valNum("bat")

        };



        const result =
          evaluateStreaming(
            scores
          );



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



        if (
          !resCard ||
          !predBox ||
          !explain
        ) {

          throw new Error(
            "One or more result elements are missing from index.html."
          );

        }



        resCard.hidden =
          false;



        predBox.textContent =
          `${result.programme.name} — ${result.programme.stream}`;


        predBox.style.background =
          result.programme.colour;


        predBox.style.color =
          "#111";



        explain.innerHTML =
          explanation(
            result
          );



        const probs =
          document.getElementById(
            "probBars"
          );


        if (probs) {

          probs.innerHTML =
            "";

          probs.style.display =
            "none";

        }



        resCard.scrollIntoView({

          behavior:
            "smooth",

          block:
            "start"

        });


      }


      catch(err) {


        console.error(
          err
        );


        alert(
          err.message
        );


      }

    }

  );

}


/* ============================================================
   START
   ============================================================ */

window.addEventListener(
  "DOMContentLoaded",
  main
);
