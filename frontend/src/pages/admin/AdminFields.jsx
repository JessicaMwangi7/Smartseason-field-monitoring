import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout';
import FieldCard from '../../components/shared/FieldCard';
import api from '../../utils/api';

const STAGES = ['Planted', 'Growing', 'Ready', 'Harvested'];
const CROPS = ['Maize', 'Wheat', 'Rice', 'Sorghum', 'Beans', 'Other'];

export default function AdminFields() {
  const [fields, setFields] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({
    name: '', crop_type: 'Maize', planting_date: '', stage: 'Planted',
    assigned_agent_id: '', location: '', area_hectares: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/fields'), api.get('/users/agents')]).then(([fr, ar]) => {
      setFields(fr.data);
      setAgents(ar.data);
      setLoading(false);
    });
  }, []);

  const filtered = filter === 'All' ? fields : fields.filter(f =>
    filter === 'At Risk' ? f.status === 'At Risk' : f.stage === filter
  );

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = { ...form, assigned_agent_id: form.assigned_agent_id || null, area_hectares: form.area_hectares || null };
      const { data } = await api.post('/fields', payload);
      setFields(prev => [data, ...prev]);
      setShowForm(false);
      setForm({ name: '', crop_type: 'Maize', planting_date: '', stage: 'Planted', assigned_agent_id: '', location: '', area_hectares: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create field');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this field?')) return;
    await api.delete(`/fields/${id}`);
    setFields(prev => prev.filter(f => f.id !== id));
  }

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <div>
            <h2>All Fields</h2>
            <p>{fields.length} fields total</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Cancel' : '+ New Field'}
          </button>
        </div>

        {showForm && (
          <div className="card form-card">
            <h3>Create New Field</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate} className="field-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Field Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required placeholder="e.g. North Block A" />
                </div>
                <div className="form-group">
                  <label>Crop Type *</label>
                  <select value={form.crop_type} onChange={e => setForm(f => ({...f, crop_type: e.target.value}))}>
                    {CROPS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Planting Date *</label>
                  <input type="date" value={form.planting_date} onChange={e => setForm(f => ({...f, planting_date: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label>Initial Stage</label>
                  <select value={form.stage} onChange={e => setForm(f => ({...f, stage: e.target.value}))}>
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Assign to Agent</label>
                  <select value={form.assigned_agent_id} onChange={e => setForm(f => ({...f, assigned_agent_id: e.target.value}))}>
                    <option value="">Unassigned</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Area (hectares)</label>
                  <input type="number" step="0.1" value={form.area_hectares} onChange={e => setForm(f => ({...f, area_hectares: e.target.value}))} placeholder="e.g. 2.5" />
                </div>
              </div>
              <div className="form-group">
                <label>Location / Notes</label>
                <input value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} placeholder="e.g. Near river bend, GPS: -1.28, 36.82" />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Field'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="filter-bar">
          {['All', 'At Risk', 'Planted', 'Growing', 'Ready', 'Harvested'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        {loading ? <div className="loading">Loading fields...</div> : (
          <div className="fields-grid">
            {filtered.map(field => (
              <div key={field.id} className="field-card-wrap">
                <FieldCard field={field} showAgent />
                <button className="btn btn-danger btn-sm field-delete" onClick={() => handleDelete(field.id)}>Delete</button>
              </div>
            ))}
            {filtered.length === 0 && <div className="empty-state">No fields found.</div>}
          </div>
        )}
      </div>
    </Layout>
  );
}
