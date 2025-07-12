import type { TimeBlock } from '../types/schedule';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Clock, CheckCircle, Circle } from 'lucide-react';
import { differenceInMinutes, parse, isAfter, isBefore } from 'date-fns';

interface ScheduleCardProps {
  blocks: TimeBlock[];
  currentTime?: Date;
}

const getActivityColor = (activity: string) => {
  switch (activity) {
    case 'ANKI_DUE': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ACTIVE_LISTENING': return 'bg-green-100 text-green-800 border-green-200';
    case 'PASSIVE_LISTENING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'HYGIENE': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'SLEEP': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'WAKE_UP': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'PREP': return 'bg-pink-100 text-pink-800 border-pink-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getActivityIcon = (activity: string) => {
  switch (activity) {
    case 'ANKI_DUE': return '🧠';
    case 'ACTIVE_LISTENING': return '🎧';
    case 'PASSIVE_LISTENING': return '🎵';
    case 'HYGIENE': return '🚿';
    case 'SLEEP': return '😴';
    case 'WAKE_UP': return '☀️';
    case 'PREP': return '🎒';
    default: return '⏰';
  }
};

const getCurrentBlockStatus = (block: TimeBlock, currentTime: Date) => {
  const blockStart = parse(block.startTime, 'HH:mm', currentTime);
  const blockEnd = parse(block.endTime, 'HH:mm', currentTime);
  
  // Handle next day for times after midnight
  if (blockStart.getHours() < 12 && currentTime.getHours() >= 12) {
    blockStart.setDate(blockStart.getDate() + 1);
    blockEnd.setDate(blockEnd.getDate() + 1);
  }
  
  if (isBefore(currentTime, blockStart)) {
    return { status: 'upcoming', progress: 0 };
  } else if (isAfter(currentTime, blockEnd)) {
    return { status: 'completed', progress: 100 };
  } else {
    const elapsed = differenceInMinutes(currentTime, blockStart);
    const progress = Math.round((elapsed / block.duration) * 100);
    return { status: 'active', progress };
  }
};

export function ScheduleCard({ blocks, currentTime = new Date() }: ScheduleCardProps) {
  if (blocks.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No schedule generated yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {blocks.map((block) => {
          const { status, progress } = getCurrentBlockStatus(block, currentTime);
          const isActive = status === 'active';
          const isCompleted = status === 'completed';
          
          return (
            <div
              key={block.id}
              className={`p-3 rounded-lg border transition-all ${
                isActive 
                  ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                  : isCompleted
                  ? 'bg-gray-50 border-gray-200 opacity-75'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-lg">{getActivityIcon(block.activity)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${
                      isCompleted ? 'text-gray-600' : 'text-gray-900'
                    }`}>
                      {block.name}
                    </p>
                    <p className={`text-xs ${
                      isCompleted ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                      {block.startTime} - {block.endTime} ({block.duration}m)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-0.5 ${getActivityColor(block.activity)}`}
                  >
                    {block.activity.replace('_', ' ')}
                  </Badge>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Circle className={`w-4 h-4 ${
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  )}
                </div>
              </div>
              
              {isActive && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              {block.isOptional && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                    Optional
                  </Badge>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
