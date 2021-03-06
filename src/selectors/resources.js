// Copyright 2018, 2019 Stanford University see LICENSE for license
import _ from 'lodash'
import { selectSubjectTemplate, selectPropertyTemplate } from 'selectors/templates'

// Always use selectNormSubject/Property/Value in components.
// selectSubject/Property/Value can be used in actionCreators.
// Only use selectFullSubject/Property/Value where absolutely necessary, since expensive to create.

export const selectSubject = (state, key) => {
  const subject = selectNormSubject(state, key)
  if (_.isEmpty(subject)) return null

  const newSubject = { ...subject }
  newSubject.subjectTemplate = selectSubjectTemplate(state, newSubject.subjectTemplateKey)
  newSubject.properties = newSubject.propertyKeys.map((propertyKey) => selectNormProperty(state, propertyKey))
  return newSubject
}

export const selectProperty = (state, key) => {
  const property = selectNormProperty(state, key)
  if (_.isEmpty(property)) return null

  const newProperty = { ...property }
  const newSubject = selectNormSubject(state, newProperty.subjectKey)
  newSubject.subjectTemplate = selectSubjectTemplate(state, newSubject.subjectTemplateKey)

  newProperty.subject = newSubject
  newProperty.propertyTemplate = selectPropertyTemplate(state, newProperty.propertyTemplateKey)
  newProperty.values = null
  if (property.valueKeys) {
    newProperty.values = newProperty.valueKeys.map((valueKey) => {
      const newValue = { ...selectValue(state, valueKey) }
      newValue.property = newProperty
      return newValue
    })
  }
  return newProperty
}

export const selectValue = (state, key) => {
  const value = selectNormValue(state, key)
  if (_.isEmpty(value)) return null

  const newValue = { ...value }
  const property = selectNormProperty(state, newValue.propertyKey)
  const newProperty = { ...property }
  newProperty.propertyTemplate = selectPropertyTemplate(state, newProperty.propertyTemplateKey)
  newValue.property = newProperty
  newValue.valueSubject = selectSubject(state, newValue.valueSubjectKey)
  return newValue
}

export const selectNormSubject = (state, key) => state.entities.subjects[key]

export const selectNormProperty = (state, key) => state.entities.properties[key]

export const selectNormValue = (state, key) => state.entities.values[key]

export const selectCurrentResourceKey = (state) => state.editor.currentResource

export const selectCurrentResourceIsReadOnly = (state) => state.editor.currentResourceIsReadOnly

export const selectFullSubject = (state, key) => {
  const subject = selectNormSubject(state, key)
  if (_.isEmpty(subject)) return null

  const newSubject = { ...subject }
  newSubject.subjectTemplate = selectSubjectTemplate(state, newSubject.subjectTemplateKey)
  newSubject.properties = newSubject.propertyKeys.map((propertyKey) => selectFullProperty(state, propertyKey, newSubject))
  return newSubject
}

export const selectFullProperty = (state, key, subject) => {
  const property = selectNormProperty(state, key)
  if (_.isEmpty(property)) return null

  const newProperty = { ...property }
  newProperty.subject = subject
  newProperty.propertyTemplate = selectPropertyTemplate(state, newProperty.propertyTemplateKey)
  newProperty.values = null
  if (property.valueKeys) newProperty.values = newProperty.valueKeys.map((valueKey) => selectFullValue(state, valueKey, newProperty))
  return newProperty
}

const selectFullValue = (state, key, property) => {
  const value = selectNormValue(state, key)
  if (_.isEmpty(value)) return null

  const newValue = { ...value }
  newValue.property = property
  newValue.valueSubject = selectFullSubject(state, newValue.valueSubjectKey)
  return newValue
}

/**
 * Determines if a resource has been changed since it was last saved.
 * @param {Object} state the redux state
 * @param {string} resourceKey of the resource to check; if omitted, current resource key is used
 * @return {true} true if the resource has changed
 */
export const resourceHasChangesSinceLastSave = (state, resourceKey) => {
  const thisResourceKey = resourceKey || selectCurrentResourceKey(state)
  return state.entities.subjects[thisResourceKey].changed
}

export const selectResourceKeys = (state) => state.editor.resources

export const selectResourceUriMap = (state) => {
  const resourceKeys = selectResourceKeys(state)
  const resourceUriMap = {}
  resourceKeys.forEach((resourceKey) => {
    const subject = selectNormSubject(state, resourceKey)
    if (subject.uri) resourceUriMap[subject.uri] = resourceKey
  })
  return resourceUriMap
}

export const selectLastSave = (state, resourceKey) => state.editor.lastSave[resourceKey]

export const selectNormValues = (state, valueKeys) => {
  if (!valueKeys) return null
  return valueKeys.map((valueKey) => selectNormValue(state, valueKey))
}
