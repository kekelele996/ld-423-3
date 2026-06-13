import { create } from 'zustand';
import { Dataset } from '../types';
import { sampleDataset } from '../api/mockData';
import { db } from '../utils/db';

interface DatasetState {
  datasets: Dataset[];
  selectedDatasetId: string;
  loadDatasets: () => Promise<void>;
  addDataset: (dataset: Dataset) => Promise<void>;
  selectDataset: (datasetId: string) => void;
  updateColumnType: (datasetId: string, columnName: string, type: Dataset['columns'][number]['type']) => Promise<void>;
  addDatasetTag: (datasetId: string, tag: string) => Promise<void>;
  removeDatasetTag: (datasetId: string, tag: string) => Promise<void>;
}

export const useDatasetStore = create<DatasetState>((set, get) => ({
  datasets: [sampleDataset],
  selectedDatasetId: sampleDataset.id,
  loadDatasets: async () => {
    const persisted = await db.datasets.toArray();
    if (persisted.length === 0) {
      await db.datasets.put(sampleDataset);
      return;
    }
    set({ datasets: persisted, selectedDatasetId: persisted[0].id });
  },
  addDataset: async (dataset) => {
    await db.datasets.put(dataset);
    set({ datasets: [dataset, ...get().datasets], selectedDatasetId: dataset.id });
  },
  selectDataset: (datasetId) => set({ selectedDatasetId: datasetId }),
  updateColumnType: async (datasetId, columnName, type) => {
    const datasets = get().datasets.map((dataset) =>
      dataset.id === datasetId
        ? { ...dataset, columns: dataset.columns.map((column) => (column.name === columnName ? { ...column, type } : column)) }
        : dataset,
    );
    const updated = datasets.find((dataset) => dataset.id === datasetId);
    if (updated) await db.datasets.put(updated);
    set({ datasets });
  },
  addDatasetTag: async (datasetId, tag) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const datasets = get().datasets.map((dataset) =>
      dataset.id === datasetId && !dataset.tags.includes(trimmed)
        ? { ...dataset, tags: [...dataset.tags, trimmed] }
        : dataset,
    );
    const updated = datasets.find((dataset) => dataset.id === datasetId);
    if (updated) await db.datasets.put(updated);
    set({ datasets });
  },
  removeDatasetTag: async (datasetId, tag) => {
    const datasets = get().datasets.map((dataset) =>
      dataset.id === datasetId
        ? { ...dataset, tags: dataset.tags.filter((t) => t !== tag) }
        : dataset,
    );
    const updated = datasets.find((dataset) => dataset.id === datasetId);
    if (updated) await db.datasets.put(updated);
    set({ datasets });
  },
}));
