import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Props {
  subName: string
  subSlug: string
  parentName: string
  parentSlug: string
}

export default function SubSectionHeader({ subName, subSlug, parentName, parentSlug }: Props) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex flex-col gap-1">
        {/* Breadcrumb */}
        <Link
          href={`/categories/${parentSlug}`}
          className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--gold)] tracking-widest uppercase hover:opacity-75 transition-opacity"
          aria-label={`القسم الرئيسي: ${parentName}`}
        >
          <span aria-hidden="true">◆</span>
          {parentName}
        </Link>
        {/* Sub name */}
        <h2
          id={`sub-heading-${subSlug}`}
          className="text-[var(--text-1)] text-xl md:text-2xl font-black leading-tight"
        >
          {subName}
        </h2>
      </div>

      <Link
        href={`/categories/${subSlug}`}
        className="inline-flex items-center gap-1.5 mt-1 text-sm font-semibold text-[var(--text-3)] hover:text-[var(--gold)] transition-colors duration-200 group shrink-0"
        aria-label={`عرض جميع منتجات ${subName}`}
      >
        عرض الكل
        <ArrowLeft
          size={13}
          className="transition-transform duration-200 group-hover:-translate-x-1"
          aria-hidden="true"
        />
      </Link>
    </div>
  )
}
