// Copyright 2018 Stanford University see LICENSE for license
import { lookupOptionsRetrieved } from 'reducers/lookups'
import { createState } from 'stateUtils'

describe('lookupOptionsRetrieved', () => {
  const uri = 'https://id.loc.gov/vocabulary/mgroove'
  const lookup = [
    {
      id: 'mDg4LzQtGH',
      label: 'Coarse groove',
      uri: 'http://id.loc.gov/vocabulary/mgroove/coarse',
    },
    {
      id: 'sFdbC6NLsZ',
      label: 'Lateral or combined cutting',
      uri: 'http://id.loc.gov/vocabulary/mgroove/lateral',
    },
  ]

  it('adds a new lookup', () => {
    const newState = lookupOptionsRetrieved(createState().selectorReducer, { payload: { uri, lookup } })
    expect(newState).toMatchObject({
      entities: {
        lookups: { [uri]: lookup },
      },
    })
  })
})
