// Copyright 2019 Stanford University see LICENSE for license

import React, {
  useState, useEffect, useMemo, useRef,
} from 'react'
import { Typeahead } from 'react-bootstrap-typeahead'
import defaultFilterBy from 'react-bootstrap-typeahead/lib/utils/defaultFilterBy'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { displayResourceValidations } from 'selectors/errors'
import { renderMenuFunc, renderTokenFunc, itemsForProperty } from './renderTypeaheadFunctions'
import { fetchLookup } from 'actionCreators/lookups'
import { selectLookup } from 'selectors/lookups'
import _ from 'lodash'
import { addProperty } from 'actions/resources'
import { newUriValue, newLiteralValue } from 'utilities/valueFactory'

// propertyTemplate of type 'lookup' does live QA lookup via API
//  based on URI in propertyTemplate.valueConstraint.useValuesFrom,
//  and the lookupConfig for the URI has component value of 'list'
const InputListLOC = (props) => {
  const dispatch = useDispatch()

  const typeAheadRef = useRef(null)

  const allAuthorities = useMemo(() => {
    const authorities = {}
    props.property.propertyTemplate.authorities.forEach((authority) => authorities[authority.uri] = authority)
    return authorities
  }, [props.property.propertyTemplate.authorities])
  const [selectedAuthorities, setSelectedAuthorities] = useState({})

  useEffect(() => {
    setSelectedAuthorities(allAuthorities)
  }, [allAuthorities])

  const isRepeatable = props.property.propertyTemplate.repeatable

  useEffect(() => {
    props.property.propertyTemplate.authorities.forEach((authority) => {
      dispatch(fetchLookup(authority.uri))
    })
  }, [dispatch, props.property.propertyTemplate.authorities])

  const authorities = useSelector((state) => {
    const newAuthorities = {}
    props.property.propertyTemplate.authorities.forEach((authority) => {
      newAuthorities[authority.uri] = selectLookup(state, authority.uri) || []
    })
    return newAuthorities
  })

  // Only update options when lookups or lookupConfigs change.
  const options = useMemo(() => {
    const newOptions = []
    Object.values(selectedAuthorities).forEach((authority) => {
      newOptions.push({ authLabel: authority.label, authURI: authority.uri })
      newOptions.push(...authorities[authority.uri] || [])
    })
    return newOptions
  }, [authorities, selectedAuthorities])

  const selected = itemsForProperty(props.property)

  // From https://github.com/ericgio/react-bootstrap-typeahead/issues/389
  const onKeyDown = (e) => {
    // 8 = backspace
    if (e.keyCode === 8
        && e.target.value === '') {
      // Don't trigger a "back" in the browser on backspace
      e.returnValue = false
      e.preventDefault()
    }
  }

  const selectionChanged = (items) => {
    const newProperty = { ...props.property }
    if (_.isEmpty(items)) {
      newProperty.values = []
    } else {
      newProperty.values = items.map((item) => {
        if (item.uri) {
          return newUriValue(props.property, item.uri, item.label)
        }
        return newLiteralValue(props.property, item.content, null)
      })
    }
    dispatch(addProperty(newProperty))
  }

  const lookupCheckboxes = props.property.propertyTemplate.authorities.map((authority) => {
    const id = `${props.property.key}-${authority.uri}`
    return (
      <div key={authority.uri} className="form-check">
        <input className="form-check-input"
               type="checkbox" id={id}
               checked={!!selectedAuthorities[authority.uri]}
               onChange={() => toggleLookup(authority.uri)} />
        <label className="form-check-label" htmlFor={id}>
          {authority.label}
        </label>
      </div>
    ) })

  // Custom filterBy to retain authority labels when filtering to provide context.
  const filterBy = (option, props) => {
    if (option.authURI || option.isError) {
      return true
    }
    props.filterBy = ['label']
    return defaultFilterBy(option, props)
  }

  const toggleLookup = (uri) => {
    const newSelectedAuthorities = { ...selectedAuthorities }
    if (newSelectedAuthorities[uri]) {
      delete newSelectedAuthorities[uri]
    } else {
      newSelectedAuthorities[uri] = allAuthorities[uri]
    }
    setSelectedAuthorities(newSelectedAuthorities)
    typeAheadRef.current.getInstance().getInput().click()
  }


  const displayValidations = useSelector((state) => displayResourceValidations(state))
  const validationErrors = props.property.errors

  const isDisabled = selected?.length > 0 && !isRepeatable

  let error
  let className
  if (displayValidations && !_.isEmpty(validationErrors)) {
    className = 'is-invalid'
    error = validationErrors.join(',')
  }

  return (
    <React.Fragment>
      {lookupCheckboxes.length > 1 && lookupCheckboxes}
      <div className="form-group">
        <Typeahead
          renderMenu={(results, menuProps) => renderMenuFunc(results, menuProps, Object.values(selectedAuthorities))}
          renderToken={(option, props, idx) => renderTokenFunc(option, props, idx)}
          allowNew={() => true }
          onChange={(selected) => selectionChanged(selected)}
          id="loc-vocab-list"
          className={className}
          isInvalid={!_.isEmpty(error)}
          multiple={true}
          placeholder={props.property.propertyTemplate.label}
          emptyLabel="retrieving list of terms..."
          useCache={true}
          selectHintOnEnter={true}
          options={options}
          selected={selected}
          filterBy={filterBy}
          onKeyDown={onKeyDown}
          disabled={isDisabled}
          ref={(ref) => typeAheadRef.current = ref}
        />
        {error && <span className="invalid-feedback">{error}</span>}
      </div>
    </React.Fragment>
  )
}

InputListLOC.propTypes = {
  property: PropTypes.object.isRequired,
}

export default InputListLOC
