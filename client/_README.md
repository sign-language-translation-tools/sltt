# To run (not in debug mode)

    yarn install      [if this has not already been done]
    yarn start

# To run (debug mode)

    yarn start
        # starts client in browser
        # you can close this browser because starting debug will open a new browser
        # do not ^c the code running in the terminal

    
    select debug mode
    select Chrome launch.json entry
    Debug > Start Debugging

        break points can be set in VSC and will be honored by browser
        Not everything visible in browser log is visible in VSC Debug Console (by most stuff is)

# Enable debug output

To turn on debug output in browser console window

    localStorage.debug = 'sltt:*'   [see www.npmjs.com/package/debug]

# View server log (real time)

    ssl to server
    PM2 logs

# Run client side unittests

So far we only have tests working for the 'models' directory.
Most of these tests only interact with a local copy of PouchDB.
The API and Db test must interact with a sltt server.
By default the test will execute against the web based server.
Uncomment the following line sltt_environment to execute against a local copy of the server 
(this may be useful when debugging since you could set breakpoints on both sides of the
test)

    # SLTT_SERVER_LOCATION="local"

TODO Figure out best way to create React component unit tests.
Cypress.io looks interesting.
One of the trickiest parts is the interaction between client and server when recording video.
Not sure how we can test that.


## Command line

    yarn test

## Interactive debugger

Select launch.json configuration

    FOCUS - run the test listed in the 'args' field of the launch.json entry
    Jest Run Current - run the active pane (e.g. Db.test.js)
                       Unlikely to do anything useful if current pane is not a test.
    Jest Update Current - Run the active pane. Update any snapshots to match output.
                          This needs to happen whenever changes to the code change the desired
                          output from the test.
                          You should only do this if you are convinced the test is running correctly.
    Jest Models - run tests in models directory
    Jest All - not currently working

Debug > Start Debugging

I have not been able to get console.log to work in interactive debugger ... no output is produced.
There are a lot of google hits about this but I could not get any of the 'fixes' to work.
Breakpoints work ok.

    
# Notes

* Major problems with click not working in react-bootstrap/SplitButton. Gave up. Complicated React stacked on top of complicated bootstrap. Learned that React does not attach event handlers at the element level ... so chrome does not show anything there.

* Locked 'debug' module at 3.2.5 because later version was causing 'yarn build' to fail with 'failed to 
minify browser.js' error.