import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChartType, ColorScheme } from '../types';
import { ChartPreview } from '../components/common/ChartPreview';
import { ColorPicker } from '../components/common/ColorPicker';
import { FieldSelector } from '../components/common/FieldSelector';
import { TagInput } from '../components/common/TagInput';
import { useChartConfig } from '../hooks/useChartConfig';
import { useChartStore } from '../stores/chartStore';
import { useDatasetStore } from '../stores/datasetStore';

export const ChartEditor = () => {
  const navigate = useNavigate();
  const { chartId } = useParams<{ chartId: string }>();
  const datasets = useDatasetStore((state) => state.datasets);
  const loadDatasets = useDatasetStore((state) => state.loadDatasets);
  const selectedDatasetId = useDatasetStore((state) => state.selectedDatasetId);
  const selectDataset = useDatasetStore((state) => state.selectDataset);
  const charts = useChartStore((state) => state.charts);
  const selectedChartId = useChartStore((state) => state.selectedChartId);
  const loadCharts = useChartStore((state) => state.loadCharts);
  const saveChart = useChartStore((state) => state.saveChart);
  const selectChart = useChartStore((state) => state.selectChart);
  const dataset = datasets.find((candidate) => candidate.id === selectedDatasetId) ?? datasets[0];
  const { suggestedConfig, validateConfig } = useChartConfig(dataset);
  const [config, setConfig] = useState(suggestedConfig);
  const errors = useMemo(() => (config ? validateConfig(config) : []), [config, validateConfig]);

  useEffect(() => {
    void loadDatasets();
    void loadCharts();
  }, [loadDatasets, loadCharts]);

  useEffect(() => {
    if (chartId) {
      const matched = charts.find((candidate) => candidate.id === chartId);
      if (matched) {
        setConfig(matched);
        selectChart(matched.id);
        if (matched.datasetId !== selectedDatasetId && datasets.some((d) => d.id === matched.datasetId)) {
          selectDataset(matched.datasetId);
        }
      }
    }
  }, [chartId, charts, datasets, selectedDatasetId, selectChart, selectDataset]);

  useEffect(() => {
    if (!config && suggestedConfig) setConfig(suggestedConfig);
  }, [config, suggestedConfig]);

  if (!config || !dataset) return null;

  const loadSavedChart = (chartIdParam: string) => {
    navigate(`/chart-editor/${chartIdParam}`);
  };

  const startNewChart = () => {
    navigate('/chart-editor');
    if (suggestedConfig) setConfig(suggestedConfig);
  };

  return (
    <main className="page editor-grid">
      <aside className="config-rail">
        <span className="eyebrow">Editor</span>
        <h1>图表编辑器</h1>
        <label className="field-control">
          <span>数据集</span>
          <select
            value={dataset.id}
            onChange={(event) => {
              selectDataset(event.target.value);
              const nextDataset = datasets.find((candidate) => candidate.id === event.target.value);
              if (nextDataset) setConfig({ ...config, datasetId: nextDataset.id, xField: nextDataset.columns[0]?.name ?? '', yField: nextDataset.columns[1]?.name ?? '' });
            }}
          >
            {datasets.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
          </select>
        </label>
        <FieldSelector label="X 轴" columns={dataset.columns} value={config.xField} onChange={(xField) => setConfig({ ...config, xField })} />
        <FieldSelector label="Y 轴" columns={dataset.columns} value={config.yField} numericOnly onChange={(yField) => setConfig({ ...config, yField })} />
        <FieldSelector label="分组字段" columns={dataset.columns} value={config.groupField ?? ''} onChange={(groupField) => setConfig({ ...config, groupField })} />
      </aside>
      <section className="preview-stage">
        <ChartPreview dataset={dataset} config={config} />
      </section>
      <aside className="config-rail">
        <label className="field-control">
          <span>图表名称</span>
          <input value={config.name} onChange={(event) => setConfig({ ...config, name: event.target.value, title: event.target.value })} />
        </label>
        <label className="field-control">
          <span>图表类型</span>
          <select value={config.type} onChange={(event) => setConfig({ ...config, type: event.target.value as ChartType })}>
            {Object.values(ChartType).map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <ColorPicker value={config.colorScheme} onChange={(colorScheme: ColorScheme) => setConfig({ ...config, colorScheme })} />
        <div className="field-control">
          <span>图表标签</span>
          <TagInput
            tags={config.tags}
            onAdd={(tag) => setConfig({ ...config, tags: [...config.tags, tag] })}
            onRemove={(tag) => setConfig({ ...config, tags: config.tags.filter((t) => t !== tag) })}
            placeholder="输入标签后按回车添加"
          />
        </div>
        {errors.map((error) => <div className="error-box" key={error}>{error}</div>)}
        <button className="primary-action" type="button" onClick={() => saveChart(config)}>保存图表</button>
        <div className="saved-list">
          <div className="panel-heading">
            <h3>已保存图表</h3>
            <button type="button" onClick={startNewChart}>新建</button>
          </div>
          {charts.map((chart) => (
            <button
              key={chart.id}
              className={`palette ${chart.id === (chartId ?? selectedChartId) ? 'is-active' : ''}`}
              onClick={() => loadSavedChart(chart.id)}
            >
              <span>{chart.name}</span>
              <span>{chart.tags.length} 标签</span>
            </button>
          ))}
        </div>
      </aside>
    </main>
  );
};
