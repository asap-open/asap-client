import { useState } from "react";
import ProgressHeader from "../../components/dashboard/progress/ProgressHeader";
import TimeFrameFilter from "../../components/dashboard/progress/TimeFrameFilter";
import ConsistencyHeatmap from "../../components/dashboard/progress/ConsistencyHeatmap";
import MobileConsistency from "../../components/dashboard/progress/MobileConsistency";
import BodyWeightChart from "../../components/dashboard/progress/BodyWeightChart";
import VolumeStats from "../../components/dashboard/progress/VolumeStats";
import MuscleDistribution from "../../components/dashboard/progress/MuscleDistribution";
import PersonalBests from "../../components/dashboard/progress/PersonalBests";

export default function Progress() {
  const [range, setRange] = useState("1M");

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto w-full md:max-w-4xl">
      <ProgressHeader />
      <div className="flex flex-col md:flex-row md:items-center md:gap-4 px-6 pt-4">
        <div className="flex-1">
          <TimeFrameFilter selected={range} onSelect={setRange} />
        </div>
      </div>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min px-6 pt-4 w-full">
        <div className="md:col-span-2">
          {/* Desktop View */}
          <div className="hidden md:block">
            <ConsistencyHeatmap range={range} />
          </div>
          {/* Mobile View */}
          <div className="md:hidden">
            <MobileConsistency range={range} />
          </div>
        </div>
        <BodyWeightChart range={range} />
        <VolumeStats range={range} />
        <MuscleDistribution range={range} />
        <PersonalBests />
      </main>
    </div>
  );
}
