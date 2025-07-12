import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Clock, RotateCcw } from 'lucide-react';
import { useScheduleStore } from './store/scheduleStore';
import { format } from 'date-fns';

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [arrivalTime, setArrivalTime] = useState('');
  
  const {
    arrivalTimeHome,
    timeWindow,
    todayBlocks,
    setArrivalTime: setStoreArrival,
    setAnkiCards: setStoreAnki,
    resetDay
  } = useScheduleStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (arrivalTime) {
      setStoreArrival(arrivalTime);
      setStoreAnki(25);
    }
  };

  const getWindowInfo = () => {
    if (!timeWindow) return null;
    
    const windowData = {
      'LONG': { 
        title: 'Long Session',
        desc: '2+ hours available', 
        color: 'bg-green-50 border-green-200',
        textColor: 'text-green-800'
      },
      'MEDIUM': { 
        title: 'Medium Session',
        desc: '1-2 hours available', 
        color: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-800'
      },
      'SHORT': { 
        title: 'Quick Session',
        desc: '30-75 min available', 
        color: 'bg-orange-50 border-orange-200',
        textColor: 'text-orange-800'
      },
      'SLEEP-FIRST': { 
        title: 'Sleep Priority',
        desc: 'Less than 30 min - rest up!', 
        color: 'bg-purple-50 border-purple-200',
        textColor: 'text-purple-800'
      },
    };
    
    return windowData[timeWindow];
  };

  const windowInfo = getWindowInfo();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-sm mx-auto text-center px-6">
          <h1 className="text-3xl font-semibold mb-3">
            SCHEDULY
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-300 text-sm">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{format(currentTime, 'HH:mm')}</span>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-6 py-8">
        {!arrivalTimeHome ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Evening Planner
              </h2>
              <p className="text-gray-600 text-sm">
                What time will you arrive home?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <input
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="w-full text-center text-4xl font-mono py-6 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 bg-white [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clock-indicator]:hidden"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 text-lg rounded-lg"
                disabled={!arrivalTime}
              >
                Generate
              </Button>
            </form>

            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
              <p>Lights off: 00:30 • Wake up: 08:00</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status */}
            {windowInfo && (
              <div className={`p-4 rounded-lg border text-center ${windowInfo.color}`}>
                <div className={`text-lg font-semibold ${windowInfo.textColor} mb-1`}>
                  {windowInfo.title}
                </div>
                <div className={`text-sm ${windowInfo.textColor} opacity-80`}>
                  Arrived at {arrivalTimeHome} • {windowInfo.desc}
                </div>
              </div>
            )}
            
            {/* Schedule */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tonight's Plan</h3>
                
                {todayBlocks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No schedule generated</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayBlocks.map((block, index) => (
                      <div
                        key={block.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {block.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {block.startTime} - {block.endTime} ({block.duration}m)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reset Button */}
            <Button
              onClick={resetDay}
              variant="outline"
              className="w-full flex items-center gap-2 py-3 border border-gray-300 hover:border-gray-400"
            >
              <RotateCcw className="w-4 h-4" />
              Plan New Evening
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;