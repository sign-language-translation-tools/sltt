// Information to show uses for all the tour location for the main window.

import React from 'react'

import TourVideo from './TourVideo.jsx'

let _project = null

export const setTourProject = function (project) {
    _project = project
}

export const getTourProject = function () {
    return _project
}

export const tourSteps = [
    {
        selector: '.sl-create-passage-segment-svg',
        position: 'bottom',
        content: (<div>Click to create a new segment at the current position in the video timeline.
                      A vertical light blue bar is
                      inserted in the timeline to mark the beginning of this segment.
                      <TourVideo stepName='create-passage-segment' />
        </div>)
    },

    {
        selector: '.segment-selector',
        position: 'bottom',
        content: (<div>
            Use the arrows to select a segment OR
            click in the video timeline to select the corresponding
            segment.
                    <TourVideo stepName='' /></div>)
    },

    {
        selector: '.sl-edit-segment-labels-button',
        position: 'bottom',
        content: (<div>Click this to add, remove, or change labels for this segment.
                       You will see the following dialog ... <TourVideo stepName='' /></div>)
    },

    {
        selector: '.segment-labels-top-left',
        position: 'left',
        content: (<div>Enter the label for the top left corner of this segment here.<TourVideo stepName='' /></div>)
    },

    {
        selector: '.sl-ok-edit-segment-lables-button',
        position: 'left',
        content: (<div>Click here to save your label changes.<TourVideo stepName='' /></div>)
    },

    {
        selector: '.sl-edit-segment-position-button',
        position: 'bottom',
        content: (<div>Click to adjust the <strong>Starts At</strong> time for this segment.<TourVideo stepName='' /></div>)
    },

    {
        selector: '.sl-play-segment-button',
        position: 'bottom',
        content: (<div>Play the video for just this segment.
                       Keyboard shortcut: Command-Space.
                    <TourVideo stepName='' /></div>)
    },

    {
        selector: '.sl-record-segment-button',
        position: 'bottom',
        content: (<div>Record a new video for this segment. 
                       If you like the new video, you can patch the new video into the passage. 
                       You can adjust the start/stop times
                       to make the patch fit smoothly.<TourVideo stepName='' /></div>)
    },

    {
        selector: '.sl-play-bible-button',
        position: 'bottom',
        content: (<div>View this segment in another published
                       sign language Bible, e.g. ASLV.<TourVideo stepName='' /></div>)
    },

    {
        selector: '.sl-select-bible-button',
        position: 'bottom',
        content: (<div>Choose which published sign language Bible you wish to view.
                       Only the Bibles which have video for this segment are shown.<TourVideo stepName='' /></div>)
    },

    {
        selector: '.sl-play-previous-draft-segment-svg',
        position: 'bottom',
        content: (<div>
                      Play the video for this segment from the PREVIOUS DRAFT.
                      This allows you to compare the previous draft of this segment to the current draft.
                      Keyboard shortcut: Option-Space.
                      <TourVideo stepName='' /></div>)
    },

    {
        selector: '.sl-select-previous-draft-segment-button',
        position: 'bottom',
        content: (<div>
                     By default we play the same segment from the previous draft.
                     Click here to choose an earlier draft or a different segment.
                     <TourVideo stepName='' /></div>)
    },

    {
        selector: '.segment-caption-heading',
        position: 'left',
        content: (<div>
            A project may optionally enter a caption for this segment.
            Some projects use this to enter a back translation of the segment.
                     <TourVideo stepName='' /></div>)
    },

    {
        selector: '.sl-edit-segment-caption-button',
        position: 'left',
        content: (<div>
            Click this to add or edit a caption for this segment.
                     <TourVideo stepName='' /></div>)
    },

    {
        selector: '.sl-dictate-segment-caption-button',
        position: 'left',
        content: (<div>
            Click this to play the segment and transcribe what the interpreter dictates.
                     <TourVideo stepName='' /></div>)
    },

    {
        selector: '.edit-members-button',
        position: 'bottom',
        content: (<div>Project administrators can click here to add or remove members from the project.
                     They may also specify what role each member has in the project.
                     <TourVideo stepName='edit-members' /></div>)
    },

    {
        selector: '.edit-portions-button',
        position: 'bottom',
        content: (<div>Projects are divided into groups of videos called "portions".
                     Portions have a name like "Luke" or "The Prodigal Son".
                     Click here to add portions to a project or edit the names of existing portions.
                     You must create at least one portion before you can start adding videos to the project.
                     <TourVideo stepName='edit-portions-button' /></div>)
    },

    {
        selector: '.video-camera-button',
        position: 'bottom',
        content: (<div>Click here to return to main project editing screen after editing portions or members.
            <TourVideo stepName='video-camera-button' /></div>)
    },

    {
        selector: '.portion-selector',
        content: (<div>Select the portion you want to work with here.
            <TourVideo stepName='portion-selector' /></div>)
    },

    {
        selector: '.passage-adder',
        content: (<div>Each portion is divided into "Passages".
                      A passage is a single video. Click to add a new passage to this portion.
                      Give the passage a name like "James 2" or "Older Brother".
                      You must do this before you can add video to the passage.
                      <TourVideo stepName='passage-adder' /></div>)
    },

    {
        selector: '.passage-button',
        content: (<div>Click to select this passage.
                     All commands (play, record, etc.) apply to the selected passage.
                     The name of the passage will appear in bold font if there has been any video recorded for this passage.<TourVideo stepName='' /></div>)
    },

    {
        selector: '.passage-button',
        content: (<div>You can drag a video file from your desktop and drop it here to add a new video draft to this passage.
                     You can use the record button to record video using your computer's webcam.
                     <TourVideo stepName='passage-button' /></div>),
        position: 'bottom',
    },

    {
        selector: '.tour-passage-handle',
        content: (<div>Click and drag this handle to reorder this passage in the portion.
                     <TourVideo stepName='tour-passage-handle' /></div>)
    },

    {
        selector: '.passage-delete-button',
        content: (<div>Click to delete this passage. If the passage has any videos present you will be asked to confirm the deletion.
                    <TourVideo stepName='passage-delete-button' /></div>)
    },

    {
        selector: '.sl-play-button',
        content: (<div>Play the currently selected passage.
                      <TourVideo stepName='sl-play-button' /></div>)
    },

    {
        selector: '.sl-record-button',
        content: (<div>Record a new draft of the currently selected passage.
                      <TourVideo stepName='sl-record-button' /></div>)
    },

    {
        selector: '.sl-create-note-button',
        content: (<div> Add a note to the passage the current position. 
                      The note may be recorded with your webcam or typed.
                      <TourVideo stepName='sl-create-note-button' /></div>)
    },

    {
        selector: '.note-bar',
        content: (<div>Notes are shown in this box. 
                     Each note is shown as a green dot at its position in the video.
                     Click the green dot to view the note or add additional video or written comments to it.
                     <TourVideo stepName='note-bar' /></div>)
    },

    {
        selector: '.passage-video-selector',
        content: (<div> This selector shows the date and times for all drafts of this passage.
                       Select which draft you wish to view here.
                        By default we show the latest draft of the video.
                        <TourVideo stepName='passage-video-selector' /></div>)
    },

    {
        selector: '.passage-status-selector',
        content: (<div> Set the draft status for the current video.
                      One filmstrip when the first project review stage has been passed.
                      Two filmstrips for the second review stage, etc.
                      Selecting the trashcan icon will delete this draft.
                      <TourVideo stepName='passage-status-selector' /></div>)
    },

    {
        selector: '.video-rate-input-slider',
        content: (<div>Select the  playback speed for the video. Move the selector upwards for faster playback.
                  <TourVideo stepName='video-rate-input-slider' /></div>)
    },

    {
        selector: '.sl-adjust-current-time-buttons',
        content: (<div>Adjust the current position in the video. You can move forward and backward by either one frame or one second.
                      <TourVideo stepName='sl-adjust-current-time-buttons' /></div>)
    },

    {
        selector: '.video-positionbar',
        content: (<div> The cursor in this box shows the position in the video. 
                      Click on the line or drag the cursor to adjust the video position.
                      <TourVideo stepName='video-positionbar' /></div>)
    },

]