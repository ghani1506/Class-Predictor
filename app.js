"use strict";

// Logic based on the supplied Year 9 channelling chart.
// Each subject must meet its programme's criteria.
// At least three non-core subjects must individually qualify.
//
// Assumptions requiring school confirmation:
// 1. BAT is an eligible non-core subject.
// 2. Decimal ranges use the next threshold:
//    40–49% means >=40% and <50%.
// 3. Mixed marks require school review.

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
  "bm", "mib", "irk",
  "english", "maths", "science"
];

const NONCORE = ["ss", "arabic", "drama", "bat"];

// Each range includes its lower bound and excludes its upper bound.
// 101 allows marks of 100 to qualify.
// Order: BM/MIB/IRK, English/Maths/Science, non-core.

const RULES = {
  P1: [[70, 101], [70, 101], [60, 101]],
  P2: [[60, 101], [60, 101], [50, 101]],
  P3: [[40, 60],  [40, 50],  [20, 50]],
  P4: [[40, 60],  [20, 40],  [20, 50]],
  P5: [[0, 40],  [0, 20],   [0, 20]]
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
    ([key, ranges]) => {
      const failures = [];

      CORE.forEach((subject, index) => {
        const range = ranges[index < 3 ? 0 : 1];

        if (!inRange(scores[subject], range)) {
          failures.push(
            `${SUBJECTS[subject]}: ${scores[subject]}%; ` +
            `requires ${rangeText(range)}.`
          );
        }
      });

      // Select any three subjects within this programme's range.
      // A higher mark outside a bounded range is not counted.
      const eligible = noncore.filter(subject =>
        inRange(subject.mark, ranges[2])
      );

      if (eligible.length < 3) {
        failures.push(
          `Non-core: ${eligible.length} qualifying subjects; ` +
          `requires at least 3, each ${rangeText(ranges[2])}.`
        );
      }

      return {
        key,
        failures,
        selected: eligible.slice(0, 3)
      };
    }
  );

  // P1 is checked before P2 because their minimum criteria overlap.
  const match = checks.find(
    check => check.failures.length === 0
  );

  return {
    label: match?.key ?? null,
    selected: match?.selected ?? [],
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
  let introduction;

  if (result.label) {
    const programme = PROGRAMMES[result.label];

    const selectedSubjects = result.selected
      .map(subject =>
        `${escapeHTML(subject.name)}: ${subject.mark}%`
      )
      .join("<br>");

    introduction = `
      <h3>Chart criteria met</h3>
      <p>
        <strong>${programme.title}</strong>
        · ${programme.duration}
      </p>
      <h3>Three qualifying non-core subjects</h3>
      <p>${selectedSubjects}</p>
    `;
  } else {
    introduction = `
      <h3>School review required</h3>
      <p>
        These marks do not meet all criteria in a single
        programme column. The chart does not specify how
        to place this combination.
      </p>
    `;
  }

  const note = `
    <p class="small-note">
      Provisional interpretation: each subject must meet
      its range, and any three eligible non-core subjects
      must each qualify. Decimal bands use the next
      threshold, for example 40% to below 50%.
      BAT eligibility and these interpretations require
      school confirmation. Final placement is decided
      by the school.
    </p>
  `;

  const details = result.checks.map(check => {
    const passed = check.failures.length === 0;

    const content = passed
      ? "<p>All subject criteria met.</p>"
      : `
        <ul>
          ${check.failures.map(failure =>
            `<li>${escapeHTML(failure)}</li>`
          ).join("")}
        </ul>
      `;

    return `
      <details>
        <summary>
          ${PROGRAMMES[check.key].name}:
          ${passed ? "Criteria met" : "Criteria not met"}
        </summary>
        ${content}
      </details>
    `;
  }).join("");

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

        label.textContent = programme
          ? `${programme.name} — ${programme.title}`
          : "School review required";

        label.style.background =
          programme?.colour ?? "#e5e7eb";

        const confidenceBox =
          document.getElementById("confidenceBox");

        if (confidenceBox) {
          confidenceBox.textContent =
            "Based on the supplied criteria; " +
            "no model confidence percentage.";
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

// Allows the logic to be tested using Node.js.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    classify,
    validateMark,
    explain
  };
}
