"use strict";

const PROGRAMMES = {
  P1: {
    name: "Prog 1",
    title: "General Education Science",
    duration: "4 Years",
    colour: "#f78b8f"
  },
  P2: {
    name: "Prog 2",
    title: "General Education Science",
    duration: "5 Years",
    colour: "#45cf59"
  },
  P3: {
    name: "Prog 3",
    title: "General Education Art",
    duration: "5 Years",
    colour: "#bff3bf"
  },
  P4: {
    name: "Prog 4",
    title: "Applied Programme",
    duration: "5 Years",
    colour: "#d8b5f4"
  },
  P5: {
    name: "Prog 5",
    title: "Special Applied Programme",
    duration: "5 Years",
    colour: "#fff98c"
  }
};

const SUBJECTS = {
  bm: "Bahasa Melayu",
  mib: "MIB",
  irk: "IRK",
  english: "English",
  maths: "Mathematics",
  science: "Science",
  ss: "Social Studies",
  arabic: "Arabic",
  drama: "Drama",
  bat: "BAT"
};

const CORE = [
  "bm",
  "mib",
  "irk",
  "english",
  "maths",
  "science"
];

const NONCORE = ["ss", "arabic", "drama", "bat"];

// Ranges include the lower bound and exclude the upper bound.
// 101 allows a mark of 100 to qualify.
//
// Order:
// 1. BM / MIB / IRK
// 2. English / Mathematics / Science
// 3. Non-core subjects
//
// Decimal interpretation:
// 40–49% is treated as >=40% and <50%.

const RULES = {
  P1: [[70, 101], [70, 101], [60, 101]],
  P2: [[60, 101], [60, 101], [50, 101]],
  P3: [[40, 60], [40, 50], [20, 50]],
  P4: [[40, 60], [20, 40], [20, 50]],
  P5: [[0, 40], [0, 20], [0, 20]]
};

function validateMark(value, label) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100
  ) {
    throw new Error(
      `${label} must be a number between 0 and 100.`
    );
  }

  return value;
}

