import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import "./GenderChart.css";

const GENDER_COLORS = ["#F2C94C", "#56CCF2"];

const GenderChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-card pie-chart-container">
      <div className="card-header">
        <h3>Thống kê giới tính</h3>
      </div>

      <div
        className="chart-content-wrapper"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ width: "50%", height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div
          className="chart-legend-custom"
          style={{ width: "50%", paddingLeft: "10px" }}
        >
          {data.map((entry, index) => (
            <div
              key={index}
              className="legend-item-row"
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "12px",
                fontSize: "14px",
              }}
            >
              <span
                className="dot"
                style={{
                  backgroundColor: GENDER_COLORS[index % GENDER_COLORS.length],
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginRight: "8px",
                }}
              ></span>
              <span
                className="label"
                style={{ marginRight: "auto", color: "#333" }}
              >
                {entry.name}
              </span>
              <span
                className="value"
                style={{ fontWeight: "600", color: "#333" }}
              >
                {total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenderChart;
