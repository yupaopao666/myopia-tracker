import {
  paginateRecords,
  filterTrendRecords,
  getTrendDensity,
} from "./ui-logic.mjs";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getDatabase,
  ref,
  get,
  set,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = {
        apiKey: "AIzaSyDLxCEmP3RchhEwjRULu0ELMg_iLItBfkw",
  authDomain: "class-tracker-7ec05.firebaseapp.com",
  databaseURL: "https://class-tracker-7ec05-default-rtdb.firebaseio.com",
  projectId: "class-tracker-7ec05",
  storageBucket: "class-tracker-7ec05.firebasestorage.app",
  messagingSenderId: "34124797425",
  appId: "1:34124797425:web:9d92e45482eb27cff6e050"
};


const firebaseApp = initializeApp(firebaseConfig);
const realtimeDb = getDatabase(firebaseApp);

const STORE_PROFILES = "profiles";
const STORE_RECORDS = "records";

const MYOPIA_ROOT = "myopiaTracker";

let profiles = [];
let activeProfileId = null;
let pendingReadings = [];
let records = [];
let currentChartMetric = "axial";
let chart;
let currentAverages = {};
let currentCounts = {};
let saveMode = "individual";
let recordsPage = 1;
const RECORDS_PER_PAGE = 10;
let trendRange = "12m";

const metricDefs = {
  axialRight: { label: "AL Axial Length", eye: "Right Eye", unit: "mm" },
  axialLeft: { label: "AL Axial Length", eye: "Left Eye", unit: "mm" },

  cornealThicknessRight: { label: "CT Corneal Thickness", eye: "Right Eye", unit: "um" },
  cornealThicknessLeft: { label: "CT Corneal Thickness", eye: "Left Eye", unit: "um" },

  anteriorChamberDepthRight: { label: "AD Anterior Chamber Depth", eye: "Right Eye", unit: "mm" },
  anteriorChamberDepthLeft: { label: "AD Anterior Chamber Depth", eye: "Left Eye", unit: "mm" },

  lensThicknessRight: { label: "LT Lens Thickness", eye: "Right Eye", unit: "mm" },
  lensThicknessLeft: { label: "LT Lens Thickness", eye: "Left Eye", unit: "mm" },

  vitreousChamberLengthRight: { label: "VT Vitreous Chamber Length", eye: "Right Eye", unit: "mm" },
  vitreousChamberLengthLeft: { label: "VT Vitreous Chamber Length", eye: "Left Eye", unit: "mm" },

  alCrRight: { label: "AL/CR", eye: "Right Eye", unit: "" },
  alCrLeft: { label: "AL/CR", eye: "Left Eye", unit: "" },

  k1Right: { label: "K1", eye: "Right Eye", unit: "D" },
  k1Left: { label: "K1", eye: "Left Eye", unit: "D" },

  k2Right: { label: "K2", eye: "Right Eye", unit: "D" },
  k2Left: { label: "K2", eye: "Left Eye", unit: "D" },

  kappaRight: { label: "Kappa", eye: "Right Eye", unit: "" },
  kappaLeft: { label: "Kappa", eye: "Left Eye", unit: "" },
};

const metricRows = [
  {
    label: "AL Axial Length",
    unit: "mm",
    rightKey: "axialRight",
    leftKey: "axialLeft",
  },
  {
    label: "CT Corneal Thickness",
    unit: "um",
    rightKey: "cornealThicknessRight",
    leftKey: "cornealThicknessLeft",
  },
  {
    label: "AD Anterior Chamber Depth",
    unit: "mm",
    rightKey: "anteriorChamberDepthRight",
    leftKey: "anteriorChamberDepthLeft",
  },
  {
    label: "LT Lens Thickness",
    unit: "mm",
    rightKey: "lensThicknessRight",
    leftKey: "lensThicknessLeft",
  },
  {
    label: "VT Vitreous Chamber Length",
    unit: "mm",
    rightKey: "vitreousChamberLengthRight",
    leftKey: "vitreousChamberLengthLeft",
  },
  {
    label: "AL/CR",
    unit: "",
    rightKey: "alCrRight",
    leftKey: "alCrLeft",
  },
  {
    label: "K1",
    unit: "D",
    rightKey: "k1Right",
    leftKey: "k1Left",
  },
  {
    label: "K2",
    unit: "D",
    rightKey: "k2Right",
    leftKey: "k2Left",
  },
  {
    label: "Kappa",
    unit: "",
    rightKey: "kappaRight",
    leftKey: "kappaLeft",
  },
];