function readMark(id, optional = false) {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing form field: ${id}.`);
  }

  const raw = element.value.trim();

  if (raw === "") {
    if (optional) return null;

    throw new Error(
      `Please enter a mark for ${SUBJECTS[id]}.`
    );
  }

  return validateMark(Number(raw), SUBJECTS[id]);
}

function nonCoreMarks(scores) {
  return NONCORE
    .filter(key => scores[key] != null)
    .map(key => ({
      name: SUBJECTS[key],
      mark: validateMark(scores[key], SUBJECTS[key])
    }))
    .sort((a, b) => b.mark - a.mark);
}

function inRange(mark, range) {
  return mark >= range[0] && mark < range[1];
}

function rangeText(range) {
  if (range[1] === 101) {
    return `${range[0]}% or above`;
  }

  if (range[0] === 0) {
    return `below ${range[1]}%`;
  }

  return `${range[0]}% to below ${range[1]}%`;
}

// Distance to a programme's band in percentage points.
// An excluded upper boundary has zero distance,
// but it does not count as an exact qualifying mark.
function distanceToRange(mark, range) {
  if (mark < range[0]) {
    return range[0] - mark;
  }

  if (mark >= range[1]) {
    return mark - range[1];
  }

  return 0;
}

function classify(scores) {
  CORE.forEach(key => {
    validateMark(scores[key], SUBJECTS[key]);
  });

  const noncore = nonCoreMarks(scores);

  if (noncore.length < 3) {
    throw new Error(
      "Enter at least three non-core marks. " +
      "Arabic and Drama may be blank, but three marks are still required."
    );
  }

  const checks = Object.entries(RULES).map(
    ([key, ranges], priority) => {
      const failures = [];
      let totalDistance = 0;
      let unmetSubjects = 0;

      // All six core subjects receive equal weight.
      CORE.forEach((subject, index) => {
        const mark = scores[subject];
        const range = ranges[index < 3 ? 0 : 1];

        totalDistance += distanceToRange(mark, range);

        if (!inRange(mark, range)) {
          unmetSubjects++;

          failures.push(
            `${SUBJECTS[subject]}: ${mark}%; ` +
            `requires ${rangeText(range)}.`
          );
        }
      });

      // Select the three non-core subjects closest
      // to this programme's band.
      const selected = noncore
        .map(subject => ({
          ...subject,
          distance: distanceToRange(
            subject.mark,
            ranges[2]
          ),
          qualifies: inRange(
            subject.mark,
            ranges[2]
          )
        }))
        .sort((a, b) =>
          a.distance - b.distance ||
          Number(b.qualifies) - Number(a.qualifies) ||
          b.mark - a.mark
        )
        .slice(0, 3);

      selected.forEach(subject => {
        totalDistance += subject.distance;

        if (!subject.qualifies) {
          unmetSubjects++;

          failures.push(
            `${subject.name}: ${subject.mark}%; ` +
            `requires ${rangeText(ranges[2])}.`
          );
        }
      });

      return {
        key,
        priority,
        failures,
        selected,
        totalDistance,
        unmetSubjects,
        exact: unmetSubjects === 0
      };
    }
  );

  // Exact matches take priority.
  // P1 precedes P2 when both sets of criteria are met.
  const exactMatch = checks.find(
    check => check.exact
  );

  // Otherwise choose the nearest programme.
  // Tie-break order:
  // 1. Smallest total distance
  // 2. Fewest unmet subject criteria
  // 3. Programme order P1–P5
  const nearestMatch = [...checks].sort((a, b) =>
    a.totalDistance - b.totalDistance ||
    a.unmetSubjects - b.unmetSubjects ||
    a.priority - b.priority
  )[0];

  const chosen = exactMatch || nearestMatch;

  return {
    label: chosen.key,
    exact: chosen.exact,
    selected: chosen.selected,
    totalDistance: chosen.totalDistance,
    unmetSubjects: chosen.unmetSubjects,
    checks
  };
}

function escapeHTML(value) {
  const replacements = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };

  return String(value).replace(
    /[&<>"']/g,
    character => replacements[character]
  );
}

function explain(result) {
  const programme = PROGRAMMES[result.label];

  const selectedSubjects = result.selected
    .map(subject =>
      `${escapeHTML(subject.name)}: ${subject.mark}%`
    )
    .join("<br>");

  const introduction = `
    <h3>
      ${result.exact
        ? "Programme criteria met"
        : "Nearest programme prediction"}
    </h3>

    <p>
      <strong>
        ${programme.name} — ${programme.title}
      </strong>
      · ${programme.duration}
    </p>

    <p>
      ${result.exact
        ? "The marks meet all criteria for this programme."
        : "This programme has the smallest total distance " +
          "from the student's marks to the chart's ranges. " +
          "Some criteria are not met."}
    </p>

    <h3>Three non-core subjects used</h3>
    <p>${selectedSubjects}</p>
  `;

  const note = `
    <p class="small-note">
      Exact chart matches are used first. Otherwise,
      the nearest programme is estimated using equal
      weights for six core subjects and three non-core
      subjects. Ties are resolved by fewer unmet
      subject criteria, then programme order.
      This nearest-match method is an added recommendation
      rule, not a placement rule specified by the chart.
      Final placement is decided by the school.
    </p>
  `;

  const details = result.checks
    .map(check => {
      const content = check.exact
        ? "<p>All subject criteria met.</p>"
        : `
          <ul>
            ${check.failures
              .map(failure =>
                `<li>${escapeHTML(failure)}</li>`
              )
              .join("")}
          </ul>
        `;

      return `
        <details>
          <summary>
            ${PROGRAMMES[check.key].name}:
            ${check.exact
              ? "Criteria met"
              : "Some criteria not met"}
          </summary>

          <p>
            Total distance:
            ${check.totalDistance.toFixed(2)}
            percentage points
          </p>

          ${content}
        </details>
      `;
    })
    .join("");

  return introduction + note + details;
}

function sample() {
  const values = {
    bm: 65,
    mib: 63,
    irk: 61,
    english: 58,
    maths: 62,
    science: 64,
    ss: 55,
    arabic: "",
    drama: 52,
    bat: 58
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);

    if (element) {
      element.value = value;
    }
  });
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    const year = document.getElementById("year");

    if (year) {
      year.textContent = new Date().getFullYear();
    }

    const form = document.getElementById("scoreForm");
    const card = document.getElementById("resultCard");
    const label = document.getElementById("predLabel");
    const panel = document.getElementById("explainPanel");

    if (!form || !card || !label || !panel) {
      console.error(
        "Required result/form elements are missing."
      );
      return;
    }

    const hideResult = () => {
      card.hidden = true;
    };

    const sampleButton =
      document.getElementById("btnSample");

    if (sampleButton) {
      sampleButton.addEventListener("click", event => {
        event.preventDefault();
        sample();
        hideResult();
      });
    }

    form.addEventListener("reset", hideResult);
    form.addEventListener("input", hideResult);

    form.addEventListener("submit", event => {
      event.preventDefault();
      hideResult();

      try {
        const scores = Object.fromEntries(
          Object.keys(SUBJECTS).map(key => [
            key,
            readMark(
              key,
              key === "arabic" || key === "drama"
            )
          ])
        );

        const result = classify(scores);
        const programme = PROGRAMMES[result.label];

        label.textContent =
          `${programme.name} — ${programme.title}`;

        label.style.background = programme.colour;

        const confidenceBox =
          document.getElementById("confidenceBox");

        if (confidenceBox) {
          confidenceBox.textContent = result.exact
            ? "Exact match to the programme criteria."
            : "Nearest programme estimate based on subject marks.";
        }

        panel.innerHTML = explain(result);
        card.hidden = false;

        card.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    });
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    classify,
    validateMark,
    distanceToRange,
    explain
  };
}
