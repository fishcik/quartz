import { jsx, jsxs } from "preact/jsx-runtime";
import { formatDate } from "@quartz-community/utils/date";
import { byDateAndAlphabetical, getDate } from "@quartz-community/utils/sort";
import { isFolderPath } from "@quartz-community/utils/path";
import { classNames } from "../util/lang";
import { i18n } from "../i18n";
import { resolveRelative } from "../util/path";
import style from "./styles/recentNotes.scss";
function resolveDefaultDateType(data, cfg) {
  return data.defaultDateType ?? cfg.defaultDateType;
}
const withResolvedDateType = (data, cfg) => {
  const resolved = resolveDefaultDateType(data, cfg);
  if (!resolved) return data;
  return { ...data, defaultDateType: resolved };
};
function filterListedPages(pages) {
  return pages.filter((p) => p.unlisted !== true);
}
function isTagPageSlug(slug) {
  if (!slug) return false;
  return slug === "tags" || slug === "tags/index" || slug.startsWith("tags/");
}
function isFolderPageSlug(slug) {
  if (!slug) return false;
  return isFolderPath(slug);
}
const byDateAndAlphabeticalWithConfig = (cfg) => {
  const sortFn = byDateAndAlphabetical();
  return (f1, f2) => sortFn(
    withResolvedDateType(f1, cfg),
    withResolvedDateType(f2, cfg)
  );
};
const defaultOptions = (cfg) => ({
  limit: 3,
  linkToMore: false,
  showTags: true,
  hideTagPages: false,
  hideFolderPages: false,
  filter: () => true,
  sort: byDateAndAlphabeticalWithConfig(cfg)
});
var RecentNotes_default = ((userOpts) => {
  const RecentNotes = ({
    allFiles,
    fileData,
    displayClass,
    cfg
  }) => {
    const parseDate = (d) => {
      if (!d) return 0;
      if (typeof d === "string") {
        const t = Date.parse(d);
        if (!isNaN(t)) return t;
      }
      if (d instanceof Date) return d.getTime();
      return 0;
    };
    const sortByDateDesc = (f1, f2) => {
      const d1 = parseDate(f1.frontmatter?.date ?? f1.dates?.published ?? f1.dates?.created);
      const d2 = parseDate(f2.frontmatter?.date ?? f2.dates?.published ?? f2.dates?.created);
      if (d1 !== d2) return d2 - d1;
      return (f1.frontmatter?.title ?? "").localeCompare(f2.frontmatter?.title ?? "");
    };
    const isActualArticle = (p) => {
      if (p.frontmatter?.draft === true) return false;
      const slug2 = (p.slug ?? "").toLowerCase();
      if (slug2 === "index" || slug2 === "tum-yazilar" || slug2 === "404" || slug2.endsWith("/index")) return false;
      if (slug2.startsWith("tags/") || slug2 === "tags") return false;
      if (isFolderPath(slug2)) return false;
      const title = (p.frontmatter?.title ?? "").toLowerCase();
      if (title === "sayko.ch" || title === "home" || title === "t\xFCm yaz\u0131lar") return false;
      return true;
    };
    const pages = filterListedPages(allFiles).filter((p) => !opts.hideTagPages || !isTagPageSlug(p.slug)).filter((p) => !opts.hideFolderPages || !isFolderPageSlug(p.slug)).filter(isActualArticle).filter(opts.filter).sort(sortByDateDesc);
    const remaining = Math.max(0, pages.length - opts.limit);
    const slug = fileData.slug;
    const locale = cfg.locale ?? "en-US";
    return /* @__PURE__ */ jsxs("div", { class: classNames(displayClass, "recent-notes"), children: [
      /* @__PURE__ */ jsx("h3", { children: opts.title ?? i18n(locale).components.recentNotes.title }),
      /* @__PURE__ */ jsx("ul", { class: "recent-ul", children: pages.slice(0, opts.limit).map((page) => {
        const title = page.frontmatter?.title ?? "Untitled";
        const tags = page.frontmatter?.tags ?? [];
        return /* @__PURE__ */ jsx("li", { class: "recent-li", children: /* @__PURE__ */ jsxs("div", { class: "section", children: [
          /* @__PURE__ */ jsx("div", { class: "desc", children: /* @__PURE__ */ jsx("h3", { children: /* @__PURE__ */ jsx("a", { href: resolveRelative(slug, page.slug), class: "internal", children: title }) }) }),
          page.dates && getDate(withResolvedDateType(page, cfg)) && /* @__PURE__ */ jsx("p", { class: "meta", children: /* @__PURE__ */ jsx("time", { datetime: getDate(withResolvedDateType(page, cfg)).toISOString(), children: formatDate(getDate(withResolvedDateType(page, cfg)), locale) }) }),
          opts.showTags && /* @__PURE__ */ jsx("ul", { class: "tags", children: tags.map((tag) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { class: "internal tag-link", href: resolveRelative(slug, `tags/${tag}`), children: tag }) })) })
        ] }) });
      }) }),
      opts.linkToMore && remaining > 0 && /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("a", { href: resolveRelative(slug, opts.linkToMore), children: i18n(locale).components.recentNotes.seeRemainingMore({ remaining }) }) })
    ] });
  };
  RecentNotes.css = style;
  return RecentNotes;
});
export {
  RecentNotes_default as default,
  filterListedPages,
  isFolderPageSlug,
  isTagPageSlug,
  resolveDefaultDateType,
  withResolvedDateType
};
//# sourceMappingURL=RecentNotes.js.map
