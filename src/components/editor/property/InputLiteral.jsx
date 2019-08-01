// Copyright 2018, 2019 Stanford University see LICENSE for license

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SinopiaPropTypes from 'SinopiaPropTypes'
import { connect } from 'react-redux'
import shortid from 'shortid'
import { removeItem, itemsSelected } from 'actions/index'
import {
  findNode, getDisplayValidations, getPropertyTemplate, findErrors,
} from 'selectors/resourceSelectors'
import LanguageButton from './LanguageButton'
import { booleanPropertyFromTemplate, defaultLanguageId } from 'Utilities'
import _ from 'lodash'

// Redux recommends exporting the unconnected component for unit tests.
export class InputLiteral extends Component {
  constructor(props) {
    super(props)

    this.state = {
      content_add: '',
    }
    this.inputLiteralRef = React.createRef()
  }

  disabled = () => !booleanPropertyFromTemplate(this.props.propertyTemplate, 'repeatable', true)
      && this.props.items?.length > 0

  handleChange = (event) => {
    const userInput = event.target.value

    this.setState({ content_add: userInput })
  }

  addUserInput = (input, currentcontent) => {
    input[shortid.generate()] = {
      content: currentcontent,
      lang: defaultLanguageId,
    }
  }

  handleKeypress = (event) => {
    if (event.key !== 'Enter') {
      return
    }
    this.addItem()
  }

  addItem = () => {
    const currentcontent = this.state.content_add.trim()
    if (!currentcontent) {
      return
    }
    const userInput = {}
    this.addUserInput(userInput, currentcontent)
    const payload = {
      reduxPath: this.props.reduxPath,
      items: userInput,
    }
    this.props.handleMyItemsChange(payload)
    this.setState({
      content_add: '',
    })
  }

  handleDeleteClick = (event) => {
    this.props.handleRemoveItem(this.props.reduxPath, event.target.dataset.item)
  }

  handleEditClick = (event) => {
    const idToRemove = event.target.dataset.item

    this.setState({ content_add: this.props.items[idToRemove].content })
    this.handleDeleteClick(event)
    this.inputLiteralRef.current.focus()
  }

  makeAddedList = () => {
    if (this.props.items === undefined) {
      return
    }

    return Object.keys(this.props.items).map(itemId => (
      <div id="userInput" key={itemId} >
        <div
          className="rbt-token rbt-token-removeable">
          {this.props.items[itemId].content}
          <button
            id={`delete${itemId}`}
            type="button"
            onClick={this.handleDeleteClick}
            key={`delete${itemId}`}
            data-item={itemId}
            className="close rbt-close rbt-token-remove-button">
            <span
                aria-hidden="true"
                data-item={itemId}>×</span>
          </button>
        </div>
        <button
          id="editItem"
          type="button"
          onClick={this.handleEditClick}
          key={`edit${itemId}`}
          data-item={itemId}
          className="btn btn-sm btn-literal btn-default">
          Edit
        </button>
        <LanguageButton reduxPath={[...this.props.reduxPath, 'items', itemId]}/>
      </div>
    ))
  }

  render() {
    // Don't render if don't have property templates yet.
    if (!this.props.propertyTemplate) {
      return null
    }

    const required = booleanPropertyFromTemplate(this.props.propertyTemplate, 'mandatory', false)
    let error
    let groupClasses = 'form-group'

    if (this.props.displayValidations && !_.isEmpty(this.props.errors)) {
      groupClasses += ' has-error'
      error = this.props.errors.join(',')
    }

    return (
      <div className={groupClasses}>
        <input
              required={required}
              className="form-control"
              placeholder={this.props.propertyTemplate.propertyLabel}
              onChange={this.handleChange}
              onKeyPress={this.handleKeypress}
              onBlur={this.addItem}
              value={this.state.content_add}
              disabled={this.disabled()}
              ref={this.inputLiteralRef}
        />
        {error && <span className="help-block">{error}</span>}
        {this.makeAddedList()}
      </div>
    )
  }
}

InputLiteral.propTypes = {
  propertyTemplate: SinopiaPropTypes.propertyTemplate,
  errors: PropTypes.array,
  items: PropTypes.object,
  handleMyItemsChange: PropTypes.func,
  handleRemoveItem: PropTypes.func,
  reduxPath: PropTypes.array.isRequired,
  displayValidations: PropTypes.bool,
}

const mapStateToProps = (state, ownProps) => {
  const reduxPath = ownProps.reduxPath
  const resourceTemplateId = reduxPath[reduxPath.length - 2]
  const propertyURI = reduxPath[reduxPath.length - 1]
  const displayValidations = getDisplayValidations(state)
  const formData = findNode(state.selectorReducer, reduxPath)
  const errors = findErrors(state.selectorReducer, reduxPath)
  // items has to be its own prop or rerendering won't occur when one is removed
  const items = formData.items
  const propertyTemplate = getPropertyTemplate(state, resourceTemplateId, propertyURI)

  return {
    items,
    propertyTemplate,
    displayValidations,
    errors,
  }
}

const mapDispatchToProps = dispatch => ({
  handleMyItemsChange(userInput) {
    dispatch(itemsSelected(userInput))
  },
  handleRemoveItem(reduxPath, itemId) {
    dispatch(removeItem(reduxPath, itemId))
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(InputLiteral)
