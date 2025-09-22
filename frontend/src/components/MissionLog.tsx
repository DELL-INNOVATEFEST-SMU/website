import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  Fuel,
  CheckCircle2,
  ClipboardList,
  X,
  Clock,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/use-mobile";

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
  onNavigate: (path: string) => void;
  completedTasks: Set<string>;
  attemptedTasks: Set<string>;
  onTaskComplete: (taskId: string) => void;
  onTaskAttempt: (taskId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// Scroll Navigation Component for Mobile
const ScrollNavigation: React.FC<{
  onScrollUp: () => void;
  onScrollDown: () => void;
}> = ({ onScrollUp, onScrollDown }) => {
  const { isMobile } = useResponsive();
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

  if (!isMobile) return null;

  const startScrolling = (direction: "up" | "down") => {
    if (scrollIntervalRef.current) return; // Prevent multiple intervals

    if (direction === "up") {
      setIsScrollingUp(true);
    } else {
      setIsScrollingDown(true);
    }

    // Initial scroll
    if (direction === "up") {
      onScrollUp();
    } else {
      onScrollDown();
    }

    // Continuous scrolling
    scrollIntervalRef.current = setInterval(() => {
      if (direction === "up") {
        onScrollUp();
      } else {
        onScrollDown();
      }
    }, 100); // Scroll every 100ms for smooth continuous scrolling
  };

  const stopScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    setIsScrollingUp(false);
    setIsScrollingDown(false);
  };

  return (
    <div className="fixed z-50 pointer-events-auto bottom-24 left-4 flex flex-col gap-2">
      <Button
        onMouseDown={() => startScrolling("up")}
        onMouseUp={stopScrolling}
        onMouseLeave={stopScrolling}
        onTouchStart={() => startScrolling("up")}
        onTouchEnd={stopScrolling}
        size="sm"
        className={`h-10 w-10 p-0 rounded-full border border-slate-600/50 backdrop-blur-sm transition-all duration-200 hover:scale-105 ${
          isScrollingUp
            ? "bg-green-600/90 hover:bg-green-600/90"
            : "bg-slate-800/90 hover:bg-slate-700/90"
        }`}
        aria-label="Scroll up"
      >
        <ChevronUp className="h-5 w-5 text-white" />
      </Button>
      <Button
        onMouseDown={() => startScrolling("down")}
        onMouseUp={stopScrolling}
        onMouseLeave={stopScrolling}
        onTouchStart={() => startScrolling("down")}
        onTouchEnd={stopScrolling}
        size="sm"
        className={`h-10 w-10 p-0 rounded-full border border-slate-600/50 backdrop-blur-sm transition-all duration-200 hover:scale-105 ${
          isScrollingDown
            ? "bg-green-600/90 hover:bg-green-600/90"
            : "bg-slate-800/90 hover:bg-slate-700/90"
        }`}
        aria-label="Scroll down"
      >
        <ChevronDown className="h-5 w-5 text-white" />
      </Button>
    </div>
  );
};

