import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles } from "lucide-react";

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
      <Card className="bg-card/90 backdrop-blur-sm border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: planet.color }}
              />
              {planet.name}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{planet.description}</p>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">
              Key Facts:
            </h4>
            <div className="flex flex-wrap gap-1">
              {planet.facts.map((fact, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {fact}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Relative Size:</span>
              <p className="font-medium">
                {(planet.size / 0.15).toFixed(2)}x Earth
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Distance:</span>
              <p className="font-medium">{planet.distance} AU</p>
            </div>
          </div>
          {planet.activities && planet.activities.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-foreground">
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
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
                <h3 className="text-lg font-semibold mb-2">
                  {activeActivity.name}
                </h3>
                <p className="mb-4">{activeActivity.description}</p>
                <activeActivity.component onClose={handleActivityComplete} />
                <Button
                  onClick={handleActivityComplete}
                  variant="outline"
                  className="mt-4 w-full"
                >
                  Complete Mission
                </Button>
              </div>
            </div>
          )}
          <Button onClick={onClose} className="w-full mt-4" variant="outline">
            Back to Solar System
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
