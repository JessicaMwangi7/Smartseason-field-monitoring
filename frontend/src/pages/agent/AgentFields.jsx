import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout';
import FieldCard from '../../components/shared/FieldCard';
import api from '../../utils/api';

export default function AgentFields() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    api.get('/fields').then(r => { setFields(r.data); setLoading(false); });
  }, []);

  const filtered = filter === 'All' ? fields : fields.filter(f =>
    filter === 'At Risk' ? f.status === 'At Risk' : f.stage === filter
  );

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <div>
            <h2>My Fields</h2>
            <p>{fields.length} fields assigned to you</p>
          </div>
        </div>

        <div className="filter-bar">
          {['All', 'At Risk', 'Planted', 'Growing', 'Ready', 'Harvested'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f} {f !== 'All' && f !== 'At Risk' ? `(${fields.filter(field => field.stage === f).length})` : ''}
            </button>
          ))}
        </div>

        {loading ? <div className="loading">Loading fields...</div> : (
          <div className="fields-grid">
            {filtered.map(f => <FieldCard key={f.id} field={f} />)}
            {filtered.length === 0 && <div className="empty-state">No fields match this filter.</div>}
          </div>
        )}
      </div>
    </Layout>
  );
}
