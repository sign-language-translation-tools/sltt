import { Project } from './Project.js'

it("can create simplest instance", () => {
    const prj = Project.create({
        name: 'ASLVtest',
    })

    expect(prj.name).toBe('ASLVtest')
})

export const typicalProject = {
    name: 'ASLVtest',
    portions:
        {
            items: [
                {
                    name: 'Mateo',
                    passages: [{
                        name: 'Mateo 1',
                        videod: true,
                    }],
                },
                {
                    name: 'Lucas',
                    passages: [{
                        name: 'Lucas 1',
                        videod: true,
                    }],
                },
            ]
        },
    members:
        {
            items: [
                {
                    email: 'milesnlwork@gmail.com',
                    role: 'admin',
                }

            ]
        },
}


