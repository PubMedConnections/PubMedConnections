import { useState } from "react";
import { OtherNavigation } from "./components/Navigation";
import { GraphBasic, GraphMedium, GraphExtreme } from "./components/Graph";


function Connections() {
    var [state, setState] = useState(0)  // 0: Extreme - 1: Basic


    function updateState() {
        // Below definitely works
        setState((state+1) % 3)

        // Alternative 1: 
        // onClick={() => setState((state+1) % 2)}

        // Alternative 2: 
        // if (state == 0)         setState(1);
        // else if (state == 1)    setState(2);
        // else if (state == 2)    setState(0);
    }


    return (
        <div>
            <OtherNavigation />
            <button className='btn btn-custom btn-lg pull-right' style={{margin:"100px 50px 0px 0px"}} onClick={updateState}>
                Filter/Unfilter
            </button>
            {state === 0 && <GraphExtreme />}
            {state === 1 && <GraphMedium />}
            {state === 2 && <GraphBasic />}
        </div>
    );
}


export default Connections;
