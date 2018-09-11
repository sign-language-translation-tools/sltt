# To run (not in debug mode)

    yarn start

# To run (debug mode)

    yarn start  (start client)
    
    ctl/shift D
    alt B - start debugging
    alt M - stop debugging

# View server log (real time)

    _sl
    PM2 logs

    
# Notes

* Major problems with click not working in react-bootstrap/SplitButton. Gave up. Complicated React stacked on top of complicated bootstrap. Learned that React does not attach event handlers at the element level ... so chrome does not show anything there.