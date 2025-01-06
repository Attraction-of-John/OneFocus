import { useState, useEffect } from 'react';
import { Plus, Search, Clock, Check, Pause } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function OneFocusPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  return (
    <div className="min-h-screen w-full bg-[url('/assets/background-imgs/trees.jpg')] bg-cover bg-center bg-no-repeat fixed inset-0">
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <img src="/assets/oneFocus-imgs/OneFocusLogo.png" alt="OneFocus Logo" className="h-20 w-20" />
            <img src="/assets/oneFocus-imgs/OneFocusTitle.png" alt="OneFocusTitle" className="h-20 w-20" />
            <div className="relative w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input type="search" placeholder="Google Search" className="pl-8 bg-white/80 border-0" />
            </div>
          </div>

          {/* Main Content */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6">
              {/* Todo Input */}
              <div className="flex gap-2 mb-6">
                <Input
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="새로운 할일을 입력하세요"
                  className="bg-white/50"
                  onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                />
                <Button onClick={addTodo} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Todo List */}
              <div className="space-y-2">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-2 p-3 bg-white/50 rounded-xl hover:bg-white/70 transition-colors"
                  >
                    <Button size="sm" variant="ghost" onClick={() => toggleTodo(todo.id)}>
                      <Check className={`h-4 w-4 ${todo.completed ? 'text-green-500' : 'text-gray-400'}`} />
                    </Button>
                    <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>{todo.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timer Card */}
          <Card className="bg-white/70 backdrop-blur-md shadow-xl">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="text-4xl font-mono mb-4">{formatTime(time)}</div>
              <div className="flex gap-2">
                <Button onClick={() => setIsRunning(!isRunning)} variant="outline" className="w-32">
                  {isRunning ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      일시정지
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      시작하기
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setTime(0);
                    setIsRunning(false);
                  }}
                  variant="outline"
                  className="w-32"
                >
                  초기화
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default OneFocusPage;
