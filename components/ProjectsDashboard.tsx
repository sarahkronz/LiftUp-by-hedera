import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, projectCategories, ProjectCategory } from '../types';
import { firestoreService } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import ProjectCard from './ProjectCard';
import Spinner from './Spinner';

type SortOption = 'newly-listed' | 'ending-soon' | 'most-funded' | 'target-amount';

const ProjectsDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'All'>('All');
  const [sortOption, setSortOption] = useState<SortOption>('newly-listed');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const fetchedProjects = await firestoreService.getProjects();
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const sortedAndFilteredProjects = useMemo(() => {
    const filtered = selectedCategory === 'All'
      ? projects
      : projects.filter(p => p.category === selectedCategory);

    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'ending-soon':
          return a.deadline.getTime() - b.deadline.getTime();
        case 'most-funded':
          return b.currentAmount - a.currentAmount;
        case 'target-amount':
          return b.targetAmount - a.targetAmount;
        case 'newly-listed':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });
  }, [projects, selectedCategory, sortOption]);

  if (loading) {
    return <div className="flex justify-center mt-12"><Spinner message="Loading projects..." /></div>;
  }

  const categories: (ProjectCategory | 'All')[] = ['All', ...projectCategories];
  const sortOptions: { key: SortOption; label: string }[] = [
    { key: 'newly-listed', label: 'Newly Listed' },
    { key: 'ending-soon', label: 'Ending Soon' },
    { key: 'most-funded', label: 'Most Funded' },
    { key: 'target-amount', label: 'Target Amount' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-200 tracking-wide">Active Projects</h2>
        {user?.role === 'creator' && (
          <button
            onClick={() => navigate('/create')}
            className="bg-gradient-to-r from-teal-400 to-teal-500 text-navy-900 font-bold py-2 px-6 rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
          >
            + New Project
          </button>
        )}
      </div>

      {/* Sort Options */}
      <div className="flex items-center space-x-4 mb-4">
        <span className="text-sm font-semibold text-slate-400">Sort by:</span>
        <div className="flex space-x-2">
          {sortOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortOption(key)}
              className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap transition-all duration-300 ${
                sortOption === key
                  ? 'bg-gradient-to-r from-teal-400 to-teal-500 text-navy-900 shadow-md scale-105'
                  : 'bg-navy-700 text-slate-300 hover:bg-navy-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 border-t border-b border-navy-700/50 py-4 scroll-smooth">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-teal-400 to-teal-500 text-navy-900 shadow-md scale-105'
                : 'bg-navy-700 text-slate-300 hover:bg-navy-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {sortedAndFilteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-navy-800 rounded-lg flex flex-col items-center justify-center space-y-2">
          <svg className="w-16 h-16 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <p className="text-slate-400 text-lg">No projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedAndFilteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={(id) => navigate(`/project/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsDashboard;
