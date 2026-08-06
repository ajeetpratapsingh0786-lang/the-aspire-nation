const SUBJECT_RULES = [
  { subject: "Polity & Governance", words: ["polity", "parliament", "constitution", "governance", "judiciary", "court", "election", "राजव्यवस्था", "संसद", "संविधान", "न्यायपालिका", "शासन"] },
  { subject: "Economy & Banking", words: ["economy", "bank", "rbi", "inflation", "gdp", "finance", "tax", "market", "अर्थव्यवस्था", "बैंक", "महंगाई", "वित्त", "बाजार"] },
  { subject: "Science & Technology", words: ["science", "technology", "space", "isro", "ai", "digital", "research", "विज्ञान", "तकनीक", "अंतरिक्ष", "डिजिटल", "अनुसंधान"] },
  { subject: "Environment & Geography", words: ["environment", "climate", "forest", "wildlife", "geography", "disaster", "पर्यावरण", "जलवायु", "वन", "वन्यजीव", "भूगोल", "आपदा"] },
  { subject: "International Relations", words: ["international", "global", "foreign", "diplomacy", "united nations", "world", "अंतरराष्ट्रीय", "वैश्विक", "विदेश", "कूटनीति", "दुनिया"] },
  { subject: "Defence & Security", words: ["defence", "defense", "security", "army", "navy", "air force", "border", "रक्षा", "सुरक्षा", "सेना", "नौसेना", "सीमा"] },
  { subject: "Agriculture", words: ["agriculture", "farm", "crop", "farmer", "food", "कृषि", "खेती", "फसल", "किसान", "खाद्य"] },
  { subject: "Social Issues", words: ["education", "health", "women", "poverty", "welfare", "social", "शिक्षा", "स्वास्थ्य", "महिला", "गरीबी", "कल्याण", "सामाजिक"] },
];

export function getArticleSubject(article = {}) {
  const combined = [
    article.section,
    article.headline,
    article.deck,
    article.body,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const match = SUBJECT_RULES.find((rule) =>
    rule.words.some((word) => combined.includes(word))
  );

  return match?.subject || article.section || "General Current Affairs";
}
