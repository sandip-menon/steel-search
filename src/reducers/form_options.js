import 'babel-polyfill';
import { SET_FORM_OPTIONS, SET_SUB_GROUPS } from 'constants';

export function form_options(state = {
  reporterCountries: [],
  partnerCountries: [],
  productGroups: [],
  flowTypes: [],
  timePeriods: [],
}, action) {
  switch (action.type) {
  case SET_FORM_OPTIONS:
    return Object.assign({}, state, {
      reporterCountries: action.reporter_countries,
      partnerCountries: action.partner_countries,
      productGroups: action.product_groups,
      flowTypes: action.flow_types,
      timePeriods: action.time_periods,
    });
  case SET_SUB_GROUPS:
    return Object.assign({}, state, {
      partnerCountries: action.partner_countries,
      productGroups: action.product_groups
    });
  default:
    return state;
  }
}