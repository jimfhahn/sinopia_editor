// Copyright 2019 Stanford University see LICENSE for license

import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { resourceEditErrorKey } from '../Editor'
import { selectValue, selectCurrentResourceKey, selectProperty } from 'selectors/resources'
import { addSiblingValueSubject, removeValue } from 'actionCreators/resources'
import _ from 'lodash'

const NestedResourceActionButtons = (props) => {
  const subjectTemplateKey = props.value.valueSubject.subjectTemplateKey
  const siblingValues = useMemo(() => props.property.values
    .filter((value) => value.valueSubject.subjectTemplateKey === subjectTemplateKey),
  [props.property.values, subjectTemplateKey])
  // Show add button if repeatable and first value.
  const showAddButton = props.property.propertyTemplate.repeatable && props.valueKey === _.first(siblingValues).key
  // Show delete button if more than one.
  const showRemoveButton = siblingValues.length > 1

  const trashIcon = faTrashAlt

  return (<div className="btn-group pull-right" role="group">
    { showAddButton
      && <button
          className="btn btn-sm btn-add-property btn-add-another"
          aria-label={`Add another ${props.value.valueSubject.subjectTemplate.label}`}
          onClick={() => props.addSiblingValueSubject(_.last(siblingValues).key, resourceEditErrorKey(props.resourceKey))}>+ Add another</button>
    }
    { showRemoveButton
      && <button
        className="btn btn-sm btn-remove-another"
        aria-label={`Remove ${props.value.valueSubject.subjectTemplate.label}`}
        onClick={() => props.removeValue(props.valueKey)}><FontAwesomeIcon icon={trashIcon} /></button>
    }

  </div>)
}
NestedResourceActionButtons.propTypes = {
  resourceKey: PropTypes.string,
  valueKey: PropTypes.string,
  value: PropTypes.object,
  addSiblingValueSubject: PropTypes.func,
  removeValue: PropTypes.func,
  property: PropTypes.object,
}

const mapStateToProps = (state, ownProps) => {
  const value = selectValue(state, ownProps.valueKey)
  // Separately getting property because going to need to evaluate sibling values.
  return {
    value,
    property: selectProperty(state, value.propertyKey),
    resourceKey: selectCurrentResourceKey(state),
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({ addSiblingValueSubject, removeValue }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(NestedResourceActionButtons)
