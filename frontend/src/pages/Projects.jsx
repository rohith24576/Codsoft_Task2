import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Layers, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-gray-200 rounded-xl max-w-[1400px] mx-auto mt-10"></div>;

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Project Portfolio</h2>
          <p className="text-sm text-gray-500 font-medium">Tracking {projects.length} strategic initiatives across the organization.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {projects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                   <Layers className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                   <Users className="w-3.5 h-3.5 text-gray-400" />
                   <span className="text-xs font-bold text-gray-600">
                     {Array.isArray(project.team_members) ? project.team_members.length : 0} Members
                   </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
              <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed line-clamp-3">{project.description}</p>
            </div>

            <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
              <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                project.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                project.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600' :
                'bg-gray-50 text-gray-400'
              }`}>
                {project.status || 'Active'}
              </span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-300">
                <Calendar className="w-3 h-3" />
                {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
