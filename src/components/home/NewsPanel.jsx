// Copyright 2019 Stanford University see LICENSE for license

import React from 'react'
import NewsItem from './NewsItem'
import LoginPanel from './LoginPanel'

const NewsPanel = () => (
  <div className="jumbotron banner center-block">
    <div className="card panel-news">
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <NewsItem />
          </div>
          <div className="col-md-6">
            <LoginPanel />
          </div>
        </div>
      </div>
    </div>
  </div>
)


export default NewsPanel
