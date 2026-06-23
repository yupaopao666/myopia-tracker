const DB_NAME = "myopia-tracker-db";
const DB_VERSION = 1;
const STORE_PROFILES = "profiles";
const STORE_RECORDS = "records";

const metricDefs = {
  axialRight: {
    label: "右眼眼轴",
    unit: "mm",
    decimals: 2,
    group: "axial",
    side: "right",
    placeholder: "24.42",
  },
  axialLeft: {
    label: "左眼眼轴",
    unit: "mm",
    decimals: 2,
    group: "axial",
    side: "left",
    placeholder: "24.41",
  },
  refractionRight: {
    label: "右眼屈光",
    unit: "D",
    decimals: 2,
    group: "refraction",
    side: "right",
    placeholder: "-2.00",
  },
  refractionLeft: {
    label: "左眼屈光",
    unit: "D",
    decimals: 2,
    group: "refraction",
    side: "left",
    placeholder: "-2.25",
  },
  axialVelocityRight: {
    label: "右眼眼轴速度",
    unit: "mm/年",
    decimals: 2,
    group: "axialVelocity",
    side: "right",
    placeholder: "0.20",
  },
  axialVelocityLeft: {
    label: "左眼眼轴速度",
    unit: "mm/年",
    decimals: 2,
    group: "axialVelocity",
    side: "left",
    placeholder: "0.18",
  },
  refractionVelocityRight: {
    label: "右眼屈光速度",
    unit: "D/年",
    decimals: 2,
    group: "refractionVelocity",
    side: "right",
    placeholder: "-0.50",
  },
  refractionVelocityLeft: {
    label: "左眼屈光速度",
    unit: "D/年",
    decimals: 2,
    group: "refractionVelocity",
    side: "left",
    placeholder: "-0.50",
  },
  cornealThicknessRight: {
    label: "右眼 CT角膜厚度",
    unit: "um",
    decimals: 0,
    group: "cornealThickness",
    side: "right",
    placeholder: "550",
  },
  cornealThicknessLeft: {
    label: "左眼 CT角膜厚度",
    unit: "um",
    decimals: 0,
    group: "cornealThickness",
    side: "left",
    placeholder: "548",
  },
  anteriorChamberDepthRight: {
    label: "右眼 AD前房深度",
    unit: "mm",
    decimals: 2,
    group: "anteriorChamberDepth",
    side: "right",
    placeholder: "3.45",
  },
  anteriorChamberDepthLeft: {
    label: "左眼 AD前房深度",
    unit: "mm",
    decimals: 2,
    group: "anteriorChamberDepth",
    side: "left",
    placeholder: "3.44",
  },
  lensThicknessRight: {
    label: "右眼 LT晶状体厚度",
    unit: "mm",
    decimals: 2,
    group: "lensThickness",
    side: "right",
    placeholder: "3.60",
  },
  lensThicknessLeft: {
    label: "左眼 LT晶状体厚度",
    unit: "mm",
    decimals: 2,
    group: "lensThickness",
    side: "left",
    placeholder: "3.58",
  },
  vitreousChamberLengthRight: {
    label: "右眼 VT玻璃体腔长度",
    unit: "mm",
    decimals: 2,
    group: "vitreousChamberLength",
    side: "right",
    placeholder: "17.20",
  },
  vitreousChamberLengthLeft: {
    label: "左眼 VT玻璃体腔长度",
    unit: "mm",
    decimals: 2,
    group: "vitreousChamberLength",
    side: "left",
    placeholder: "17.18",
  },
  k1Right: {
    label: "右眼 K1",
    unit: "D",
    decimals: 2,
    group: "k1",
    side: "right",
    placeholder: "43.00",
  },
  k1Left: {
    label: "左眼 K1",
    unit: "D",
    decimals: 2,
    group: "k1",
    side: "left",
    placeholder: "43.10",
  },
  k2Right: {
    label: "右眼 K2",
    unit: "D",
    decimals: 2,
    group: "k2",
    side: "right",
    placeholder: "44.20",
  },
  k2Left: {
    label: "左眼 K2",
    unit: "D",
    decimals: 2,
    group: "k2",
    side: "left",
    placeholder: "44.15",
  },
};

const metricOrder = Object.keys(metricDefs);

const trendGroups = {
  axial: {
    label: "眼轴",
    unit: "mm",
    rightKey: "axialRight",
    leftKey: "axialLeft",
    decimals: 2,
  },
  refraction: {
    label: "屈光",
    unit: "D",
    rightKey: "refractionRight",
    leftKey: "refractionLeft",
    decimals: 2,
  },
  axialVelocity: {
    label: "眼轴速度",
    unit: "mm/年",
    rightKey: "axialVelocityRight",
    leftKey: "axialVelocityLeft",
    decimals: 2,
  },
  refractionVelocity: {
    label: "屈光速度",
    unit: "D/年",
    rightKey: "refractionVelocityRight",
    leftKey: "refractionVelocityLeft",
    decimals: 2,
  },
  cornealThickness: {
    label: "CT角膜厚度",
    unit: "um",
    rightKey: "cornealThicknessRight",
    leftKey: "cornealThicknessLeft",
    decimals: 0,
  },
  anteriorChamberDepth: {
    label: "AD前房深度",
    unit: "mm",
    rightKey: "anteriorChamberDepthRight",
    leftKey: "anteriorChamberDepthLeft",
    decimals: 2,
  },
  lensThickness: {
    label: "LT晶状体厚度",
    unit: "mm",
    rightKey: "lensThicknessRight",
    leftKey: "lensThicknessLeft",
    decimals: 2,
  },
  vitreousChamberLength: {
    label: "VT玻璃体腔长度",
    unit: "mm",
    rightKey: "vitreousChamberLengthRight",
    leftKey: "vitreousChamberLengthLeft",
    decimals: 2,
  },
  k1: {
    label: "K1",
    unit: "D",
    rightKey: "k1Right",
    leftKey: "k1Left",
    decimals: 2,
  },
  k2: {
    label: "K2",
    unit: "D",
    rightKey: "k2Right",
    leftKey: "k2Left",
    decimals: 2,
  },
};

