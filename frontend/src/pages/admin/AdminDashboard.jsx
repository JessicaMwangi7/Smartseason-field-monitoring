import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout';
import StatsCard from '../../components/shared/StatsCard';
import FieldCard from '../../components/shared/FieldCard';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/fields').then(r => { setFields(r.data); setLoading(false); });
  }, []);

  const total = fields.length;
  const active = fields.filter(f => f.status === 'Active').length;
  const atRisk = fields.filter(f => f.status === 'At Risk').length;
  const completed = fields.filter(f => f.status === 'Completed').length;
  const unassigned = fields.filter(f => !f.assigned_agent_id).length;
  const atRiskFields = fields.filter(f => f.status === 'At Risk');
  const recentFields = [...fields].slice(0, 4);

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <h2>Dashboard Overview</h2>
          <p>Monitor all fields across your operation</p>
        </div>

        {loading ? <div className="loading">Loading...</div> : (
          <>
            <div className="stats-grid">
              <StatsCard label="Total Fields" value={total} icon="🗺️" />
              <StatsCard label="Active" value={active} icon="🌿" color="green" />
              <StatsCard label="At Risk" value={atRisk} icon="⚠️" color="amber" />
              <StatsCard label="Completed" value={completed} icon="✅" color="blue" />
              <StatsCard label="Unassigned" value={unassigned} icon="👤" color="grey" />
            </div>

            {atRiskFields.length > 0 && (
              <section className="dashboard-section">
                <h3 className="section-title risk-title">⚠️ Fields At Risk ({atRiskFields.length})</h3>
                <div className="fields-grid">
                  {atRiskFields.map(f => <FieldCard key={f.id} field={f} showAgent />)}
                </div>
              </section>
            )}

            <section className="dashboard-section">
              <div className="section-header">
                <h3 className="section-title">Recent Fields</h3>
                <a href="/admin/fields" className="section-link">View all →</a>
              </div>
              <div className="fields-grid">
                {recentFields.map(f => <FieldCard key={f.id} field={f} showAgent />)}
              </div>
            </section>

            <section className="dashboard-section">
              <h3 className="section-title">Stage Breakdown</h3>
              <div className="stage-breakdown">
                {['Planted','Growing','Ready','Harvested'].map(stage => {
                  const count = fields.filter(f => f.stage === stage).length;
                  const pct = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={stage} className="stage-row">
                      <span className="stage-label">{stage}</span>
                      <div className="stage-bar-wrap">
                        <div className="stage-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="stage-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
