import React from 'react';
import { useNavigate } from 'react-router-dom';

const STAGE_ICONS = { Planted: '🌱', Growing: '🌿', Ready: '🌾', Harvested: '✅' };
const STATUS_COLORS = { Active: 'status-active', 'At Risk': 'status-risk', Completed: 'status-completed' };

export default function FieldCard({ field, showAgent = false }) {
  const navigate = useNavigate();
  const icon = STAGE_ICONS[field.stage] || '🌱';
  const statusClass = STATUS_COLORS[field.status] || 'status-active';

  return (
    <div
      className={`field-card ${statusClass}`}
      onClick={() => navigate(`/fields/${field.id}`)}
    >
      <div className="field-card-header">
        <span className="field-icon">{icon}</span>
        <div className="field-title">
          <h3>{field.name}</h3>
          <span className="crop-type">{field.crop_type}</span>
        </div>
        <span className={`status-badge ${statusClass}`}>{field.status}</span>
      </div>
      <div className="field-card-body">
        <div className="field-meta">
          <span className="meta-item">📅 Planted {new Date(field.planting_date).toLocaleDateString()}</span>
          <span className="meta-item">⏱ {field.days_since_planting} days</span>
          {field.area_hectares && <span className="meta-item">📐 {field.area_hectares} ha</span>}
        </div>
        <div className="stage-progress">
          {['Planted', 'Growing', 'Ready', 'Harvested'].map((s, i) => (
            <div key={s} className={`stage-step ${i <= ['Planted','Growing','Ready','Harvested'].indexOf(field.stage) ? 'done' : ''}`}>
              <div className="stage-dot" />
              <span>{s}</span>
            </div>
          ))}
        </div>
        {showAgent && (
          <div className="field-agent">
            👤 {field.agent_name || <em>Unassigned</em>}
          </div>
        )}
      </div>
    </div>
  );
}
