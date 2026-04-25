import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout';
import api from '../../utils/api';

export default function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/fields')]).then(([ur, fr]) => {
      setAgents(ur.data.filter(u => u.role === 'agent'));
      setFields(fr.data);
      setLoading(false);
    });
  }, []);

  function fieldsForAgent(agentId) {
    return fields.filter(f => f.assigned_agent_id === agentId);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const { data } = await api.post('/users', { ...form, role: 'agent' });
      setAgents(prev => [...prev, data]);
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'agent' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create agent');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this agent? Their fields will become unassigned.')) return;
    await api.delete(`/users/${id}`);
    setAgents(prev => prev.filter(a => a.id !== id));
  }

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <div>
            <h2>Field Agents</h2>
            <p>{agents.length} agents registered</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Cancel' : '+ Add Agent'}
          </button>
        </div>

        {showForm && (
          <div className="card form-card">
            <h3>Add New Agent</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate} className="field-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required placeholder="e.g. John Kamau" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required placeholder="john@example.com" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Password *</label>
                  <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required placeholder="Min 6 characters" />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Agent'}</button>
              </div>
            </form>
          </div>
        )}

        {loading ? <div className="loading">Loading agents...</div> : (
          <div className="agents-grid">
            {agents.map(agent => {
              const agentFields = fieldsForAgent(agent.id);
              const atRisk = agentFields.filter(f => f.status === 'At Risk').length;
              return (
                <div key={agent.id} className="agent-card card">
                  <div className="agent-header">
                    <div className="agent-avatar">{agent.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <h3>{agent.name}</h3>
                      <span className="agent-email">{agent.email}</span>
                    </div>
                    <button className="btn btn-danger btn-sm ml-auto" onClick={() => handleDelete(agent.id)}>Remove</button>
                  </div>
                  <div className="agent-stats">
                    <div className="agent-stat">
                      <span className="stat-num">{agentFields.length}</span>
                      <span className="stat-lbl">Fields</span>
                    </div>
                    <div className="agent-stat">
                      <span className="stat-num text-green">{agentFields.filter(f => f.status === 'Active').length}</span>
                      <span className="stat-lbl">Active</span>
                    </div>
                    <div className="agent-stat">
                      <span className={`stat-num ${atRisk > 0 ? 'text-amber' : ''}`}>{atRisk}</span>
                      <span className="stat-lbl">At Risk</span>
                    </div>
                    <div className="agent-stat">
                      <span className="stat-num text-blue">{agentFields.filter(f => f.status === 'Completed').length}</span>
                      <span className="stat-lbl">Done</span>
                    </div>
                  </div>
                  {agentFields.length > 0 && (
                    <div className="agent-fields">
                      <p className="agent-fields-label">Assigned Fields:</p>
                      {agentFields.map(f => (
                        <span key={f.id} className={`field-chip ${f.status === 'At Risk' ? 'chip-risk' : ''}`}>
                          {f.name} — {f.stage}
                        </span>
                      ))}
                    </div>
                  )}
                  {agentFields.length === 0 && <p className="no-fields-note">No fields assigned yet.</p>}
                  <p className="agent-joined">Joined {new Date(agent.created_at).toLocaleDateString()}</p>
                </div>
              );
            })}
            {agents.length === 0 && <div className="empty-state">No agents yet. Add one above.</div>}
          </div>
        )}
      </div>
    </Layout>
  );
}
