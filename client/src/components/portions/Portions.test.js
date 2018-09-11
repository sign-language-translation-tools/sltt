import React from 'react';
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'

import PortionsEditor from './PortionsEditor.jsx'
import { Project } from '../../models/Project.js'
import { typicalProject } from '../../models/Project.test.js'

const prj = Project.create(typicalProject)

it("renders without crashing", () => {
    const div = document.createElement('div')
    ReactDOM.render(
      <Provider iAmTranslator={true}>
        <PortionsEditor portions={prj.portions} />
      </Provider>, 
      div
    )
    ReactDOM.unmountComponentAtNode(div)
})