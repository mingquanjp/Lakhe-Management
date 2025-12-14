import React, { useState, useEffect } from "react";
import { Card } from "../../../components/commons";
import "./StatsFinanceDashboard.css";
import { getFees, getFinanceStats } from "../../../utils/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const StatsFinanceDashboard = () => {
  const [fees, setFees] = useState([]);
  const [selectedFeeId, setSelectedFeeId] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch list of fees on mount
  useEffect(() => {
    const fetchFees = async () => {
      try {
        const response = await getFees();
        if (response.success && response.data.length > 0) {
          setFees(response.data);
          setSelectedFeeId(response.data[0].fee_id); // Select first fee by default
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching fees:", err);
        setError("Không thể tải danh sách khoản thu");
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  // Fetch stats when selectedFeeId changes
  useEffect(() => {
    if (!selectedFeeId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getFinanceStats(selectedFeeId);
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        console.error("Error fetching finance stats:", err);
        setError("Không thể tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedFeeId]);

  const PIE_COLORS = ["#F2C94C", "#56CCF2"]; // Yellow, Blue

  if (loading && !stats)
    return <div className="content">Đang tải dữ liệu...</div>;
  if (error) return <div className="content">Lỗi: {error}</div>;

  // Default data if no stats available
  const defaultStats = {
    summary: {
      totalCollected: 0,
      expectedRevenue: 0,
      paidHouseholds: 0,
      unpaidHouseholds: 0,
      totalHouseholds: 0,
    },
    charts: {
      line: [],
      pie: [
        { name: "Đã đóng", value: 0 },
        { name: "Chưa đóng", value: 0 },
      ],
      bar: [],
    },
  };

  const { summary, charts } = stats || defaultStats;

  return (
    <div className="content">
      {/* Filter Section */}
      <div className="finance-filter-section">
        <span className="filter-label">Chọn đợt thu/đóng góp</span>
        <select
          className="filter-select"
          value={selectedFeeId}
          onChange={(e) => setSelectedFeeId(e.target.value)}
          disabled={fees.length === 0}
        >
          {fees.length === 0 ? (
            <option value="">Chưa có khoản thu nào</option>
          ) : (
            fees.map((fee) => (
              <option key={fee.fee_id} value={fee.fee_id}>
                {fee.fee_name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards-grid">
        <Card className="summary-card finance-card">
          <div className="card-value">
            {summary.totalCollected.toLocaleString()} VND
          </div>
          <div className="card-title">Tổng tiền đã thu</div>
        </Card>
        <Card className="summary-card finance-card">
          <div className="card-value">
            {summary.expectedRevenue.toLocaleString()} VND
          </div>
          <div className="card-title">Tổng tiền thu dự kiến</div>
        </Card>
        <Card className="summary-card finance-card">
          <div className="card-value">{summary.paidHouseholds}</div>
          <div className="card-title">Số hộ đã đóng</div>
        </Card>
        <Card className="summary-card finance-card">
          <div className="card-value">{summary.unpaidHouseholds}</div>
          <div className="card-title">Số hộ chưa đóng</div>
        </Card>
      </div>

      {/* Main Line Chart */}
      <Card className="chart-card full-width mb-32">
        <h3 className="chart-title">Tổng tiền đã thu</h3>
        <div className="line-chart-container" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={charts.line}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#333333" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#333333" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E0E0E0"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#828282", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#828282", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(value) => value.toLocaleString() + " VND"}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#333333"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Bottom Charts Grid */}
      <div className="charts-grid">
        {/* Pie Chart */}
        <Card className="chart-card">
          <h3 className="chart-title">Thống kê số hộ đóng</h3>
          <div className="chart-content-wrapper">
            <div
              className="pie-chart-container"
              style={{ height: 250, width: "50%" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.pie}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {charts.pie.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend-custom">
              {charts.pie.map((entry, index) => (
                <div key={index} className="legend-item-row">
                  <span
                    className="dot"
                    style={{ backgroundColor: PIE_COLORS[index] }}
                  ></span>
                  <span className="label">{entry.name}</span>
                  <span className="value">
                    {summary.totalHouseholds > 0
                      ? ((entry.value / summary.totalHouseholds) * 100).toFixed(
                          1
                        )
                      : 0}
                    %
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Bar Chart */}
        <Card className="chart-card">
          <h3 className="chart-title">Thống kê thu phí</h3>
          <div className="bar-chart-container" style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.bar}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barSize={40}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E0E0E0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#333", fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#828282", fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  formatter={(value) => value.toLocaleString() + " VND"}
                />
                <Bar dataKey="value" fill="#2F80ED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StatsFinanceDashboard;
