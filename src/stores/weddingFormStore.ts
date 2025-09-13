import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface WeddingFormData {
  bride: {
    name: string;
    email: string;
  };
  groom: {
    name: string;
    email: string;
  };
  wedding: {
    date: string;
    venue: string;
    guestCount: number;
  };
  preferences: {
    theme: string;
    budget: number;
    catering: string;
  };
}

export interface WeddingFormState {
  formData: WeddingFormData;
  isLoading: boolean;
  errors: Record<string, string>;
  updateBride: (data: Partial<WeddingFormData['bride']>) => void;
  updateGroom: (data: Partial<WeddingFormData['groom']>) => void;
  updateWedding: (data: Partial<WeddingFormData['wedding']>) => void;
  updatePreferences: (data: Partial<WeddingFormData['preferences']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  resetForm: () => void;
  saveForm: () => Promise<void>;
}

const initialFormData: WeddingFormData = {
  bride: { name: '', email: '' },
  groom: { name: '', email: '' },
  wedding: { date: '', venue: '', guestCount: 0 },
  preferences: { theme: '', budget: 0, catering: '' },
};

export const useWeddingFormStore = create<WeddingFormState>()(
  persist(
    immer((set) => ({
      formData: initialFormData,
      isLoading: false,
      errors: {},

      updateBride: (data) =>
        set((state) => {
          state.formData.bride = { ...state.formData.bride, ...data };
        }),

      updateGroom: (data) =>
        set((state) => {
          state.formData.groom = { ...state.formData.groom, ...data };
        }),

      updateWedding: (data) =>
        set((state) => {
          state.formData.wedding = { ...state.formData.wedding, ...data };
        }),

      updatePreferences: (data) =>
        set((state) => {
          state.formData.preferences = {
            ...state.formData.preferences,
            ...data,
          };
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      setError: (field, error) =>
        set((state) => {
          state.errors[field] = error;
        }),

      clearError: (field) =>
        set((state) => {
          delete state.errors[field];
        }),

      clearAllErrors: () =>
        set((state) => {
          state.errors = {};
        }),

      resetForm: () =>
        set((state) => {
          state.formData = initialFormData;
          state.errors = {};
          state.isLoading = false;
        }),

      saveForm: async () => {
        set((state) => {
          state.isLoading = true;
          state.errors = {};
        });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Simulate validation
          const currentState = useWeddingFormStore.getState();
          const newErrors: Record<string, string> = {};

          if (!currentState.formData.bride.name) {
            newErrors['bride.name'] = 'Bride name is required';
          }
          if (!currentState.formData.groom.name) {
            newErrors['groom.name'] = 'Groom name is required';
          }
          if (!currentState.formData.wedding.date) {
            newErrors['wedding.date'] = 'Wedding date is required';
          }

          if (Object.keys(newErrors).length > 0) {
            set((state) => {
              state.errors = newErrors;
              state.isLoading = false;
            });
            throw new Error('Validation failed');
          }

          set((state) => {
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
          });
          throw error;
        }
      },
    })),
    {
      name: 'wedding-form-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist form data, not loading states or errors
      partialize: (state) => ({ formData: state.formData }),
    }
  )
);
