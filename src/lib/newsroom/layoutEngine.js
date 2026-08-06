import { buildEditorialBlock, pageBlockTargets } from "./editorialBlocks";

const PAGE_DENSITY = {
  1: { lead: 1, major: 3, standard: 5, brief: 3, visualTarget: 6 },
  2: { lead: 1, major: 2, standard: 3, brief: 2, visualTarget: 5 },
  3: { lead: 1, major: 2, standard: 2, brief: 2, visualTarget: 5 },
  4: { lead: 1, major: 2, standard: 3, brief: 2, visualTarget: 6 },
  5: { lead: 1, major: 2, standard: 3, brief: 2, visualTarget: 6 },
  6: { lead: 1, major: 2, standard: 2, brief: 2, visualTarget: 6 },
  7: { lead: 1, major: 1, standard: 3, brief: 2, visualTarget: 5 },
  8: { lead: 1, major: 2, standard: 2, brief: 1, visualTarget: 5 },
};

function hasVisual(article) {
  return Boolean(article?.image_url || article?.visual_prompt || article?.visual_type);
}

function editorialScore(article) {
  const slot = String(article?.slot || "").toLowerCase();
  const rank = Number(article?.rank || article?.display_order || 999);
  let score = 1000 - Math.min(rank, 999);
  if (/hero|lead/.test(slot)) score += 5000;
  if (/major|secondary/.test(slot)) score += 2500;
  if (/brief/.test(slot)) score -= 300;
  if (hasVisual(article)) score += 180;
  if (article?.deck) score += 40;
  if (article?.fact_box) score += 30;
  return score;
}

function preferredVisual(article, pageNumber) {
  const text = `${article?.section || ""} ${article?.headline || ""} ${article?.visual_type || ""}`.toLowerCase();
  if (/econom|bank|inflation|rbi|sebi|agri|budget|trade/.test(text)) return "chart";
  if (/international|world|border|country|sea|ocean|region|environment|park|river/.test(text)) return "map";
  if (/court|judgment|act|bill|law|history|agreement|summit/.test(text)) return "timeline";
  if (/science|technology|space|mission|process|scheme|policy/.test(text)) return "process";
  if (pageNumber === 7) return "revision-card";
  return hasVisual(article) ? "editorial-image" : "fact-box";
}

export function buildPagePlan(articles = [], pageNumber = 1) {
  const density = PAGE_DENSITY[pageNumber] || PAGE_DENSITY[2];
  const ordered = [...articles].sort((a, b) => editorialScore(b) - editorialScore(a));
  const roleSequence = [
    ...Array(density.lead).fill("lead"),
    ...Array(density.major).fill("major"),
    ...Array(density.standard).fill("standard"),
    ...Array(density.brief).fill("brief"),
  ];

  const blockTargets = pageBlockTargets(pageNumber);
  return ordered.map((article, index) => {
    const editorialBlock = buildEditorialBlock(article, pageNumber);
    const preferredBlock = blockTargets.includes(editorialBlock.type)
      ? editorialBlock.type
      : blockTargets[index % blockTargets.length];
    return {
      ...article,
      __layoutRole: roleSequence[index] || "brief",
      __preferredVisual: preferredVisual(article, pageNumber),
      __visualPriority: index < density.visualTarget,
      __layoutIndex: index,
      __editorialBlock: preferredBlock,
      __blockPayload: { ...editorialBlock, type: preferredBlock },
    };
  });
}

export function getPageDensity(pageNumber = 1) {
  return PAGE_DENSITY[pageNumber] || PAGE_DENSITY[2];
}
