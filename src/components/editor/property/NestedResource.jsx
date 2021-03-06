// Copyright 2019 Stanford University see LICENSE for license

import React from 'react'
import PropTypes from 'prop-types'
import NestedProperty from './NestedProperty'
import NestedResourceActionButtons from './NestedResourceActionButtons'
import { selectNormValue, selectNormSubject, selectCurrentResourceIsReadOnly } from 'selectors/resources'
import { selectSubjectTemplate } from 'selectors/templates'
import { connect, useSelector } from 'react-redux'
import useNavigableComponent from 'hooks/useNavigableComponent'

// AKA a value subject.
const NestedResource = (props) => {
  const [navEl, navClickHandler] = useNavigableComponent(props.value.rootSubjectKey, props.value.rootPropertyKey, props.value.valueSubjectKey)

  const readOnly = useSelector((state) => selectCurrentResourceIsReadOnly(state))

  // onClick is to support left navigation, so ignoring jsx-ally seems reasonable.
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-static-element-interactions */
  return (
    <div className='nested-resource' ref={navEl} onClick={navClickHandler}>
      <div className="row" key={props.valueKey}>
        <section className="col-md-6">
          <h5>{ props.subjectTemplate.label }</h5>
        </section>
        <section className="col-md-6">
          {!readOnly && <NestedResourceActionButtons value={props.value} />}
        </section>
      </div>
      <div>
        {
          props.valueSubject.propertyKeys.map((propertyKey) => (
            <NestedProperty key={propertyKey} propertyKey={propertyKey} />
          ))
        }
      </div>
    </div>
  )
}

NestedResource.propTypes = {
  valueKey: PropTypes.string.isRequired,
  value: PropTypes.object,
  valueSubject: PropTypes.object,
  subjectTemplate: PropTypes.object,
}

const mapStateToProps = (state, ourProps) => {
  // props.value.valueSubject.subjectTemplate
  const value = selectNormValue(state, ourProps.valueKey)
  const valueSubject = selectNormSubject(state, value?.valueSubjectKey)
  return {
    value,
    valueSubject,
    subjectTemplate: selectSubjectTemplate(state, valueSubject?.subjectTemplateKey),
  }
}

export default connect(mapStateToProps)(NestedResource)
