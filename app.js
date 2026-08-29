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

const metricDefs = {
  axialRight: { label: "AL 眼轴", eye: "右眼", unit: "mm" },
  axialLeft: { label: "AL 眼轴", eye: "左眼", unit: "mm" },

  cornealThicknessRight: { label: "CT 角膜厚度", eye: "右眼", unit: "um" },
  cornealThicknessLeft: { label: "CT 角膜厚度", eye: "左眼", unit: "um" },

  anteriorChamberDepthRight: { label: "AD 前房深度", eye: "右眼", unit: "mm" },
  anteriorChamberDepthLeft: { label: "AD 前房深度", eye: "左眼", unit: "mm" },

  lensThicknessRight: { label: "LT 晶状体厚度", eye: "右眼", unit: "mm" },
  lensThicknessLeft: { label: "LT 晶状体厚度", eye: "左眼", unit: "mm" },

  vitreousChamberLengthRight: { label: "VT 玻璃体腔长度", eye: "右眼", unit: "mm" },
  vitreousChamberLengthLeft: { label: "VT 玻璃体腔长度", eye: "左眼", unit: "mm" },

  alCrRight: { label: "AL/CR", eye: "右眼", unit: "" },
  alCrLeft: { label: "AL/CR", eye: "左眼", unit: "" },

  k1Right: { label: "K1", eye: "右眼", unit: "D" },
  k1Left: { label: "K1", eye: "左眼", unit: "D" },

  k2Right: { label: "K2", eye: "右眼", unit: "D" },
  k2Left: { label: "K2", eye: "左眼", unit: "D" },

  kappaRight: { label: "Kappa", eye: "右眼", unit: "" },
  kappaLeft: { label: "Kappa", eye: "左眼", unit: "" },
};