const colors = {
  right: "#2e8798",
  left: "#7b2cc5",
  grid: "#dfe7e6",
  text: "#172326",
  muted: "#637173",
};

let db;
let profiles = [];
let activeProfileId = null;
let records = [];
let pendingReadings = [];
let activeTrend = "axial";
let deferredInstallPrompt = null;

const els = {
  profileSelect: document.querySelector("#profileSelect"),
  newProfileForm: document.querySelector("#newProfileForm"),
  newProfileName: document.querySelector("#newProfileName"),
  capturedAtInput: document.querySelector("#capturedAtInput"),
  imageInput: document.querySelector("#imageInput"),
  analyzeButton: document.querySelector("#analyzeButton"),
  clearUploadButton: document.querySelector("#clearUploadButton"),
  addManualReadingButton: document.querySelector("#addManualReadingButton"),
  ocrStatus: document.querySelector("#ocrStatus"),
  readingList: document.querySelector("#readingList"),
  readingTemplate: document.querySelector("#readingCardTemplate"),
  savePanel: document.querySelector("#savePanel"),
  averageSummary: document.querySelector("#averageSummary"),
  saveRecordButton: document.querySelector("#saveRecordButton"),
  metricSwitcher: document.querySelector("#metricSwitcher"),
  trendCanvas: document.querySelector("#trendCanvas"),
  chartEmptyState: document.querySelector("#chartEmptyState"),
  trendStats: document.querySelector("#trendStats"),
  recordList: document.querySelector("#recordList"),
  exportButton: document.querySelector("#exportButton"),
  importInput: document.querySelector("#importInput"),
  deleteProfileButton: document.querySelector("#deleteProfileButton"),
  installButton: document.querySelector("#installButton"),
};

init();

async function init() {
  db = await openDatabase();
  await ensureDefaultProfile();
  await refreshProfiles();
  setDefaultCapturedAt();
  bindEvents();
  await loadRecords();
  renderAll();
  registerServiceWorker();
}

