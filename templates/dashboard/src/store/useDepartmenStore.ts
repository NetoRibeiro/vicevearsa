import { create } from "zustand";
import type { DepartmenInfo, DepartmenState } from "@/types/state";

interface DepartmenStore {
  // State
  departmens: Map<string, DepartmenInfo>;
  activeStates: Map<string, DepartmenState>;
  selectedDepartmen: string | null;
  isConnected: boolean;

  // Actions
  selectDepartmen: (name: string | null) => void;
  setConnected: (connected: boolean) => void;
  setSnapshot: (departmens: DepartmenInfo[], activeStates: Record<string, DepartmenState>) => void;
  setDepartmenActive: (departmen: string, state: DepartmenState) => void;
  updateDepartmenState: (departmen: string, state: DepartmenState) => void;
  setDepartmenInactive: (departmen: string) => void;
}

export const useDepartmenStore = create<DepartmenStore>((set) => ({
  departmens: new Map(),
  activeStates: new Map(),
  selectedDepartmen: null,
  isConnected: false,

  selectDepartmen: (name) => set({ selectedDepartmen: name }),

  setConnected: (connected) => set({ isConnected: connected }),

  setSnapshot: (departmens, activeStates) =>
    set({
      departmens: new Map(departmens.map((s) => [s.code, s])),
      activeStates: new Map(Object.entries(activeStates)),
    }),

  setDepartmenActive: (departmen, state) =>
    set((prev) => ({
      activeStates: new Map(prev.activeStates).set(departmen, state),
    })),

  updateDepartmenState: (departmen, state) =>
    set((prev) => ({
      activeStates: new Map(prev.activeStates).set(departmen, state),
    })),

  setDepartmenInactive: (departmen) =>
    set((prev) => {
      const next = new Map(prev.activeStates);
      next.delete(departmen);
      return {
        activeStates: next,
        // Reset selection if the inactive departmen was selected
        selectedDepartmen: prev.selectedDepartmen === departmen ? null : prev.selectedDepartmen,
      };
    }),
}));
