const DB_NAME = "myopia-tracker-db";
const DB_VERSION = 1;
const STORE_PROFILES = "profiles";
const STORE_RECORDS = "records";

let db;
let profiles = [];
let activeProfileId = null;
let pendingReadings = [];
let records = [];
let currentChartMetric = "axial";
let chart;

const metricDefs = {
  axialRight: { label: "右眼 AL 眼轴", unit: "mm" },
  axialLeft: { label: "左眼 AL 眼轴", unit: "mm" },

  cornealThicknessRight: { label: "右眼 CT 角膜厚度", unit: "um" },
  cornealThicknessLeft: { label: "左眼 CT 角膜厚度", unit: "um" },

  anteriorChamberDepthRight: { label: "右眼 AD 前房深度", unit: "mm" },
  anteriorChamberDepthLeft: { label: "左眼 AD 前房深度", unit: "mm" },

  lensThicknessRight: { label: "右眼 LT 晶状体厚度", unit: "mm" },
  lensThicknessLeft: { label: "左眼 LT 晶状体厚度", unit: "mm" },

  vitreousChamberLengthRight: { label: "右眼 VT 玻璃体腔长度", unit: "mm" },
  vitreousChamberLengthLeft: { label: "左眼 VT 玻璃体腔长度", unit: "mm" },

  alCrRight: { label: "右眼 AL/CR", unit: "" },
  alCrLeft: { label: "左眼 AL/CR", unit: "" },

  k1Right: { label: "右眼 K1", unit: "D" },
  k1Left: { label: "左眼 K1", unit: "D" },

  k2Right: { label: "右眼 K2", unit: "D" },
  k2Left: { label: "左眼 K2", unit: "D" },

  kappaRight: { label: "右眼 Kappa", unit: "" },
  kappaLeft: { label: "左眼 Kappa", unit: "" },
};

const metricOrder = Object.keys(metricDefs);

const els = {
  profileSelect: document.querySelector("#profileSelect"),
  profileNameInput: document.querySelector("#profileNameInput"),
  createProfileButton: document.querySelector("#createProfileButton"),
  capturedAtInput: document.querySelector("#capturedAtInput"),
  manualEntryButton: document.querySelector("#manualEntryButton"),
  imageInput: document.querySelector("#imageInput"),
  uploadZone: document.querySelector("#uploadZone"),
  chooseImageButton: document.querySelector("#chooseImageButton"),
  analyzeButton: document.querySelector("#analyzeButton"),
  clearUploadsButton: document.querySelector("#clearUploadsButton"),
  ocrStatus: document.querySelector("#ocrStatus"),
  uploadList: document.querySelector("#uploadList"),
  averageSummary: document.querySelector("#averageSummary"),
  saveRecordButton: document.querySelector("#saveRecordButton"),
  readingTemplate: document.querySelector("#readingTemplate"),
  recordsList: document.querySelector("#recordsList"),
  emptyTrendMessage: document.querySelector("#emptyTrendMessage"),
  trendCanvas: document.querySelector("#trendCanvas"),
  exportButton: document.querySelector("#exportButton"),
  importInput: document.querySelector("#importInput"),
  deleteProfileButton: document.querySelector("#deleteProfileButton"),
};

init();

async function init() {
  db = await openDb();
  bindEvents();
  setDefaultCapturedAt();
  await loadProfiles();
  await loadRecords();
  renderAll();
}

