import React from "react";
import "./Overview.css";
import StatCard from "./StatCard";
import PopulationChart from "./PopulationChart";
import ActivityList from "./ActivityList";
import {
  statData,
  populationData} from "../../data/mockData";

const Overview = () => {
  return (
    <div className="overview-container">
      <div className="stats-grid">
        {statData.map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            value={item.value}
            change={item.change}
            isPositive={item.isPositive}
          />
        ))}
      </div>

      <div className="charts-row-1">
        <PopulationChart data={populationData} />
        <ActivityList />
      </div>
    </div>
  );
};

export default Overview;
