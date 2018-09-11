
Project
    name: string
    members: Members
        items: [Member]
            email: string
            role: string
    portions: Portions
        portions: [Portion]
            _id: string
            name: string
            rank: number
            passages: [Passage]
                name: string
                status: number
                notes: [PassageNote]
                    videoCreated: string
                    noteCreated: string
                    position: number
                    segments: [PassageNoteSegment]
                        videoCreated: string
                        noteCreated: string
                        username: string
                        url: string
                        position: number
                        duration: number
                        text: string
                videos: [PassageVideo]
                    username: string
                    videoCreated: string
                    duration: number
                    url: string
                    
    iAmAdmin: boolean
    iAmTranslator: boolean
    iAmConsultant: boolean
