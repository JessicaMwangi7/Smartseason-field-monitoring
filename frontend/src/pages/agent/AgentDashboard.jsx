import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout';
import StatsCard from '../../components/shared/StatsCard';
import FieldCard from '../../components/shared/FieldCard';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AgentDashboard() {
  const { user } = useAuth();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/fields').then(r => { setFields(r.data); setLoading(false); });
  }, []);

  const total = fields.length;
  const active = fields.filter(f => f.status === 'Active').length;
  const atRisk = fields.filter(f => f.status === 'At Risk').length;
  const completed = fields.filter(f => f.status === 'Completed').length;
  const atRiskFields = fields.filter(f => f.status === 'At Risk');
  const readyFields = fields.filter(f => f.stage === 'Ready');

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <div>
            <h2>Welcome, {user?.name?.split(' ')[0]} 👋</h2>
            <p>Here's the status of your assigned fields</p>
          </div>
        </div>

        {loading ? <div className="loading">Loading your fields...</div> : (
          <>
            <div className="stats-grid">
              <StatsCard label="My Fields" value={total} icon="🗺️" />
              <StatsCard label="Active" value={active} icon="🌿" color="green" />
              <StatsCard label="At Risk" value={atRisk} icon="⚠️" color="amber" />
              <StatsCard label="Completed" value={completed} icon="✅" color="blue" />
            </div>

            {atRiskFields.length > 0 && (
              <section className="dashboard-section">
                <h3 className="section-title risk-title">⚠️ Needs Attention ({atRiskFields.length})</h3>
                <p className="section-note">These fields have exceeded their expected stage duration. Please update their status or add an observation.</p>
                <div className="fields-grid">
                  {atRiskFields.map(f => <FieldCard key={f.id} field={f} />)}
                </div>
              </section>
            )}

            {readyFields.length > 0 && (
              <section className="dashboard-section">
                <h3 className="section-title">🌾 Ready for Harvest ({readyFields.length})</h3>
                <div className="fields-grid">
                  {readyFields.map(f => <FieldCard key={f.id} field={f} />)}
                </div>
              </section>
            )}

            <section className="dashboard-section">
              <div className="section-header">
                <h3 className="section-title">All My Fields</h3>
                <a href="/agent/fields" className="section-link">View all →</a>
              </div>
              <div className="fields-grid">
                {fields.slice(0, 4).map(f => <FieldCard key={f.id} field={f} />)}
              </div>
              {total === 0 && (
                <div className="empty-state">
                  <p>No fields assigned to you yet.</p>
                  <p>Contact your coordinator to get started.</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