function bindEvents() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  els.profileSelect.addEventListener("change", async () => {
    activeProfileId = els.profileSelect.value;
    localStorage.setItem("myopia-active-profile-id", activeProfileId);
    clearUploads();
    await loadRecords();
    renderAll();
  });

  els.newProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = els.newProfileName.value.trim();
    if (!name) return;
    const profile = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
    };
    await putItem(STORE_PROFILES, profile);
    activeProfileId = profile.id;
    localStorage.setItem("myopia-active-profile-id", activeProfileId);
    els.newProfileName.value = "";
    await refreshProfiles();
    await loadRecords();
    renderAll();
  });

  els.imageInput.addEventListener("change", () => {
    addFiles(Array.from(els.imageInput.files || []));
    els.imageInput.value = "";
  });

  els.analyzeButton.addEventListener("click", analyzePendingImages);
  els.clearUploadButton.addEventListener("click", clearUploads);
  els.addManualReadingButton.addEventListener("click", addManualReading);
  els.saveRecordButton.addEventListener("click", saveCurrentRecord);

  els.metricSwitcher.addEventListener("click", (event) => {
    const button = event.target.closest(".metric-button");
    if (!button) return;
    activeTrend = button.dataset.metric;
    document.querySelectorAll(".metric-button").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    renderTrend();
  });

  els.exportButton.addEventListener("click", exportData);
  els.importInput.addEventListener("change", importData);
  els.deleteProfileButton.addEventListener("click", deleteActiveProfile);

  window.addEventListener("resize", () => renderTrend());
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    els.installButton.hidden = false;
  });
  els.installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    els.installButton.hidden = true;
  });
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_PROFILES)) {
        database.createObjectStore(STORE_PROFILES, { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains(STORE_RECORDS)) {
        const store = database.createObjectStore(STORE_RECORDS, { keyPath: "id" });
        store.createIndex("profileId", "profileId", { unique: false });
        store.createIndex("capturedAt", "capturedAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getStore(storeName, mode = "readonly") {
  return db.transaction(storeName, mode).objectStore(storeName);
}

function getAll(storeName) {
  return new Promise((resolve, reject) => {
    const request = getStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function putItem(storeName, item) {
  return new Promise((resolve, reject) => {
    const request = getStore(storeName, "readwrite").put(item);
    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
}

function deleteItem(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = getStore(storeName, "readwrite").delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function ensureDefaultProfile() {
  const existing = await getAll(STORE_PROFILES);
  if (existing.length > 0) return;
  await putItem(STORE_PROFILES, {
    id: crypto.randomUUID(),
    name: "Default",
    createdAt: new Date().toISOString(),
  });
}

async function refreshProfiles() {
  profiles = (await getAll(STORE_PROFILES)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const remembered = localStorage.getItem("myopia-active-profile-id");
  activeProfileId = profiles.some((profile) => profile.id === remembered) ? remembered : profiles[0]?.id;
  if (activeProfileId) {
    localStorage.setItem("myopia-active-profile-id", activeProfileId);
  }
}

async function loadRecords() {
  const allRecords = await getAll(STORE_RECORDS);
  records = allRecords
    .filter((record) => record.profileId === activeProfileId)
    .sort((a, b) => new Date(a.capturedAt) - new Date(b.capturedAt));
}

function renderAll() {
  renderProfiles();
  renderUploads();
  renderTrend();
  renderRecords();
}

function renderProfiles() {
  els.profileSelect.innerHTML = "";
  profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.name;
    option.selected = profile.id === activeProfileId;
    els.profileSelect.append(option);
  });
}

function switchTab(tab) {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === tab);
  });
  if (tab === "trends") renderTrend();
}

function setDefaultCapturedAt() {
  els.capturedAtInput.value = toDatetimeLocal(new Date());
}

function toDatetimeLocal(date) {
  const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return copy.toISOString().slice(0, 16);
}

function addFiles(files) {
  files
    .filter((file) => file.type.startsWith("image/"))
    .forEach((file) => {
      pendingReadings.push({
        id: crypto.randomUUID(),
        fileName: file.name,
        file,
        previewUrl: URL.createObjectURL(file),
        status: "new",
        text: "",
        values: {},
      });
    });
  renderUploads();
}

function addManualReading() {
  pendingReadings.push({
    id: crypto.randomUUID(),
    fileName: `手动录入 ${pendingReadings.length + 1}`,
    file: null,
    previewUrl: "",
    status: "manual",
    text: "手动录入",
    values: {},
    sources: {},
  });
  renderUploads();
}

function clearUploads() {
  const previewUrls = new Set(
    pendingReadings
      .map((reading) => reading.previewUrl)
      .filter(Boolean),
  );

  previewUrls.forEach((previewUrl) => {
    URL.revokeObjectURL(previewUrl);
  });

  pendingReadings = [];
  els.ocrStatus.textContent = "等待上传图片";
  renderUploads();
}

function renderUploads() {
  els.readingList.innerHTML = "";
  pendingReadings.forEach((reading, index) => {
    const node = els.readingTemplate.content.firstElementChild.cloneNode(true);
    const image = node.querySelector(".reading-preview");
    const heading = node.querySelector("h3");
    const badge = node.querySelector(".badge");
    const text = node.querySelector("pre");

    heading.textContent = reading.fileName || `图片 ${index + 1}`;
    badge.textContent = getReadingStatusLabel(reading.status);
    badge.className = `badge ${reading.status === "done" || reading.status === "manual" ? "done" : ""} ${
      reading.status === "failed" ? "warn" : ""
    }`;
    text.textContent = formatReadingTrace(reading);

    if (reading.previewUrl) {
      image.src = reading.previewUrl;
    } else {
      image.remove();
      node.querySelector(".reading-media").textContent = "手动录入";
    }

    renderMetricInputs(node.querySelector(".reading-fields"));
    node.querySelectorAll("input[data-metric]").forEach((input) => {
      const key = input.dataset.metric;
      const value = reading.values[key];
      input.value = Number.isFinite(value) ? formatNumber(value, metricDefs[key].decimals) : "";
      input.addEventListener("input", () => {
        reading.values[key] = parseUserNumber(input.value);
        updateAverageSummary();
      });
    });

    els.readingList.append(node);
  });

  const hasReadings = pendingReadings.length > 0;
  els.analyzeButton.disabled = !pendingReadings.some((reading) => reading.file);
  els.clearUploadButton.disabled = !hasReadings;
  els.savePanel.hidden = !hasReadings;
  updateAverageSummary();
}

function renderMetricInputs(container) {
  container.innerHTML = metricOrder
    .map((key) => {
      const metric = metricDefs[key];

      return `
        <label>
          <span>${metric.label} ${metric.unit}</span>
          <input
            type="number"
            step="0.01"
            data-metric="${key}"
            placeholder="待识别"
          />
        </label>
      `;
    })
    .join("");
}

function getReadingStatusLabel(status) {
  if (status === "processing") return "识别中";
  if (status === "done") return "已识别";
  if (status === "manual") return "手动";
  if (status === "failed") return "需手动";
  return "待分析";
}

async function analyzePendingImages() {
  if (!pendingReadings.some((reading) => reading.file)) return;

  els.analyzeButton.disabled = true;
  els.ocrStatus.textContent = "正在加载 OCR";

  try {
    await ensureTesseract();
  } catch (error) {
    els.ocrStatus.textContent = "OCR 加载失败，可以先手动录入";
    pendingReadings.forEach((reading) => {
      if (reading.file && reading.status === "new") reading.status = "failed";
    });
    renderUploads();
    return;
  }

  const originalReadings = [...pendingReadings];
  const nextReadings = [];
  const imageReadings = originalReadings.filter((reading) => reading.file);
  let processedImageCount = 0;

  for (const reading of originalReadings) {
    if (!reading.file) {
      nextReadings.push(reading);
      continue;
    }

    processedImageCount += 1;
    reading.status = "processing";
    pendingReadings = [...nextReadings, reading, ...originalReadings.slice(originalReadings.indexOf(reading) + 1)];
    renderUploads();

    els.ocrStatus.textContent = `正在分析 ${processedImageCount}/${imageReadings.length}`;

    try {
      const result = await Tesseract.recognize(reading.file, "eng+chi_sim", {
        logger: (message) => {
          if (message.status === "recognizing text" && message.progress) {
            const pct = Math.round(message.progress * 100);
            els.ocrStatus.textContent = `正在分析 ${processedImageCount}/${imageReadings.length}: ${pct}%`;
          }
        },
      });

      const ocrText = result.data.text.trim();
      const extraction = extractRecords(ocrText);

      if (extraction.records.length === 0) {
        nextReadings.push({
          ...reading,
          text: ocrText,
          values: {},
          sources: {},
          status: "failed",
        });
        continue;
      }

      extraction.records.forEach((record, recordIndex) => {
        const isSingleRecord = extraction.records.length === 1;

        nextReadings.push({
          id: isSingleRecord ? reading.id : crypto.randomUUID(),
          fileName: isSingleRecord
            ? reading.fileName
            : `${reading.fileName} · record ${recordIndex + 1}`,
          file: null,
          previewUrl: reading.previewUrl,
          sourceImageName: reading.fileName,
          status: "done",
          text: record.text || ocrText,
          values: record.values,
          sources: record.sources,
        });
      });
    } catch (error) {
      nextReadings.push({
        ...reading,
        text: `OCR 失败: ${error.message || error}`,
        values: {},
        sources: {},
        status: "failed",
      });
    }
  }

  pendingReadings = nextReadings;
  els.ocrStatus.textContent = "识别完成，请确认每条 record 的数值后保存";
  renderUploads();
}

function ensureTesseract() {
  if (window.Tesseract) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("无法加载 Tesseract.js"));
    document.head.append(script);
  });
}

function formatReadingTrace(reading) {
  const sourceLines = Object.entries(reading.sources || {});
  const sourceText =
    sourceLines.length > 0
      ? sourceLines.map(([key, source]) => `${metricDefs[key]?.label || key}: ${source}`).join("\n")
      : "暂无提取来源";
  return `提取来源:\n${sourceText}\n\nOCR文本:\n${reading.text || "暂无识别文本"}`;
}


function extractRecords(text) {
  const lines = text
    .split(/\n+/)
    .map((line) => normalizeOcrLine(line))
    .filter(Boolean)
    .filter((line) => !isLikelyChartOrUiText(line));

  const blocks = splitRecordBlocks(lines);

  const records = blocks
    .map((block, index) => {
      const blockText = block.join("\n");
      const extraction = extractValues(blockText);

      return {
        index,
        text: blockText,
        values: extraction.values,
        sources: extraction.sources,
      };
    })
    .filter((record) => Object.keys(record.values).length > 0);

  // fallback: 如果分块失败，就把整张图作为一条 record
  if (records.length === 0) {
    const fallback = extractValues(text);

    if (Object.keys(fallback.values).length > 0) {
      records.push({
        index: 0,
        text,
        values: fallback.values,
        sources: fallback.sources,
      });
    }
  }

  return { records };
}

function splitRecordBlocks(lines) {
  const obviousBlocks = splitByObviousRecordSeparators(lines);

  if (obviousBlocks.length > 1) {
    return obviousBlocks;
  }

  const metricBlocks = splitByRepeatedMetricStarts(lines);

  if (metricBlocks.length > 1) {
    return metricBlocks;
  }

  return [lines];
}

function splitByObviousRecordSeparators(lines) {
  const blocks = [];
  let current = [];

  lines.forEach((line) => {
    const startsNewRecord = isRecordStartLine(line);

    if (startsNewRecord && current.length > 0) {
      blocks.push(current);
      current = [];
    }

    current.push(line);
  });

  if (current.length > 0) {
    blocks.push(current);
  }

  return blocks;
}

function isRecordStartLine(line) {
  return /record|记录|检查|测量|验光|生物测量|biometry|i[o0]l|患者|姓名|日期|时间|no\.?\s*\d+|#\s*\d+/i.test(line);
}

function splitByRepeatedMetricStarts(lines) {
  const blocks = [];
  let current = [];
  let currentHasData = false;

  lines.forEach((line) => {
    const startsNewMetricGroup = looksLikeFirstMetricOfRecord(line);
    const hasRecordData = hasAnyMetricData(line);

    if (startsNewMetricGroup && currentHasData && current.length > 0) {
      blocks.push(current);
      current = [];
      currentHasData = false;
    }

    current.push(line);

    if (hasRecordData) {
      currentHasData = true;
    }
  });

  if (current.length > 0) {
    blocks.push(current);
  }

  return blocks;
}

function looksLikeFirstMetricOfRecord(line) {
  const lower = line.toLowerCase();

  return /眼轴|轴长|axial length|a\/l|\bal\b/.test(lower);
}

function hasAnyMetricData(line) {
  const lower = line.toLowerCase();

  return /眼轴|轴长|axial length|a\/l|\bal\b|屈光|球镜|等效|se\b|spherical|diopter|\bd\b|ct\b|cct\b|角膜厚度|ad\b|acd\b|前房|lt\b|晶状体|vt\b|玻璃体|k\s*1|k\s*2|角膜曲率/.test(lower);
}

function extractValues(text) {
  const values = {};
  const sources = {};

  const lines = text
    .split(/\n+/)
    .map((line) => normalizeOcrLine(line))
    .filter(Boolean)
    .filter((line) => !isLikelyChartOrUiText(line));

  extractSideBySideTableValues(lines, values, sources);
  extractNonTableValues(lines, values, sources);

  return { values, sources };
}

function extractSideBySideTableValues(lines, values, sources) {
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const lower = line.toLowerCase();

    const isMainHeader =
      /\bal\b/.test(lower) &&
      /\bct\b/.test(lower) &&
      /\bad\b/.test(lower) &&
      /\blt\b/.test(lower) &&
      /\bvt\b/.test(lower);

    if (isMainHeader) {
      const valueLine = findNextNumericLine(lines, i + 1, 8);

      if (valueLine) {
        const nums = extractNumbers(valueLine);

        // 并排两个表：前 5 个数字是左框 = 右眼，后 5 个数字是右框 = 左眼
        if (nums.length >= 10) {
          assignExact(values, sources, "axialRight", nums[0], valueLine);
          assignExact(values, sources, "cornealThicknessRight", normalizeCornealThickness(nums[1]), valueLine);
          assignExact(values, sources, "anteriorChamberDepthRight", nums[2], valueLine);
          assignExact(values, sources, "lensThicknessRight", nums[3], valueLine);
          assignExact(values, sources, "vitreousChamberLengthRight", nums[4], valueLine);

          assignExact(values, sources, "axialLeft", nums[5], valueLine);
          assignExact(values, sources, "cornealThicknessLeft", normalizeCornealThickness(nums[6]), valueLine);
          assignExact(values, sources, "anteriorChamberDepthLeft", nums[7], valueLine);
          assignExact(values, sources, "lensThicknessLeft", nums[8], valueLine);
          assignExact(values, sources, "vitreousChamberLengthLeft", nums[9], valueLine);
        }

        // 只有一个表时：根据附近文字判断左右眼
        else if (nums.length >= 5) {
          const side = detectSideAround(lines, i);

          if (side === "left") {
            assignExact(values, sources, "axialLeft", nums[0], valueLine);
            assignExact(values, sources, "cornealThicknessLeft", normalizeCornealThickness(nums[1]), valueLine);
            assignExact(values, sources, "anteriorChamberDepthLeft", nums[2], valueLine);
            assignExact(values, sources, "lensThicknessLeft", nums[3], valueLine);
            assignExact(values, sources, "vitreousChamberLengthLeft", nums[4], valueLine);
          } else {
            assignExact(values, sources, "axialRight", nums[0], valueLine);
            assignExact(values, sources, "cornealThicknessRight", normalizeCornealThickness(nums[1]), valueLine);
            assignExact(values, sources, "anteriorChamberDepthRight", nums[2], valueLine);
            assignExact(values, sources, "lensThicknessRight", nums[3], valueLine);
            assignExact(values, sources, "vitreousChamberLengthRight", nums[4], valueLine);
          }
        }
      }
    }

    const isKHeader =
      /al\/cr/i.test(line) &&
      /\bk\s*1\b/i.test(line) &&
      /\bk\s*2\b/i.test(line);

    if (isKHeader) {
      const valueLine = findNextNumericLine(lines, i + 1, 8);

      if (valueLine) {
        const kPairs = extractKPairs(valueLine);

        // 并排两个表：前两个 K pair 是右眼，后两个 K pair 是左眼
        if (kPairs.length >= 4) {
          assignExact(values, sources, "k1Right", kPairs[0], valueLine);
          assignExact(values, sources, "k2Right", kPairs[1], valueLine);
          assignExact(values, sources, "k1Left", kPairs[2], valueLine);
          assignExact(values, sources, "k2Left", kPairs[3], valueLine);
        }

        else if (kPairs.length >= 2) {
          const side = detectSideAround(lines, i);

          if (side === "left") {
            assignExact(values, sources, "k1Left", kPairs[0], valueLine);
            assignExact(values, sources, "k2Left", kPairs[1], valueLine);
          } else {
            assignExact(values, sources, "k1Right", kPairs[0], valueLine);
            assignExact(values, sources, "k2Right", kPairs[1], valueLine);
          }
        }
      }
    }
  }
}

function extractNonTableValues(lines, values, sources) {
  lines.forEach((line) => {
    const lower = line.toLowerCase();
    const nums = extractNumbers(line);

    if (nums.length === 0) return;

    const side = detectSide(line);

    if (/眼轴速度|毫米\/年|mm\/y|mm\/year|axial.*rate|axial.*speed/.test(lower)) {
      const speeds = nums.filter((number) => number >= -5 && number <= 5);
      assignBySide(values, sources, side, "axialVelocityRight", "axialVelocityLeft", speeds, line);
      return;
    }

    if (/屈光速度|度\/年|d\/y|diopter.*year|refraction.*rate/.test(lower)) {
      const speeds = nums
        .map(normalizeDiopterLike)
        .filter((number) => number >= -5 && number <= 5);

      assignBySide(values, sources, side, "refractionVelocityRight", "refractionVelocityLeft", speeds, line);
      return;
    }

    const hasKData = /\bk\s*[12]\b|角膜曲率|keratometry|corneal curvature/i.test(line);

    if (!hasKData && /屈光|球镜|等效|近视|远视|se\b|spherical|diopter|\bd\b|度/i.test(line)) {
      const refractions = nums
        .map(normalizeDiopterLike)
        .filter((number) => number >= -30 && number <= 30);

      assignBySide(values, sources, side, "refractionRight", "refractionLeft", refractions, line);
    }
  });
}

function findNextNumericLine(lines, startIndex, maxLookAhead = 6) {
  for (let index = startIndex; index < Math.min(lines.length, startIndex + maxLookAhead); index += 1) {
    const line = lines[index];
    const nums = extractNumbers(line);

    if (nums.length >= 2) {
      return line;
    }
  }

  return "";
}

function detectSideAround(lines, index) {
  const nearby = [
    lines[index - 3],
    lines[index - 2],
    lines[index - 1],
    lines[index],
    lines[index + 1],
  ]
    .filter(Boolean)
    .join(" ");

  return detectSide(nearby);
}

function extractKPairs(line) {
  return [...line.matchAll(/(\d{2}(?:[.,]\d+)?)\s*\/\s*\d{1,3}/g)]
    .map((match) => Number(match[1].replace(",", ".")))
    .filter(Number.isFinite);
}

function assignExact(values, sources, key, value, sourceLine) {
  if (!Number.isFinite(value)) return;
  if (values[key] != null) return;

  values[key] = value;
  sources[key] = sourceLine;
}

function extractTableValues(lines, values, sources) {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lower = line.toLowerCase();

    const isBiometryHeader =
      /\bal\b/.test(lower) &&
      /\bct\b/.test(lower) &&
      /\bad\b/.test(lower) &&
      /\blt\b/.test(lower) &&
      /\bvt\b/.test(lower);

    if (isBiometryHeader) {
      const valueLine = findNextNumericLine(lines, index + 1);
      if (valueLine) {
        const side = detectSideAround(lines, index);
        const nums = extractNumbers(valueLine);

        if (nums.length >= 5) {
          assignTableValue(values, sources, side, "axialRight", "axialLeft", nums[0], valueLine);
          assignTableValue(values, sources, side, "cornealThicknessRight", "cornealThicknessLeft", normalizeCornealThickness(nums[1]), valueLine);
          assignTableValue(values, sources, side, "anteriorChamberDepthRight", "anteriorChamberDepthLeft", nums[2], valueLine);
          assignTableValue(values, sources, side, "lensThicknessRight", "lensThicknessLeft", nums[3], valueLine);
          assignTableValue(values, sources, side, "vitreousChamberLengthRight", "vitreousChamberLengthLeft", nums[4], valueLine);
        }
      }
    }

    const isKHeader =
      /al\/cr/i.test(line) &&
      /\bk\s*1\b/i.test(line) &&
      /\bk\s*2\b/i.test(line);

    if (isKHeader) {
      const valueLine = findNextNumericLine(lines, index + 1);
      if (valueLine) {
        const side = detectSideAround(lines, index);
        const kValues = extractKValues(valueLine);

        if (kValues.k1 != null) {
          assignTableValue(values, sources, side, "k1Right", "k1Left", kValues.k1, valueLine);
        }

        if (kValues.k2 != null) {
          assignTableValue(values, sources, side, "k2Right", "k2Left", kValues.k2, valueLine);
        }
      }
    }
  }
}

