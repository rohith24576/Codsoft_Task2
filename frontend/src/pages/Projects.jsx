import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const sampleProjects = [
    { id: 'p1', name: 'Horizon AI Integration', description: 'Developing a neural network for real-time predictive analytics and automation.', status: 'In Progress', created_at: '2026-05-01', isSample: true },
    { id: 'p2', name: 'Stealth Mode UI Redesign', description: 'Crafting a next-gen, glassmorphic design system for the entire platform suite.', status: 'Completed', created_at: '2026-04-15', isSample: true },
    { id: 'p3', name: 'Genesis Project', description: 'The foundation layer for our decentralized architecture and data integrity.', status: 'In Progress', created_at: '2026-05-10', isSample: true },
    { id: 'p4', name: 'Z-Cloud Core Engine', description: 'Scaling our infrastructure to handle petabytes of engineering data across regions.', status: 'In Progress', created_at: '2026-05-05', isSample: true }
  ];

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

  if (loading) return <div className="animate-pulse h-32 bg-gray-200 rounded-xl"></div>;

  const displayProjects = projects.length > 0 ? projects : sampleProjects;

  return (
    <div className="max-w-[1400px] mx-auto py-8">
      <div className="flex justify-between items-center mb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Project Portfolio</h2>
          <p className="text-sm text-gray-500 font-medium">Tracking {displayProjects.length} strategic initiatives.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {displayProjects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col"
          >
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
               <Layers className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
              {project.isSample && <span className="text-[8px] font-black bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-lg uppercase">Sample</span>}
            </div>
            <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed line-clamp-3">{project.description}</p>
            
            <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
              <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                project.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                project.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600' :
                'bg-gray-50 text-gray-400'
              }`}>
                {project.status || 'Active'}
              </span>
              <span className="text-[10px] font-bold text-gray-300">
                {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
