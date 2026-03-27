import { create } from "zustand";
import type { DepartmentInfo, DepartmentState } from "@/types/state";

interface DepartmentStore {
  // State
  departments: Map<string, DepartmentInfo>;
  activeStates: Map<string, DepartmentState>;
  selectedDepartment: string | null;
  isConnected: boolean;

  // Actions
  selectDepartment: (name: string | null) => void;
  setConnected: (connected: boolean) => void;
  setSnapshot: (departments: DepartmentInfo[], activeStates: Record<string, DepartmentState>) => void;
  setDepartmentActive: (department: string, state: DepartmentState) => void;
  updateDepartmentState: (department: string, state: DepartmentState) => void;
  setDepartmentInactive: (department: string) => void;
}

export const useDepartmentStore = create<DepartmentStore>((set) => ({
  departments: new Map(),
  activeStates: new Map(),
  selectedDepartment: null,
  isConnected: false,

  selectDepartment: (name) => set({ selectedDepartment: name }),

  setConnected: (connected) => set({ isConnected: connected }),

  setSnapshot: (departments, activeStates) =>
    set({
      departments: new Map(departments.map((s) => [s.code, s])),
      activeStates: new Map(Object.entries(activeStates)),
    }),

  setDepartmentActive: (department, state) =>
    set((prev) => ({
      activeStates: new Map(prev.activeStates).set(department, state),
    })),

  updateDepartmentState: (department, state) =>
    set((prev) => ({
      activeStates: new Map(prev.activeStates).set(department, state),
    })),

  setDepartmentInactive: (department) =>
    set((prev) => {
      const next = new Map(prev.activeStates);
      next.delete(department);
      return {
        activeStates: next,
        // Reset selection if the inactive department was selected
        selectedDepartment: prev.selectedDepartment === department ? null : prev.selectedDepartment,
      };
    }),
}));
