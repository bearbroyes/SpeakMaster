import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, X } from "lucide-react";
import type { StudentProfile } from "../types";
import type { ThemeStyles } from "../themes";
import type { TranslationKey } from "../i18n/translations";

interface Props {
  open: boolean;
  onClose: () => void;
  profile: StudentProfile | null;
  onSave: (profile: StudentProfile | null) => void;
  ST: ThemeStyles;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

export function StudentProfileModal({ open, onClose, profile, onSave, ST, t }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (open) {
      setFirstName(profile?.firstName ?? "");
      setLastName(profile?.lastName ?? "");
    }
  }, [open, profile]);

  const handleSave = () => {
    const first = firstName.trim();
    const last = lastName.trim();
    if (!first && !last) {
      onSave(null);
    } else {
      onSave({ firstName: first, lastName: last });
    }
    onClose();
  };

  const handleClear = () => {
    setFirstName("");
    setLastName("");
    onSave(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm cursor-default"
            aria-label={t("closeProfile")}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed left-1/2 top-1/2 z-[201] w-[min(100%,420px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-6 sm:p-8 shadow-2xl ${ST.workflowCard}`}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${ST.logoBox}`}>
                  <User className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="profile-modal-title" className={`text-lg font-bold ${ST.workflowHeading}`}>
                    {t("studentProfileTitle")}
                  </h2>
                  <p className={`text-xs mt-0.5 ${ST.workflowSubtitle}`}>{t("studentProfileDesc")}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-xl border cursor-pointer ${ST.langBtn}`}
                aria-label={t("closeProfile")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${ST.aspectLabel}`}>
                  {t("firstName")}
                </span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("firstNamePlaceholder")}
                  className={`w-full ${ST.input} rounded-xl px-4 py-3 text-sm outline-none border font-medium`}
                  autoComplete="given-name"
                />
              </label>
              <label className="block space-y-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${ST.aspectLabel}`}>
                  {t("lastName")}
                </span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t("lastNamePlaceholder")}
                  className={`w-full ${ST.input} rounded-xl px-4 py-3 text-sm outline-none border font-medium`}
                  autoComplete="family-name"
                />
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                type="button"
                onClick={handleSave}
                className={`flex-1 py-3.5 rounded-2xl font-bold cursor-pointer ${ST.primaryButton}`}
              >
                {t("saveProfile")}
              </button>
              {profile && (
                <button
                  type="button"
                  onClick={handleClear}
                  className={`py-3.5 px-5 rounded-2xl font-semibold text-xs border cursor-pointer ${ST.retryButton}`}
                >
                  {t("clearProfile")}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