function extractLineValues(lines, values, sources) {
  lines.forEach((line) => {
    const lower = line.toLowerCase();
    const side = detectSide(line);

    if (/眼轴速度|毫米\/年|mm\/y|mm\/year|axial.*rate|axial.*speed/.test(lower)) {
      const nums = extractNumbers(line).filter((number) => number >= -5 && number <= 5);
      assignBySide(values, sources, side, "axialVelocityRight", "axialVelocityLeft", nums, line);
      return;
    }

    if (/屈光速度|度\/年|d\/y|diopter.*year|refraction.*rate/.test(lower)) {
      const nums = extractNumbers(line)
        .map(normalizeDiopterLike)
        .filter((number) => number >= -5 && number <= 5);
      assignBySide(values, sources, side, "refractionVelocityRight", "refractionVelocityLeft", nums, line);
      return;
    }

    const hasKData = /\bk\s*[12]\b|角膜曲率|keratometry|corneal curvature/i.test(line);

    if (!hasKData && /屈光|球镜|等效|近视|远视|se\b|spherical|diopter|\bd\b|度/i.test(line)) {
      const nums = extractNumbers(line)
        .map(normalizeDiopterLike)
        .filter((number) => number >= -30 && number <= 30);
      assignBySide(values, sources, side, "refractionRight", "refractionLeft", nums, line);
    }
  });
}

