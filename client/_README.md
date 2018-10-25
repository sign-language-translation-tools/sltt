# To run (not in debug mode)

    yarn install      [if this has not already been done]
    yarn start

# To run (debug mode)

    yarn start  (start client)
    
    select debug mode
    Debug > Start Debugging

# Enable debug output

    [enter in browser console]
    localStorage.debug = 'sltt:*'   [see www.npmjs.com/package/debug]

# View server log (real time)

    ssl to server
    PM2 logs

    
# Notes

* Major problems with click not working in react-bootstrap/SplitButton. Gave up. Complicated React stacked on top of complicated bootstrap. Learned that React does not attach event handlers at the element level ... so chrome does not show anything there.