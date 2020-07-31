// Copyright 2019 Stanford University see LICENSE for license
import { addError } from 'actions/errors'
import { validateTemplates } from './templateValidationHelpers'
import Config from 'Config'
import { addTemplates } from 'actions/templates'
import { selectSubjectAndPropertyTemplates } from 'selectors/templates'
import TemplatesBuilder from 'TemplatesBuilder'
import { fetchResource } from 'sinopiaApi'

/**
 * A thunk that gets a resource template from state or the server.
 * @return [Object] subject template
 */
export const loadResourceTemplate = (resourceTemplateId, errorKey) => (dispatch) => dispatch(loadResourceTemplateWithoutValidation(resourceTemplateId))
  .then((subjectTemplate) => dispatch(validateTemplates(subjectTemplate, errorKey))
    .then((isValid) => (isValid ? subjectTemplate : null)))
  .catch((err) => {
    dispatch(addError(errorKey, `Error retrieving ${resourceTemplateId}: ${err.message}`))
    return null
  })

/**
   * A thunk that gets a resource template from state or the server and transforms to
   * subject template and property template models and adds to state.
   * Validation is not performed. This means that invalid templates can be stored in state.
   * @return [Object] subject template
   * @throws when error occurs retrieving the resource template.
   */
export const loadResourceTemplateWithoutValidation = (resourceTemplateId) => (dispatch, getState) => {
  // Try to get it from state.
  const subjectTemplate = selectSubjectAndPropertyTemplates(getState(), resourceTemplateId)
  if (subjectTemplate) return Promise.resolve(subjectTemplate)

  const templateUri = `${Config.sinopiaApiBase}/${resourceTemplateId}`
  return fetchResource(templateUri)
    .then(([dataset]) => {
      const subjectTemplate = new TemplatesBuilder(dataset, templateUri).build()
      dispatch(addTemplates(subjectTemplate))
      return subjectTemplate
    })
}
