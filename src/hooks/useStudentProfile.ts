import { useCallback, useState } from "react";
import type { StudentProfile } from "../types";
import { loadStudentProfile, saveStudentProfile } from "../utils/profile";

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(() => loadStudentProfile());

  const updateProfile = useCallback((next: StudentProfile | null) => {
    saveStudentProfile(next);
    setProfile(next);
  }, []);

  return { profile, updateProfile };
}
