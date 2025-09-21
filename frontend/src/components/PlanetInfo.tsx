import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface PlanetActivity {
  name: string;
  description: string;
  component: React.FC<{ onClose: () => void }>; // or simpler if just modal content
}

interface PlanetData {
  name: string;
  color: string;
  size: number;
  distance: number;
  speed: number;
  description: string;
  facts: string[];
  characterPath?: string;
  activities?: PlanetActivity[];
}

interface PlanetInfoProps {
  planet: PlanetData;
  onClose: () => void;
  onStartActivity?: (activity: PlanetActivity) => void;
  onActivityComplete?: () => void;
}

export const PlanetInfo: React.FC<PlanetInfoProps> = ({
  planet,
  onClose,
  onStartActivity,
  onActivityComplete,
}) => {
  const [activeActivity, setActiveActivity] = useState<PlanetActivity | null>(
    null
  );

  const handleActivityComplete = () => {
    setActiveActivity(null);
    onActivityComplete?.();
  };
  return (
    <div className="absolute bottom-6 left-6 right-6 md:right-auto md:max-w-md z-20">
      <Card className="bg-slate-900/95 backdrop-blur-sm border-slate-700/50 shadow-2xl">
        <CardHeader className="pb-3 bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: planet.color }}
              />
              {planet.name}
            </CardTitle>
            {/* Planet Character Image - Large */}
            {planet.characterPath && (
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-600/50 flex-shrink-0">
                <img
                  src={planet.characterPath}
                  alt={`${planet.name} character`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 bg-slate-900/95">
          <p className="text-sm text-slate-300">{planet.description}</p>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-100">Key Facts:</h4>
            <div className="flex flex-wrap gap-1">
              {planet.facts.map((fact, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-slate-800/60 border-slate-700/50 text-slate-200"
                >
                  {fact}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Relative Size:</span>
              <p className="font-medium text-slate-200">
                {(planet.size / 0.15).toFixed(2)}x Earth
              </p>
            </div>
            <div>
              <span className="text-slate-400">Distance:</span>
              <p className="font-medium text-slate-200">{planet.distance} AU</p>
            </div>
          </div>
          {planet.activities && planet.activities.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-slate-100">
                Try Activities:
              </h4>
              <div className="flex gap-2 flex-wrap">
                {planet.activities.map((activity) => (
                  <Button
                    key={activity.name}
                    onClick={() => onStartActivity && onStartActivity(activity)}
                    variant="secondary"
                    className="w-full mt-4 relative overflow-hidden group hover:scale-105 transition-all duration-300"
                    style={{
                      backgroundColor: `${planet.color}20`,
                      borderColor: `${planet.color}40`,
                      color: planet.color,
                    }}
                  >
                    {/* Sparkle Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

                    {/* Button Content */}
                    <div className="relative flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      {activity.name}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
          {activeActivity && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
            >
              <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 p-6 rounded-lg shadow-2xl max-w-md">
                <h3 className="text-lg font-semibold mb-2 text-slate-100">
                  {activeActivity.name}
                </h3>
                <p className="mb-4 text-slate-300">
                  {activeActivity.description}
                </p>
                <activeActivity.component onClose={handleActivityComplete} />
                <Button
                  onClick={handleActivityComplete}
                  variant="outline"
                  className="mt-4 w-full border-green-500 text-green-400 bg-transparent hover:bg-green-500/10 hover:text-green-300 hover:border-green-400"
                >
                  Complete Mission
                </Button>
              </div>
            </div>
          )}
          <Button
            onClick={onClose}
            className="w-full mt-4 border-green-500 text-green-400 bg-slate-900/95 hover:bg-green-500/20 hover:text-green-300 hover:border-green-400"
            variant="outline"
          >
            Back to Solar System
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
