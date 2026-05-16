import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, Search, Filter, MoreHorizontal, 
  Calendar, Flag, Layers, CheckCircle2,
  Clock, AlertCircle, Trash2, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', project_id: '', priority: 'Medium', status: 'To Do', deadline: '', assignee_id: '' });

  const fetchTasks = async () => {
    try {
      const [taskRes, projRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/admin/users').catch(() => ({ data: [] })) // Graceful fallback if Member
      ]);
      setTasks(taskRes.data);
      setProjects(projRes.data);
      if (usersRes?.data) setUsers(usersRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error('Failed to update status');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', newTask);
      setShowCreateModal(false);
      setNewTask({ title: '', description: '', project_id: '', priority: 'Medium', status: 'To Do', deadline: '', assignee_id: '' });
      fetchTasks();
    } catch (error) {
      console.error('Failed to create task');
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task');
    }
  };

  if (loading) return (
    <div className="max-w-[1400px] mx-auto py-12 px-4 space-y-8">
      <div className="h-20 bg-gray-100 rounded-3xl animate-pulse"></div>
      <div className="grid grid-cols-3 gap-8">
        {[1, 2, 3].map(i => <div key={i} className="h-[600px] bg-gray-50 rounded-[2.5rem] animate-pulse"></div>)}
      </div>
    </div>
  );

  const columns = [
    { id: 'To Do', icon: Clock, color: 'text-gray-400', bg: 'bg-gray-100' },
    { id: 'In Progress', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'Done', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  return (
    <div className="max-w-[1500px] mx-auto space-y-8 pb-20 px-4">
      
      {/* Kanban Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Project Kanban</h2>
          <p className="text-sm text-gray-500 font-medium">Coordinate deliverables and track velocity across all initiatives.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search tasks..."
              className="pl-11 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>

      {/* Board Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {columns.map((col) => (
          <div key={col.id} className="space-y-6">
            <div className="flex items-center justify-between px-4">
               <div className="flex items-center gap-3">
                  <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center", col.bg)}>
                     <col.icon className={clsx("w-4 h-4", col.color)} />
                  </div>
                  <h3 className="font-black text-gray-900 tracking-tight">{col.id}</h3>
                  <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                    {tasks.filter(t => t.status === col.id).length}
                  </span>
               </div>
               <button onClick={() => setShowCreateModal(true)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                  <Plus className="w-4 h-4" />
               </button>
            </div>

            <div className="bg-gray-50/50 rounded-[2.5rem] p-4 min-h-[600px] border border-gray-100/50 space-y-4">
               <AnimatePresence mode="popLayout">
                 {tasks.filter(t => t.status === col.id).map((task) => (
                   <motion.div
                     layout
                     key={task.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                   >
                     {/* Priority Badge */}
                     <div className="flex justify-between items-start mb-4">
                        <span className={clsx(
                          "px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                          task.priority === 'High' ? "bg-rose-50 text-rose-600 border-rose-100" :
                          task.priority === 'Medium' ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-indigo-50 text-indigo-600 border-indigo-100"
                        )}>
                          {task.priority}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                           <button 
                             onClick={() => deleteTask(task.id)}
                             className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50"
                           >
                              <Trash2 className="w-3.5 h-3.5" />
                           </button>
                           <button className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                           </button>
                        </div>
                     </div>

                     <h4 className="font-bold text-gray-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                       {task.title}
                     </h4>
                     <p className="text-xs text-gray-400 font-medium line-clamp-2 mb-6">
                       {task.description || 'No description provided for this task.'}
                     </p>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                           <div className="flex items-center gap-1.5">
                             <Layers className="w-3.5 h-3.5 text-indigo-500" />
                             {projects.find(p => p.id === task.project_id)?.name || task.project_name || 'ProjectFlow'}
                           </div>
                           <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-100">
                             <User className="w-3 h-3 text-gray-400" />
                             <span className="text-[10px] text-gray-600 font-bold">{task.assignee_name || 'Unassigned'}</span>
                           </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                           <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              <Calendar className="w-3 h-3" />
                              {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No Due Date'}
                           </div>
                           <div className="w-6 h-6 rounded-full bg-indigo-600 text-white border-2 border-white flex items-center justify-center text-[8px] font-black shadow-sm">
                             {task.assignee_name ? task.assignee_name[0] : 'U'}
                           </div>
                        </div>
                     </div>

                     {/* Quick Move Overlay */}
                     <div className="absolute inset-x-0 bottom-0 p-2 bg-white/80 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform flex gap-1 justify-center border-t border-gray-100">
                        {columns.filter(c => c.id !== task.status).map(c => (
                          <button 
                            key={c.id}
                            onClick={() => handleUpdateStatus(task.id, c.id)}
                            className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-[9px] font-black text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest"
                          >
                             Move to {c.id}
                          </button>
                        ))}
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
               
               {tasks.filter(t => t.status === col.id).length === 0 && (
                 <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 opacity-20">
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                    <p className="text-sm font-bold text-gray-400">Column Empty</p>
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Creation Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 space-y-8"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900">Create New Task</h3>
                <p className="text-gray-400 text-sm font-medium">Assign work and set clear expectations for the team.</p>
              </div>
              
              <form className="space-y-6" onSubmit={handleCreateTask}>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Task Title</label>
                  <input 
                    required
                    type="text" 
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="e.g. Architect Core Services"
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Project</label>
                      <select 
                        required
                        value={newTask.project_id}
                        onChange={(e) => setNewTask({ ...newTask, project_id: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                         <option value="">Select Project</option>
                         {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Priority</label>
                      <select 
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                         <option>Low</option>
                         <option>Medium</option>
                         <option>High</option>
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Assignee</label>
                      <select 
                        value={newTask.assignee_id}
                        onChange={(e) => setNewTask({ ...newTask, assignee_id: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                         <option value="">Select Assignee</option>
                         {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Deadline</label>
                      <input 
                        type="date"
                        value={newTask.deadline}
                        onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                      />
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                     type="button"
                     onClick={() => setShowCreateModal(false)}
                     className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                   >
                     Create Task
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;
