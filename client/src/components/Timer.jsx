import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// 🔥 Timer Component
const Timer = ({ timeLeft = 30, totalTime = 30 }) => {
  const percentage = ((timeLeft / totalTime) * 100).toFixed(0);

  return (
    <div className="w-24 h-24">
      <CircularProgressbar
        value={percentage}
        text={`${timeLeft}s`}
        styles={buildStyles({
          pathColor: "#10b981",
          textColor: "#000",
          trailColor: "#e5e7eb",
        })}
      />
    </div>
  );
};

export default Timer;