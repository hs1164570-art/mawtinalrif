import type { HomeSubSection } from "./types";
import Sub1HeroGrid from "./layouts/sub/Sub1HeroGrid";
import Sub2EqualGrid from "./layouts/sub/Sub2EqualGrid";
import Sub3Magazine from "./layouts/sub/Sub3Magazine";
import Sub4ScrollReel from "./layouts/sub/Sub4ScrollReel";
import Sub5Masonry from "./layouts/sub/Sub5Masonry";
import Sub6Cinematic from "./layouts/sub/Sub6Cinematic";
import Sub7Triptych from "./layouts/sub/Sub7Triptych";
import Sub8Brickwork from "./layouts/sub/Sub8Brickwork";
import Sub9HorizontalList from "./layouts/sub/Sub9HorizontalList";
import Sub10Spotlight from "./layouts/sub/Sub10Spotlight";
import Sub11Circles from "./layouts/sub/Sub11Circles";

const LAYOUTS = [
  Sub1HeroGrid,
  Sub2EqualGrid,
  Sub3Magazine,
  Sub4ScrollReel,
  Sub5Masonry,
  Sub6Cinematic,
  Sub7Triptych,
  Sub8Brickwork,
] as const;

interface Props {
  section: HomeSubSection;
  index: number;
  isPriority: boolean;
}

/**
 * كل قسم فرعي ياخد layout مختلف بناءً على رقمه
 * 11 قسم × 11 layout = كل قسم ليه تصميمه الخاص
 * لو في أكتر من 11 قسم → بيكرر من الأول
 */
export default function SubSectionWrapper({
  section,
  index,
  isPriority,
}: Props) {
  const Layout = LAYOUTS[index % LAYOUTS.length];
  return <Layout section={section} isPriority={isPriority} />;
}