function findNextNumericLine(lines, startIndex) {
  for (let index = startIndex; index < Math.min(lines.length, startIndex + 4); index += 1) {
    const line = lines[index];
    const nums = extractNumbers(line);

    if (nums.length >= 2) {
      return line;
    }
  }

  return "";
}

function detectSideAround(lines, index) {
  const nearby = [
    lines[index - 3],
    lines[index - 2],
    lines[index - 1],
    lines[index],
    lines[index + 1],
  ]
    .filter(Boolean)
    .join(" ");

  return detectSide(nearby);
}

function assignTableValue(values, sources, side, rightKey, leftKey, value, sourceLine) {
  if (!Number.isFinite(value)) return;

  if (side === "right" && values[rightKey] == null) {
    values[rightKey] = value;
    sources[rightKey] = sourceLine;
    return;
  }

  if (side === "left" && values[leftKey] == null) {
    values[leftKey] = value;
    sources[leftKey] = sourceLine;
    return;
  }

  if (side === "both") {
    if (values[rightKey] == null) {
      values[rightKey] = value;
      sources[rightKey] = sourceLine;
    } else if (values[leftKey] == null) {
      values[leftKey] = value;
      sources[leftKey] = sourceLine;
    }
  }
}

function extractKValues(line) {
  const pairMatches = [...line.matchAll(/(\d{2}(?:[.,]\d+)?)\s*\/\s*\d{1,3}/g)].map((match) =>
    Number(match[1].replace(",", ".")),
  );

  return {
    k1: Number.isFinite(pairMatches[0]) ? pairMatches[0] : null,
    k2: Number.isFinite(pairMatches[1]) ? pairMatches[1] : null,
  };
}

