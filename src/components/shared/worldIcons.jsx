import {
  BookOpen,
  Boxes,
  Compass,
  Library,
  MoonStar,
  Sparkles,
  Stars,
  Trees,
} from "lucide-react";

const screenIcons = {
  Sanctuary: MoonStar,
  "Deck Garden": Trees,
  Archive: Library,
  Observatory: Stars,
};

const deckIcons = {
  "Today Ritual": Compass,
  "Recovery Run": Sparkles,
  "Flow Stack": BookOpen,
  "Blind Trainer": Boxes,
};

function getScreenIcon(name) {
  return screenIcons[name] || MoonStar;
}

function getDeckIcon(name) {
  return deckIcons[name] || BookOpen;
}

export { getDeckIcon, getScreenIcon };
