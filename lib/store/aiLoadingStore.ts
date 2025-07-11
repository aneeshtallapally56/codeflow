
import { create } from 'zustand';

export const useAiLoadingStore = create<{
  isFixing: boolean;
  isGenerating: boolean;
  setFixing: (val: boolean) => void;
  setGenerating: (val: boolean) => void;
}>((set) => ({
  isFixing: false,
  isGenerating: false,
  setFixing: (val) => set({ isFixing: val }),
  setGenerating: (val) => set({ isGenerating: val }),
}));