function normalizeOcrLine(line) {
  return line
    .replace(/[，。]/g, ".")
    .replace(/[：]/g, ":")
    .replace(/\s+/g, " ")
    .trim();
}

function isLikelyChartOrUiText(line) {
  return /曲线|图表|警示线|同龄|过滤|检查单|小程序|vs|月份|近三月|近半年|近一年|近两年|半年前|一年前|两年前/i.test(line);
}

function extractNumbers(text) {
  const matches = text.match(/[-+]?\d+(?:[.,]\d+)?/g) || [];
  return matches.map((match) => Number(match.replace(",", "."))).filter(Number.isFinite);
}

function detectSide(line) {
  const hasRight = /右眼|右|od\b|\br\b|right/i.test(line);
  const hasLeft = /左眼|左|os\b|\bl\b|left/i.test(line);
  if (hasRight && !hasLeft) return "right";
  if (hasLeft && !hasRight) return "left";
  return "both";
}

function normalizeDiopterLike(value) {
  if (!Number.isFinite(value)) return value;
  if (Math.abs(value) >= 30) return value / 100;
  return value;
}

function normalizeCornealThickness(value) {
  if (!Number.isFinite(value)) return value;
  if (value > 0.3 && value < 1) return value * 1000;
  return value;
}

function assignBySide(values, sources, side, rightKey, leftKey, numbers, sourceLine) {
  const cleaned = numbers.filter(Number.isFinite);
  if (cleaned.length === 0) return;
  if (side === "right" && values[rightKey] == null) {
    values[rightKey] = cleaned[0];
    sources[rightKey] = sourceLine;
  }
  if (side === "left" && values[leftKey] == null) {
    values[leftKey] = cleaned[0];
    sources[leftKey] = sourceLine;
  }
  if (side === "both") fillMissingPair(values, sources, rightKey, leftKey, cleaned.slice(-2), sourceLine);
}

