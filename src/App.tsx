import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Clock, RotateCcw } from 'lucide-react';
import { useScheduleStore } from './store/scheduleStore';
import { TimeInput } from './components/TimeInput';
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
      <motion.div 
        className="bg-gray-900 text-white py-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-sm mx-auto text-center px-6">
          <motion.h1 
            className="text-3xl font-semibold mb-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            SCHEDULY
          </motion.h1>
          <motion.div 
            className="flex items-center justify-center gap-2 text-gray-300 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Clock className="w-4 h-4" />
            <span className="font-mono">{format(currentTime, 'HH:mm')}</span>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-sm mx-auto px-6 py-8">
        {!arrivalTimeHome ? (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
          >
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Evening Planner
              </h2>
              <p className="text-gray-600 text-sm">
                What time will you arrive home?
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <TimeInput
                value={arrivalTime}
                onChange={setArrivalTime}
              />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 text-lg rounded-lg transition-all duration-300"
                  disabled={!arrivalTime}
                  asChild
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Generate
                  </motion.button>
                </Button>
              </motion.div>
            </form>

            <motion.div 
              className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <p>Lights off: 00:30 • Wake up: 08:00</p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Status */}
            {windowInfo && (
              <motion.div 
                className={`p-4 rounded-lg border text-center ${windowInfo.color}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className={`text-lg font-semibold ${windowInfo.textColor} mb-1`}>
                  {windowInfo.title}
                </div>
                <div className={`text-sm ${windowInfo.textColor} opacity-80`}>
                  Arrived at {arrivalTimeHome} • {windowInfo.desc}
                </div>
              </motion.div>
            )}
            
            {/* Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tonight's Plan</h3>
                  
                  {todayBlocks.length === 0 ? (
                    <motion.div 
                      className="text-center py-8 text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <Clock className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No schedule generated</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {todayBlocks.map((block, index) => (
                        <motion.div
                          key={block.id}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            delay: 0.6 + (index * 0.1), 
                            duration: 0.4,
                            ease: "easeOut" 
                          }}
                          whileHover={{ 
                            scale: 1.02,
                            backgroundColor: "#f3f4f6"
                          }}
                        >
                          <motion.div 
                            className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                              delay: 0.7 + (index * 0.1),
                              type: "spring",
                              stiffness: 500,
                              damping: 15
                            }}
                          >
                            {index + 1}
                          </motion.div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {block.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {block.startTime} - {block.endTime} ({block.duration}m)
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Reset Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Button
                onClick={resetDay}
                variant="outline"
                className="w-full flex items-center gap-2 py-3 border border-gray-300 hover:border-gray-400 transition-all duration-300"
                asChild
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Plan New Evening
                </motion.button>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;