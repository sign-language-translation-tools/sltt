import React from 'react'

export const tourSteps = [
    {
        selector: '.edit-members-button',
        position: 'bottom',
        content: (<p>Project administrators can click here to add or remove members from the project.
                     They may also specify what role each member has in the project.</p>)
    },

    {
        selector: '.edit-portions-button',
        position: 'bottom',
        content: (<p>Projects are divided into groups of videos called "portions".
                     Portions have a name like "Luke" or "The Prodigal Son".
                     Click here to add portions to a project or edit the names of existing portions.
                     You must create at least one portion before you can start adding videos to the project.</p>)
    },

    {
        selector: '.video-camera-button',
        position: 'bottom',
        content: (<p>Click here to return to main project editing screen after editing portions or members.</p>)
    },

    {
        selector: '.portion-selector',
        content: 'Select the portion you want to work with here.'
    },

    {
        selector: '.passage-adder',
        content: (<p>Each portion is divided into "Passages".
                      A passage is a single video. Click to add a new passage to this portion.
                      Give the passage a name like "James 2" or "Older Brother".
                      You must do this before you can add video to the passage.</p>)
    },

    {
        selector: '.passage-button',
        content: (<p>Click to select this passage.
                     All commands (play, record, etc.) apply to the selected passage.
                     The name of the passage will appear in bold font if there has been any video recorded for this passage.</p>)
    },

    {
        selector: '.passage-button',
        content: (<p>You can drag a video file from your desktop and drop it here to add a new video draft to this passage.
                     You can use the record button to record video using your computer's webcam.</p>),
        position: 'bottom',
    },

    {
        selector: '.tour-passage-handle',
        content: (<p>Click and drag this handle to reorder this passage in the portion.</p>)
    },

    {
        selector: '.passage-delete-button',
        content: (<p>Click to delete this passage. If the passage has any videos present you will be asked to confirm the deletion.</p>)
    },

    {
        selector: '.sl-play-button',
        content: (<p>Play the currently selected passage.</p>)
    },

    {
        selector: '.sl-record-button',
        content: (<p>Record a new draft of the currently selected passage.</p>)
    },

    {
        selector: '.sl-create-note-button',
        content: (<p> Add a note to the passage the current position. 
                      The note may be recorded with your webcam or typed.</p>)
    },

    {
        selector: '.note-bar',
        content: (<p>Notes are shown in this box. 
                     Each note is shown as a green dot at its position in the video.
                     Click the green dot to view the note or add additional video or written comments to it.</p>)
    },

    {
        selector: '.passage-video-selector',
        content: (<p> This selector shows the date and times for all drafts of this passage.
                       Select which draft you wish to view here.
                        By default we show the latest draft of the video.
        </p>)
    },

    {
        selector: '.passage-status-selector',
        content: (<p> Set the draft status for the current video.
                      One filmstrip when the first project review stage has been passed.
                      Two filmstrips for the second review stage, etc.
                      Selecting the trashcan icon will delete this draft.
        </p>)
    },

    {
        selector: '.video-rate-input-slider',
        content: (<p>Select the  playback speed for the video. Move the selector upwards for faster playback.</p>)
    },

    {
        selector: '.sl-adjust-current-time-buttons',
        content: (<p>Adjust the current position in the video. You can move forward and backward by either one frame or one second.</p>)
    },

    {
        selector: '.video-positionbar',
        content: (<p> The cursor in this box shows the position in the video. 
                      Click on the line or drag the cursor to adjust the video position.</p>)
    },

]