const metricRows = [
  {
    label: "AL 眼轴",
    unit: "mm",
    rightKey: "axialRight",
    leftKey: "axialLeft",
  },
  {
    label: "CT 角膜厚度",
    unit: "um",
    rightKey: "cornealThicknessRight",
    leftKey: "cornealThicknessLeft",
  },
  {
    label: "AD 前房深度",
    unit: "mm",
    rightKey: "anteriorChamberDepthRight",
    leftKey: "anteriorChamberDepthLeft",
  },
  {
    label: "LT 晶状体厚度",
    unit: "mm",
    rightKey: "lensThicknessRight",
    leftKey: "lensThicknessLeft",
  },
  {
    label: "VT 玻璃体腔长度",
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
  saveRecordButton: document.querySelector("#saveRecordButton"),
  readingTemplate: document.querySelector("#readingTemplate"),
  recordsList: document.querySelector("#recordsList"),
  emptyTrendMessage: document.querySelector("#emptyTrendMessage"),
  trendCanvas: document.querySelector("#trendCanvas"),
  clearUploadsButton: document.querySelector("#clearUploadsButton"),
  calculateButton: document.querySelector("#calculateButton"),
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
    alert("请输入新用户名字");
    els.profileNameInput.focus();
    return;
  }

  try {
    els.createProfileButton.disabled = true;
    els.createProfileButton.textContent = "创建中...";

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
    alert(`创建用户失败：${error.message || error}`);
  } finally {
    els.createProfileButton.disabled = false;
    els.createProfileButton.textContent = "创建";
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
    status.textContent = "已导入";

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

  // 数据改过以后，之前计算的平均值失效
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

  // CT 正常是 450-700；如果 OCR 读成 55.0 / 56.6，不要强行填
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
  // 理想情况：左右眼各有 K1/K2，共 4 个 pair
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

  // 一边数据：先填右眼，再填左眼
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

  // 右眼通常是第一个小数 kappa，左眼通常是第二个
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
          <th>项目</th>
          <th>右眼</th>
          <th>左眼</th>
          <th>单位</th>
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
                    placeholder="待填写"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    data-metric="${row.leftKey}"
                    placeholder="待填写"
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

function calculateAndShowAverage() {
  const averages = {};
  const counts = {};

  Object.keys(metricDefs).forEach((key) => {
    const values = pendingReadings
      .map((reading) => reading.values?.[key])
      .filter((value) => Number.isFinite(value));

    if (!values.length) {
      return;
    }

    averages[key] =
      values.reduce(
        (sum, value) => sum + value,
        0
      ) / values.length;

    counts[key] = values.length;
  });

  currentAverages = averages;
  currentCounts = counts;

  saveMode = "average";

  updateAverageSummary();
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
    els.averageSummary.textContent = "还没有导入数据";
    return;
  }

  if (
    saveMode === "average" &&
    Object.keys(currentAverages).length > 0
  ) {
    els.averageSummary.textContent =
      Object.entries(currentAverages)
        .map(([key, value]) => {
          const metric = metricDefs[key];
          const count = currentCounts[key] || 0;

          return `${metric.eye} ${metric.label}: ${formatMetricValue(value)} ${metric.unit}（n=${count}）`;
        })
        .join(" · ");

    return;
  }

  els.averageSummary.textContent =
    `已导入 ${pendingReadings.length} 条测量记录。直接保存将生成 ${pendingReadings.length} 个 data points；点击“计算平均值”后保存将生成 1 个 data point。`;
}


function formatMetricValue(value) {
  return Number(value).toFixed(2);
}

async function saveCurrentRecord() {
  if (!activeProfileId) {
    alert("请先选择用户");
    return;
  }

  if (!pendingReadings.length) {
    alert("没有可保存的数据");
    return;
  }

  /*
   * Mode 1:
   * 保存平均值 → 一个 data point
   */
  if (
    saveMode === "average" &&
    Object.keys(currentAverages).length > 0
  ) {
    const measurementTimes = pendingReadings
      .map((reading) => reading.measurementTime)
      .filter(Boolean)
      .map((value) =>
        new Date(value.replace(" ", "T"))
      )
      .filter((date) => !Number.isNaN(date.getTime()));

    let capturedAt;

    if (measurementTimes.length) {
      // 平均 data point 的时间：
      // 使用这批 measurement 的平均时间
      const averageTimestamp =
        measurementTimes.reduce(
          (sum, date) => sum + date.getTime(),
          0
        ) / measurementTimes.length;

      capturedAt =
        new Date(averageTimestamp).toISOString();
    } else {
      capturedAt =
        new Date(
          els.capturedAtInput.value || Date.now()
        ).toISOString();
    }

    const record = {
      id: crypto.randomUUID(),

      profileId: activeProfileId,

      capturedAt,

      createdAt: new Date().toISOString(),

      averages: currentAverages,

      counts: currentCounts,

      type: "average",

      sourceCount: pendingReadings.length,
    };

    await putItem(
      STORE_RECORDS,
      record
    );
  }

  /*
   * Mode 2:
   * 不计算平均值 → 每条 measurement 一个 data point
   */
  else {
    const readingsWithTime =
      resolveMeasurementTimes(pendingReadings);

    for (const reading of readingsWithTime) {
      const values =
        reading.values || {};

      if (!Object.keys(values).length) {
        continue;
      }

      const counts = {};

      Object.keys(values).forEach((key) => {
        if (Number.isFinite(values[key])) {
          counts[key] = 1;
        }
      });

      const record = {
        id: crypto.randomUUID(),

        profileId: activeProfileId,

        capturedAt:
          reading.resolvedTime.toISOString(),

        createdAt:
          new Date().toISOString(),

        averages: values,

        counts,

        type: "individual",

        measurementTime:
          reading.measurementTime || null,
      };

      await putItem(
        STORE_RECORDS,
        record
      );
    }
  }

  clearUploads();

  await loadRecords();

  renderAll();

  switchTab("trends");
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
    "粘贴 JSON 或选择 JSON 文件";

  renderUploads();
}

function renderRecords() {
  els.recordsList.innerHTML = "";

  if (!records.length) {
    els.recordsList.textContent =
      "当前用户还没有记录";
    return;
  }

  const table = document.createElement("table");
  table.className = "records-table";

  table.innerHTML = `
    <thead>
      <tr>
        <th>检查时间</th>
        <th>项目</th>
        <th>右眼</th>
        <th>左眼</th>
        <th>单位</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody =
    table.querySelector("tbody");

  records.forEach((record) => {
    metricRows.forEach((metric, index) => {
      const tr =
        document.createElement("tr");

      const right =
        record.averages?.[metric.rightKey];

      const left =
        record.averages?.[metric.leftKey];

      tr.innerHTML = `
        ${
          index === 0
            ? `
              <td rowspan="${metricRows.length}">
                ${new Date(
                  record.capturedAt
                ).toLocaleString()}
              </td>
            `
            : ""
        }

        <td>${metric.label}</td>

        <td>
          ${
            Number.isFinite(right)
              ? formatMetricValue(right)
              : "-"
          }
        </td>

        <td>
          ${
            Number.isFinite(left)
              ? formatMetricValue(left)
              : "-"
          }
        </td>

        <td>${metric.unit}</td>
      `;

      tbody.appendChild(tr);
    });
  });

  els.recordsList.appendChild(table);
}

function renderChart() {
  const canvas = els.trendCanvas;
  if (!canvas || typeof Chart === "undefined") return;

  if (chart) {
    chart.destroy();
    chart = null;
  }

  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy();
  }

  const rightKey = `${currentChartMetric}Right`;
  const leftKey = `${currentChartMetric}Left`;

  const metricLabel =
    metricDefs[rightKey]?.label || 
    metricDefs[leftKey]?.label ||
    currentChartMetric;

  els.emptyTrendMessage.hidden = records.length > 0;

  chart = new Chart(canvas, {
    type: "line",
    data: {
      labels: records.map((record) =>
        new Date(record.capturedAt || record.date).toLocaleDateString()
      ),
      datasets: [
        {
          label: `${metricLabel} 右眼`,
          data: records.map(record => record.averages?.[rightKey] ?? null),
          tension: 0.3,
          spanGaps: true,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        {
          label: `${metricLabel} 左眼`,
          data: records.map(record => record.averages?.[leftKey] ?? null),
          tension: 0.3,
          spanGaps: true,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
  const number = Number(value);

  if (Number.isFinite(number)) {
    target[key] = number;
  }
}

function importMeasurementJson(json) {
  if (!Array.isArray(json)) {
    throw new Error("JSON 顶层必须是一个 array");
  }

  const imported = [];

  json.forEach((record, index) => {
    if (!record || typeof record !== "object") {
      throw new Error(`第 ${index + 1} 条 record 格式错误`);
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
    throw new Error("JSON 中没有有效的眼部测量记录");
  }

  pendingReadings.push(...imported);

  const firstMeasurementTime =
  imported.find(item => item.measurementTime)?.measurementTime;

if (firstMeasurementTime) {
  els.capturedAtInput.value =
    measurementTimeToLocalInput(firstMeasurementTime);
}

  els.importStatus.textContent =
    `成功导入 ${imported.length} 条记录`;

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
      throw new Error("请粘贴 JSON 或选择 JSON 文件");
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
      `导入失败: ${error.message}`;
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

function resolveMeasurementTimes(readings) {
  const result = readings.map((reading) => ({
    ...reading,
    resolvedTime: null,
  }));

  // 先填已有时间
  result.forEach((reading) => {
    if (reading.measurementTime) {
      const normalized =
        reading.measurementTime.replace(" ", "T");

      reading.resolvedTime =
        new Date(normalized);
    }
  });

  // 再给 null 时间补值
  result.forEach((reading, index) => {
    if (reading.resolvedTime) return;

    // 优先找后面的已知时间
    let nextKnownIndex = -1;

    for (let i = index + 1; i < result.length; i++) {
      if (result[i].resolvedTime) {
        nextKnownIndex = i;
        break;
      }
    }

    if (nextKnownIndex !== -1) {
      const base =
        result[nextKnownIndex].resolvedTime;

      reading.resolvedTime =
        new Date(
          base.getTime() -
          (nextKnownIndex - index) * 1000
        );

      return;
    }

    // 如果后面没有，再找前面的已知时间
    let previousKnownIndex = -1;

    for (let i = index - 1; i >= 0; i--) {
      if (result[i].resolvedTime) {
        previousKnownIndex = i;
        break;
      }
    }

    if (previousKnownIndex !== -1) {
      const base =
        result[previousKnownIndex].resolvedTime;

      reading.resolvedTime =
        new Date(
          base.getTime() +
          (index - previousKnownIndex) * 1000
        );

      return;
    }

    // 整批都没有 measurement_time 时
    reading.resolvedTime =
      new Date(els.capturedAtInput.value || Date.now());
  });

  return result;
}