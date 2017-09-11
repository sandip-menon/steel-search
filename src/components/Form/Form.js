import React, { Component, PropTypes } from 'react';
import { reduxForm, change } from 'redux-form';
import Select from 'react-select';
import moment from 'moment';
import FormMessages from 'redux-form-validation';
import { generateValidation } from 'redux-form-validation';
import { requestFormOptions } from '../../actions/form_options';
import './Form.scss';
import { isEmpty, map, snakeCase } from '../../utils/lodash';

 const validations = {
    reporterCountries: {
      required: true
    },
    flowType: {
      required: true
    },
    partnerCountries: {
      required: true
    },
    productGroups: {
      required: true
    },
    tradeFlow: {
      required: true
    }
  };

const SelectField = ({ description, field, label = 'Untitled', options, multi = false, handleChange = null }) => {
  return (
  <div>
    <label htmlFor={field.name}>{label}</label>
    {description ? <p>{description}</p> : null}
    <div>
      <Select
        {...field}
        options={options}
        multi={multi} autoBlur
        onBlur={() => field.onBlur(field.value)}
        joinValues = {true}
        delimiter = {','}
        simpleValue = {true}
        onChange={event => {
          field.onChange(event)
          if (handleChange){
            handleChange(event);
          }
        }}
      />
    </div>
  </div>
);
}
SelectField.propTypes = {
  description: PropTypes.string,
  field: PropTypes.object.isRequired,
  label: PropTypes.string,
  options: PropTypes.array.isRequired,
  multi: PropTypes.bool,
};

class Form extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    formOptions: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      trade_flow: this.props.fields.tradeFlow.value
    }
    this.handleTradeFlowChange = this.handleTradeFlowChange.bind(this);
    this.handleReporterCountryChange = this.handleReporterCountryChange.bind(this);
  }

  handleTradeFlowChange(e) {
    
    this.props.fields.reporterCountries.onChange(null);
    this.props.fields.partnerCountries.onChange(null);
    this.props.fields.productGroups.onChange(null);
    
    const query = {};
    for(let k in this.props.fields) {
      let v = this.props.fields[k];
      query[snakeCase(v.name)] = v.value;
    }
    query.trade_flow = e;

    return this.props.dispatch(requestFormOptions(query));
  }

  handleReporterCountryChange(e) {

    this.props.fields.partnerCountries.onChange(null);
    this.props.fields.productGroups.onChange(null);
    
    const query = {};
    for(let k in this.props.fields) {
      let v = this.props.fields[k];
      query[snakeCase(v.name)] = v.value;
    }
    query.reporter_countries = e;

    return this.props.dispatch(requestFormOptions(query));
  }

  render() {
    const { 
      fields: {  reporterCountries, partnerCountries, productGroups, flowType, tradeFlow }, 
      handleSubmit,
      formOptions 
    } = this.props;
  
    return (
      <form className="explorer__form" onSubmit={handleSubmit}>
        <fieldset>

          <div className="explorer__form__row">
            <div className="explorer__form__group">
              <SelectField field={tradeFlow} options={formOptions.tradeFlows} label="Trade Flow" description="" handleChange={this.handleTradeFlowChange} />
              <FormMessages field={tradeFlow} >
                 <p className="validation-error" when="required">
                   Must choose Imports or Exports.
                 </p>
              </FormMessages>
            </div>

            <div className="explorer__form__group">
              <SelectField field={productGroups} options={formOptions.productGroups} label="Product Groups" description="" />
              <FormMessages field={productGroups} >
                 <p className="validation-error" when="required">
                   Must choose a product group.  
                 </p>
              </FormMessages>
            </div>
          </div>

          <div className="explorer__form__row">
            <div className="explorer__form__group">
              <SelectField field={reporterCountries} options={formOptions.reporterCountries} label="Reporter Country" description="" handleChange={this.handleReporterCountryChange} />
              <FormMessages field={reporterCountries} > 
                   <p className="validation-error" when="required">
                     Must choose a reporter country.
                   </p>
              </FormMessages>
            </div>

            <div className="explorer__form__group">
              <SelectField field={flowType} options={formOptions.flowTypes} label="Quantity or Value" description="" />
              <FormMessages field={flowType} >
                 <p className="validation-error" when="required">
                   Must choose quantity or dollar value.  
                 </p>
              </FormMessages>
            </div>
          </div>

          <div className="explorer__form__row">
            <div className="explorer__form__group">
              <SelectField field={partnerCountries} options={formOptions.partnerCountries} label="Partner Country" description="" />
              <FormMessages field={partnerCountries} >
                 <p className="validation-error" when="required">
                   Must choose a partner country.  
                 </p>
              </FormMessages>
            </div>

            <div className="explorer__form__group">
              <button className="explorer__form__submit pure-button pure-button-primary" onClick={handleSubmit}>
                <i className="fa fa-paper-plane" /> Generate Dashboard
              </button>
            </div>
          </div>

        </fieldset>
      </form>
    );
  }
}

export default reduxForm({
  form: 'form',
  fields: ['reporterCountries', 'partnerCountries', 'productGroups', 'flowType', 'tradeFlow'],
  ...generateValidation(validations)
})(Form);