const metricOrder = Object.keys(metricDefs);

const els = {
  profileSelect: document.querySelector("#profileSelect"),
  profileNameInput: document.querySelector("#profileNameInput"),
  createProfileButton: document.querySelector("#createProfileButton"),
  capturedAtInput: document.querySelector("#capturedAtInput"),
  jsonInput: document.querySelector("#jsonInput"),
  jsonFileInput: document.querySelector("#jsonFileInput"),
  chooseJsonButton: document.querySelector("#chooseJsonButton"),
  jsonFileName: document.querySelector("#jsonFileName"),
  importJsonButton: document.querySelector("#importJsonButton"),
  importStatus: document.querySelector("#importStatus"),
  uploadList: document.querySelector("#uploadList"),
  averageSummary: document.querySelector("#averageSummary"),
  calculateButton: document.querySelector("#calculateButton"),
  saveRecordButton: document.querySelector("#saveRecordButton"),
  readingTemplate: document.querySelector("#readingTemplate"),
  recordsList: document.querySelector("#recordsList"),
  emptyTrendMessage: document.querySelector("#emptyTrendMessage"),
  trendCanvas: document.querySelector("#trendCanvas"),
  clearUploadsButton: document.querySelector("#clearUploadsButton"),
  recordsPagination: document.querySelector("#recordsPagination"),
  recordsPageInfo: document.querySelector("#recordsPageInfo"),
  recordsPageNumber: document.querySelector("#recordsPageNumber"),
  recordsPrevButton: document.querySelector("#recordsPrevButton"),
  recordsNextButton: document.querySelector("#recordsNextButton"),
  trendRangeControls: document.querySelector("#trendRangeControls"),
};

init();

async function init() {
  bindEvents();
  setDefaultCapturedAt();
  await loadProfiles();
  await loadRecords();
  renderAll();
}
function bindEvents() {
  els.createProfileButton.addEventListener(
    "click",
    createProfile
  );

  els.profileSelect.addEventListener(
    "change",
    async () => {
      activeProfileId =
        els.profileSelect.value || null;

      localStorage.setItem(
        "activeProfileId",
        activeProfileId || ""
      );

      recordsPage = 1;
      await loadRecords();
      renderAll();
    }
  );

  els.calculateButton.addEventListener(
    "click",
    calculateAndShowAverage
  );

  els.saveRecordButton.addEventListener(
    "click",
    saveCurrentRecord
  );

  els.clearUploadsButton.addEventListener(
  "click",
  clearUploads
);

  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener(
      "click",
      () => switchTab(button.dataset.tab)
    );
  });

  document
    .querySelectorAll(".metric-tab")
    .forEach((button) => {
      button.addEventListener("click", () => {
        currentChartMetric =
          button.dataset.chartMetric;

        document
          .querySelectorAll(".metric-tab")
          .forEach((item) =>
            item.classList.remove("active")
          );

        button.classList.add("active");
        renderChart();
      });
    });

  els.recordsPrevButton.addEventListener("click", () => {
    recordsPage = Math.max(1, recordsPage - 1);
    renderRecords();
  });

  els.recordsNextButton.addEventListener("click", () => {
    recordsPage += 1;
    renderRecords();
  });

  els.trendRangeControls.querySelectorAll("[data-trend-range]").forEach((button) => {
    button.addEventListener("click", () => {
      trendRange = button.dataset.trendRange;
      els.trendRangeControls.querySelectorAll("[data-trend-range]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      renderChart();
    });
  });
}

