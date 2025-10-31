import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { firestoreService } from '../services/firebase';
import { Project } from '../types';
import firebase from 'firebase/compat/app';
import Spinner from './Spinner';

const toDate = (value: firebase.firestore.Timestamp | Date | undefined): Date => {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  if ('toDate' in value && typeof value.toDate === 'function') return value.toDate();
  return new Date(0);
};

const EditProject: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      try {
        const proj = await firestoreService.getProject(projectId);
        if (proj) {
          setProject(proj);
          setTitle(proj.title);
          setDescription(proj.description);
          setDeadline(toDate(proj.deadline));
        }
      } catch (error) {
        console.error('Failed to fetch project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSave = async () => {
    if (!projectId) return;
    setSaving(true);

    try {
      await firestoreService.updateProject(projectId, {
        title,
        description,
        deadline: firebase.firestore.Timestamp.fromDate(deadline),
      });
      navigate(`/project/${projectId}`);
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !project) return <Spinner message="Loading project..." />;

  return (
    <div className="max-w-3xl mx-auto bg-navy-800 p-8 rounded-2xl shadow-lg text-slate-200">
      <h2 className="text-3xl font-bold mb-6 text-teal-400">Edit Project</h2>

      {/* Title */}
      <div className="mb-5">
        <label className="block text-sm font-semibold mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-navy-700 border border-navy-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>

      {/* Description */}
      <div className="mb-5">
        <label className="block text-sm font-semibold mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-navy-700 border border-navy-600 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
          rows={5}
        />
      </div>

      {/* Deadline */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-1">Deadline</label>
        <input
          type="date"
          value={deadline.toISOString().split('T')[0]}
          onChange={e => setDeadline(new Date(e.target.value))}
          className="px-4 py-2 rounded-lg bg-navy-700 border border-navy-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>

      {/* Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`bg-teal-500 hover:bg-teal-400 text-navy-900 px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50`}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={() => navigate(`/project/${projectId}`)}
          className="bg-navy-700 hover:bg-navy-600 text-slate-300 px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditProject;
