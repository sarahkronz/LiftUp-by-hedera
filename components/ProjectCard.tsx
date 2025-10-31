import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
    project: Project;
    onSelect: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
    console.log("Project ID:", project.id, "Image URL:", project.imageUrl);
const totalRaised = project.raisedAmount || 0;
    const fundedPercentage = (totalRaised / project.targetAmount) * 100;

    const daysLeft = () => {
const deadlineDate = project.deadline;
        const now = new Date();
        const diff = deadlineDate.getTime() - now.getTime();
        if (diff <= 0) return 0;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <div
            className="bg-navy-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transform hover:-translate-y-2 hover:shadow-2xl transition-transform duration-300"
            onClick={() => onSelect(project.id)}
        >
            <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
    <img 
        src={project.imageUrl } 
        alt={project.title}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        
    />
    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent"></div>
</div>


            <div className="p-5 space-y-3">
                <p className="text-xs font-semibold text-teal-400 uppercase tracking-wide">{project.category}</p>
                <h3 className="text-lg font-bold text-slate-200 truncate">{project.title}</h3>
                <p className="text-sm text-slate-400">by {project.creatorName}</p>

                {/* Progress Bar */}
                <div className="mt-3">
                    <div className="w-full bg-navy-700 rounded-full h-2.5">
                        <div
                            className="bg-teal-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(fundedPercentage, 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        {fundedPercentage.toFixed(2)}% Funded
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="mt-4 grid grid-cols-3 text-center text-slate-300 text-xs font-semibold gap-2">
                    <div>
                        <p className="text-slate-200 font-bold">{totalRaised.toLocaleString()}</p>
                        <p>Total Raised</p>
                    </div>
                    <div>
                        <p className="text-slate-200 font-bold">{project.targetAmount.toLocaleString()}</p>
                        <p>Target</p>
                    </div>
                    <div>
                        <p className="text-slate-200 font-bold">{daysLeft()}</p>
                        <p>Days Left</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
