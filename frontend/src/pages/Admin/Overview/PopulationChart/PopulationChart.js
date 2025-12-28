import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./PopulationChart.css";

const PopulationChart = ({ data }) => {
  return (
    <div className="chart-card line-chart-container">
      <div className="card-header">
        <h3>Biến động dân số</h3>
        <div className="chart-legend-custom">
          <span>• Tổng số nhân khẩu</span>
          <span style={{ color: "#74b9ff" }}>• Số nhân khẩu tạm trú</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#888" }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#888" }}
          />
          <Tooltip
            formatter={(value, name) =>
              ({
                total: [value, "Tổng số nhân khẩu"],
                temp: [value, "Số nhân khẩu tạm trú"],
              }[name] || [value, name])
            }
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#333"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="temp"
            stroke="#74b9ff"
            strokeWidth={2}
            dot={false}
            strokeDasharray="3 3"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PopulationChart;
