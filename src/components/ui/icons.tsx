/**
 * Shared Lucide interface icons for BhoomiSetu.
 *
 * Thin wrappers so every icon in the product shares the site's stroke
 * weight (1.75) and inherits color/size via currentColor + Tailwind classes.
 * Brand motifs (BrandMark, decor parcel art) stay as bespoke SVG by design.
 */
import type { ComponentType } from "react";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  Landmark,
  Lock,
  Mountain,
  Search,
  Table2,
  TriangleAlert,
  X,
} from "lucide-react";

type LucideGlyph = ComponentType<{
  className?: string;
  strokeWidth?: number | string;
  "aria-hidden"?: boolean;
}>;

type IconProps = { className?: string; "aria-hidden"?: boolean };

function wrap(Glyph: LucideGlyph) {
  return function Icon({ className = "h-4 w-4", ...rest }: IconProps) {
    return <Glyph className={className} strokeWidth={1.75} aria-hidden {...rest} />;
  };
}

export const SearchIcon = wrap(Search);
export const XIcon = wrap(X);
export const ArrowLeftIcon = wrap(ArrowLeft);
export const ArrowRightIcon = wrap(ArrowRight);
export const TriangleAlertIcon = wrap(TriangleAlert);
export const LockIcon = wrap(Lock);
export const ArchiveIcon = wrap(Archive);

/** Evidence-type glyphs used by repository result cards. */
const TYPE_GLYPHS: Record<string, LucideGlyph> = {
  "Policy brief": FileText,
  Dataset: Table2,
  "Journal paper": BookOpen,
  "Field study": Mountain,
  "Government report": Landmark,
};

export function typeGlyph(type: string): LucideGlyph {
  return TYPE_GLYPHS[type] ?? FileText;
}

/** Small provenance marker for the source line on evidence cards. */
export const SourceGlyph = wrap(Archive);
