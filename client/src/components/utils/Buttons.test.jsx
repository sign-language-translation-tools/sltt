import React from 'react'

import { PassageAddButton, MembersViewButton, PortionsViewButton, StopButton, PlayButton, PauseButton, RecordButton, 
         CreateNoteButton, AdjustCurrentTimeButtons } from './Buttons.jsx'

function ButtonsTest() {
    return (
        <div>
            <div>
                <PassageAddButton enabled={true} />
                <PassageAddButton enabled={false} />
            </div>
            <div>
                <MembersViewButton />
                <PortionsViewButton />
            </div>
            <div>
                <StopButton enabled={true} />
                <PlayButton enabled={true} />
                <PauseButton enabled={true} />
                <RecordButton enabled={true} />
                <CreateNoteButton enabled={true} />
                <AdjustCurrentTimeButtons enabled={true} />
            </div>
            <div>
                <StopButton enabled={false} />
                <PlayButton enabled={false} />
                <PauseButton enabled={false} />
                <RecordButton enabled={false} />
                <CreateNoteButton enabled={false} />
                <AdjustCurrentTimeButtons enabled={false} />
            </div>
        </div>
    )
}

export default ButtonsTest