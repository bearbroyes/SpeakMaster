import type { MouseEvent } from "react";
import { motion } from "motion/react";
import { Search, Sparkles, Sliders, ChevronRight, Star, AlertCircle } from "lucide-react";
import { MONOLOGUES } from "../data";
import type { Monologue, PracticeMode, TopicProgress, TopicStatus } from "../types";
import type { ThemeStyles } from "../themes";
import type { TranslationKey } from "../i18n/translations";
import { countCompleted } from "../utils/progress";

interface Props {
  ST: ThemeStyles;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedThemeFilter: string | null;
  setSelectedThemeFilter: (t: string | null) => void;
  filteredMonologues: Monologue[];
  themes: string[];
  progress: Record<number, TopicProgress>;
  showUncompletedOnly: boolean;
  setShowUncompletedOnly: (v: boolean) => void;
  practiceMode: PracticeMode;
  setPracticeMode: (m: PracticeMode) => void;
  micPermissionError: string | null;
  onSelect: (m: Monologue) => void;
  onSurpriseMe: (e: MouseEvent<HTMLButtonElement>) => void;
}

function statusLabel(status: TopicStatus, t: Props["t"]): string {
  if (status === "submitted") return t("statusSubmitted");
  if (status === "recorded") return t("statusRecorded");
  return t("statusNotStarted");
}

function statusColor(status: TopicStatus, ST: ThemeStyles): string {
  if (status === "submitted") return ST.statusSubmitted;
  if (status === "recorded") return ST.statusRecorded;
  return ST.statusNotStarted;
}

