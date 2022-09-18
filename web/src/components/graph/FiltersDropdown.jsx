import React, { useEffect, useRef, useState } from 'react';
import Filters from "./Filters";
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import {ArrowDropDown, ArrowDropUp} from '@mui/icons-material'
import {useSelector} from 'react-redux'

const FiltersDropdown = () => {
    const activeFilters = useSelector((state) => state.filters.activeFilters);
    const [collapsed, setCollapsed] = useState(activeFilters.length === 0);

    return <div id="filter-dropdown">
        <Collapse in={!collapsed}>
            <Filters />
        </Collapse>
        <Button id="filter-collapse-button"
                onClick={() => setCollapsed(!collapsed)}
                startIcon={collapsed ? <ArrowDropDown />: <ArrowDropUp />}>
            {collapsed ? activeFilters.length + " filter" + (activeFilters.length > 1 ? "s" : "") : ""}
        </Button>
    </div>;
};

export default FiltersDropdown;
