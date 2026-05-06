import ru from "../messages/ru.json";
import tj from "../messages/tj.json";

const ruKeys = Object.keys(ru).sort();
const tjKeys = Object.keys(tj).sort();
const missingInTj = ruKeys.filter((key) => !(key in tj));
const missingInRu = tjKeys.filter((key) => !(key in ru));

if (missingInTj.length || missingInRu.length) {
  console.log(`missingInTj=${missingInTj.join(",") || "none"}`);
  console.log(`missingInRu=${missingInRu.join(",") || "none"}`);
  process.exit(1);
}

console.log(`i18n=ok; keys=${ruKeys.length}`);
