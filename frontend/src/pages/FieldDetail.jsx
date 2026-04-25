import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/shared/Layout';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const STAGES = ['Planted', 'Growing', 'Ready', 'Harvested'];
const STATUS_COLORS = { Active: '#16a34a', 'At Risk': '#d97706', Completed: '#2563eb' };
const STAGE_ICONS = { Planted: '🌱', Growing: '🌿', Ready: '🌾', Harvested: '✅' };

export default function FieldDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateForm, setUpdateForm] = useState({ stage: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [agents, setAgents] = useState([]);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    api.get(`/fields/${id}`).then(r => {
      setField(r.data);
      setUpdateForm({ stage: r.data.stage, note: '' });
      setLoading(false);
    }).catch(() => navigate(-1));

    if (user.role === 'admin') {
      api.get('/users/agents').then(r => setAgents(r.data));
    }
  }, [id]);

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const { data } = await api.patch(`/fields/${id}`, updateForm);
      setField(prev => ({ ...prev, ...data, updates: prev.updates }));
      // Refresh updates list
      const full = await api.get(`/fields/${id}`);
      setField(full.data);
      setUpdateForm(f => ({ ...f, note: '' }));
      setSuccess('Field updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  }

  async function handleAdminEdit(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const { data } = await api.patch(`/fields/${id}`, editForm);
      const full = await api.get(`/fields/${id}`);
      setField(full.data);
      setEditForm(null);
      setSuccess('Field saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  }

  if (loading) return <Layout><div className="loading">Loading field...</div></Layout>;
  if (!field) return null;

  const isAgent = user.role === 'agent';
  const statusColor = STATUS_COLORS[field.status] || '#16a34a';

  return (
    <Layout>
      <div className="page">
        <button className="btn btn-outline btn-sm mb-3" onClick={() => navigate(-1)}>← Back</button>

        <div className="field-detail-header">
          <div className="field-detail-title">
            <span className="field-icon-lg">{STAGE_ICONS[field.stage]}</span>
            <div>
              <h2>{field.name}</h2>
              <span className="crop-type-lg">{field.crop_type}</span>
            </div>
          </div>
          <div className="field-detail-badges">
            <span className="status-badge-lg" style={{ background: statusColor + '20', color: statusColor, border: `1px solid ${statusColor}` }}>
              {field.status}
            </span>
            <span className="stage-badge">{field.stage}</span>
          </div>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="detail-grid">
          {/* Left: Info + Update */}
          <div className="detail-left">
            <div className="card info-card">
              <h3>Field Information</h3>
              <div className="info-rows">
                <div className="info-row"><span>Planted</span><strong>{new Date(field.planting_date).toLocaleDateString('en-KE', { year:'numeric', month:'long', day:'numeric' })}</strong></div>
                <div className="info-row"><span>Days Growing</span><strong>{field.days_since_planting} days</strong></div>
                <div className="info-row"><span>Current Stage</span><strong>{field.stage}</strong></div>
                <div className="info-row"><span>Status</span><strong style={{ color: statusColor }}>{field.status}</strong></div>
                {field.area_hectares && <div className="info-row"><span>Area</span><strong>{field.area_hectares} hectares</strong></div>}
                {field.location && <div className="info-row"><span>Location</span><strong>{field.location}</strong></div>}
                <div className="info-row"><span>Assigned Agent</span><strong>{field.agent_name || 'Unassigned'}</strong></div>
              </div>
            </div>

            {/* Stage progress */}
            <div className="card">
              <h3>Growth Progress</h3>
              <div className="stage-progress-detail">
                {STAGES.map((s, i) => {
                  const currentIdx = STAGES.indexOf(field.stage);
                  const done = i <= currentIdx;
                  const current = i === currentIdx;
                  return (
                    <div key={s} className={`stage-step-detail ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                      <div className="stage-dot-detail">{done ? '✓' : i + 1}</div>
                      <div className="stage-info">
                        <span className="stage-name">{s}</span>
                        {current && <span className="stage-current-label">Current</span>}
                      </div>
                      {i < STAGES.length - 1 && <div className={`stage-connector ${done && i < currentIdx ? 'done' : ''}`} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Admin edit form */}
            {user.role === 'admin' && (
              <div className="card">
                <div className="card-header-row">
                  <h3>Edit Field</h3>
                  <button className="btn btn-outline btn-sm" onClick={() => setEditForm(editForm ? null : {
                    name: field.name, crop_type: field.crop_type, planting_date: field.planting_date,
                    stage: field.stage, assigned_agent_id: field.assigned_agent_id || '',
                    location: field.location || '', area_hectares: field.area_hectares || ''
                  })}>
                    {editForm ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                {editForm && (
                  <form onSubmit={handleAdminEdit} className="field-form mt-2">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name</label>
                        <input value={editForm.name} onChange={e => setEditForm(f => ({...f, name: e.target.value}))} required />
                      </div>
                      <div className="form-group">
                        <label>Crop Type</label>
                        <input value={editForm.crop_type} onChange={e => setEditForm(f => ({...f, crop_type: e.target.value}))} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Stage</label>
                        <select value={editForm.stage} onChange={e => setEditForm(f => ({...f, stage: e.target.value}))}>
                          {STAGES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Assign Agent</label>
                        <select value={editForm.assigned_agent_id} onChange={e => setEditForm(f => ({...f, assigned_agent_id: e.target.value}))}>
                          <option value="">Unassigned</option>
                          {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right: Update form + History */}
          <div className="detail-right">
            <div className="card update-card">
              <h3>{isAgent ? 'Log Update' : 'Add Note / Change Stage'}</h3>
              <form onSubmit={handleUpdate} className="update-form">
                <div className="form-group">
                  <label>Stage</label>
                  <select value={updateForm.stage} onChange={e => setUpdateForm(f => ({...f, stage: e.target.value}))}>
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Observation / Note</label>
                  <textarea
                    value={updateForm.note}
                    onChange={e => setUpdateForm(f => ({...f, note: e.target.value}))}
                    rows={4}
                    placeholder="e.g. Soil moisture is good, signs of pest activity on eastern edge..."
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
                  {saving ? 'Saving...' : 'Submit Update'}
                </button>
              </form>
            </div>

            <div className="card">
              <h3>Update History</h3>
              {field.updates?.length > 0 ? (
                <div className="update-history">
                  {field.updates.map(u => (
                    <div key={u.id} className="update-entry">
                      <div className="update-entry-header">
                        <span className="update-agent">👤 {u.agent_name}</span>
                        <span className="update-date">{new Date(u.created_at).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' })}</span>
                      </div>
                      {u.old_stage !== u.new_stage && (
                        <div className="stage-change">
                          <span className="old-stage">{u.old_stage}</span>
                          <span>→</span>
                          <span className="new-stage">{u.new_stage}</span>
                        </div>
                      )}
                      {u.note && <p className="update-note">"{u.note}"</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-updates">No updates logged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
