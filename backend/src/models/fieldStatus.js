/**
 * Field Status Logic
 * ==================
 * Status is computed from stage + planting date (days elapsed).
 *
 * Rules:
 *  - Harvested stage => "Completed"
 *  - Planted/Growing/Ready + within expected window => "Active"
 *  - Planted/Growing + days elapsed exceed crop-specific threshold => "At Risk"
 *  - Ready + days elapsed > expected harvest window => "At Risk"
 *
 * Expected growth windows (days) per crop type:
 *  Default fallback is 90 days.
 */

const CROP_WINDOWS = {
  maize:    { planted: 14, growing: 75, ready: 21 },
  wheat:    { planted: 10, growing: 60, ready: 14 },
  rice:     { planted: 21, growing: 100, ready: 21 },
  sorghum:  { planted: 14, growing: 70, ready: 21 },
  beans:    { planted: 10, growing: 50, ready: 14 },
  default:  { planted: 14, growing: 75, ready: 21 },
};

function daysSince(dateStr) {
  const planted = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - planted) / (1000 * 60 * 60 * 24));
}

function computeStatus(field) {
  const { stage, planting_date, crop_type } = field;

  if (stage === 'Harvested') return 'Completed';

  const days = daysSince(planting_date);
  const crop = (crop_type || '').toLowerCase();
  const windows = CROP_WINDOWS[crop] || CROP_WINDOWS.default;

  // Cumulative thresholds
  const plantedMax = windows.planted;
  const growingMax = windows.planted + windows.growing;
  const readyMax   = windows.planted + windows.growing + windows.ready;

  if (stage === 'Planted' && days > plantedMax) return 'At Risk';
  if (stage === 'Growing' && days > growingMax)  return 'At Risk';
  if (stage === 'Ready'   && days > readyMax)    return 'At Risk';

  return 'Active';
}

function enrichField(field) {
  return {
    ...field,
    status: computeStatus(field),
    days_since_planting: daysSince(field.planting_date),
  };
}

module.exports = { computeStatus, enrichField };