function bindEvents() {
  els.createProfileButton.addEventListener("click", createProfile);

  els.profileSelect.addEventListener("change", async () => {
    activeProfileId = els.profileSelect.value || null;
    localStorage.setItem("activeProfileId", activeProfileId || "");
    await loadRecords();
    renderAll();
  });

  els.chooseImageButton.addEventListener("click", () => {
    els.imageInput.click();
  });

  els.uploadZone.addEventListener("click", (event) => {
    if (event.target === els.chooseImageButton) return;
    els.imageInput.click();
  });

  els.imageInput.addEventListener("change", () => {
    const files = Array.from(els.imageInput.files || []);
    addFiles(files);
    els.imageInput.value = "";
  });

  els.uploadZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    els.uploadZone.classList.add("drag-over");
  });

  els.uploadZone.addEventListener("dragleave", () => {
    els.uploadZone.classList.remove("drag-over");
  });

  els.uploadZone.addEventListener("drop", (event) => {
    event.preventDefault();
    els.uploadZone.classList.remove("drag-over");
    addFiles(Array.from(event.dataTransfer?.files || []));
  });

  els.analyzeButton.addEventListener("click", analyzePendingImages);
  els.clearUploadsButton.addEventListener("click", clearUploads);
  els.manualEntryButton.addEventListener("click", addManualReading);
  els.saveRecordButton.addEventListener("click", saveCurrentRecord);

  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  document.querySelectorAll(".metric-tab").forEach((button) => {
    button.addEventListener("click", () => {
      currentChartMetric = button.dataset.chartMetric;
      document.querySelectorAll(".metric-tab").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderChart();
    });
  });
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_PROFILES)) {
        database.createObjectStore(STORE_PROFILES, { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains(STORE_RECORDS)) {
        database.createObjectStore(STORE_RECORDS, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAll(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const request = tx.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function putItem(storeName, item) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(item);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

function deleteItem(storeName, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function loadProfiles() {
  profiles = await getAll(STORE_PROFILES);
  const savedActive = localStorage.getItem("activeProfileId");
  activeProfileId = profiles.some((profile) => profile.id === savedActive)
    ? savedActive
    : profiles[0]?.id || null;
}

async function loadRecords() {
  const allRecords = await getAll(STORE_RECORDS);
  records = allRecords
    .filter((record) => record.profileId === activeProfileId)
    .sort((a, b) => new Date(a.capturedAt) - new Date(b.capturedAt));
}

async function createProfile() {
  const name = els.profileNameInput.value.trim();
  if (!name) return;

  const profile = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  };

  await putItem(STORE_PROFILES, profile);
  els.profileNameInput.value = "";
  await loadProfiles();
  activeProfileId = profile.id;
  localStorage.setItem("activeProfileId", activeProfileId);
  await loadRecords();
  renderAll();
}

function setDefaultCapturedAt() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  els.capturedAtInput.value = now.toISOString().slice(0, 16);
}

function addFiles(files) {
  const imageFiles = files.filter((file) => {
    const isImageType = file.type && file.type.startsWith("image/");
    const isImageName = /\.(png|jpe?g|webp|gif|bmp|heic|heif)$/i.test(file.name || "");
    return isImageType || isImageName;
  });

  if (imageFiles.length === 0) {
    els.ocrStatus.textContent = "没有读取到图片文件";
    return;
  }

  imageFiles.forEach((file) => {
    pendingReadings.push({
      id: crypto.randomUUID(),
      fileName: file.name || `图片 ${pendingReadings.length + 1}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: "new",
      text: "",
      values: {},
      sources: {},
    });
  });

  els.ocrStatus.textContent = `已添加 ${imageFiles.length} 张图片，请点击“分析图片”`;
  renderUploads();
}

function addManualReading() {
  pendingReadings.push({
    id: crypto.randomUUID(),
    fileName: `手动录入 ${pendingReadings.length + 1}`,
    file: null,
    previewUrl: "",
    status: "manual",
    text: "",
    values: {},
    sources: {},
  });
  renderUploads();
}

async function analyzePendingImages() {
  const imageReadings = pendingReadings.filter((reading) => reading.file);
  if (imageReadings.length === 0) return;

  els.analyzeButton.disabled = true;

  const nextReadings = pendingReadings.filter((reading) => !reading.file);

  for (const reading of imageReadings) {
    reading.status = "processing";
    renderUploads();

    try {
      els.ocrStatus.textContent = `正在分析 ${reading.fileName}`;

      let result;

      try {
        result = await Tesseract.recognize(reading.file, "eng+chi_sim", {
          logger: (message) => {
            if (message.status === "recognizing text" && message.progress) {
              els.ocrStatus.textContent = `正在分析 ${reading.fileName}: ${Math.round(message.progress * 100)}%`;
            }
          },
        });
      } catch (firstError) {
        console.warn("eng+chi_sim OCR failed, falling back to eng:", firstError);

        result = await Tesseract.recognize(reading.file, "eng", {
          logger: (message) => {
            if (message.status === "recognizing text" && message.progress) {
              els.ocrStatus.textContent = `正在分析 ${reading.fileName}: ${Math.round(message.progress * 100)}%`;
            }
          },
        });
      }

      const text = result.data.text || "";
      console.log("OCR TEXT:", text);

      const extraction = extractRecords(text);
      console.log("EXTRACTION:", extraction);
      console.log("EXTRACTION JSON:", JSON.stringify(extraction, null, 2));

      if (extraction.records.length > 0) {
        extraction.records.forEach((record, recordIndex) => {
          nextReadings.push({
            id: extraction.records.length === 1 ? reading.id : crypto.randomUUID(),
            fileName:
              extraction.records.length === 1
                ? reading.fileName
                : `${reading.fileName} · record ${recordIndex + 1}`,
            file: null,
            previewUrl: reading.previewUrl,
            sourceImageName: reading.fileName,
            status: "done",
            text: record.text || text,
            values: record.values,
            sources: record.sources,
          });
        });
      } else {
        nextReadings.push({
          ...reading,
          file: null,
          text: text || "OCR 没有返回文字",
          values: {},
          sources: {},
          status: "failed",
        });
      }
    } catch (error) {
      console.error("OCR failed:", error);

      nextReadings.push({
        ...reading,
        file: null,
        text: `OCR 失败: ${error.message || error}`,
        values: {},
        sources: {},
        status: "failed",
      });
    }

    pendingReadings = [...nextReadings];
    renderUploads();
  }

  pendingReadings = nextReadings;
  els.ocrStatus.textContent = "识别完成，请确认数值";
  renderUploads();
}

function extractRecords(text) {
  const blocks = splitRecordBlocks(text);
  const records = [];

  blocks.forEach((block, index) => {
    const extraction = extractValues(block);

    if (Object.keys(extraction.values).length > 0) {
      records.push({
        index,
        text: block,
        values: extraction.values,
        sources: extraction.sources,
      });
    }
  });

  return { records };
}

function splitRecordBlocks(text) {
  const lines = String(text)
    .split(/\n+/)
    .map((line) => normalizeOcrLineForRecords(line))
    .filter(Boolean);

  const blocks = [];
  let current = [];
  let tableHeaderCount = 0;

  lines.forEach((line) => {
    const lower = line.toLowerCase();

    const isMeasurementTime = /测量时间|检查时间|measurement time|exam time/.test(lower);

    const isTableHeader =
      /\bal\b/.test(lower) &&
      /\bct\b/.test(lower) &&
      /\bad\b/.test(lower) &&
      /\blt\b/.test(lower) &&
      /\bvt\b/.test(lower);

    const isWeakTableHeader =
      /a\s*>?\s*vt/i.test(line) ||
      /\bal\b.*\bvt\b/i.test(line) ||
      /a\s+l\s+.*v\s*t/i.test(line);

    const startsNewRecord =
      isMeasurementTime ||
      ((isTableHeader || isWeakTableHeader) && tableHeaderCount > 0 && current.length > 0);

    if (startsNewRecord && current.length > 0) {
      blocks.push(current.join("\n"));
      current = [];
    }

    current.push(line);

    if (isTableHeader || isWeakTableHeader) {
      tableHeaderCount += 1;
    }
  });

  if (current.length > 0) {
    blocks.push(current.join("\n"));
  }

  return blocks.length > 0 ? blocks : [text];
}

function normalizeOcrLineForRecords(line) {
  return String(line)
    .replace(/,/g, ".")
    .replace(/[|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findNextNumericLine(lines, startIndex) {
  for (let i = startIndex; i < Math.min(lines.length, startIndex + 6); i += 1) {
    if (extractNumbers(lines[i]).length >= 2) return lines[i];
  }
  return "";
}

function extractNumbers(line) {
  return [...String(line).matchAll(/-?\d+(?:[.,]\d+)?/g)]
    .map((match) => Number(match[0].replace(",", ".")))
    .filter(Number.isFinite);
}

function extractKPairs(line) {
  return [...String(line).matchAll(/(\d{2}(?:[.,]\d+)?)\s*\/\s*\d{1,3}/g)]
    .map((match) => Number(match[1].replace(",", ".")))
    .filter(Number.isFinite);
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
    status.textContent = statusText(reading.status);

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
        updateAverageSummary();
      });
    });

    pre.textContent = reading.text || "";
    els.uploadList.appendChild(card);
  });

  els.analyzeButton.disabled = !pendingReadings.some((reading) => reading.file);
  updateAverageSummary();
}

function extractValues(text) {
  const values = {};
  const sources = {};

  const lines = String(text)
    .split(/\n+/)
    .map((line) => normalizeOcrLineForRecords(line))
    .filter(Boolean);

  const numericLines = lines.filter((line) => extractNumbers(line).length >= 2);

  numericLines.forEach((line) => {
    const nums = extractNumbers(line);
    const kPairs = extractKPairs(line);

    // K1 / K2 行，例如 42.99/164
    if (kPairs.length > 0) {
      assignNextEyeValue(values, sources, "k1Right", "k1Left", kPairs[0], line);

      if (kPairs.length > 1) {
        assignNextEyeValue(values, sources, "k2Right", "k2Left", kPairs[1], line);
      }

      const possibleKappa = nums.find((num) => num > 0 && num < 10 && !kPairs.includes(num));
      if (possibleKappa != null) {
        assignNextEyeValue(values, sources, "kappaRight", "kappaLeft", possibleKappa, line);
      }

      return;
    }

    // AL / CT / AD / LT / VT 行
    // 理想行是：24.54 555.00 3.17 3.61 17.20
    const axial = nums.find((num) => num >= 20 && num <= 30);
    const ct = nums.find((num) => num >= 450 && num <= 700);
    const smallNums = nums.filter((num) => num >= 2.5 && num <= 5);
    const vt = nums.find((num) => num >= 14 && num <= 20);

    if (axial != null) {
      assignNextEyeValue(values, sources, "axialRight", "axialLeft", axial, line);
    }

    if (ct != null) {
      assignNextEyeValue(values, sources, "cornealThicknessRight", "cornealThicknessLeft", ct, line);
    }

    if (smallNums.length >= 1) {
      assignNextEyeValue(values, sources, "anteriorChamberDepthRight", "anteriorChamberDepthLeft", smallNums[0], line);
    }

    if (smallNums.length >= 2) {
      assignNextEyeValue(values, sources, "lensThicknessRight", "lensThicknessLeft", smallNums[1], line);
    }

    if (vt != null) {
      assignNextEyeValue(values, sources, "vitreousChamberLengthRight", "vitreousChamberLengthLeft", vt, line);
    }

    // AL/CR 通常在 3.x
    const alCr = nums.find((num) => num >= 2.5 && num <= 4);
    if (alCr != null) {
      assignNextEyeValue(values, sources, "alCrRight", "alCrLeft", alCr, line);
    }
  });

  return { values, sources };
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

function parseLooseBiometryLines(numericLines, values, sources) {
  numericLines.forEach((line) => {
    const nums = extractNumbers(line);
    const kPairs = extractKPairs(line);

    // K 值行，比如 3.16 42.99/164 ...
    if (kPairs.length > 0) {
      if (values.k1Right == null) {
        values.k1Right = kPairs[0];
        sources.k1Right = line;
      } else if (values.k1Left == null) {
        values.k1Left = kPairs[0];
        sources.k1Left = line;
      }

      if (kPairs.length > 1) {
        if (values.k2Right == null) {
          values.k2Right = kPairs[1];
          sources.k2Right = line;
        } else if (values.k2Left == null) {
          values.k2Left = kPairs[1];
          sources.k2Left = line;
        }
      }

      return;
    }

    // 生物测量行，需要至少有 AL 和 VT
    const axialCandidates = nums.filter((num) => num >= 20 && num <= 30);
    const vtCandidates = nums.filter((num) => num >= 14 && num <= 20);
    const chamberCandidates = nums.filter((num) => num >= 2.5 && num <= 5);
    const ctCandidates = nums.filter((num) => num >= 450 && num <= 700);

    if (axialCandidates.length === 0 || vtCandidates.length === 0) return;

    // 如果 OCR 只读出一个 24.xx，它大概率是左边/右边都同一个 AL
    if (values.axialRight == null) {
      values.axialRight = axialCandidates[0];
      sources.axialRight = line;
    } else if (values.axialLeft == null) {
      values.axialLeft = axialCandidates[0];
      sources.axialLeft = line;
    }

    // 如果这一行看起来是双眼同一横排，优先把同一个 AL 也填到左眼
    if (values.axialLeft == null && axialCandidates.length === 1 && vtCandidates.length >= 1) {
      values.axialLeft = axialCandidates[0];
      sources.axialLeft = line;
    }

    if (ctCandidates.length > 0) {
      if (values.cornealThicknessRight == null) {
        values.cornealThicknessRight = ctCandidates[0];
        sources.cornealThicknessRight = line;
      } else if (values.cornealThicknessLeft == null) {
        values.cornealThicknessLeft = ctCandidates[0];
        sources.cornealThicknessLeft = line;
      }
    }

    // OCR 里 AD/LT 经常只剩 3.62 这种一个值，不强行乱填两个
    if (chamberCandidates.length >= 1) {
      if (values.lensThicknessLeft == null) {
        values.lensThicknessLeft = chamberCandidates[chamberCandidates.length - 1];
        sources.lensThicknessLeft = line;
      }
    }

    // VT 取最后一个 17.xx
    const vtValue = vtCandidates[vtCandidates.length - 1];

    if (values.vitreousChamberLengthRight == null) {
      values.vitreousChamberLengthRight = vtValue;
      sources.vitreousChamberLengthRight = line;
    } else if (values.vitreousChamberLengthLeft == null) {
      values.vitreousChamberLengthLeft = vtValue;
      sources.vitreousChamberLengthLeft = line;
    }

    // 如果只有一个 VT，但这一行明显是双眼横排，先填左眼，避免完全空
    if (values.vitreousChamberLengthLeft == null && vtCandidates.length >= 1) {
      values.vitreousChamberLengthLeft = vtValue;
      sources.vitreousChamberLengthLeft = line;
    }
  });
}

function parseStandardTableLines(lines, values, sources) {
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].toLowerCase();

    const isHeader =
      /\bal\b/.test(line) &&
      /\bct\b/.test(line) &&
      /\bad\b/.test(line) &&
      /\blt\b/.test(line) &&
      /\bvt\b/.test(line);

    if (isHeader) {
      const valueLine = findNextNumericLine(lines, i + 1);
      const nums = extractNumbers(valueLine);

      if (nums.length >= 10) {
        setValueIfEmpty(values, sources, "axialRight", nums[0], valueLine);
        setValueIfEmpty(values, sources, "cornealThicknessRight", nums[1], valueLine);
        setValueIfEmpty(values, sources, "anteriorChamberDepthRight", nums[2], valueLine);
        setValueIfEmpty(values, sources, "lensThicknessRight", nums[3], valueLine);
        setValueIfEmpty(values, sources, "vitreousChamberLengthRight", nums[4], valueLine);

        setValueIfEmpty(values, sources, "axialLeft", nums[5], valueLine);
        setValueIfEmpty(values, sources, "cornealThicknessLeft", nums[6], valueLine);
        setValueIfEmpty(values, sources, "anteriorChamberDepthLeft", nums[7], valueLine);
        setValueIfEmpty(values, sources, "lensThicknessLeft", nums[8], valueLine);
        setValueIfEmpty(values, sources, "vitreousChamberLengthLeft", nums[9], valueLine);
      } else if (nums.length >= 5) {
        setValueIfEmpty(values, sources, "axialRight", nums[0], valueLine);
        setValueIfEmpty(values, sources, "cornealThicknessRight", nums[1], valueLine);
        setValueIfEmpty(values, sources, "anteriorChamberDepthRight", nums[2], valueLine);
        setValueIfEmpty(values, sources, "lensThicknessRight", nums[3], valueLine);
        setValueIfEmpty(values, sources, "vitreousChamberLengthRight", nums[4], valueLine);
      }
    }

    if (/al\/cr/i.test(line) && /\bk\s*1\b/i.test(line) && /\bk\s*2\b/i.test(line)) {
      const valueLine = findNextNumericLine(lines, i + 1);
      const pairs = extractKPairs(valueLine);

      if (pairs.length >= 4) {
        setValueIfEmpty(values, sources, "k1Right", pairs[0], valueLine);
        setValueIfEmpty(values, sources, "k2Right", pairs[1], valueLine);
        setValueIfEmpty(values, sources, "k1Left", pairs[2], valueLine);
        setValueIfEmpty(values, sources, "k2Left", pairs[3], valueLine);
      }
    }
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

function extractKPairs(line) {
  return [...String(line).matchAll(/(\d{2}(?:[.,]\d+)?)\s*\/\s*\d{1,3}/g)]
    .map((match) => Number(match[1].replace(",", ".")))
    .filter(Number.isFinite);
}

function renderMetricInputs(container) {
  container.innerHTML = metricOrder
    .map((key) => {
      const metric = metricDefs[key];
      return `
        <label>
          <span>${metric.label} ${metric.unit}</span>
          <input type="number" step="0.01" data-metric="${key}" placeholder="待识别" />
        </label>
      `;
    })
    .join("");
}

function statusText(status) {
  if (status === "new") return "待分析";
  if (status === "processing") return "识别中";
  if (status === "done") return "已识别";
  if (status === "failed") return "识别失败";
  if (status === "manual") return "手动";
  return "待确认";
}

function calculateAveragesWithCounts() {
  const averages = {};
  const counts = {};

  metricOrder.forEach((key) => {
    const nums = pendingReadings
      .map((reading) => reading.values[key])
      .filter(Number.isFinite);

    if (nums.length) {
      averages[key] = nums.reduce((sum, value) => sum + value, 0) / nums.length;
      counts[key] = nums.length;
    }
  });

  return { averages, counts };
}

function updateAverageSummary() {
  const { averages, counts } = calculateAveragesWithCounts();
  const entries = Object.entries(averages);

  els.saveRecordButton.disabled = entries.length === 0;

  if (!entries.length) {
    els.averageSummary.textContent = "还没有可保存的数据";
    return;
  }

  els.averageSummary.textContent = entries
    .map(([key, value]) => `${metricDefs[key].label} ${formatMetricValue(value)}（n=${counts[key]}）`)
    .join(" · ");
}

function formatMetricValue(value) {
  return Number(value).toFixed(2);
}

async function saveCurrentRecord() {
  const { averages, counts } = calculateAveragesWithCounts();
  if (!activeProfileId || Object.keys(averages).length === 0) return;

  const record = {
    id: crypto.randomUUID(),
    profileId: activeProfileId,
    capturedAt: new Date(els.capturedAtInput.value || Date.now()).toISOString(),
    createdAt: new Date().toISOString(),
    averages,
    counts,
    readings: pendingReadings.map((reading) => ({
      fileName: reading.fileName,
      text: reading.text,
      values: reading.values,
      status: reading.status,
    })),
  };

  await putItem(STORE_RECORDS, record);
  clearUploads();
  await loadRecords();
  renderAll();
  switchTab("trends");
}

function clearUploads() {
  const urls = new Set(pendingReadings.map((reading) => reading.previewUrl).filter(Boolean));
  urls.forEach((url) => URL.revokeObjectURL(url));
  pendingReadings = [];
  els.ocrStatus.textContent = "等待上传图片";
  renderUploads();
}

function renderRecords() {
  els.recordsList.innerHTML = "";

  if (!records.length) {
    els.recordsList.textContent = "当前用户还没有记录";
    return;
  }

  records.forEach((record) => {
    const div = document.createElement("div");
    div.className = "record-item";
    div.innerHTML = `
      <strong>${new Date(record.capturedAt).toLocaleString()}</strong>
      <p>${Object.entries(record.averages)
        .map(([key, value]) => `${metricDefs[key]?.label || key}: ${formatMetricValue(value)}`)
        .join(" · ")}</p>
    `;
    els.recordsList.appendChild(div);
  });
}

function renderChart() {
  if (!els.trendCanvas || typeof Chart === "undefined") return;

  const metricMap = {
  axial: ["axialRight", "axialLeft"],
  cornealThickness: ["cornealThicknessRight", "cornealThicknessLeft"],
  anteriorChamberDepth: ["anteriorChamberDepthRight", "anteriorChamberDepthLeft"],
  lensThickness: ["lensThicknessRight", "lensThicknessLeft"],
  vitreousChamberLength: ["vitreousChamberLengthRight", "vitreousChamberLengthLeft"],
  alCr: ["alCrRight", "alCrLeft"],
  k1: ["k1Right", "k1Left"],
  k2: ["k2Right", "k2Left"],
  kappa: ["kappaRight", "kappaLeft"],
};

  const keys = metricMap[currentChartMetric] || metricMap.axial;
  const labels = records.map((record) => new Date(record.capturedAt).toLocaleDateString());

  const datasets = keys.map((key) => ({
    label: metricDefs[key].label,
    data: records.map((record) => record.averages[key] ?? null),
    spanGaps: true,
  }));

  els.emptyTrendMessage.hidden = records.length > 0;

  if (chart) chart.destroy();

  chart = new Chart(els.trendCanvas, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: false },
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