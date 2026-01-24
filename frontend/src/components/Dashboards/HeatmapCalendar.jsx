import React, { useState } from "react";

const HeatmapCalendar = ({ activity }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  const generateFullYearData = () => {
    const dateMap = {};
    activity?.forEach((item) => {
      dateMap[item.date] = item.count;
    });

    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    const startDate = new Date(todayUTC);
    startDate.setUTCDate(startDate.getUTCDate() - 364);

    const dayOfWeek = startDate.getUTCDay();
    startDate.setUTCDate(startDate.getUTCDate() - dayOfWeek);

    const yearData = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < 371; i++) {
      const year = currentDate.getUTCFullYear();
      const month = String(currentDate.getUTCMonth() + 1).padStart(2, "0");
      const dayOfMonth = String(currentDate.getUTCDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${dayOfMonth}`;

      yearData.push({
        date: dateStr,
        count: dateMap[dateStr] || 0,
        day: currentDate.getUTCDay(),
        month: currentDate.getUTCMonth(),
        displayDate: new Date(currentDate),
      });

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    return yearData;
  };

  const yearData = generateFullYearData();
  const maxCount = Math.max(...yearData.map((d) => d.count), 1);
  const totalSubmissions = yearData.reduce((sum, day) => sum + day.count, 0);
  const activeDays = yearData.filter((day) => day.count > 0).length;

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const days = ["", "Mon", "", "Wed", "", "Fri", ""];

  const getColorIntensity = (count) => {
    if (count === 0) return "bg-gray-800 border-gray-700 hover:border-gray-600";
    const intensity = Math.min(Math.floor((count / maxCount) * 4) + 1, 4);
    const colors = [
      "bg-orange-900/40 border-orange-800/60 hover:border-orange-700",
      "bg-orange-700/60 border-orange-600/70 hover:border-orange-500",
      "bg-orange-500/80 border-orange-400/80 hover:border-orange-300",
      "bg-orange-400 border-orange-300 hover:border-orange-200",
    ];
    return colors[intensity - 1] || colors[0];
  };

  const monthlyData = yearData.reduce((acc, day) => {
    const month = day.month;
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(day);
    return acc;
  }, {});

  const startMonth = yearData[0].month;
  const sortedMonthKeys = Array.from(
    { length: 12 },
    (_, i) => (startMonth + i) % 12
  ).filter((key) => monthlyData[key]);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-orange-400 mb-1">
              Coding Activity
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>{totalSubmissions} submissions in the last year</span>
              <span>•</span>
              <span>{activeDays} active days</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm border transition-all duration-200 ${getColorIntensity(
                  level === 0 ? 0 : Math.ceil((level / 4) * maxCount)
                )}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>

        <div className="flex">
          <div className="flex flex-col mr-3 mt-8">
            {days.map((day, i) => (
              <div
                key={i}
                className="h-4 text-xs text-gray-400 w-8 mb-1 flex items-center"
              >
                {day}
              </div>
            ))}
          </div>
          <div
            className="flex overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {sortedMonthKeys.map((monthKey) => {
              const monthWeeks = [];
              let currentWeek = [];
              monthlyData[monthKey].forEach((day, index) => {
                if (day.day === 0 && currentWeek.length > 0) {
                  monthWeeks.push(currentWeek);
                  currentWeek = [];
                }
                currentWeek.push(day);
              });
              if (currentWeek.length > 0) {
                monthWeeks.push(currentWeek);
              }

              return (
                <div key={monthKey} className="flex flex-col mr-4">
                  <div className="text-xs text-gray-400 font-medium mb-2">
                    {months[monthKey]}
                  </div>
                  <div className="flex">
                    {monthWeeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col mr-1">
                        {Array(7)
                          .fill(null)
                          .map((_, dayIndex) => {
                            const day = week.find((d) => d.day === dayIndex);
                            if (!day) {
                              return (
                                <div
                                  key={dayIndex}
                                  className="w-4 h-4 rounded-sm mb-1"
                                />
                              );
                            }
                            const cellKey = `${monthKey}-${weekIndex}-${dayIndex}`;
                            const isHovered = hoveredCell === cellKey;
                            return (
                              <div
                                key={dayIndex}
                                className={`w-4 h-4 rounded-sm mb-1 border transition-all duration-200 cursor-pointer transform ${getColorIntensity(
                                  day.count
                                )} ${
                                  isHovered ? "scale-125 z-10 shadow-lg" : ""
                                }`}
                                onMouseEnter={() => setHoveredCell(cellKey)}
                                onMouseLeave={() => setHoveredCell(null)}
                                title={`${day.displayDate.toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}: ${day.count} submission${
                                  day.count !== 1 ? "s" : ""
                                }`}
                              />
                            );
                          })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-3 gap-4 text-center">
          <div className="p-2 bg-gray-700/30 rounded-lg">
            <div className="text-lg font-bold text-orange-400">
              {totalSubmissions}
            </div>
            <div className="text-xs text-gray-400">Total Submissions</div>
          </div>
          <div className="p-2 bg-gray-700/30 rounded-lg">
            <div className="text-lg font-bold text-green-400">{activeDays}</div>
            <div className="text-xs text-gray-400">Active Days</div>
          </div>
          <div className="p-2 bg-gray-700/30 rounded-lg">
            <div className="text-lg font-bold text-blue-400">{maxCount}</div>
            <div className="text-xs text-gray-400">Best Day</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapCalendar;