function fillMissingPair(values, sources, rightKey, leftKey, pair, sourceLine) {
  if (pair.length === 1) {
    if (values[rightKey] == null) {
      values[rightKey] = pair[0];
      sources[rightKey] = sourceLine;
    }
    return;
  }
  if (pair.length >= 2) {
    if (values[rightKey] == null) {
      values[rightKey] = pair[0];
      sources[rightKey] = sourceLine;
    }
    if (values[leftKey] == null) {
      values[leftKey] = pair[1];
      sources[leftKey] = sourceLine;
    }
  }
}

function parseUserNumber(value) {
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const normalized = Number(trimmed.replace(",", "."));
  return Number.isFinite(normalized) ? normalized : null;
}

function calculateAverages() {
  return calculateAveragesWithCounts().averages;
}

function calculateAveragesWithCounts() {
  const averages = {};
  const counts = {};

  Object.keys(metricDefs).forEach((key) => {
    const nums = pendingReadings
      .map((reading) => reading.values[key])
      .filter((value) => Number.isFinite(value));

    if (nums.length > 0) {
      const sum = nums.reduce((total, value) => total + value, 0);
      averages[key] = sum / nums.length;
      counts[key] = nums.length;
    }
  });

  return { averages, counts };
}


function updateAverageSummary() {
  const { averages, counts } = calculateAveragesWithCounts();
  const entries = Object.entries(averages);

  els.saveRecordButton.disabled = entries.length === 0;

  if (entries.length === 0) {
    els.averageSummary.textContent = "还没有可保存的数据";
    return;
  }

  els.averageSummary.textContent = entries
    .map(([key, value]) => {
      const count = counts[key] || 0;
      return `${metricDefs[key].label} ${formatMetricValue(key, value)}（n=${count}）`;
    })
    .join(" · ");
}

async function saveCurrentRecord() {
  const { averages, counts } = calculateAveragesWithCounts();

  if (Object.keys(averages).length === 0 || !activeProfileId) return;

  const record = {
    id: crypto.randomUUID(),
    profileId: activeProfileId,
    capturedAt: new Date(els.capturedAtInput.value || Date.now()).toISOString(),
    createdAt: new Date().toISOString(),
    averages,
    counts,
    readings: pendingReadings.map((reading) => ({
      fileName: reading.fileName,
      sourceImageName: reading.sourceImageName || reading.fileName,
      text: reading.text,
      values: reading.values,
      status: reading.status,
    })),
  };

  await putItem(STORE_RECORDS, record);
  clearUploads();
  setDefaultCapturedAt();
  await loadRecords();
  renderAll();
  switchTab("trends");
}

function renderTrend() {
  const canvas = els.trendCanvas;
  const group = trendGroups[activeTrend];
  const rightSeries = records
    .map((record) => makePoint(record, group.rightKey))
    .filter((point) => Number.isFinite(point.value));
  const leftSeries = records
    .map((record) => makePoint(record, group.leftKey))
    .filter((point) => Number.isFinite(point.value));
  const allPoints = [...rightSeries, ...leftSeries];
  const hasData = allPoints.length > 0;

  els.chartEmptyState.classList.toggle("visible", !hasData);
  canvas.hidden = !hasData;
  renderTrendStats(group, rightSeries, leftSeries);
  if (!hasData) return;

  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, Math.round(rect.width));
  const height = Number(canvas.getAttribute("height")) || 360;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const padding = { top: 28, right: 24, bottom: 54, left: 44 };
  const plot = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  };

  const minDate = Math.min(...allPoints.map((point) => point.time));
  const maxDate = Math.max(...allPoints.map((point) => point.time));
  const sameDate = minDate === maxDate;
  const minValue = Math.min(...allPoints.map((point) => point.value));
  const maxValue = Math.max(...allPoints.map((point) => point.value));
  const valuePad = Math.max((maxValue - minValue) * 0.18, group.unit === "mm" ? 0.03 : 0.25);
  const yMin = minValue - valuePad;
  const yMax = maxValue + valuePad;

  const xFor = (time) => {
    if (sameDate) return plot.x + plot.width / 2;
    return plot.x + ((time - minDate) / (maxDate - minDate)) * plot.width;
  };
  const yFor = (value) => plot.y + plot.height - ((value - yMin) / (yMax - yMin)) * plot.height;

  drawChartFrame(ctx, plot, yMin, yMax, group);
  drawSeries(ctx, rightSeries, xFor, yFor, colors.right, group);
  drawSeries(ctx, leftSeries, xFor, yFor, colors.left, group);
  drawXAxis(ctx, plot, records);
  drawLegend(ctx, plot);
}

function makePoint(record, key) {
  return {
    id: record.id,
    time: new Date(record.capturedAt).getTime(),
    label: formatShortDate(record.capturedAt),
    value: record.averages[key],
  };
}

function drawChartFrame(ctx, plot, yMin, yMax, group) {
  ctx.save();
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  ctx.fillStyle = colors.muted;
  ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let index = 0; index <= 4; index += 1) {
    const y = plot.y + (plot.height / 4) * index;
    const value = yMax - ((yMax - yMin) / 4) * index;
    ctx.beginPath();
    ctx.moveTo(plot.x, y);
    ctx.lineTo(plot.x + plot.width, y);
    ctx.stroke();
    ctx.fillText(formatNumber(value, group.decimals), plot.x - 8, y);
  }

  ctx.fillStyle = colors.text;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "700 13px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(`${group.label} (${group.unit})`, plot.x, 8);
  ctx.restore();
}

function drawSeries(ctx, series, xFor, yFor, color, group) {
  if (series.length === 0) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.beginPath();
  series.forEach((point, index) => {
    const x = xFor(point.time);
    const y = yFor(point.value);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.font = "700 11px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  series.forEach((point) => {
    const x = xFor(point.time);
    const y = yFor(point.value);
    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fillText(formatNumber(point.value, group.decimals), x, y - 12);
  });
  ctx.restore();
}