async function openDb() {
  return realtimeDb;
}

async function getAll(storeName) {
  const snapshot = await get(
    ref(realtimeDb, `${MYOPIA_ROOT}/${storeName}`)
  );

  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.val();

  return Object.entries(data).map(([id, value]) => ({
    id,
    ...value,
  }));
}

async function putItem(storeName, item) {
  if (!item.id) {
    item.id = crypto.randomUUID();
  }

  await set(
    ref(
      realtimeDb,
      `${MYOPIA_ROOT}/${storeName}/${item.id}`
    ),
    item
  );

  return item;
}

async function deleteItem(storeName, id) {
  await remove(
    ref(
      realtimeDb,
      `${MYOPIA_ROOT}/${storeName}/${id}`
    )
  );
}



async function loadRecords() {
  if (!activeProfileId) {
    records = [];
    return;
  }

  const allRecords = await getAll(STORE_RECORDS);

  records = allRecords
    .filter(
      record => record.profileId === activeProfileId
    )
    .sort((a, b) =>
      String(a.capturedAt || "")
        .localeCompare(
          String(b.capturedAt || "")
        )
    );
}
async function createProfile() {
  const name = els.profileNameInput.value.trim();

  if (!name) {
    alert("Please enter a profile name");
    els.profileNameInput.focus();
    return;
  }

  try {
    els.createProfileButton.disabled = true;
    els.createProfileButton.textContent = "Creating...";

    const profile = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
    };

    await putItem(STORE_PROFILES, profile);

    els.profileNameInput.value = "";
    activeProfileId = profile.id;

    localStorage.setItem("activeProfileId", activeProfileId);

    await loadProfiles();
    await loadRecords();

    renderAll();

  } catch (error) {
    console.error("Create profile failed:", error);
    alert(`Failed to create profile: ${error.message || error}`);
  } finally {
    els.createProfileButton.disabled = false;
    els.createProfileButton.textContent = "Create";
  }
}

function setDefaultCapturedAt() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  els.capturedAtInput.value = now.toISOString().slice(0, 16);
}

function setValue(values, sources, key, value, sourceLine) {
  if (!Number.isFinite(value)) return;
  values[key] = value;
  sources[key] = sourceLine;
}

function renderAll() {
  renderProfiles();
  renderUploads();
  renderRecords();
  renderChart();
}

function renderProfiles() {
  els.profileSelect.innerHTML = "";

  profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.name;
    option.selected = profile.id === activeProfileId;
    els.profileSelect.appendChild(option);
  });
}

function renderUploads() {
  els.uploadList.innerHTML = "";

  pendingReadings.forEach((reading) => {
    const node = els.readingTemplate.content.cloneNode(true);
    const card = node.querySelector(".reading-card");
    const title = node.querySelector("h3");
    const status = node.querySelector(".status-pill");
    const img = node.querySelector(".preview");
    const grid = node.querySelector(".metric-grid");
    const pre = node.querySelector("pre");

    title.textContent = reading.fileName;
    status.textContent = "Imported";

    if (reading.previewUrl) {
      img.src = reading.previewUrl;
      img.hidden = false;
    } else {
      img.hidden = true;
    }

    renderMetricInputs(grid);

    grid.querySelectorAll("input").forEach((input) => {
      const key = input.dataset.metric;
      if (Number.isFinite(reading.values[key])) {
        input.value = reading.values[key];
      }

      input.addEventListener("input", () => {
  const value = Number(input.value);

  if (Number.isFinite(value)) {
    reading.values[key] = value;
  } else {
    delete reading.values[key];
  }

  currentAverages = {};
  currentCounts = {};
  saveMode = "individual";
  updateAverageSummary();
});
    });

    pre.textContent = reading.text || "";
    els.uploadList.appendChild(card);
  });

  updateAverageSummary();
}

