// local-plugins/recent-notes/src/components/RecentNotes.tsx
import { formatDate } from "@quartz-community/utils/date";
import { byDateAndAlphabetical, getDate } from "@quartz-community/utils/sort";
import { isFolderPath } from "@quartz-community/utils/path";

// local-plugins/recent-notes/src/util/lang.ts
import { classNames } from "@quartz-community/utils/lang";

// local-plugins/recent-notes/src/i18n/locales/en-US.ts
var en_US_default = {
  components: {
    recentNotes: {
      title: "Recent Notes",
      seeRemainingMore: ({ remaining }) => `See ${remaining} more \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/ar-SA.ts
var ar_SA_default = {
  components: {
    recentNotes: {
      title: "\u0622\u062E\u0631 \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A",
      seeRemainingMore: ({ remaining }) => `\u062A\u0635\u0641\u062D ${remaining} \u0623\u0643\u062B\u0631 \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/ca-ES.ts
var ca_ES_default = {
  components: {
    recentNotes: {
      title: "Notes Recents",
      seeRemainingMore: ({ remaining }) => `Vegi ${remaining} m\xE9s \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/cs-CZ.ts
var cs_CZ_default = {
  components: {
    recentNotes: {
      title: "Nejnov\u011Bj\u0161\xED pozn\xE1mky",
      seeRemainingMore: ({ remaining }) => `Zobraz ${remaining} dal\u0161\xEDch \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/de-DE.ts
var de_DE_default = {
  components: {
    recentNotes: {
      title: "Zuletzt bearbeitete Seiten",
      seeRemainingMore: ({ remaining }) => `${remaining} weitere ansehen \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/en-GB.ts
var en_GB_default = {
  components: {
    recentNotes: {
      title: "Recent Notes",
      seeRemainingMore: ({ remaining }) => `See ${remaining} more \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/es-ES.ts
var es_ES_default = {
  components: {
    recentNotes: {
      title: "Notas Recientes",
      seeRemainingMore: ({ remaining }) => `Vea ${remaining} m\xE1s \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/fa-IR.ts
var fa_IR_default = {
  components: {
    recentNotes: {
      title: "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u0627\u062E\u06CC\u0631",
      seeRemainingMore: ({ remaining }) => `${remaining} \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u062F\u06CC\u06AF\u0631 \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/fi-FI.ts
var fi_FI_default = {
  components: {
    recentNotes: {
      title: "Viimeisimm\xE4t muistiinpanot",
      seeRemainingMore: ({ remaining }) => `N\xE4yt\xE4 ${remaining} lis\xE4\xE4 \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/fr-FR.ts
var fr_FR_default = {
  components: {
    recentNotes: {
      title: "Notes R\xE9centes",
      seeRemainingMore: ({ remaining }) => `Voir ${remaining} de plus \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/he-IL.ts
var he_IL_default = {
  components: {
    recentNotes: {
      title: "\u05D4\u05E2\u05E8\u05D5\u05EA \u05D0\u05D7\u05E8\u05D5\u05E0\u05D5\u05EA",
      seeRemainingMore: ({ remaining }) => `\u05E2\u05D9\u05D9\u05DF \u05D1 ${remaining} \u05E0\u05D5\u05E1\u05E4\u05D9\u05DD \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/hu-HU.ts
var hu_HU_default = {
  components: {
    recentNotes: {
      title: "Legut\xF3bbi jegyzetek",
      seeRemainingMore: ({ remaining }) => `${remaining} tov\xE1bbi megtekint\xE9se \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/id-ID.ts
var id_ID_default = {
  components: {
    recentNotes: {
      title: "Catatan Terbaru",
      seeRemainingMore: ({ remaining }) => `Lihat ${remaining} lagi \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/it-IT.ts
var it_IT_default = {
  components: {
    recentNotes: {
      title: "Note recenti",
      seeRemainingMore: ({ remaining }) => remaining === 1 ? "Vedi 1 altra \u2192" : `Vedi altre ${remaining} \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/ja-JP.ts
var ja_JP_default = {
  components: {
    recentNotes: {
      title: "\u6700\u8FD1\u306E\u8A18\u4E8B",
      seeRemainingMore: ({ remaining }) => `\u3055\u3089\u306B${remaining}\u4EF6 \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/kk-KZ.ts
var kk_KZ_default = {
  components: {
    recentNotes: {
      title: "\u0421\u043E\u04A3\u0493\u044B \u0436\u0430\u0437\u0431\u0430\u043B\u0430\u0440",
      seeRemainingMore: ({ remaining }) => `\u0422\u0430\u0493\u044B ${remaining} \u0436\u0430\u0437\u0431\u0430\u043D\u044B \u049B\u0430\u0440\u0430\u0443 \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/ko-KR.ts
var ko_KR_default = {
  components: {
    recentNotes: {
      title: "\uCD5C\uADFC \uAC8C\uC2DC\uAE00",
      seeRemainingMore: ({ remaining }) => `${remaining}\uAC74 \uB354\uBCF4\uAE30 \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/lt-LT.ts
var lt_LT_default = {
  components: {
    recentNotes: {
      title: "Naujausi U\u017Era\u0161ai",
      seeRemainingMore: ({ remaining }) => `Per\u017Ei\u016Br\u0117ti dar ${remaining} \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/nb-NO.ts
var nb_NO_default = {
  components: {
    recentNotes: {
      title: "Nylige notater",
      seeRemainingMore: ({ remaining }) => `Se ${remaining} til \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/nl-NL.ts
var nl_NL_default = {
  components: {
    recentNotes: {
      title: "Recente notities",
      seeRemainingMore: ({ remaining }) => `Zie ${remaining} meer \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/pl-PL.ts
var pl_PL_default = {
  components: {
    recentNotes: {
      title: "Najnowsze notatki",
      seeRemainingMore: ({ remaining }) => `Zobacz ${remaining} nastepnych \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/pt-BR.ts
var pt_BR_default = {
  components: {
    recentNotes: {
      title: "Notas recentes",
      seeRemainingMore: ({ remaining }) => `Veja mais ${remaining} \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/ro-RO.ts
var ro_RO_default = {
  components: {
    recentNotes: {
      title: "Noti\u021Be recente",
      seeRemainingMore: ({ remaining }) => `Vezi \xEEnc\u0103 ${remaining} \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/ru-RU.ts
var ru_RU_default = {
  components: {
    recentNotes: {
      title: "\u041D\u0435\u0434\u0430\u0432\u043D\u0438\u0435 \u0437\u0430\u043C\u0435\u0442\u043A\u0438",
      seeRemainingMore: ({ remaining }) => `\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u043E\u0441\u0442\u0430\u0432\u0448${getForm(remaining, "\u0443\u044E\u0441\u044F", "\u0438\u0435\u0441\u044F", "\u0438\u0435\u0441\u044F")} ${remaining} \u2192`
    }
  }
};
function getForm(number, form1, form2, form5) {
  const remainder100 = number % 100;
  const remainder10 = remainder100 % 10;
  if (remainder100 >= 10 && remainder100 <= 20) return form5;
  if (remainder10 > 1 && remainder10 < 5) return form2;
  if (remainder10 == 1) return form1;
  return form5;
}

// local-plugins/recent-notes/src/i18n/locales/th-TH.ts
var th_TH_default = {
  components: {
    recentNotes: {
      title: "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14",
      seeRemainingMore: ({ remaining }) => `\u0E14\u0E39\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E2D\u0E35\u0E01 ${remaining} \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23 \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/tr-TR.ts
var tr_TR_default = {
  components: {
    recentNotes: {
      title: "Son Notlar",
      seeRemainingMore: ({ remaining }) => `${remaining} tane daha g\xF6r \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/uk-UA.ts
var uk_UA_default = {
  components: {
    recentNotes: {
      title: "\u041E\u0441\u0442\u0430\u043D\u043D\u0456 \u043D\u043E\u0442\u0430\u0442\u043A\u0438",
      seeRemainingMore: ({ remaining }) => `\u041F\u0435\u0440\u0435\u0433\u043B\u044F\u043D\u0443\u0442\u0438 \u0449\u0435 ${remaining} \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/vi-VN.ts
var vi_VN_default = {
  components: {
    recentNotes: {
      title: "Ghi ch\xFA g\u1EA7n \u0111\xE2y",
      seeRemainingMore: ({ remaining }) => `Xem th\xEAm ${remaining} ghi ch\xFA \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/zh-CN.ts
var zh_CN_default = {
  components: {
    recentNotes: {
      title: "\u6700\u8FD1\u7684\u7B14\u8BB0",
      seeRemainingMore: ({ remaining }) => `\u67E5\u770B\u66F4\u591A${remaining}\u7BC7\u7B14\u8BB0 \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/locales/zh-TW.ts
var zh_TW_default = {
  components: {
    recentNotes: {
      title: "\u6700\u8FD1\u7684\u7B46\u8A18",
      seeRemainingMore: ({ remaining }) => `\u67E5\u770B\u66F4\u591A ${remaining} \u7BC7\u7B46\u8A18 \u2192`
    }
  }
};

// local-plugins/recent-notes/src/i18n/index.ts
var locales = {
  "en-US": en_US_default,
  "ar-SA": ar_SA_default,
  "ca-ES": ca_ES_default,
  "cs-CZ": cs_CZ_default,
  "de-DE": de_DE_default,
  "en-GB": en_GB_default,
  "es-ES": es_ES_default,
  "fa-IR": fa_IR_default,
  "fi-FI": fi_FI_default,
  "fr-FR": fr_FR_default,
  "he-IL": he_IL_default,
  "hu-HU": hu_HU_default,
  "id-ID": id_ID_default,
  "it-IT": it_IT_default,
  "ja-JP": ja_JP_default,
  "kk-KZ": kk_KZ_default,
  "ko-KR": ko_KR_default,
  "lt-LT": lt_LT_default,
  "nb-NO": nb_NO_default,
  "nl-NL": nl_NL_default,
  "pl-PL": pl_PL_default,
  "pt-BR": pt_BR_default,
  "ro-RO": ro_RO_default,
  "ru-RU": ru_RU_default,
  "th-TH": th_TH_default,
  "tr-TR": tr_TR_default,
  "uk-UA": uk_UA_default,
  "vi-VN": vi_VN_default,
  "zh-CN": zh_CN_default,
  "zh-TW": zh_TW_default
};
function i18n(locale) {
  return locales[locale] || en_US_default;
}

// local-plugins/recent-notes/src/util/path.ts
import { simplifySlug as utilSimplifySlug, joinSegments } from "@quartz-community/utils";
function simplifySlug(fp) {
  return utilSimplifySlug(fp);
}
function resolveRelative(current, target) {
  const simplified = simplifySlug(target);
  const rootPath = pathToRoot(current);
  return joinSegments(rootPath, simplified);
}
function pathToRoot(slug) {
  let rootPath = slug.split("/").filter((x) => x !== "").slice(0, -1).map((_) => "..").join("/");
  if (rootPath.length === 0) {
    rootPath = ".";
  }
  return rootPath;
}

// local-plugins/recent-notes/src/components/styles/recentNotes.scss
var recentNotes_default = ".recent-notes {\n  & > h3 {\n    margin: 0.5rem 0 0 0;\n    font-size: 1rem;\n  }\n\n  & > ul.recent-ul {\n    list-style: none;\n    margin-top: 1rem;\n    padding-left: 0;\n\n    & > li {\n      margin: 1rem 0;\n      .section > .desc > h3 > a {\n        background-color: transparent;\n      }\n\n      .section > .meta {\n        margin: 0 0 0.5rem 0;\n        opacity: 0.6;\n      }\n    }\n  }\n}\n";

// local-plugins/recent-notes/src/components/RecentNotes.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
function resolveDefaultDateType(data, cfg) {
  return data.defaultDateType ?? cfg.defaultDateType;
}
var withResolvedDateType = (data, cfg) => {
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
var byDateAndAlphabeticalWithConfig = (cfg) => {
  const sortFn = byDateAndAlphabetical();
  return (f1, f2) => sortFn(
    withResolvedDateType(f1, cfg),
    withResolvedDateType(f2, cfg)
  );
};
var defaultOptions = (cfg) => ({
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
    const opts = { ...defaultOptions(cfg), ...userOpts };
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
  RecentNotes.css = recentNotes_default;
  return RecentNotes;
});
export {
  RecentNotes_default as RecentNotes,
  filterListedPages,
  isFolderPageSlug,
  isTagPageSlug,
  resolveDefaultDateType,
  withResolvedDateType
};
//# sourceMappingURL=index.js.map
