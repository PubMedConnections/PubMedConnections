import React, { useEffect, useRef, useState } from 'react';
import Filters from "./Filters";
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import {ArrowDropDown, ArrowDropUp} from '@mui/icons-material'

/*
TODO:
* Passthrough starting filters props
...
 */

const FiltersDropdown = () => {
    const [collapsed, setCollapsed] = useState(true);

    return <div id="filter-dropdown">
        <Collapse in={!collapsed}>
            <Filters />
        </Collapse>
        <Button id="filter-collapse-button" onClick={() => setCollapsed(!collapsed)} >
            {collapsed ? <ArrowDropDown /> : <ArrowDropUp />}
        </Button>
    </div>;
};

export default FiltersDropdown;
