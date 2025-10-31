// components/ProjectUpdates.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { firestoreService } from '../services/firebase';
import { Update, User, Project } from '../types';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';

interface RouteParams {
  projectId: string;
}

const linkify = (text: string) => {
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  return text.split(urlRegex).map((part, i) =>
    part.match(urlRegex) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">
        {part}
      </a>
    ) : (
      part
    )
  );
};

const ProjectUpdates: React.FC = () => {
const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isCreator = user?.id === project?.creatorId;

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      try {
        const proj = await firestoreService.getProject(projectId);
        setProject(proj);
      } catch (err) {
        console.error('Failed to fetch project:', err);
      }
    };

    fetchProject();

    const unsubscribe = firestoreService.getProjectUpdates(projectId, (fetchedUpdates) => {
      setUpdates(fetchedUpdates);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setError('Title and content cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (project) {
        await firestoreService.createProjectUpdate(project.id, project.title, {
          title: newTitle,
          content: newContent,
        });
        setNewTitle('');
        setNewContent('');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to post update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-navy-800 rounded-lg shadow-lg text-slate-200 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-teal-400 hover:underline font-semibold"
      >
        &larr; Back
      </button>

      <h2 className="text-3xl font-bold">{project?.title || 'Project Updates'}</h2>
      <p className="text-slate-400">{project?.description}</p>

      {isCreator && (
        <form onSubmit={handlePostUpdate} className="bg-navy-900 border border-navy-700 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-bold text-slate-200">Post a New Update</h3>
          <div>
            <label className="text-sm text-slate-400 block mb-1" htmlFor="update-title">
              Title
            </label>
            <input
              id="update-title"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-2 bg-navy-800 border border-navy-700 rounded"
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1" htmlFor="update-content">
              Content
            </label>
            <textarea
              id="update-content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full p-2 bg-navy-800 border border-navy-700 rounded"
              rows={5}
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-teal-500 text-navy-900 font-bold py-2 px-4 rounded hover:bg-teal-400 disabled:bg-slate-500"
            >
              {isSubmitting ? <Spinner size="sm" /> : 'Post Update'}
            </button>
          </div>
        </form>
      )}

      {loading && <Spinner />}

      {!loading && updates.length === 0 && (
        <div className="text-center py-8 text-slate-400 bg-navy-900/50 rounded-lg">
          {isCreator
            ? "You haven't posted any updates yet. Keep your investors informed!"
            : "No updates have been posted yet."}
        </div>
      )}

      <div className="space-y-6">
        {updates.map((update) => (
          <div key={update.id} className="border-l-4 border-teal-500 pl-4 py-2">
            <p className="text-sm text-slate-500">
              {update.createdAt?.toDate
                ? update.createdAt.toDate().toLocaleDateString()
                : new Date(update.createdAt).toLocaleDateString()}
            </p>
            <h4 className="text-lg font-bold text-slate-200 mt-1">{update.title}</h4>
            <p className="text-slate-300 mt-2 whitespace-pre-wrap">{linkify(update.content)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectUpdates;
