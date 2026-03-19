import { FormEvent, useEffect, useState } from 'react';
import {
  Bot,
  Play,
  Pause,
  Settings,
  TrendingUp,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AIAgentTask } from '../types';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { sendAIChatMessage } from '../lib/aiClient';

type ChatMessage = { role: 'user' | 'ai'; content: string };

export default function AIAgent() {
  const { user } = useAuth();
  const { aiAgentTasks, runAutomationTask, pauseAutomationTask } = useAppData();
  const [selectedTask, setSelectedTask] = useState<AIAgentTask | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content:
        'Hello! I\'m your AI Payment Agent. I can help you with automated payment execution, treasury optimization, FX conversion, and risk monitoring. How can I assist you today?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [aiOnline, setAiOnline] = useState(false);
  const [activeModel, setActiveModel] = useState<string>('qwen-plus');
  const [taskFeedback, setTaskFeedback] = useState<string | null>(null);
  const [taskActionLoading, setTaskActionLoading] = useState<Record<string, 'run' | 'pause'>>({});
  const canManageAutomation = user?.role === 'admin' || user?.role === 'operator';

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setAiOnline(Boolean(data?.aiConfigured));
        if (typeof data?.model === 'string' && data.model.length > 0) {
          setActiveModel(data.model);
        }
      })
      .catch(() => {
        setAiOnline(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedTask) return;
    const latestTask = aiAgentTasks.find((task) => task.id === selectedTask.id) ?? null;
    if (!latestTask) {
      setSelectedTask(null);
      return;
    }
    if (latestTask !== selectedTask) {
      setSelectedTask(latestTask);
    }
  }, [aiAgentTasks, selectedTask]);

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'payment_execution':
        return <DollarSign className="w-5 h-5" />;
      case 'treasury_optimization':
        return <TrendingUp className="w-5 h-5" />;
      case 'fx_conversion':
        return <RefreshCw className="w-5 h-5" />;
      case 'risk_monitoring':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'completed':
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      case 'paused':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'scheduled':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Zap className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'paused':
        return <Pause className="w-3 h-3" />;
      case 'scheduled':
        return <Clock className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userMessage = inputMessage.trim();
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInputMessage('');
    setIsSending(true);

    try {
      const history = chatMessages.map((message) => ({
        role: message.role === 'ai' ? 'assistant' as const : 'user' as const,
        content: message.content,
      }));
      const result = await sendAIChatMessage(userMessage, history);
      if (result.model) setActiveModel(result.model);
      setChatMessages((prev) => [...prev, { role: 'ai', content: result.content }]);
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : 'AI request failed due to an unknown error.';
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `I could not reach the live AI service right now. ${errorText}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const totalSavings = aiAgentTasks.reduce((acc, task) => acc + (task.savings || 0), 0);
  const runningTasks = aiAgentTasks.filter((t) => t.status === 'running').length;
  const isTaskBusy = (taskId: string) => Boolean(taskActionLoading[taskId]);

  const handleToggleTask = async (task: AIAgentTask) => {
    if (!canManageAutomation) {
      setTaskFeedback('Viewer mode: read-only. Hanya admin/operator yang bisa run/pause task.');
      return;
    }

    const action: 'run' | 'pause' = task.status === 'running' ? 'pause' : 'run';
    setTaskFeedback(null);
    setTaskActionLoading((prev) => ({ ...prev, [task.id]: action }));

    try {
      const nextTask =
        action === 'run'
          ? await runAutomationTask(task.id)
          : await pauseAutomationTask(task.id);
      setTaskFeedback(
        action === 'run'
          ? `Task "${nextTask.type.replace('_', ' ')}" berhasil dijalankan.`
          : `Task "${nextTask.type.replace('_', ' ')}" berhasil dipause.`
      );
    } catch (error) {
      setTaskFeedback(error instanceof Error ? error.message : 'Gagal mengubah status task.');
    } finally {
      setTaskActionLoading((prev) => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Payment Agent</h1>
          <p className="text-slate-400 mt-1">
            Automated payment execution and treasury optimization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-emerald-400">Agent Active</span>
          </div>
          {!canManageAutomation && (
            <span className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              Viewer mode: read-only
            </span>
          )}
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {taskFeedback && (
        <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-lg text-sm text-slate-200">
          {taskFeedback}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm">Active Tasks</span>
          </div>
          <p className="text-2xl font-semibold text-white">{runningTasks}</p>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Completed Today</span>
          </div>
          <p className="text-2xl font-semibold text-white">12</p>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Total Savings</span>
          </div>
          <p className="text-2xl font-semibold text-emerald-400">${totalSavings.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Processed Volume</span>
          </div>
          <p className="text-2xl font-semibold text-white">$4.2M</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Chat */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col h-[500px]">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white">AI Assistant</h2>
                <p className="text-xs text-slate-400">
                  Powered by {activeModel} • {aiOnline ? 'Live API' : 'API not configured'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      <span className="text-xs text-violet-400 font-medium">AI Agent</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-slate-800 text-slate-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                    <span className="text-sm text-slate-300">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about payments, treasury, or compliance..."
                disabled={isSending}
                className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="submit"
                disabled={isSending}
                className="p-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Active Tasks */}
        <div className="bg-slate-900 rounded-xl border border-slate-800">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-semibold text-white">Automation Tasks</h2>
            <p className="text-sm text-slate-400 mt-1">Manage your AI-powered automations</p>
          </div>

          <div className="divide-y divide-slate-800">
            {aiAgentTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      task.status === 'running'
                        ? 'bg-emerald-500/10'
                        : task.status === 'scheduled'
                        ? 'bg-cyan-500/10'
                        : 'bg-slate-700'
                    }`}
                  >
                    {getTaskIcon(task.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-white capitalize">
                        {task.type.replace('_', ' ')}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {getStatusIcon(task.status)}
                        <span className="capitalize">{task.status}</span>
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{task.description}</p>

                    <div className="flex items-center gap-4 mt-2">
                      {task.lastRun && (
                        <span className="text-xs text-slate-500">
                          Last run:{' '}
                          {task.lastRun.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                      {task.nextRun && (
                        <span className="text-xs text-cyan-400">
                          Next:{' '}
                          {task.nextRun.toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                      {task.savings && (
                        <span className="text-xs text-emerald-400">
                          Savings: ${task.savings.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {task.status === 'running' ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTask(task);
                        }}
                        disabled={isTaskBusy(task.id) || !canManageAutomation}
                        className="p-2 text-amber-400 hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        {isTaskBusy(task.id) ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Pause className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTask(task);
                        }}
                        disabled={isTaskBusy(task.id) || !canManageAutomation}
                        className="p-2 text-emerald-400 hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        {isTaskBusy(task.id) ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedTask(null)} />
          <div className="relative w-full max-w-lg bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div
                className={`p-3 rounded-lg ${
                  selectedTask.status === 'running' ? 'bg-emerald-500/10' : 'bg-slate-700'
                }`}
              >
                {getTaskIcon(selectedTask.type)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white capitalize">
                  {selectedTask.type.replace('_', ' ')}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border mt-1 ${getStatusColor(
                    selectedTask.status
                  )}`}
                >
                  {getStatusIcon(selectedTask.status)}
                  <span className="capitalize">{selectedTask.status}</span>
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Description</p>
                <p className="text-sm text-white">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedTask.lastRun && (
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Last Run</p>
                    <p className="text-sm text-white">
                      {selectedTask.lastRun.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
                {selectedTask.nextRun && (
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Next Run</p>
                    <p className="text-sm text-white">
                      {selectedTask.nextRun.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>

              {selectedTask.savings && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <p className="text-xs text-emerald-400 mb-1">Total Savings Generated</p>
                  <p className="text-xl font-semibold text-emerald-400">
                    ${selectedTask.savings.toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
                {selectedTask.status === 'running' ? (
                  <button
                    type="button"
                    onClick={() => handleToggleTask(selectedTask)}
                    disabled={isTaskBusy(selectedTask.id) || !canManageAutomation}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                  >
                    {isTaskBusy(selectedTask.id) ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Pause className="w-4 h-4" />
                    )}
                    {isTaskBusy(selectedTask.id) ? 'Updating...' : 'Pause Task'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggleTask(selectedTask)}
                    disabled={isTaskBusy(selectedTask.id) || !canManageAutomation}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                  >
                    {isTaskBusy(selectedTask.id) ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {isTaskBusy(selectedTask.id) ? 'Updating...' : 'Run Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
