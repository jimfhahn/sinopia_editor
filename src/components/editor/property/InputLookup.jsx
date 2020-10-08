// Copyright 2020 Stanford University see LICENSE for license

import React from 'react'
import PropTypes from 'prop-types'
import { selectModalType } from 'selectors/modals'
import { connect, useSelector, useDispatch } from 'react-redux'
import { bindActionCreators } from 'redux'
import { displayResourceValidations } from 'selectors/errors'
import { selectNormValues, selectCurrentResourceIsReadOnly } from 'selectors/resources'
import _ from 'lodash'
import { removeValue } from 'actions/resources'
import { showModal } from 'actions/modals'
import ModalWrapper from 'components/ModalWrapper'
import LookupModal from './LookupModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe, faSearch, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import ResourceList from './ResourceList'

const InputLookup = (props) => {
  const dispatch = useDispatch()
  const displayValidations = useSelector((state) => displayResourceValidations(state, props.property.rootSubjectKey))
  const errors = props.property.errors
  const readOnly = useSelector((state) => selectCurrentResourceIsReadOnly(state))

  const isRepeatable = props.propertyTemplate.repeatable

  const isDisabled = readOnly || (props.lookupValues.length > 0 && !isRepeatable)

  let error
  let controlClasses = 'open-search-modal btn btn-sm btn-secondary btn-literal form-control'

  if (displayValidations && !_.isEmpty(errors)) {
    controlClasses += ' is-invalid'
    error = errors.join(',')
  }

  const modalId = `InputLookupModal-${props.property.key}`

  const handleClick = (event) => {
    event.preventDefault()
    dispatch(showModal(modalId))
  }

  const lookupSelection = props.lookupValues.map((lookupValue) => (
    <div key={lookupValue.key} className="lookup-value">
      <span key={lookupValue.key}>{lookupValue.label || lookupValue.literal}</span>
      <a href={lookupValue.uri} aria-label={`Link to value ${lookupValue.uri}`} target="_new">
        <span aria-hidden="true"><FontAwesomeIcon className="globe-icon" icon={faGlobe} /></span>
      </a>
      <button onClick={() => props.removeValue(lookupValue.key)}>
        <FontAwesomeIcon className="trash-icon" icon={faTrashAlt} />
      </button>
    </div>
  ))

  let modal
  if (props.show) {
    modal = (
      <LookupModal modalId={modalId}
                   property={props.property}
                   propertyTemplate={props.propertyTemplate}
                   show={props.show} />
    )
  }

  return (
    <React.Fragment>
      <button
        id="lookup"
        data-testid="lookup"
        onClick={ handleClick }
        aria-label={`Lookup value for ${props.propertyTemplate.label}`}
        disabled={isDisabled}
        className={controlClasses}>
        <FontAwesomeIcon className="search-icon" icon={faSearch} />
      </button>
      {error && <span className="invalid-feedback">{error}</span>}
      { lookupSelection }
      <ResourceList property={props.property} />
      <ModalWrapper modal={modal} />
    </React.Fragment>
  )
}

InputLookup.propTypes = {
  property: PropTypes.object.isRequired,
  propertyTemplate: PropTypes.object.isRequired,
  show: PropTypes.bool,
  lookupValues: PropTypes.array,
  removeValue: PropTypes.func,
}

const mapStateToProps = (state, ownProps) => ({
  lookupValues: selectNormValues(state, ownProps.property?.valueKeys),
  show: selectModalType(state) === `InputLookupModal-${ownProps.property.key}`,
})

const mapDispatchToProps = (dispatch) => bindActionCreators({ removeValue }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(InputLookup)