export function GridDashboard({
  ST,
  t,
  searchQuery,
  setSearchQuery,
  selectedThemeFilter,
  setSelectedThemeFilter,
  filteredMonologues,
  themes,
  progress,
  showUncompletedOnly,
  setShowUncompletedOnly,
  practiceMode,
  setPracticeMode,
  micPermissionError,
  onSelect,
  onSurpriseMe,
}: Props) {
  const done = countCompleted(progress, MONOLOGUES.length);

  const displayList = showUncompletedOnly
    ? filteredMonologues.filter((m) => (progress[m.id]?.status ?? "not_started") === "not_started")
    : filteredMonologues;

  return (
    <motion.div
      key="theme-grid-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
      id="dashboard_grid_container"
    >
      <div id="frosted_hero_banner" className={`relative overflow-hidden rounded-[32px] p-8 sm:p-10 shadow-xl transition-all duration-300 card-shine ${ST.banner}`}>
        <div className={`absolute top-0 right-0 h-40 w-40 blur-3xl rounded-full hero-orb ${ST.heroGlow}`} />
        <div className={`absolute bottom-0 left-0 h-32 w-32 blur-3xl rounded-full hero-orb-delayed ${ST.heroGlow} opacity-60`} />
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 border text-xs font-semibold rounded-full ${ST.bannerStep}`}>
            <Sparkles className={`h-3.5 w-3.5 ${ST.iconAccent}`} />
            <span>State Exam Preparation Module</span>
          </div>
          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight leading-none ${ST.bannerTitle}`}>
            {t("selectTopic")}
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed max-w-3xl ${ST.bannerDesc}`}>{t("heroDesc")}</p>
          <p className={`text-xs font-mono ${ST.workflowSubtitle}`}>
            {t("progressCount", { done, total: MONOLOGUES.length })}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {[
              { n: "01", l: t("stepChoose") },
              { n: "90s", l: t("stepPrepare") },
              { n: "05s", l: t("stepReady") },
              { n: "120s", l: t("stepRecord") },
            ].map((s, i) => (
              <div
                key={s.n}
                className={`${ST.bannerStep} rounded-2xl p-4 text-center border stagger-fade`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className={`block font-mono text-xl font-bold ${ST.heroStepNum}`}>{s.n}</span>
                <span className="text-[11px] font-semibold">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`flex flex-wrap items-center gap-3 p-4 rounded-2xl border ${ST.filterConsole}`}>
        <button
          onClick={() => setPracticeMode("training")}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            practiceMode === "training" ? ST.pillActive : ST.pillInactive
          }`}
        >
          {t("trainingMode")}
        </button>
        <button
          onClick={() => setPracticeMode("exam")}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            practiceMode === "exam" ? ST.pillActive : ST.pillInactive
          }`}
          title={t("examModeDesc")}
        >
          {t("examMode")}
        </button>
        <label className={`flex items-center gap-2 text-xs font-semibold cursor-pointer ${ST.themePillLabel}`}>
          <input
            type="checkbox"
            checked={showUncompletedOnly}
            onChange={(e) => setShowUncompletedOnly(e.target.checked)}
            className="accent-indigo-500"
          />
          {t("showUncompleted")}
        </label>
      </div>

      {micPermissionError && (
        <div id="mic_alert_banner" className={`p-4 rounded-2xl text-xs sm:text-sm flex items-start gap-3 ${ST.warningAlert}`}>
          <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${ST.warningIcon}`} />
          <div>
            <span className="font-bold">{t("micError")}</span> {micPermissionError}
          </div>
        </div>
      )}

      <div id="frosted_filter_console" className={`backdrop-blur-md rounded-2xl p-6 shadow-xl space-y-4 transition-all duration-300 ${ST.filterConsole}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${ST.iconMuted}`} aria-hidden="true" />
            <input
              id="search_prompt_input"
              type="search"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${ST.input} rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all font-medium border`}
              aria-label={t("searchPlaceholder")}
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              id="surprise_me_btn"
              onClick={onSurpriseMe}
              className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl cursor-pointer text-sm ${ST.surpriseButton}`}
            >
              <Star className="h-4 w-4 fill-amber-300 text-amber-200" />
              <span>{t("surpriseMe")}</span>
            </button>
            <div className={`flex items-center gap-2 text-xs font-semibold ${ST.filterCount} px-4 py-2.5 rounded-xl border`}>
              <Sliders className={`h-4 w-4 ${ST.iconAccent}`} />
              <span>{t("selectedCount", { count: displayList.length })}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className={`text-[10px] sm:text-xs font-bold ${ST.themePillLabel} uppercase tracking-wider`}>
            {t("examThemes")}
          </div>
          <div id="theme_badge_pills" className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedThemeFilter(null)}
              className={`text-xs px-4 py-2 rounded-xl border transition-all font-semibold cursor-pointer ${
                selectedThemeFilter === null ? ST.pillActive : ST.pillInactive
              }`}
            >
              {t("allIssues")}
            </button>
            {themes.map((tName) => (
              <button
                key={tName}
                onClick={() => setSelectedThemeFilter(tName)}
                className={`text-xs px-4 py-2 rounded-xl border transition-all font-semibold capitalize cursor-pointer ${
                  selectedThemeFilter === tName ? ST.pillActive : ST.pillInactive
                }`}
              >
                {tName}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div id="frosted_cards_grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayList.map((item, idx) => {
          const status = progress[item.id]?.status ?? "not_started";
          return (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.4) }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={item.id}
              id={`monologue_tile_${item.id}`}
              onClick={() => onSelect(item)}
              className={`group card-shine ${ST.card} rounded-2xl p-6 flex flex-col justify-between shadow-lg transition-all cursor-pointer relative overflow-hidden`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelect(item)}
            >
              <div className={`absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl ${ST.accentGlow} to-transparent pointer-events-none rounded-tr-2xl`} />
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-mono text-[10px] font-bold ${ST.cardTag} px-2.5 py-1 rounded-md uppercase`}>
                    CARD {item.id.toString().padStart(2, "0")}
                  </span>
                  <span className={`text-[8px] px-2 py-0.5 rounded-full border font-bold uppercase ${statusColor(status, ST)}`}>
                    {statusLabel(status, t)}
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className={`text-lg font-bold capitalize tracking-tight line-clamp-1 ${ST.cardTitle}`}>
                    {item.id === 1 || item.id === 11 || item.id === 17 || item.id === 24
                      ? `your school (${item.id})`
                      : item.theme}
                  </h4>
                  <p className={`text-[10px] font-mono ${ST.cardSub}`}>{item.title}</p>
                </div>
                <div className={`border-t pt-3 space-y-2 ${ST.cardDivider}`}>
                  <span className={`text-[9px] font-bold uppercase block ${ST.cardLabel}`}>
                    {t("coreRubrics", { count: item.points.length })}
                  </span>
                  <ul className="space-y-1">
                    {item.points.slice(0, 2).map((pt, ptIdx) => (
                      <li key={ptIdx} className={`text-xs flex items-start gap-1.5 ${ST.cardBulletText}`}>
                        <span className={`${ST.accentBullet} font-bold`}>•</span>
                        <span className="line-clamp-1 capitalize">{pt.replace(/[;.]/g, "")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold ${ST.cardFooter} ${ST.cardDivider}`}>
                <span>{t("beginTest")}</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {displayList.length === 0 && (
        <div id="search_empty_view" className={`text-center py-20 border border-dashed rounded-2xl ${ST.emptyBanner}`}>
          <Search className={`h-8 w-8 mx-auto mb-4 ${ST.iconAccent}`} />
          <h3 className={`text-lg font-bold ${ST.emptyTitle}`}>{t("noResults")}</h3>
          <p className={`text-sm mt-1 ${ST.emptyDesc}`}>{t("noResultsDesc")}</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedThemeFilter(null);
              setShowUncompletedOnly(false);
            }}
            className={`mt-6 rounded-xl px-4 py-2.5 text-xs font-bold cursor-pointer ${ST.primaryButtonSm}`}
          >
            {t("resetFilters")}
          </button>
        </div>
      )}
    </motion.div>
  );
}
