import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Sun, Coffee } from 'lucide-react';
import { useScheduleStore } from '../store/scheduleStore';
import { ScheduleCard } from './ScheduleCard';

export function MorningSchedule() {
  const { 
    generateMorningSchedule, 
    todayBlocks, 
    currentPhase, 
    isAwake 
  } = useScheduleStore();

  const handleStartMorning = () => {
    generateMorningSchedule();
  };

  if (currentPhase !== 'MORNING' && !isAwake) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
            <Sun className="w-6 h-6 text-yellow-500" />
            Morning Routine
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4">
            <Coffee className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
            <p className="text-gray-600 mb-4">
              Ready to start your day? Target wake time: <strong>08:00</strong>
            </p>
          </div>
          <Button 
            onClick={handleStartMorning}
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            ☀️ Start Morning Routine
          </Button>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Morning Pipeline:</strong><br/>
              • 08:00-08:15: Wake + Hydrate (no screens)<br/>
              • 08:15-08:30: Breakfast + Passive Listening<br/>
              • 08:30-09:55: Study Block (Anki + Active)<br/>
              • 09:55-10:00: Prep & Leave Home
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-bold flex items-center justify-center gap-2">
            <Sun className="w-5 h-5 text-yellow-500" />
            Morning Active
          </CardTitle>
        </CardHeader>
      </Card>
      
      <ScheduleCard blocks={todayBlocks} />
    </div>
  );
}
