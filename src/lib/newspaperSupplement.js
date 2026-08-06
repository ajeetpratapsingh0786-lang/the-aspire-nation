function textOf(article = {}) {
  return [
    article.headline,
    article.deck,
    article.body,
    article.fact_box,
    article.exam_connection,
    article.section,
    article.treatment_type,
    article.visual_type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function storyRole(article = {}) {
  const explicit = String(article.editorial_role || "").toLowerCase();
  if (["lead", "major", "standard", "brief"].includes(explicit)) return explicit;
  const slot = String(article.slot || "").toLowerCase();
  if (/hero|lead/.test(slot) || Number(article.rank) === 1) return "lead";
  if (/major|secondary/.test(slot) || Number(article.rank) <= 3) return "major";
  if (/brief/.test(slot)) return "brief";
  return "standard";
}

export function isSchemeStory(article = {}) {
  const text = textOf(article);
  return /\bscheme\b|\bmission\b|\byojana\b|programme|beneficiar|welfare|subsid|insurance|पेंशन|योजना|मिशन|लाभार्थी|कल्याण/.test(text);
}

export function supplementaryOptions(article = {}) {
  const text = textOf(article);
  const role = storyRole(article);
  const options = [];

  const add = (id, label, hindiLabel) => {
    if (!options.some((item) => item.id === id)) options.push({ id, label, hindiLabel });
  };

  if (/science|technology|space|satellite|mission|process|mechanism|how it works|विज्ञान|तकनीक|अंतरिक्ष|प्रक्रिया/.test(text)) {
    add("visual-notes", "Visual notes", "विजुअल नोट्स");
  }
  if (/court|judg|bill|act|law|amendment|history|launched|year|timeline|अदालत|विधेयक|कानून|संशोधन|इतिहास/.test(text)) {
    add("timeline", "Timeline", "टाइमलाइन");
  }
  if (/econom|bank|inflation|gdp|rate|percent|₹|crore|lakh|data|index|अर्थव्यवस्था|बैंक|महंगाई|प्रतिशत|करोड़/.test(text)) {
    add("data", "Data snapshot", "डेटा स्नैपशॉट");
  }
  if (/international|country|border|river|basin|state|district|geograph|environment|park|species|देश|सीमा|नदी|राज्य|भूगोल|पर्यावरण/.test(text)) {
    add("map", "Map focus", "मैप फोकस");
  }
  if (isSchemeStory(article)) {
    add("scheme", "Scheme notes", "योजना नोट्स");
  }
  if (role === "lead" || role === "major") {
    add("smart-revision", "Smart revision", "स्मार्ट रिवीजन");
  }

  return options.slice(0, role === "lead" || role === "major" ? 4 : 2);
}

export function shouldOfferSupplement(article = {}) {
  return supplementaryOptions(article).length > 0;
}

export function shouldOfferCompleteAnalysis(article = {}) {
  const role = storyRole(article);
  return role === "lead" || role === "major";
}