// Mission Log Bubble Component (similar to ChatBubble)
const MissionLogBubble: React.FC<{
  isOpen: boolean;
  completedCount: number;
  totalTasks: number;
  onClick: () => void;
}> = ({ isOpen, completedCount, totalTasks, onClick }) => {
  const { isMobile } = useResponsive();

  if (isOpen) return null;

  return (
    <div
      className={`fixed z-50 pointer-events-auto transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 ${
        isMobile ? "bottom-4 left-4" : "bottom-6 left-6"
      }`}
    >
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
        size={isMobile ? "default" : "lg"}
        className={cn(
          `relative rounded-full shadow-lg z-10 min-h-touch ${
            isMobile ? "h-16 w-16" : "h-14 w-14"
          }`,
          "bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700",
          "hover:from-green-500 hover:via-emerald-500 hover:to-teal-600",
          "border-2 border-white/20",
          "transition-all duration-300 ease-in-out",
          completedCount === totalTasks && "animate-pulse"
        )}
      >
        <ClipboardList
          className={`${isMobile ? "h-7 w-7" : "h-6 w-6"} text-white`}
        />

        {/* Completion Progress Indicator */}
        {completedCount > 0 && (
          <Badge
            className={`absolute -top-1 -right-1 p-0 bg-green-500 hover:bg-green-500 text-white text-xs border-2 border-white ${
              isMobile ? "h-6 w-6" : "h-5 w-5"
            }`}
          >
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
    id: "find-cosmic-compass",
    title: "Find Your Cosmic Compass",
    planet: "CosmicCompass",
    planetColor: "#9333EA",
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
  isAttempted: boolean;
  onClick: () => void;
}> = ({ task, isCompleted, isAttempted, onClick }) => {
  const { isMobile } = useResponsive();

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
        isCompleted
          ? "bg-green-900/30 border-green-500/50"
          : isAttempted
          ? "bg-yellow-900/30 border-yellow-500/50"
          : "bg-slate-900/95 border-slate-700 hover:border-slate-500"
      } backdrop-blur-sm`}
      onClick={onClick}
    >
      <CardContent className={isMobile ? "p-3" : "p-4"}>
        <div className={`flex items-center ${isMobile ? "gap-4" : "gap-3"}`}>
          {/* Planet Color Indicator */}
          <div
            className={`${
              isMobile ? "w-5 h-5" : "w-4 h-4"
            } rounded-full border-2 border-white/20`}
            style={{ backgroundColor: task.planetColor }}
          />

          {/* Task Info */}
          <div className="flex-1">
            <h3
              className={`font-semibold text-white ${
                isMobile ? "text-base" : "text-sm"
              }`}
            >
              {task.title}
            </h3>
            <p className={`text-slate-400 ${isMobile ? "text-sm" : "text-xs"}`}>
              on {task.planet}
            </p>
          </div>

          {/* Completion Status */}
          {isCompleted ? (
            <CheckCircle2
              className={`${isMobile ? "h-6 w-6" : "h-5 w-5"} text-green-400`}
            />
          ) : isAttempted ? (
            <Clock
              className={`${isMobile ? "h-6 w-6" : "h-5 w-5"} text-yellow-400`}
            />
          ) : (
            <div
              className={`${
                isMobile ? "w-6 h-6" : "w-5 h-5"
              } border-2 border-slate-400 rounded-full`}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const MissionLog: React.FC<MissionLogProps> = ({
  onPlanetClick,
  onNavigate,
  completedTasks,
  attemptedTasks,
  onTaskComplete,
  onTaskAttempt,
  isOpen,
  onToggle,
}) => {
  const [tasks] = useState(missionTasks);
  const { isMobile } = useResponsive();

  // Update tasks with completion and attempt status
  const updatedTasks = tasks.map((task) => ({
    ...task,
    completed: completedTasks.has(task.id),
    attempted: attemptedTasks.has(task.id),
    onStart: () => onPlanetClick(task.planet),
  }));

  const completedCount = completedTasks.size;
  const attemptedCount = attemptedTasks.size;

  // Calculate fuel progress based on attempts (attempts count as partial progress)
  // Each attempt gives 50% progress, completion gives 100%
  const totalProgress = Array.from(attemptedTasks).reduce((total, taskId) => {
    const baseProgress = 50; // 50% for attempting
    const completionBonus = completedTasks.has(taskId) ? 50 : 0; // Additional 50% for completing
    return total + baseProgress + completionBonus;
  }, 0);

  const fuelProgress = (totalProgress / (tasks.length * 100)) * 100;
  const isFuelFull = fuelProgress >= 100;

  const handleLaunch = () => {
    // Temporary link - replace with actual telegram bot integration
    window.open("https://t.me/CommanderSam_bot", "_blank");
  };

  const handleScrollUp = () => {
    window.scrollBy({ top: -window.innerHeight * 0.8, behavior: "smooth" });
  };

  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
  };

  const handleTaskClick = (task: MissionTask) => {
    if (!task.completed) {
      // Handle cosmic compass navigation specially
      if (task.id === "find-cosmic-compass") {
        onNavigate("/cosmic-compass");
        // Mark as both attempted and completed for proper fuel calculation
        onTaskAttempt(task.id);
        onTaskComplete(task.id);
      } else {
        onPlanetClick(task.planet);
      }
    }
  };

  return (
    <>
      {/* Scroll Navigation - only show when mission log is closed on mobile */}
      {!isOpen && (
        <ScrollNavigation
          onScrollUp={handleScrollUp}
          onScrollDown={handleScrollDown}
        />
      )}

      {/* Mission Log Panel */}
      {isOpen && (
        <div
          className={`absolute z-30 pointer-events-auto ${
            isMobile ? "inset-4 w-auto max-w-sm mx-auto" : "top-4 right-4 w-80"
          }`}
        >
          <Card
            className={`bg-slate-900/95 border-slate-700 backdrop-blur-sm ${
              isMobile ? "max-h-[80vh]" : "max-h-[85vh]"
            } overflow-y-auto`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle
                  className={`${
                    isMobile ? "text-lg" : "text-xl"
                  } font-bold text-green-400 flex items-center gap-2`}
                >
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  MISSION LOG
                </CardTitle>
                <Button
                  variant="ghost"
                  size={isMobile ? "default" : "sm"}
                  onClick={onToggle}
                  className={`${
                    isMobile ? "min-h-touch" : "h-8 w-8 p-0"
                  } text-slate-400 hover:text-white`}
                >
                  <X className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
                </Button>
              </div>
              <p className="text-sm text-slate-400 mt-2">
                Tap on a planet to start a mission. Each completed mission fuels your tank and helps you feel better along the way.
              </p>
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
                    isAttempted={task.attempted}
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
                    {attemptedCount}/{tasks.length} Attempted
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-slate-400">Completed</span>
                  <Badge
                    variant="secondary"
                    className="bg-slate-800 text-blue-400"
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
        completedCount={attemptedCount}
        totalTasks={tasks.length}
        onClick={onToggle}
      />
    </>
  );
};
