import React from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./AgeChart.css";

const AgeChart = ({ data }) => {
  return (
    <div className="chart-card bar-chart-container">
      <div className="card-header">
        <h3>Thống kê nhóm tuổi</h3>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#888" }}
            dy={10}
          />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "transparent" }}
            formatter={(value) => [value, "Số người"]}
          />
          <Bar dataKey="value" radius={[10, 10, 10, 10]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AgeChart;