function assignBiometryGroup(values, sources, side, group, sourceLine) {
  const suffix = side === "Right" ? "Right" : "Left";

  const axial = group[0];
  const ct = group[1];
  const ad = group[2];
  const lt = group[3];
  const vt = group[4];

  setEditableValue(values, sources, `axial${suffix}`, axial, sourceLine);

  // Typical CT values are 450-700; do not force-fill obvious OCR errors such as 55.0 / 56.6.
  if (ct >= 450 && ct <= 700) {
    setEditableValue(values, sources, `cornealThickness${suffix}`, ct, sourceLine);
  }

  setEditableValue(values, sources, `anteriorChamberDepth${suffix}`, ad, sourceLine);
  setEditableValue(values, sources, `lensThickness${suffix}`, lt, sourceLine);
  setEditableValue(values, sources, `vitreousChamberLength${suffix}`, vt, sourceLine);
}

function extractOneBiometryGroup(nums) {
  const axial = nums.find((num) => num >= 20 && num <= 30);
  const ct = nums.find((num) => num >= 450 && num <= 700);
  const smallNums = nums.filter((num) => num >= 2.5 && num <= 5);
  const vtCandidates = nums.filter((num) => num >= 14 && num <= 20);

  if (axial == null && vtCandidates.length === 0) return null;

  return [
    axial ?? null,
    ct ?? null,
    smallNums[0] ?? null,
    smallNums[1] ?? null,
    vtCandidates.at(-1) ?? null,
  ];
}

function parseEditableKLine(line, nums, kPairs, values, sources) {
  // Ideal case: K1/K2 pairs for both eyes, 4 pairs total.
  if (kPairs.length >= 4) {
    const rightKappa = findKappaAfterPairs(nums, 0);
    const leftKappa = findKappaAfterPairs(nums, 1);

    setEditableValue(values, sources, "k1Right", kPairs[0], line);
    setEditableValue(values, sources, "k2Right", kPairs[1], line);
    setEditableValue(values, sources, "kappaRight", rightKappa, line);

    setEditableValue(values, sources, "k1Left", kPairs[2], line);
    setEditableValue(values, sources, "k2Left", kPairs[3], line);
    setEditableValue(values, sources, "kappaLeft", leftKappa, line);

    const alCrValues = nums.filter((num) => num >= 2.8 && num <= 3.5);
    setEditableValue(values, sources, "alCrRight", alCrValues[0], line);
    setEditableValue(values, sources, "alCrLeft", alCrValues[1], line);
    return;
  }

  // Single-eye data: fill the right eye first, then the left eye.
  const side = values.k1Right == null ? "Right" : "Left";
  const suffix = side === "Right" ? "Right" : "Left";

  setEditableValue(values, sources, `k1${suffix}`, kPairs[0], line);
  setEditableValue(values, sources, `k2${suffix}`, kPairs[1], line);

  const alCr = nums.find((num) => num >= 2.8 && num <= 3.5);
  setEditableValue(values, sources, `alCr${suffix}`, alCr, line);

  const possibleKappa = nums
    .filter((num) => num > 0 && num < 10)
    .at(-1);

  setEditableValue(values, sources, `kappa${suffix}`, possibleKappa, line);
}

function findKappaAfterPairs(nums, sideIndex) {
  const possible = nums.filter((num) => num > 0 && num < 10);

  // The first small decimal is usually right-eye kappa; the second is usually left-eye kappa.
  return possible[sideIndex] ?? null;
}

function setEditableValue(values, sources, key, value, sourceLine) {
  if (!Number.isFinite(value)) return;
  if (values[key] != null) return;

  values[key] = value;
  sources[key] = sourceLine;
}

function assignEditableValue(values, sources, key, value, sourceLine) {
  if (!Number.isFinite(value)) return;
  if (values[key] != null) return;

  values[key] = value;
  sources[key] = sourceLine;
}

