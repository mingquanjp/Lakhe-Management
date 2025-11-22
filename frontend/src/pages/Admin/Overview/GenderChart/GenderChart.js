import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import './GenderChart.css';

const GENDER_COLORS = ['#343a40', '#74b9ff'];

const GenderChart = ({ data }) => {
  return (
    <div className="chart-card pie-chart-container">
      <div className="card-header">
        <h3>Thống kê giới tính</h3>
      </div>
      <div className="pie-wrapper">
         <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
              ))}
            </Pie>
            <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GenderChart;