import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartPreview } from '../components/common/ChartPreview';
import { EmptyState } from '../components/common/EmptyState';
import { useChartStore } from '../stores/chartStore';
import { useDatasetStore } from '../stores/datasetStore';

export const ChartGallery = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const charts = useChartStore((state) => state.charts);
  const datasets = useDatasetStore((state) => state.datasets);
  const loadCharts = useChartStore((state) => state.loadCharts);
  const loadDatasets = useDatasetStore((state) => state.loadDatasets);

  useEffect(() => {
    void loadDatasets();
    void loadCharts();
  }, [loadDatasets, loadCharts]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    charts.forEach((chart) => chart.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [charts]);

  const visible = useMemo(() => {
    return charts.filter((chart) => {
      const matchesQuery = chart.name.toLowerCase().includes(query.toLowerCase()) || chart.tags.some((tag) => tag.includes(query));
      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => chart.tags.includes(tag));
      return matchesQuery && matchesTags;
    });
  }, [charts, query, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const openInEditor = (chartId: string) => {
    navigate(`/chart-editor/${chartId}`);
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Gallery</span>
          <h1>图表库</h1>
        </div>
        <input className="search-input" placeholder="搜索名称或标签" value={query} onChange={(event) => setQuery(event.target.value)} />
      </section>
      {allTags.length > 0 && (
        <div className="tag-filter-bar">
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`tag-filter ${selectedTags.includes(tag) ? 'is-active' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      {visible.length === 0 ? (
        <EmptyState title="没有匹配图表" description="调整关键词，或回到编辑器保存新的图表。" />
      ) : (
        <section className="gallery-grid">
          {visible.map((chart) => (
            <article className="gallery-item" key={chart.id} onClick={() => openInEditor(chart.id)}>
              <ChartPreview config={chart} dataset={datasets.find((dataset) => dataset.id === chart.datasetId)} compact />
              <strong>{chart.name}</strong>
              <span>{chart.type} · {chart.colorScheme}</span>
              {chart.tags.length > 0 && (
                <div className="tag-row">
                  {chart.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
};
