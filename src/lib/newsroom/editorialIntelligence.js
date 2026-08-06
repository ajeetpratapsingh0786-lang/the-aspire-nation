const SECTION_WEIGHTS = {
  governance: 14,
  parliament: 14,
  judiciary: 14,
  economy: 13,
  banking: 13,
  international: 12,
  defence: 12,
  environment: 11,
  science: 11,
  agriculture: 10,
  infrastructure: 10,
  education: 9,
  health: 9,
};

const IMPACT_TERMS = [
  "supreme court", "parliament", "cabinet", "rbi", "sebi", "election commission",
  "constitutional", "bill", "act", "judgment", "scheme", "policy", "budget",
  "inflation", "gdp", "employment", "national security", "climate", "space",
  "international", "treaty", "report", "index", "mission", "launch",
];

const TRUSTED_SOURCE_TERMS = [
  "pib", "parliament", "supreme court", "rbi", "sebi", "isro", "who", "united nations",
  "world bank", "imf", "government", "ministry", "commission", "authority",
];

function text(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function searchable(candidate) {
  return `${text(candidate?.headline)} ${text(candidate?.verified_summary)} ${text(candidate?.why_it_matters)} ${text(candidate?.section)}`.toLowerCase();
}

function words(value) {
  return new Set(
    text(value)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3)
  );
}

function similarity(a, b) {
  const left = words(`${a?.headline || ""} ${a?.verified_summary || ""}`);
  const right = words(`${b?.headline || ""} ${b?.verified_summary || ""}`);
  if (!left.size || !right.size) return 0;
  let common = 0;
  for (const item of left) if (right.has(item)) common += 1;
  return common / Math.max(1, Math.min(left.size, right.size));
}

export function recommendVisualType(candidate = {}) {
  const haystack = searchable(candidate);
  if (/border|country|state|sea|ocean|river|corridor|international|summit|conflict|region|island/.test(haystack)) return "map";
  if (/year|history|amendment|judgment|court|deadline|phase|sequence|anniversary/.test(haystack)) return "timeline";
  if (/inflation|gdp|rate|growth|decline|increase|decrease|budget|exports|imports|index|survey|data|percent|crore/.test(haystack)) return "chart";
  if (/process|scheme|mission|mechanism|how|technology|science|system|procedure|framework/.test(haystack)) return "data infographic";
  if (/institution|parliament|court|ministry|commission|rbi|sebi|organisation|organization/.test(haystack)) return "institutional scene";
  return "photo illustration";
}

export function scoreCandidate(candidate = {}) {
  const haystack = searchable(candidate);
  const source = text(candidate?.source_name).toLowerCase();
  let nationalImportance = 4;
  let examRelevance = 4;
  let publicInterest = 3;
  let sourceStrength = 3;
  let visualPotential = 4;

  for (const [term, weight] of Object.entries(SECTION_WEIGHTS)) {
    if (haystack.includes(term)) {
      nationalImportance += weight / 4;
      examRelevance += weight / 3.5;
    }
  }

  for (const term of IMPACT_TERMS) {
    if (haystack.includes(term)) {
      nationalImportance += 0.7;
      examRelevance += 0.8;
      publicInterest += 0.35;
    }
  }

  for (const term of TRUSTED_SOURCE_TERMS) {
    if (source.includes(term)) sourceStrength += 0.8;
  }

  const visual = recommendVisualType(candidate);
  if (["map", "timeline", "chart", "data infographic"].includes(visual)) visualPotential += 3;
  if (text(candidate?.verified_summary).length > 250) examRelevance += 0.8;
  if (text(candidate?.why_it_matters).length > 100) publicInterest += 0.7;

  const clamp = (value) => Math.max(1, Math.min(10, Math.round(value * 10) / 10));
  nationalImportance = clamp(nationalImportance);
  examRelevance = clamp(examRelevance);
  publicInterest = clamp(publicInterest);
  sourceStrength = clamp(sourceStrength);
  visualPotential = clamp(visualPotential);

  const total = Math.round((
    nationalImportance * 0.28 +
    examRelevance * 0.34 +
    publicInterest * 0.16 +
    sourceStrength * 0.14 +
    visualPotential * 0.08
  ) * 10) / 10;

  return {
    national_importance: nationalImportance,
    exam_relevance: examRelevance,
    public_interest: publicInterest,
    source_strength: sourceStrength,
    visual_potential: visualPotential,
    total,
  };
}

export function editorialPriority(score) {
  const total = Number(score?.total || 0);
  if (total >= 8.2) return "lead";
  if (total >= 7.2) return "major";
  if (total >= 5.8) return "standard";
  return "brief";
}

export function prepareEditorialCandidates(candidates = []) {
  const ordered = (Array.isArray(candidates) ? candidates : [])
    .map((candidate) => {
      const editorial_scores = scoreCandidate(candidate);
      return {
        ...candidate,
        visual_type: recommendVisualType(candidate),
        editorial_scores,
        editorial_score: editorial_scores.total,
        editorial_priority: editorialPriority(editorial_scores),
      };
    })
    .sort((a, b) => Number(b.editorial_score) - Number(a.editorial_score));

  const kept = [];
  for (const candidate of ordered) {
    const duplicate = kept.some((existing) => similarity(existing, candidate) >= 0.78);
    if (!duplicate) kept.push(candidate);
  }
  return kept;
}

function compactHeadline(value = "") {
  return text(value)
    .replace(/\baccording to\b/gi, "")
    .replace(/\bhas announced\b/gi, "announces")
    .replace(/\bhas approved\b/gi, "approves")
    .replace(/\bhas launched\b/gi, "launches")
    .replace(/\s+([,:;])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function normalizeAssignments(assignments = []) {
  const pageCounters = new Map();
  const output = [];
  const seen = new Set();

  for (const raw of Array.isArray(assignments) ? assignments : []) {
    const page = Math.max(1, Math.min(8, Number(raw?.page || 1)));
    const headline = compactHeadline(raw?.headline || "Untitled story");
    const treatment = text(raw?.treatment_type || "news").toLowerCase();
    const key = `${page}|${headline.toLowerCase()}|${treatment}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const rank = (pageCounters.get(page) || 0) + 1;
    pageCounters.set(page, rank);
    const score = raw?.editorial_scores || scoreCandidate(raw);
    const defaultRole = rank === 1 ? "lead" : rank <= 3 ? "major" : rank <= 6 ? "standard" : "brief";

    output.push({
      ...raw,
      page,
      rank,
      headline,
      editorial_scores: score,
      editorial_score: Number(raw?.editorial_score || score.total),
      editorial_role: text(raw?.editorial_role || defaultRole).toLowerCase(),
      treatment_type: treatment,
      visual_type: text(raw?.visual_type || recommendVisualType(raw)).toLowerCase(),
    });
  }

  return output
    .sort((a, b) => Number(a.page) - Number(b.page) || Number(a.rank) - Number(b.rank))
    .map((item, index) => ({ ...item, story_id: `S${String(index + 1).padStart(3, "0")}` }));
}
