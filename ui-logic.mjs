export function paginateRecords(records, requestedPage, pageSize) {
  const safePageSize = Math.max(1, Number(pageSize) || 10);
  const total = records.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const page = Math.min(Math.max(1, Number(requestedPage) || 1), totalPages);
  const startIndex = (page - 1) * safePageSize;
  const endIndex = Math.min(startIndex + safePageSize, total);

  return {
    items: records.slice(startIndex, endIndex),
    page,
    pageSize: safePageSize,
    total,
    totalPages,
    startNumber: total === 0 ? 0 : startIndex + 1,
    endNumber: endIndex,
  };
}

function subtractYears(date, years) {
  const copy = new Date(date);
  copy.setFullYear(copy.getFullYear() - years);
  return copy;
}

export function filterTrendRecords(records, range, now = new Date()) {
  let start;

  if (range === 'year') {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  } else if (range === '12m') {
    start = subtractYears(now, 1);
  } else {
    const match = String(range).match(/^(\d+)y$/);
    const years = match ? Number(match[1]) : 1;
    start = subtractYears(now, years);
  }

  return records.filter((record) => {
    const value = record.capturedAt || record.date;
    if (!value) return false;
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && date >= start && date <= now;
  });
}

export function getTrendDensity(range, pointCount) {
  const longRange = ['4y', '5y'].includes(range);
  const mediumRange = ['2y', '3y'].includes(range);

  return {
    pointRadius: longRange ? 2 : mediumRange ? 3 : 4,
    pointHoverRadius: longRange ? 5 : 6,
    maxTicksLimit: longRange ? 8 : mediumRange ? 10 : 12,
    showDataLabels: !longRange && pointCount <= 24,
  };
}
