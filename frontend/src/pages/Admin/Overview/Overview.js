import React, { useEffect, useState } from "react";
import "./Overview.css";
import StatCard from "./StatCard";
import PopulationChart from "./PopulationChart";
import ActivityList from "./ActivityList";
import AgeChart from "./AgeChart";
import GenderChart from "./GenderChart";
import { fetchOverview } from "../../../utils/api";
import Loading from "../../../components/commons/Loading/Loading";

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: [],
    populationData: [],
    ageData: [],
    genderData: [],
    recentActivities: [],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchOverview();
        if (res.success) {
          setData(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch overview data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="overview-container">
        <Loading />
      </div>
    );
  }

  return (
    <div className="overview-container">
      {/* 1. Hàng Thống kê (Cards) */}
      <div className="stats-grid">
        {data.stats.map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            value={item.value}
            change={item.change}
            isPositive={item.isPositive}
          />
        ))}
      </div>

      {/* 2. Hàng Biểu đồ Dân số & Hoạt động */}
      <div className="charts-row-1">
        <PopulationChart data={data.populationData} />
        <ActivityList activities={data.recentActivities} />
      </div>

      {/* 3. Hàng Biểu đồ Tuổi & Giới tính */}
      <div className="charts-row-2">
        <AgeChart data={data.ageData} />
        <GenderChart data={data.genderData} />
      </div>
    </div>
  );
};

export default Overview;
