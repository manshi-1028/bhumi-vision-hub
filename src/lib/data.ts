/**
 * SAMPLE DATA ONLY.
 * Every number below is invented for demonstration of SIH26019 and does not
 * represent official Government of India statistics.
 */

export type ResearchType = "Policy brief" | "Dataset" | "Journal paper" | "Field study" | "Government report";

export interface ResearchItem {
  id: string;
  title: string;
  type: ResearchType;
  topic: string;
  state: string;
  year: number;
  summary: string;
  tags: string[];
  status: "approved" | "pending";
}

export const STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Gujarat",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Uttar Pradesh",
];

export const TOPICS = [
  "Land records digitization",
  "Dispute resolution",
  "Women's land rights",
  "Climate resilience",
  "Urban land use",
  "Tenancy and leasing",
];

export const TYPES: ResearchType[] = [
  "Policy brief",
  "Dataset",
  "Journal paper",
  "Field study",
  "Government report",
];

export const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

const TITLE_STEMS: Record<string, string[]> = {
  "Land records digitization": [
    "Survey record modernisation and cadastral accuracy in",
    "Cost of record correction requests in",
    "Digitised mutation turnaround times in",
  ],
  "Dispute resolution": [
    "Civil land litigation backlog patterns in",
    "Mediation outcomes in boundary disputes in",
    "Revenue court disposal rates in",
  ],
  "Women's land rights": [
    "Joint titling uptake among rural households in",
    "Inheritance recording practices for women in",
    "Barriers to independent land titles for women in",
  ],
  "Climate resilience": [
    "Flood exposure of agricultural holdings in",
    "Drought risk and land use change in",
    "Coastal erosion and tenure security in",
  ],
  "Urban land use": [
    "Peri-urban built-up expansion in",
    "Master plan compliance of land conversions in",
    "Informal settlement regularisation in",
  ],
  "Tenancy and leasing": [
    "Recorded tenancy arrangements among smallholders in",
    "Lease formalisation and credit access in",
    "Sharecropping documentation gaps in",
  ],
};

function makeItems(): ResearchItem[] {
  const items: ResearchItem[] = [];
  let n = 0;
  for (const topic of TOPICS) {
    const stems = TITLE_STEMS[topic];
    for (let i = 0; i < 8; i++) {
      n += 1;
      const state = STATES[(n * 5) % STATES.length];
      const year = 2017 + ((n * 3) % 9);
      const type = TYPES[n % TYPES.length];
      items.push({
        id: `RS-${String(n).padStart(3, "0")}`,
        title: `${stems[i % stems.length]} ${state}, ${year}`,
        type,
        topic,
        state,
        year,
        summary:
          `This ${type.toLowerCase()} examines ${topic.toLowerCase()} in ${state} using sample administrative records ` +
          `collected between ${year - 2} and ${year}. It reports district level variation, identifies the administrative ` +
          `steps that add the most delay, and lists options available to state revenue departments. All figures are ` +
          `illustrative sample data prepared for the SIH26019 prototype.`,
        tags: [topic.split(" ")[0].toLowerCase(), state.split(" ")[0].toLowerCase(), String(year), type.split(" ")[0].toLowerCase()],
        status: "approved",
      });
    }
  }
  return items;
}

export const RESEARCH_ITEMS: ResearchItem[] = makeItems();

export const TIME_SERIES_YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

export const DIGITIZED_SERIES = [31, 36, 42, 48, 55, 59, 64, 70, 76, 81, 86];
export const BUILT_UP_SERIES = [4.1, 4.3, 4.6, 4.9, 5.2, 5.3, 5.6, 5.9, 6.3, 6.6, 7.0];

export interface Kpis {
  digitized: number;
  pendingDisputes: number;
  avgResolutionDays: number;
  womenOwned: number;
  climateIndex: number;
  researchOutputs: number;
}

export const KPIS_BY_YEAR: Record<number, Kpis> = {
  2019: { digitized: 55, pendingDisputes: 1842000, avgResolutionDays: 1180, womenOwned: 12.4, climateIndex: 0.61, researchOutputs: 214 },
  2020: { digitized: 59, pendingDisputes: 1910000, avgResolutionDays: 1244, womenOwned: 13.1, climateIndex: 0.62, researchOutputs: 231 },
  2021: { digitized: 64, pendingDisputes: 1877000, avgResolutionDays: 1201, womenOwned: 13.9, climateIndex: 0.64, researchOutputs: 268 },
  2022: { digitized: 70, pendingDisputes: 1798000, avgResolutionDays: 1132, womenOwned: 14.8, climateIndex: 0.65, researchOutputs: 305 },
  2023: { digitized: 76, pendingDisputes: 1702000, avgResolutionDays: 1058, womenOwned: 15.6, climateIndex: 0.67, researchOutputs: 349 },
  2024: { digitized: 81, pendingDisputes: 1624000, avgResolutionDays: 996, womenOwned: 16.9, climateIndex: 0.68, researchOutputs: 392 },
  2025: { digitized: 86, pendingDisputes: 1551000, avgResolutionDays: 942, womenOwned: 18.2, climateIndex: 0.7, researchOutputs: 441 },
  2026: { digitized: 89, pendingDisputes: 1487000, avgResolutionDays: 905, womenOwned: 19.4, climateIndex: 0.71, researchOutputs: 468 },
};

export const DISPUTES_BY_STATE: Record<number, { label: string; value: number }[]> = Object.fromEntries(
  YEARS.map((y) => {
    const base = KPIS_BY_YEAR[y].pendingDisputes / 1000;
    const weights = [0.16, 0.13, 0.11, 0.1, 0.09, 0.085, 0.08, 0.075, 0.07, 0.06];
    const order = [
      "Uttar Pradesh",
      "Bihar",
      "Maharashtra",
      "Madhya Pradesh",
      "Rajasthan",
      "Karnataka",
      "Gujarat",
      "Odisha",
      "Assam",
      "Punjab",
    ];
    return [y, order.map((s, i) => ({ label: s, value: Math.round(base * weights[i]) }))];
  }),
);

export const PROGRESS_COMPONENTS = [
  { label: "Record digitisation pipeline", value: 86 },
  { label: "State data integration", value: 64 },
  { label: "Dispute case linkage", value: 48 },
  { label: "Research repository", value: 72 },
  { label: "Policy simulation engine", value: 35 },
  { label: "National map layer", value: 12 },
];
