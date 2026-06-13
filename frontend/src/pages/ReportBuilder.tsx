import { useEffect } from 'react';
import { DraggableGrid } from '../components/common/DraggableGrid';
import { useChartStore } from '../stores/chartStore';
import { useDatasetStore } from '../stores/datasetStore';
import { useReportStore } from '../stores/reportStore';

export const ReportBuilder = () => {
  const charts = useChartStore((state) => state.charts);
  const reports = useReportStore((state) => state.reports);
  const activeReportId = useReportStore((state) => state.activeReportId);
  const saveReport = useReportStore((state) => state.saveReport);
  const loadCharts = useChartStore((state) => state.loadCharts);
  const loadDatasets = useDatasetStore((state) => state.loadDatasets);
  const loadReports = useReportStore((state) => state.loadReports);
  const report = reports.find((candidate) => candidate.id === activeReportId) ?? reports[0];

  useEffect(() => {
    void loadDatasets();
    void loadCharts();
    void loadReports();
  }, [loadDatasets, loadCharts, loadReports]);

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Report</span>
          <h1>报告组装</h1>
        </div>
        <button className="primary-action" onClick={() => saveReport({ ...report, exportStatus: 'Ready', updatedAt: new Date().toISOString() })}>标记可导出</button>
      </section>
      <DraggableGrid
        report={report}
        charts={charts}
        onAddChart={(chartId) => {
          if (report.chartIds.includes(chartId)) return;
          void saveReport({ ...report, chartIds: [...report.chartIds, chartId], updatedAt: new Date().toISOString() });
        }}
      />
    </main>
  );
};
