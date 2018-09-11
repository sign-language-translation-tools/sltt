import React, { Component } from 'react'
import { Editor, EditorState, convertFromRaw, convertToRaw, RichUtils } from 'draft-js'
import PropTypes from 'prop-types'
import { extendObservable } from 'mobx'
import { observer } from 'mobx-react'
import '../../../node_modules/draft-js/dist/Draft.css'


class NoteTextEditor extends Component {
    static propTypes = {
        onSave: PropTypes.func,  // If present, content is assumed to be editable
        onCancel: PropTypes.func,
        content: PropTypes.string,
    }

    constructor(props) {
        super(props)

        let { content } = this.props

        extendObservable(this, {
            editorState: null,
        })

        if (content) {
            let content2 = convertFromRaw(JSON.parse(content))
            this.editorState = EditorState.createWithContent(content2)
        } else {
            this.editorState = EditorState.createEmpty()
        }

        this.handleKeyCommand = this.handleKeyCommand.bind(this)
    }

    render() {
        let { onSave } = this.props

        return (
            <div className="note-text-editor">
                <div className="note-text-editor-editor">
                    <Editor
                        editorState={this.editorState}
                        onChange={this.onChange}
                        handleKeyCommand={this.handleKeyCommand}
                        placeholder="Enter note..." />
                    { onSave && <div className="note-text-editor-buttons">
                        <button type="button"
                            className="btn btn-primary pull-right"
                            onClick={this.onCancel}>Cancel</button>
                        <button type="button"
                            className="btn btn-default btn-primary pull-right"
                            onClick={this.onSave}>OK</button>
                    </div> }
                </div>
            </div>
        )
    }

    onSave = () => {
        let { onSave } = this.props
        if (!onSave) return

        const contentState = this.editorState.getCurrentContent()
        const content = JSON.stringify(convertToRaw(contentState))

        onSave(content)
    }

    onCancel = () => {
        let { onCancel } = this.props
        onCancel && onCancel()
    }

    onChange = (editorState) => {
        let { onSave } = this.props
        if (!onSave) return // If no onSave function, content is not editable

        this.editorState = editorState
    }

    handleKeyCommand(command, editorState) {
        //console.log("command", command)
        let newState = RichUtils.handleKeyCommand(editorState, command)

        if (newState) {
            this.onChange(newState)
            return true
        }

        return false
    }
}

export default observer(NoteTextEditor)