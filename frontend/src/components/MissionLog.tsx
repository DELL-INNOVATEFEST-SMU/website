import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rocket, Fuel, CheckCircle2, ClipboardList, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MissionTask {
  id: string;
  title: string;
  planet: string;
  planetColor: string;
  completed: boolean;
  onStart: () => void;
}

interface MissionLogProps {
  onPlanetClick: (planetName: string) => void;
  completedTasks: Set<string>;
  onTaskComplete: (taskId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// Mission Log Bubble Component (similar to ChatBubble)
const MissionLogBubble: React.FC<{
  isOpen: boolean;
  completedCount: number;
  totalTasks: number;
  onClick: () => void;
}> = ({ isOpen, completedCount, totalTasks, onClick }) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-auto transition-all duration-300 ease-in-out hover:scale-105 active:scale-95">
      {/* Pulsing Ring Effect for completed tasks */}
      {completedCount > 0 && (
        <div
          className={cn(
            "absolute inset-0 rounded-full border-2 border-green-400/50",
            "animate-ping pointer-events-none -z-10",
            completedCount === totalTasks ? "opacity-75" : "opacity-50"
          )}
        />
      )}

      {/* Main Mission Log Bubble */}
      <Button
        onClick={() => {
          console.log("MissionLogBubble clicked!");
          onClick();
        }}
        size="lg"
        className={cn(
          "relative h-14 w-14 rounded-full shadow-lg z-10",
          "bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700",
          "hover:from-green-500 hover:via-emerald-500 hover:to-teal-600",
          "border-2 border-white/20",
          "transition-all duration-300 ease-in-out",
          completedCount === totalTasks && "animate-pulse"
        )}
      >
        <ClipboardList className="h-6 w-6 text-white" />

        {/* Completion Progress Indicator */}
        {completedCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-green-500 hover:bg-green-500 text-white text-xs border-2 border-white">
            {completedCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};

const missionTasks: MissionTask[] = [
  {
    id: "rewrite-story",
    title: "Rewrite Your Story",
    planet: "Jupiter",
    planetColor: "#D8CA9D",
    completed: false,
    onStart: () => {},
  },
  {
    id: "calm-storm",
    title: "Calm in the Storm",
    planet: "Mercury",
    planetColor: "#8C7853",
    completed: false,
    onStart: () => {},
  },
  {
    id: "break-traps",
    title: "Break Thinking Traps",
    planet: "Neptune",
    planetColor: "#4B70DD",
    completed: false,
    onStart: () => {},
  },
  {
    id: "replenish-oxygen",
    title: "Replenish Oxygen",
    planet: "Venus",
    planetColor: "#FFC649",
    completed: false,
    onStart: () => {},
  },
];

const FuelTank: React.FC<{
  progress: number;
  isFull: boolean;
  onLaunch: () => void;
}> = ({ progress, isFull, onLaunch }) => {
  return (
    <Card className="bg-slate-900/95 border-slate-700 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-green-400 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          FUEL TANK
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fuel Tank Visual */}
        <div className="relative">
          <div className="h-6 bg-slate-800 rounded-full border border-slate-600 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-400 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Fuel className="h-4 w-4 text-white/80" />
          </div>
        </div>

        {/* Progress Text */}
        <div className="text-center">
          <span className="text-sm text-slate-300">
            {Math.round(progress)}% Fuel Capacity
          </span>
        </div>

        {/* Launch Button */}
        {isFull && (
          <Button
            onClick={onLaunch}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all duration-300 hover:scale-105"
          >
            <Rocket className="h-5 w-5 mr-2" />
            INITIATE LAUNCH
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const MissionTaskCard: React.FC<{
  task: MissionTask;
  isCompleted: boolean;
  onClick: () => void;
}> = ({ task, isCompleted, onClick }) => {
  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
        isCompleted
          ? "bg-green-900/30 border-green-500/50"
          : "bg-slate-900/95 border-slate-700 hover:border-slate-500"
      } backdrop-blur-sm`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Planet Color Indicator */}
          <div
            className="w-4 h-4 rounded-full border-2 border-white/20"
            style={{ backgroundColor: task.planetColor }}
          />

          {/* Task Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm">{task.title}</h3>
            <p className="text-xs text-slate-400">on {task.planet}</p>
          </div>

          {/* Completion Status */}
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          ) : (
            <div className="w-5 h-5 border-2 border-slate-400 rounded-full" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const MissionLog: React.FC<MissionLogProps> = ({
  onPlanetClick,
  completedTasks,
  onTaskComplete,
  isOpen,
  onToggle,
}) => {
  const [tasks, setTasks] = useState(missionTasks);

  // Update tasks with completion status
  const updatedTasks = tasks.map((task) => ({
    ...task,
    completed: completedTasks.has(task.id),
    onStart: () => onPlanetClick(task.planet),
  }));

  const completedCount = completedTasks.size;
  const fuelProgress = (completedCount / tasks.length) * 100;
  const isFuelFull = fuelProgress >= 100;

  const handleLaunch = () => {
    // Temporary link - replace with actual telegram bot integration
    window.open("https://t.me/your_bot_here", "_blank");
  };

  const handleTaskClick = (task: MissionTask) => {
    if (!task.completed) {
      onPlanetClick(task.planet);
    }
  };

  return (
    <>
      {/* Mission Log Panel */}
      {isOpen && (
        <div className="absolute top-4 right-4 w-80 z-30 pointer-events-auto">
          <Card className="bg-slate-900/95 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-green-400 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  MISSION LOG
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mission Tasks */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Primary Objectives
                </h3>
                {updatedTasks.map((task) => (
                  <MissionTaskCard
                    key={task.id}
                    task={task}
                    isCompleted={task.completed}
                    onClick={() => handleTaskClick(task)}
                  />
                ))}
              </div>

              {/* Fuel Tank */}
              <FuelTank
                progress={fuelProgress}
                isFull={isFuelFull}
                onLaunch={handleLaunch}
              />

              {/* Mission Status */}
              <div className="pt-2 border-t border-slate-700">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Mission Progress</span>
                  <Badge
                    variant="secondary"
                    className="bg-slate-800 text-green-400"
                  >
                    {completedCount}/{tasks.length} Complete
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mission Log Bubble */}
      <MissionLogBubble
        isOpen={isOpen}
        completedCount={completedCount}
        totalTasks={tasks.length}
        onClick={onToggle}
      />
    </>
  );
};
