import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Clock, Home, Brain } from 'lucide-react';
import { useScheduleStore } from '../store/scheduleStore';

export function TimeInput() {
  const [arrivalTime, setArrivalTime] = useState('');
  const [ankiCards, setAnkiCards] = useState('');
  const { setArrivalTime: setStoreArrival, setAnkiCards: setStoreAnki, timeWindow } = useScheduleStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (arrivalTime) {
      setStoreArrival(arrivalTime);
    }
    if (ankiCards) {
      setStoreAnki(parseInt(ankiCards) || 0);
    }
  };

  const getWindowInfo = () => {
    if (!timeWindow) return null;
    
    const windowData = {
      'LONG': { emoji: '😊', desc: '2+ hours available', color: 'text-green-600' },
      'MEDIUM': { emoji: '😐', desc: '1-2 hours available', color: 'text-yellow-600' },
      'SHORT': { emoji: '😬', desc: '30-75 min available', color: 'text-orange-600' },
      'SLEEP-FIRST': { emoji: '😴', desc: 'Less than 30 min - prioritize sleep', color: 'text-red-600' },
    };
    
    return windowData[timeWindow];
  };

  const windowInfo = getWindowInfo();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
          <Home className="w-6 h-6" />
          Evening Setup
        </CardTitle>
        {windowInfo && (
          <div className={`text-sm font-medium ${windowInfo.color}`}>
            {windowInfo.emoji} {timeWindow}: {windowInfo.desc}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="arrival-time" className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Arrival Time Home
            </Label>
            <Input
              id="arrival-time"
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="text-center text-lg font-mono"
              placeholder="20:30"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="anki-cards" className="text-sm font-medium flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Anki Cards Due
            </Label>
            <Input
              id="anki-cards"
              type="number"
              value={ankiCards}
              onChange={(e) => setAnkiCards(e.target.value)}
              className="text-center text-lg"
              placeholder="25"
              min="0"
              max="200"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-black text-white hover:bg-gray-800"
            disabled={!arrivalTime}
          >
            Generate Evening Schedule
          </Button>
        </form>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong>Time Windows:</strong><br/>
            • Before 21:30 = LONG (2+ hours)<br/>
            • 21:30-22:29 = MEDIUM (1-2 hours)<br/>
            • 22:30-23:14 = SHORT (30-75 min)<br/>
            • After 23:15 = SLEEP-FIRST (&lt;30 min)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
