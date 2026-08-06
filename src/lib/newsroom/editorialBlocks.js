const NUMBER_PATTERN = /(?:₹|\$|€|£)?\s?\d[\d,.]*(?:\s?(?:%|crore|lakh|million|billion|trillion|km|kg|gw|mw|years?|days?|countries|states))?/gi;
const YEAR_PATTERN = /\b(?:19|20)\d{2}\b/g;

function clean(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function sentences(value = "") {
  return clean(value)
    .split(/(?<=[.!?।])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniq(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = clean(item).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function extractNumbers(article = {}) {
  const source = `${article.headline || ""} ${article.deck || ""} ${article.body || ""} ${article.fact_box || ""}`;
  return uniq((source.match(NUMBER_PATTERN) || []).map(clean)).slice(0, 4);
}

export function extractTimeline(article = {}) {
  const source = `${article.headline || ""} ${article.deck || ""} ${article.body || ""} ${article.fact_box || ""}`;
  const years = uniq(source.match(YEAR_PATTERN) || []).slice(0, 4);
  if (years.length < 2) return [];
  const sourceSentences = sentences(source);
  return years.map((year) => ({
    label: year,
    text: clean(sourceSentences.find((line) => line.includes(year)) || article.headline || "Key development"),
  }));
}

export function extractFactItems(article = {}) {
  const source = article.fact_box || article.exam_connection || article.deck || article.body || "";
  return uniq(
    clean(source)
      .split(/\s*[•|;]\s*|\s+-\s+|(?<=[.!?।])\s+/)
      .map((item) => item.replace(/^[-•]\s*/, "").trim())
      .filter((item) => item.length > 12)
  ).slice(0, 4);
}

export function chooseEditorialBlock(article = {}, pageNumber = 1) {
  const text = `${article.section || ""} ${article.headline || ""} ${article.deck || ""} ${article.visual_type || ""}`.toLowerCase();
  const numbers = extractNumbers(article);
  const timeline = extractTimeline(article);

  if (timeline.length >= 2 && /court|judg|law|bill|act|history|agreement|summit|phase|deadline|year/.test(text)) return "timeline";
  if (numbers.length >= 2 && /econom|bank|rbi|sebi|inflation|gdp|budget|trade|report|index|survey|growth|rate/.test(text)) return "data-watch";
  if (/international|world|border|country|sea|ocean|river|park|region|island|corridor|geograph/.test(text)) return "map-focus";
  if (/science|technology|space|mission|process|scheme|policy|mechanism|framework/.test(text)) return "explained";
  if (pageNumber === 7) return "quick-revision";
  if (numbers.length >= 2) return "numbers";
  return "exam-snapshot";
}

export function buildEditorialBlock(article = {}, pageNumber = 1) {
  const type = chooseEditorialBlock(article, pageNumber);
  return {
    type,
    numbers: extractNumbers(article),
    timeline: extractTimeline(article),
    facts: extractFactItems(article),
    title: clean(article.headline),
    section: clean(article.section),
    source: clean(article.source_name),
  };
}

export function pageBlockTargets(pageNumber = 1) {
  const targets = {
    1: ["data-watch", "timeline", "exam-snapshot", "numbers"],
    2: ["timeline", "explained", "exam-snapshot"],
    3: ["map-focus", "timeline", "exam-snapshot"],
    4: ["data-watch", "numbers", "explained", "exam-snapshot"],
    5: ["explained", "timeline", "exam-snapshot", "numbers"],
    6: ["map-focus", "explained", "timeline", "exam-snapshot"],
    7: ["quick-revision", "numbers", "exam-snapshot"],
    8: ["explained", "timeline", "data-watch"],
  };
  return targets[pageNumber] || targets[2];
}
