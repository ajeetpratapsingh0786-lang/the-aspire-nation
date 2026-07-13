import {
  FaBookOpen,
  FaBriefcase,
  FaPenNib,
  FaNewspaper,
  FaDownload,
  FaClipboardList,
} from "react-icons/fa";

import NewsCard from "./NewsCard";
import SectionTitle from "./SectionTitle";

export default function NewsGrid() {
  const cards = [
    ["Current Affairs", "Daily exam-focused current affairs.", FaNewspaper],
    ["Latest Jobs", "Government vacancies and notifications.", FaBriefcase],
    ["Admit Cards", "Exam city slips and admit card updates.", FaDownload],
    ["Results", "Latest result and merit list updates.", FaClipboardList],
    ["Editorial", "Simple analysis for aspirants.", FaPenNib],
    ["Daily Quiz", "Practice MCQs for daily revision.", FaBookOpen],
  ];

  return (
    <section className="bg-white border-y">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <SectionTitle
          title="Latest Sections"
          subtitle="Everything a serious aspirant needs in one organized platform."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(([title, desc, Icon]) => (
            <NewsCard key={title} title={title} desc={desc} Icon={Icon} />
          ))}
        </div>
      </div>
    </section>
  );
}