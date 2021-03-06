import fetch from 'isomorphic-fetch';
import { stringify } from 'querystring';
import { isEmpty, omit, values, has, startCase, map } from '../utils/lodash';
import { REQUEST_RESULTS, RECEIVE_FAILURE, RECEIVE_RESULTS } from 'constants';
import config from '../config.js';
import moment from 'moment';

export function requestResults() {
  return {
    type: REQUEST_RESULTS,
  };
}

export function receiveFailure(error) {
  return {
    type: RECEIVE_FAILURE,
    error,
  };
}

export function receiveResults(payload) {
  const results = {};
  // Grab the time period fields from one of the result entries: 
  const time_periods = map(extractTimePeriods(payload.product_group_entry[0]), time_period => {
    return {label: startCase(time_period.replace('sum_', '')).toUpperCase(), value: time_period}
  });
  results.dashboardData = payload;
  results.time_periods = time_periods;
  return {
    type: RECEIVE_RESULTS,
    results,
  };
}

function aggregateResults(json, params, offset, agg_results) {
  
  const results = {};
  results.product_group_entry = json[0].results;
  results.partner_country_entry = json[1].results;

  if (results.product_group_entry.length == 0 && results.partner_country_entry == 0)
    return receiveFailure('No results found for this Trade Flow and Reporter Country combination.' );
  else if (results.partner_country_entry == 0)
    return receiveFailure('No results found for this Reporter and Partner Country combination.' );
  else if (results.product_group_entry.length == 0)
    return receiveFailure('No results found for this Reporter Country and Product Group combination.' );

  results.reporter_country = params.reporter_countries;
  results.source_last_updated = json[1].sources_used[0].source_last_updated;

  return receiveResults(results);
}

const { host, apiKey } = config.api.steel;
function fetchResults(params, offset = 0, aggregated_results = {}) {
  return (dispatch) => {
    dispatch(requestResults());
    const product_group_querystring = stringify(omit(params, ['partner_countries', 'comparison_interval_start', 'comparison_interval_end', 'pie_period']));
    const partner_country_querystring = stringify(omit(params, ['product_groups', 'comparison_interval_start', 'comparison_interval_end', 'pie_period']));
    const requests = [
      fetch(`${host}?api_key=${apiKey}&size=100&offset=${offset}&${product_group_querystring}`).then(response => response.json()),
      fetch(`${host}?api_key=${apiKey}&size=100&offset=${offset}&${partner_country_querystring}`).then(response => response.json()) ];

    return Promise.all(requests)
      .then(json => dispatch(aggregateResults(json, params, offset, aggregated_results)))
      .catch((error) => {
        dispatch(receiveFailure('There was an error retrieving results from the data source:  ' + error ));
      });
  };
}

export function fetchResultsIfNeeded(params) {
  return (dispatch, getState) => {
    if (isEmpty(omit(params, ['offset', 'size'])))
      return dispatch(receiveResults({})); // Don't return anything if no query is entered
    if(shouldFetchResults(getState())){
      const agg_results = {results: [], total: 0}
      return dispatch(fetchResults(params, 0, agg_results));
    }

    return Promise.resolve([]);
  };
}

function shouldFetchResults(state) {
  const { results } = state;
  if (!results) {
    return true;
  } else if (results.isFetching) {
    return false;
  }
  return true;
}

function extractTimePeriods(result){
  const time_periods = [];
  for (let key in result){
    if (/[0-9]{4}/.test(key))
      time_periods.push(key);
  }
  return time_periods;
}