function normalizeEditableOcrLine(line) {
  return String(line)
    .replace(/,/g, ".")
    .replace(/[|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function assignNextEyeValue(values, sources, rightKey, leftKey, value, sourceLine) {
  if (!Number.isFinite(value)) return;

  if (values[rightKey] == null) {
    values[rightKey] = value;
    sources[rightKey] = sourceLine;
    return;
  }

  if (values[leftKey] == null) {
    values[leftKey] = value;
    sources[leftKey] = sourceLine;
  }
}

function setValueIfEmpty(values, sources, key, value, sourceLine) {
  if (!Number.isFinite(value)) return;
  if (values[key] != null) return;

  values[key] = value;
  sources[key] = sourceLine;
}

function findNextNumericLine(lines, startIndex) {
  for (let i = startIndex; i < Math.min(lines.length, startIndex + 8); i += 1) {
    if (extractNumbers(lines[i]).length >= 2) {
      return lines[i];
    }
  }

  return "";
}

function extractNumbers(line) {
  return [...String(line).matchAll(/-?\d+(?:[.,]\d+)?/g)]
    .map((match) => Number(match[0].replace(",", ".")))
    .filter(Number.isFinite);
}

function renderMetricInputs(container) {
  container.innerHTML = `
    <table class="reading-table">
      <thead>
        <tr>
          <th>Metric</th>
          <th>Right Eye</th>
          <th>Left Eye</th>
          <th>Unit</th>
        </tr>
      </thead>
      <tbody>
        ${metricRows
          .map(
            (row) => `
              <tr>
                <td>${row.label}</td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    data-metric="${row.rightKey}"
                    placeholder="Enter value"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    data-metric="${row.leftKey}"
                    placeholder="Enter value"
                  />
                </td>
                <td>${row.unit}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function updateAverageSummary() {
  const hasAnyValue = pendingReadings.some((reading) =>
    Object.values(reading.values || {}).some(
      (value) => Number.isFinite(value)
    )
  );

  els.calculateButton.disabled = !hasAnyValue;
  els.saveRecordButton.disabled = !hasAnyValue;

  if (!hasAnyValue) {
    els.averageSummary.textContent = "No data imported yet";
    return;
  }

  if (saveMode === "average" && Object.keys(currentAverages).length > 0) {
    const summary = Object.entries(currentAverages)
      .map(([key, value]) => {
        const metric = metricDefs[key];
        const count = currentCounts[key] || 0;
        return `${metric.eye} ${metric.label}: ${formatMetricValue(value)} ${metric.unit}（n=${count}）`;
      })
      .join(" · ");

    els.averageSummary.textContent = `${summary}. Saving will create 1 averaged data point.`;
    return;
  }

  els.averageSummary.textContent =
    `Imported ${pendingReadings.length} measurements. Save now to create ${pendingReadings.length} data points, or calculate the average first to save 1 averaged data point.`;
}

function calculateAndShowAverage() {
  const averages = {};
  const counts = {};

  Object.keys(metricDefs).forEach((key) => {
    const values = pendingReadings
      .map((reading) => reading.values?.[key])
      .filter((value) => Number.isFinite(value));

    if (!values.length) return;

    averages[key] = values.reduce((sum, value) => sum + value, 0) / values.length;
    counts[key] = values.length;
  });

  currentAverages = averages;
  currentCounts = counts;
  saveMode = "average";
  updateAverageSummary();
}

function formatMetricValue(value) {
  return Number(value).toFixed(2);
}

async function saveCurrentRecord() {
  if (!activeProfileId) {
    alert("Please select a profile first");
    return;
  }

  if (!pendingReadings.length) {
    alert("There is no data to save");
    return;
  }

  const readingsWithTime = resolveMeasurementTimes(pendingReadings);

  if (saveMode === "average" && Object.keys(currentAverages).length > 0) {
    const timestamps = readingsWithTime
      .map((reading) => reading.resolvedTime?.getTime())
      .filter(Number.isFinite);

    const averageTimestamp = timestamps.length
      ? timestamps.reduce((sum, value) => sum + value, 0) / timestamps.length
      : Date.now();

    const record = {
      id: crypto.randomUUID(),
      profileId: activeProfileId,
      capturedAt: new Date(averageTimestamp).toISOString(),
      createdAt: new Date().toISOString(),
      averages: currentAverages,
      counts: currentCounts,
      type: "average",
      sourceCount: pendingReadings.length,
    };

    await putItem(STORE_RECORDS, record);
  } else {
    for (const reading of readingsWithTime) {
      const values = reading.values || {};
      if (!Object.keys(values).length) continue;

      const counts = {};
      Object.keys(values).forEach((key) => {
        if (Number.isFinite(values[key])) counts[key] = 1;
      });

      const record = {
        id: crypto.randomUUID(),
        profileId: activeProfileId,
        capturedAt: reading.resolvedTime.toISOString(),
        createdAt: new Date().toISOString(),
        averages: values,
        counts,
        type: "individual",
        measurementTime: reading.measurementTime || null,
      };

      await putItem(STORE_RECORDS, record);
    }
  }

  clearUploads();
  await loadRecords();
  renderAll();
  switchTab("trends");
}

function resolveMeasurementTimes(readings) {
  const result = readings.map((reading) => ({
    ...reading,
    resolvedTime: parseMeasurementTime(reading.measurementTime),
  }));

  const hasKnownTime = result.some((reading) => reading.resolvedTime);

  if (!hasKnownTime) {
    const base = new Date(els.capturedAtInput.value || Date.now());
    result.forEach((reading, index) => {
      reading.resolvedTime = new Date(base.getTime() + index * 1000);
    });
    return result;
  }

  result.forEach((reading, index) => {
    if (reading.resolvedTime) return;

    let nextKnownIndex = -1;
    for (let i = index + 1; i < result.length; i += 1) {
      if (result[i].resolvedTime) {
        nextKnownIndex = i;
        break;
      }
    }

    if (nextKnownIndex !== -1) {
      const base = result[nextKnownIndex].resolvedTime;
      reading.resolvedTime = new Date(
        base.getTime() - (nextKnownIndex - index) * 1000
      );
      return;
    }

    let previousKnownIndex = -1;
    for (let i = index - 1; i >= 0; i -= 1) {
      if (result[i].resolvedTime) {
        previousKnownIndex = i;
        break;
      }
    }

    const base = result[previousKnownIndex].resolvedTime;
    reading.resolvedTime = new Date(
      base.getTime() + (index - previousKnownIndex) * 1000
    );
  });

  return result;
}

function parseMeasurementTime(value) {
  if (!value) return null;
  const date = new Date(String(value).trim().replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

function clearUploads() {
  pendingReadings = [];
  currentAverages = {};
  currentCounts = {};
  saveMode = "individual";

  els.jsonInput.value = "";
  els.jsonFileInput.value = "";
  els.jsonFileName.textContent = "";
  selectedJsonFile = null;

  els.importStatus.textContent =
    "Paste JSON or choose a JSON file";

  renderUploads();
}

function renderRecords() {
  els.recordsList.innerHTML = "";

  if (!records.length) {
    els.recordsList.textContent =
      "No records for the current profile yet";
    els.recordsPagination.hidden = true;
    return;
  }

  const newestFirst = [...records].reverse();
  const pageData = paginateRecords(
    newestFirst,
    recordsPage,
    RECORDS_PER_PAGE
  );
  recordsPage = pageData.page;

  const table = document.createElement("table");
  table.className = "records-table";

  table.innerHTML = `
    <thead>
      <tr>
        <th>Measurement Time</th>
        <th>Metric</th>
        <th>Right Eye</th>
        <th>Left Eye</th>
        <th>Unit</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  pageData.items.forEach((record) => {
    metricRows.forEach((metric, index) => {
      const tr = document.createElement("tr");
      const right = record.averages?.[metric.rightKey];
      const left = record.averages?.[metric.leftKey];

      tr.innerHTML = `
        ${
          index === 0
            ? `
              <td rowspan="${metricRows.length}" class="record-date-cell">
                ${new Date(record.capturedAt).toLocaleString()}
              </td>
            `
            : ""
        }
        <td>${metric.label}</td>
        <td>${Number.isFinite(right) ? formatMetricValue(right) : "-"}</td>
        <td>${Number.isFinite(left) ? formatMetricValue(left) : "-"}</td>
        <td>${metric.unit}</td>
      `;

      tbody.appendChild(tr);
    });
  });

  els.recordsList.appendChild(table);
  els.recordsPagination.hidden = false;
  els.recordsPageInfo.textContent =
    `Showing ${pageData.startNumber}-${pageData.endNumber} of ${pageData.total} records`;
  els.recordsPageNumber.textContent =
    `Page ${pageData.page} of ${pageData.totalPages}`;
  els.recordsPrevButton.disabled = pageData.page <= 1;
  els.recordsNextButton.disabled = pageData.page >= pageData.totalPages;
}

function renderChart() {
  const canvas = els.trendCanvas;
  if (!canvas || typeof Chart === "undefined") return;

  if (chart) {
    chart.destroy();
    chart = null;
  }

  const existingChart = Chart.getChart(canvas);
  if (existingChart) existingChart.destroy();

  const rightKey = `${currentChartMetric}Right`;
  const leftKey = `${currentChartMetric}Left`;
  const metricLabel =
    metricDefs[rightKey]?.label ||
    metricDefs[leftKey]?.label ||
    currentChartMetric;

  // Keep every measurement as a raw data point. The selected range only
  // filters time; longer ranges reduce visual density through smaller points
  // and fewer x-axis labels, never by merging measurements.
  const trendRecords = filterTrendRecords(records, trendRange);
  const density = getTrendDensity(trendRange, trendRecords.length);

  els.emptyTrendMessage.hidden = trendRecords.length > 0;
  canvas.parentElement.hidden = trendRecords.length === 0;
  if (!trendRecords.length) return;

  const labels = trendRecords.map((record) => {
    const date = new Date(record.capturedAt || record.date);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: trendRange === "12m" || trendRange === "year" ? "numeric" : undefined,
      year: "numeric",
    });
  });

  chart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: `${metricLabel} Right Eye`,
          data: trendRecords.map(record => record.averages?.[rightKey] ?? null),
          borderColor: "#4f9bb5",
          backgroundColor: "rgba(79, 155, 181, 0.10)",
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#4f9bb5",
          pointBorderWidth: 2,
          borderWidth: 3,
          tension: 0.35,
          spanGaps: true,
          pointRadius: density.pointRadius,
          pointHoverRadius: density.pointHoverRadius,
        },
        {
          label: `${metricLabel} Left Eye`,
          data: trendRecords.map(record => record.averages?.[leftKey] ?? null),
          borderColor: "#8a55cc",
          backgroundColor: "rgba(138, 85, 204, 0.10)",
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#8a55cc",
          pointBorderWidth: 2,
          borderWidth: 3,
          tension: 0.35,
          spanGaps: true,
          pointRadius: density.pointRadius,
          pointHoverRadius: density.pointHoverRadius,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "nearest",
        intersect: false,
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            autoSkip: true,
            maxTicksLimit: density.maxTicksLimit,
            maxRotation: 0,
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            title(items) {
              const index = items[0]?.dataIndex;
              if (index == null) return "";
              return new Date(
                trendRecords[index].capturedAt || trendRecords[index].date
              ).toLocaleString();
            },
          },
        },
      },
    },
  });
}

function switchTab(tabName) {
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `${tabName}Tab`);
  });

  if (tabName === "trends") renderChart();
}



function eyeJsonToValues(record) {
  const values = {};

  mapEye(record.right_eye, "Right", values);
  mapEye(record.left_eye, "Left", values);

  return values;
}

function mapEye(eye, suffix, values) {
  if (!eye) {
    return;
  }

  setIfNumber(values, `axial${suffix}`, eye.AL);
  setIfNumber(values, `cornealThickness${suffix}`, eye.CT);
  setIfNumber(values, `anteriorChamberDepth${suffix}`, eye.AD);
  setIfNumber(values, `lensThickness${suffix}`, eye.LT);
  setIfNumber(values, `vitreousChamberLength${suffix}`, eye.VT);

  setIfNumber(values, `alCr${suffix}`, eye.AL_CR);

  if (eye.K1) {
    setIfNumber(values, `k1${suffix}`, eye.K1.value);
    setIfNumber(values, `k1Axis${suffix}`, eye.K1.axis);
  }

  if (eye.K2) {
    setIfNumber(values, `k2${suffix}`, eye.K2.value);
    setIfNumber(values, `k2Axis${suffix}`, eye.K2.axis);
  }

  setIfNumber(values, `kappa${suffix}`, eye.Kappa);
}

function setIfNumber(target, key, value) {
  if (value === null || value === undefined || value === "") return;
  const number = Number(value);

  if (Number.isFinite(number)) {
    target[key] = number;
  }
}

function importMeasurementJson(json) {
  if (!Array.isArray(json)) {
    throw new Error("The top-level JSON value must be an array");
  }

  const imported = [];

  json.forEach((record, index) => {
    if (!record || typeof record !== "object") {
      throw new Error(`Record ${index + 1} has an invalid format`);
    }

    if (!record.right_eye && !record.left_eye) {
      return;
    }

    imported.push({
      id: crypto.randomUUID(),

      fileName:
        record.measurement_time ||
        `JSON record ${index + 1}`,

      file: null,
      previewUrl: "",

      status: "review",

      text: record.note || "",

      values: eyeJsonToValues(record),

      sources: {},

      measurementTime: record.measurement_time || null
    });
  });

  if (imported.length === 0) {
    throw new Error("No valid eye measurements were found in the JSON");
  }

  pendingReadings.push(...imported);
  currentAverages = {};
  currentCounts = {};
  saveMode = "individual";

  const firstMeasurementTime =
  imported.find(item => item.measurementTime)?.measurementTime;

if (firstMeasurementTime) {
  els.capturedAtInput.value =
    measurementTimeToLocalInput(firstMeasurementTime);
}

  els.importStatus.textContent =
    `Imported ${imported.length} records successfully`;

  renderUploads();
}


let selectedJsonFile = null;

els.chooseJsonButton.addEventListener("click", () => {
  els.jsonFileInput.click();
});

els.jsonFileInput.addEventListener("change", () => {
  selectedJsonFile =
    els.jsonFileInput.files?.[0] || null;

  els.jsonFileName.textContent =
    selectedJsonFile?.name || "";
});

els.importJsonButton.addEventListener("click", async () => {
  try {
    let text = els.jsonInput.value.trim();

    if (!text && selectedJsonFile) {
      text = await selectedJsonFile.text();
    }

    if (!text) {
      throw new Error("Paste JSON or choose a JSON file");
    }

    console.log("JSON length:", text.length);
console.log("First 20 chars:", JSON.stringify(text.slice(0, 20)));
console.log("Last 20 chars:", JSON.stringify(text.slice(-20)));

    const json = JSON.parse(text);

    importMeasurementJson(json);

    els.jsonInput.value = "";
    els.jsonFileInput.value = "";
    els.jsonFileName.textContent = "";
    selectedJsonFile = null;

  } catch (error) {
    console.error(error);

    els.importStatus.textContent =
      `Import failed: ${error.message}`;
  }
});

async function loadProfiles() {
  profiles = await getAll(STORE_PROFILES);

  const savedActive =
    localStorage.getItem("activeProfileId");

  if (
    savedActive &&
    profiles.some(profile => profile.id === savedActive)
  ) {
    activeProfileId = savedActive;
  } else {
    activeProfileId = profiles[0]?.id || null;
  }
}

function measurementTimeToLocalInput(value) {
  if (!value) return "";

  // "2026-06-03 11:46:08" -> "2026-06-03T11:46"
  return String(value)
    .trim()
    .replace(" ", "T")
    .slice(0, 16);
}