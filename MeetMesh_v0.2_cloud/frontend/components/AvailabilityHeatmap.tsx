'use client';

/**
 * AvailabilityHeatmap Component
 * 
 * This component is integrated into the TimeGrid component.
 * It provides the color-coded overlay functionality showing availability levels.
 * 
 * The heatmap logic is implemented in TimeGrid using:
 * - getAvailabilityColor() from lib/utils.ts
 * - Dynamic background colors based on availableCount/totalParticipants ratio
 * - Visual feedback with color gradients (bg-blue-100 to bg-blue-700)
 * 
 * Color scheme:
 * - No availability: bg-gray-50
 * - User only: bg-blue-500
 * - 0-25%: bg-blue-100
 * - 25-50%: bg-blue-300
 * - 50-75%: bg-blue-500
 * - 75-100%: bg-blue-700
 */

import React from 'react';

export function AvailabilityHeatmap() {
  return (
    <div className="text-sm text-gray-500 italic">
      This component is integrated into the TimeGrid component.
      See TimeGrid.tsx for the heatmap implementation.
    </div>
  );
}
