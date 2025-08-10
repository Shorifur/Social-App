// server/middleware/featureFlags.js
export const isFeatureEnabled = (feature) => {
  return process.env[`FEATURE_${feature}`] === 'true';
};