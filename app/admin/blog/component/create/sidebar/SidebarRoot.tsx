"use client";

import { Send, Image as ImageIcon, FolderTree, Sparkles, Link2, Search, Eye, Gauge } from "lucide-react";
import { CollapsibleSection } from "./CollapsibleSection";
import { PublishSection } from "./PublishSection";
import { CoverImageSection } from "./CoverImageSection";
import { CategoryTagSection } from "./CategoryTagSection";
import { KeywordsSection } from "./KeywordsSection";
import { InternalLinksSection, type SelectedLink } from "./InternalLinksSection";
import { SeoSection } from "./SeoSection";
import { SerpPreview } from "./SerpPreview";
import { SeoScoreSection } from "./SeoScoreSection";
import type { BlogStatus } from "../../shared/StatusBadge";
import type { SeoScoreInput } from "../../../utils/seoScore";

interface SidebarRootProps {
  status: BlogStatus;
  onStatusChange: (s: BlogStatus) => void;
  scheduledFor: string | null;
  onScheduledForChange: (v: string | null) => void;

  coverImage: string;
  onCoverImageChange: (url: string) => void;

  categoryId: string | null;
  onCategoryChange: (id: string | null) => void;
  tagIds: string[];
  onTagsChange: (ids: string[]) => void;

  internalLinks: SelectedLink[];
  onInternalLinksChange: (links: SelectedLink[]) => void;

  title: string;
  excerpt: string;
  metaTitle: string;
  onMetaTitleChange: (v: string) => void;
  metaDescription: string;
  onMetaDescriptionChange: (v: string) => void;
  postKeywords: string[];
  onPostKeywordsChange: (v: string[]) => void;

  slug: string;
  seoScoreInput: SeoScoreInput;

  validationErrors: string[];
  onPublishClick: () => void;
  publishing: boolean;
}

export function SidebarRoot(props: SidebarRootProps) {
  return (
    <aside dir="rtl" className="h-full overflow-y-auto bg-[var(--surface)] md:border-r-[1.5px] border-b-[1.5px] md:border-b-0 border-[var(--border-md)]">
      <CollapsibleSection title="النشر" icon={<Send size={15} className="text-[var(--gold)]" />}>
        <PublishSection
          status={props.status}
          scheduledFor={props.scheduledFor}
          onStatusChange={props.onStatusChange}
          onScheduledForChange={props.onScheduledForChange}
          validationErrors={props.validationErrors}
          onPublishClick={props.onPublishClick}
          publishing={props.publishing}
        />
      </CollapsibleSection>

      <CollapsibleSection title="صورة الغلاف" icon={<ImageIcon size={15} className="text-[var(--gold)]" />}>
        <CoverImageSection value={props.coverImage} onChange={props.onCoverImageChange} />
      </CollapsibleSection>

      <CollapsibleSection title="التصنيف والوسوم" icon={<FolderTree size={15} className="text-[var(--gold)]" />}>
        <CategoryTagSection
          categoryId={props.categoryId}
          tagIds={props.tagIds}
          onCategoryChange={props.onCategoryChange}
          onTagsChange={props.onTagsChange}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="عصف ذهني للكلمات المفتاحية"
        icon={<Sparkles size={15} className="text-[var(--gold)]" />}
        defaultOpen={false}
      >
        <KeywordsSection />
      </CollapsibleSection>

      <CollapsibleSection
        title="الروابط الداخلية"
        icon={<Link2 size={15} className="text-[var(--gold)]" />}
        badge={
          props.internalLinks.length === 0
            ? <span className="text-[0.65rem] text-[var(--red)] font-bold">مطلوب</span>
            : <span className="text-[0.65rem] text-[#2f9e44] font-bold">{props.internalLinks.length}</span>
        }
      >
        <InternalLinksSection value={props.internalLinks} onChange={props.onInternalLinksChange} />
      </CollapsibleSection>

      <CollapsibleSection title="SEO والميتا" icon={<Search size={15} className="text-[var(--gold)]" />}>
        <SeoSection
          title={props.title}
          excerpt={props.excerpt}
          metaTitle={props.metaTitle}
          metaDescription={props.metaDescription}
          keywords={props.postKeywords}
          onMetaTitleChange={props.onMetaTitleChange}
          onMetaDescriptionChange={props.onMetaDescriptionChange}
          onKeywordsChange={props.onPostKeywordsChange}
        />
      </CollapsibleSection>

      <CollapsibleSection title="معاينة Google" icon={<Eye size={15} className="text-[var(--gold)]" />} defaultOpen={false}>
        <SerpPreview title={props.title} metaTitle={props.metaTitle} metaDescription={props.metaDescription} slug={props.slug} />
      </CollapsibleSection>

      <CollapsibleSection title="درجة SEO" icon={<Gauge size={15} className="text-[var(--gold)]" />}>
        <SeoScoreSection input={props.seoScoreInput} />
      </CollapsibleSection>
    </aside>
  );
}
