/**
 * Selects a subject template by key.
 * @param [Object] state
 * @param [string] key
 * @return [Object] subject template
 */
export const selectSubjectTemplate = (state, key) => state.selectorReducer
  .entities.subjectTemplates[key]

/**
   * Selects a property template by key.
   * @param [Object] state
   * @param [string] key
   * @return [Object] property template
   */
export const selectPropertyTemplate = (state, key) => state.selectorReducer
  .entities.propertyTemplates[key]

/**
     * Selects a subject template and associated property templates by key.
     * @param [Object] state
     * @param [string] key
     * @return [Object, [Object]] subject template, propertyTemplates
     */
export const selectSubjectAndPropertyTemplates = (state, key) => {
  const subjectTemplate = selectSubjectTemplate(state, key)
  if (!subjectTemplate) return [null, []]

  const propertyTemplates = subjectTemplate.propertyTemplateKeys
    .map((propertyTemplateKey) => selectPropertyTemplate(state, propertyTemplateKey))

  return [subjectTemplate, propertyTemplates]
}

export const selectHistoricalTemplates = (state) => state.selectorReducer.historicalTemplates
  .map((resourceTemplateId) => selectSubjectTemplate(state, resourceTemplateId))