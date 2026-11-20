import backendTargets from '../firebase-target.json';

export const COMMON_FUNCTION_OPTIONS = {
  region: backendTargets.productionRegion,
  serviceAccount: backendTargets.productionRuntimeServiceAccount,
};
