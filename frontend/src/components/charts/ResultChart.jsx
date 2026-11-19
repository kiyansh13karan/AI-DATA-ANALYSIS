import React from "react";
import createPlotlyComponent from "react-plotly.js/factory";
import * as PlotlyModule from "plotly.js/dist/plotly.js";

const Plotly = PlotlyModule.default || PlotlyModule;
const createPlotly = createPlotlyComponent.default || createPlotlyComponent;
const Plot = createPlotly(Plotly);

/**
 * Renders a Plotly chart from the deterministic chart_spec returned by the
 * backend (see app/services/chart_service.py::build_chart_spec).
 */
export default function ResultChart({ chartType, chartSpec }) {
  if (!chartSpec || chartSpec.type === "table") return null;

  if (chartType === "kpi") {
    const value = chartSpec.y?.[0] ?? chartSpec.x?.[0];
    return (
      <div className="rounded-xl border border-[#E2E8F0] dark:border-[#1F2630] bg-[#FFFFFF] dark:bg-[#10171F] p-6 text-center">
        <p className="text-sm text-[#64748B] dark:text-[#7B8794]">{chartSpec.y_label || chartSpec.x_label}</p>
        <p className="text-4xl font-bold mt-1 text-[#0F172A] dark:text-[#F2F4F7]">{formatValue(value)}</p>
      </div>
    );
  }

  const trace = buildTrace(chartType, chartSpec);

  return (
    <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#1F2630] bg-[#FFFFFF] dark:bg-[#10171F] p-2 sm:p-3 shadow-xs">
      <Plot
        data={[trace]}
        layout={{
          autosize: true,
          margin: { t: 20, r: 20, b: 50, l: 50 },
          xaxis: { title: chartSpec.x_label },
          yaxis: { title: chartSpec.y_label },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: { color: "inherit" },
        }}
        useResizeHandler
        style={{ width: "100%", height: "340px" }}
        config={{ displaylogo: false, toImageButtonOptions: { format: "png" } }}
      />
    </div>
  );
}

function buildTrace(chartType, spec) {
  switch (chartType) {
    case "line":
      return { x: spec.x, y: spec.y, type: "scatter", mode: "lines+markers" };
    case "pie":
      return { labels: spec.x, values: spec.y, type: "pie" };
    case "scatter":
      return { x: spec.x, y: spec.y, mode: "markers", type: "scatter" };
    case "histogram":
      return { x: spec.x, type: "histogram" };
    case "box":
      return spec.x && spec.x.length > 0
        ? { x: spec.x, y: spec.y, type: "box" }
        : { y: spec.y, type: "box" };
    case "area":
      return { x: spec.x, y: spec.y, fill: "tozeroy", type: "scatter" };
    case "horizontal_bar":
      return { x: spec.y, y: spec.x, type: "bar", orientation: "h" };
    case "bar":
    default:
      return { x: spec.x, y: spec.y, type: "bar" };
  }
}

function formatValue(value) {
  if (typeof value === "number") {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return value ?? "—";
}
