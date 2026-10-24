import { create } from "zustand";

export type PlotShape = "rectangular" | "l_shape" | "irregular";
export type RoadFacingSide = "north" | "south" | "east" | "west";
export type BuildType = "bungalow" | "rowhouse" | "villa" | "apartment";
export type RoofType = "flat" | "sloped" | "hip";

export interface PlotInput {
  length_ft: number;
  width_ft: number;
  shape: PlotShape;
  road_facing_side: RoadFacingSide;
  imageFile?: File;
}

export interface PlotAnalysis {
  area_sqft: number;
  shape: string;
  buildable_area_sqft: number;
  setback_front_ft: number;
  setback_rear_ft: number;
  setback_side_ft: number;
  obstructions: string[];
  notes: string[];
  segmentation_confidence?: number;
}

export interface BuildSuggestion {
  recommended_type: BuildType;
  requested_type_feasible: boolean;
  scores: Record<BuildType, number>;
  floors_suggested: number;
  reasoning: string[];
}

export interface MaterialLineItem {
  material_name: string;
  quantity: number;
  unit: string;
  rate_per_unit: number;
  subtotal: number;
}

export interface MaterialEstimate {
  build_type: string;
  built_up_area_sqft: number;
  floors: number;
  line_items: MaterialLineItem[];
  total_cost: number;
  currency: string;
}

export interface Model3DResult {
  model_url: string;
  template_used: string;
  generation_params: Record<string, unknown>;
}

interface PlotStore {
  plotInput: PlotInput | null;
  plotAnalysis: PlotAnalysis | null;
  selectedBuildType: BuildType | null;
  floors: number;
  roofType: RoofType;
  buildSuggestion: BuildSuggestion | null;
  materialEstimate: MaterialEstimate | null;
  model3D: Model3DResult | null;
  currentStep: number;

  setPlotInput: (input: PlotInput) => void;
  setPlotAnalysis: (analysis: PlotAnalysis) => void;
  setSelectedBuildType: (type: BuildType) => void;
  setFloors: (floors: number) => void;
  setRoofType: (roofType: RoofType) => void;
  setBuildSuggestion: (suggestion: BuildSuggestion) => void;
  setMaterialEstimate: (estimate: MaterialEstimate) => void;
  setModel3D: (model: Model3DResult) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
  plotInput: null,
  plotAnalysis: null,
  selectedBuildType: null,
  floors: 1,
  roofType: "flat" as RoofType,
  buildSuggestion: null,
  materialEstimate: null,
  model3D: null,
  currentStep: 1,
};

export const usePlotStore = create<PlotStore>((set) => ({
  ...initialState,

  setPlotInput: (plotInput) => set({ plotInput }),

  setPlotAnalysis: (plotAnalysis) => set({ plotAnalysis }),

  setSelectedBuildType: (selectedBuildType) =>
    set({ selectedBuildType }),

  setFloors: (floors) => set({ floors }),

  setRoofType: (roofType) => set({ roofType }),

  setBuildSuggestion: (buildSuggestion) =>
    set({ buildSuggestion }),

  setMaterialEstimate: (materialEstimate) =>
    set({ materialEstimate }),

  setModel3D: (model3D) => set({ model3D }),

  setCurrentStep: (currentStep) =>
    set({ currentStep }),

  reset: () => set(initialState),
}));