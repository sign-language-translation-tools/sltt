/*
    Show all database keys for current project.
    Click on a key to see coressponding doc.
    Filter by entering a key prefix in the text box.
    Optionally delete all keys matching a prefix, BE CAREFUL! (but it won't let you delete w/o a filter value)
 */


import React, { Component } from 'react'
import _ from 'underscore'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'

function RowView(props) {
    let { setDetails, row } = props
    return ( 
        <p onClick={ () => setDetails(JSON.stringify(row.doc, null, 2)) } > 
            {row.id} 
        </p> 
    )
}

class DatabaseEditor extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props)
        extendObservable(this, {
            rows: [],
            details: '',
            filter: '',
            fetched: null,
        })

        let { project } = props
        if (!project) return

        this.db = project.getDb()
        this.load.bind(this)()
    }

    load() {
        let { filter, db, fetched } = this
        if (!db) return

        if (filter === fetched) return
        this.fetched = filter

        let options = {
            include_docs: true,
        }

        if (filter) {
            options.startkey = filter
            options.endkey = filter + '\ufff0'
            //options.endkey = filter + 'zzzzzzz'
        }

        db.allDocs(options)
            .then(response => {
                this.rows = response.rows
            })
            .catch(err => 
                console.error(err)
            )
    }

    componentWillUpdate() {
        this.load()
    }

    render() {
        //let { project } = this.props

        return (
            <div>
                <input
                    autoFocus
                    value={this.filter}
                    onChange={this.onChange.bind(this)} /> &nbsp;&nbsp;&nbsp;&nbsp;

                <button
                    type="button"
                    className="delete-db-keys btn btn-primary btn-warning"
                    onClick={this.deleteKeys.bind(this)} >
                    Delete!!!
                </button>

                <div className="app-database">
                    <div className="app-database-list">
                        {this.rows.map(row =>
                            <RowView key={row.id}
                                row={row}
                                setDetails={details => this.details = details} />)
                        }
                    </div>
                    <div className="app-database-details">
                        <pre> {this.details} </pre>
                    </div>
                </div>
            </div>
        )
    }

    deleteKeys() {
        // Don't allow deleting everything!!!
        if (!this.filter || this.filter.length === 0) return

        let docs = _.map(this.rows, row => {
            return {
                _deleted: true,
                _id: row.doc._id,
                _rev: row.doc._rev,
            }
        })

        let self = this

        this.db.bulkDocs(
            docs
        ).then(function (result) {
            console.log('Delete done!', result)
            self.fetched = null
            self.load()
        }).catch(function (err) {
            console.error(err);
        })
    }

    onChange(e) {
        this.filter = e.target.value
    }

}

export default observer(DatabaseEditor)