function drawXAxis(ctx, plot, allRecords) {
  const ticks = [...new Map(allRecords.map((record) => [formatShortDate(record.capturedAt), record])).values()];
  const maxTicks = 4;
  const sampled = ticks.filter((_, index) => {
    if (ticks.length <= maxTicks) return true;
    return index === 0 || index === ticks.length - 1 || index % Math.ceil(ticks.length / maxTicks) === 0;
  });
  const minDate = Math.min(...allRecords.map((record) => new Date(record.capturedAt).getTime()));
  const maxDate = Math.max(...allRecords.map((record) => new Date(record.capturedAt).getTime()));
  const sameDate = minDate === maxDate;

  ctx.save();
  ctx.fillStyle = colors.muted;
  ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  sampled.forEach((record) => {
    const time = new Date(record.capturedAt).getTime();
    const x = sameDate ? plot.x + plot.width / 2 : plot.x + ((time - minDate) / (maxDate - minDate)) * plot.width;
    ctx.fillText(formatShortDate(record.capturedAt), x, plot.y + plot.height + 16);
  });
  ctx.restore();
}

function drawLegend(ctx, plot) {
  const y = plot.y + plot.height + 36;
  ctx.save();
  ctx.font = "700 12px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textBaseline = "middle";
  drawLegendItem(ctx, plot.x, y, colors.right, "右眼");
  drawLegendItem(ctx, plot.x + 74, y, colors.left, "左眼");
  ctx.restore();
}

function drawLegendItem(ctx, x, y, color, label) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y - 5, 18, 10);
  ctx.fillStyle = colors.text;
  ctx.fillText(label, x + 24, y);
}

function renderTrendStats(group, rightSeries, leftSeries) {
  const items = [
    makeStat(`${group.label} 右眼`, rightSeries, group),
    makeStat(`${group.label} 左眼`, leftSeries, group),
    makeDeltaStat("右眼变化", rightSeries, group),
    makeDeltaStat("左眼变化", leftSeries, group),
  ];
  els.trendStats.innerHTML = items
    .map(
      (item) => `
        <div class="stat-card">
          <span>${item.label}</span>
          <strong>${item.value}</strong>
        </div>
      `,
    )
    .join("");
}

function makeStat(label, series, group) {
  const latest = series.at(-1);
  return {
    label,
    value: latest ? `${formatNumber(latest.value, group.decimals)} ${group.unit}` : "暂无",
  };
}

function makeDeltaStat(label, series, group) {
  if (series.length < 2) return { label, value: "暂无" };
  const delta = series.at(-1).value - series[0].value;
  const prefix = delta > 0 ? "+" : "";
  return {
    label,
    value: `${prefix}${formatNumber(delta, group.decimals)} ${group.unit}`,
  };
}

function renderRecords() {
  if (records.length === 0) {
    els.recordList.innerHTML = `<div class="record-card"><p>当前用户还没有记录</p></div>`;
    return;
  }
  els.recordList.innerHTML = records
    .slice()
    .reverse()
    .map((record) => {
      const values = Object.entries(record.averages)
        .map(
          ([key, value]) => `
            <div class="value-pill">
              ${metricDefs[key].label}<br />
              <b>${formatMetricValue(key, value)}</b>
            </div>
          `,
        )
        .join("");
      return `
        <article class="record-card">
          <div class="record-header">
            <div>
              <h3>${formatDateTime(record.capturedAt)}</h3>
              <time>${record.readings.length} 张/组来源</time>
            </div>
            <button class="mini-button" data-delete-record="${record.id}" type="button">删除</button>
          </div>
          <div class="record-values">${values}</div>
        </article>
      `;
    })
    .join("");

  els.recordList.querySelectorAll("[data-delete-record]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.deleteRecord;
      if (!confirm("删除这条记录？")) return;
      await deleteItem(STORE_RECORDS, id);
      await loadRecords();
      renderAll();
    });
  });
}

async function deleteActiveProfile() {
  if (!activeProfileId || profiles.length <= 1) {
    alert("至少保留一个用户");
    return;
  }
  const profile = profiles.find((item) => item.id === activeProfileId);
  if (!confirm(`删除 ${profile?.name || "当前用户"} 和所有记录？`)) return;
  await deleteItem(STORE_PROFILES, activeProfileId);
  await Promise.all(records.map((record) => deleteItem(STORE_RECORDS, record.id)));
  await refreshProfiles();
  await loadRecords();
  renderAll();
}

function exportData() {
  const profile = profiles.find((item) => item.id === activeProfileId);
  const payload = {
    exportedAt: new Date().toISOString(),
    profile,
    records,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `myopia-${profile?.name || "profile"}-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importData(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    if (!payload.profile || !Array.isArray(payload.records)) throw new Error("JSON 格式不正确");
    const profile = { ...payload.profile, id: crypto.randomUUID(), importedAt: new Date().toISOString() };
    await putItem(STORE_PROFILES, profile);
    for (const record of payload.records) {
      await putItem(STORE_RECORDS, {
        ...record,
        id: crypto.randomUUID(),
        profileId: profile.id,
        importedAt: new Date().toISOString(),
      });
    }
    activeProfileId = profile.id;
    localStorage.setItem("myopia-active-profile-id", activeProfileId);
    await refreshProfiles();
    await loadRecords();
    renderAll();
  } catch (error) {
    alert(error.message || "导入失败");
  }
}

function formatMetricValue(key, value) {
  const metric = metricDefs[key];
  return `${formatNumber(value, metric.decimals)} ${metric.unit}`;
}

function formatNumber(value, decimals) {
  if (!Number.isFinite(value)) return "";
  return Number(value).toFixed(decimals);
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
  }).format(new Date(value));
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
