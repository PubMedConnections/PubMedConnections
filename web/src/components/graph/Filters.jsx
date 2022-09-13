import React, { useEffect, useRef, useState } from 'react';
import {Add, Delete} from '@mui/icons-material'
import {
    Button,
    TextField,
    IconButton,
    Checkbox,
    Select,
    MenuItem,
    ListItemText,
    Slider,
    FormControlLabel
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import {useSelector, useDispatch} from 'react-redux'
import { setFilter, resetFilter, setActiveFilters, removeActiveFilter } from '../../store/slices/filterSlice'


let filterNames = {
    mesh_heading: "MeSH Heading",
    author: "Author Name",
    first_author: "Is First Author",
    last_author: "Is Last Author",
    published_before: "Published Before",
    published_after: "Published After",
    journal: "Journal Name",
    article: "Article Name",
    graph_size: "Max Graph Size",
    graph_type: "Graph Type",
}

const Filters = () => {
    const filters = useSelector((state) => state.filters.filters);
    const dispatch = useDispatch();

    const activeFilters = useSelector((state) => state.filters.activeFilters)

    const filterCategories = {
        Journal: ["Journal", "rgba(169, 103, 224, 0.6)"],
        Author: ["Author", "rgba(234, 47, 30, 0.6)"],
        Article: ["Article", "rgba(149, 178, 249, 0.6)"],
        Graph: ["Graph", "rgba(0, 0, 0, 0.4)"]
    }

    function makeFilterEntry(classifier, identifier, inputField) {
        let name = filterNames[identifier];

        return <div className="filter-row" key={identifier}>
            <div className="filter-class">
                <p style={{background: classifier[1]}}>
                    {classifier[0]}
                </p>
            </div>
            <div className="filter-name"><p>{name}</p></div>
            <div className="filter-entry">{inputField}</div>
            <div className="filter-delete">
                <IconButton aria-label="delete" onClick={() => deleteFilter(identifier)}>
                    <Delete />
                </IconButton>
            </div>
        </div>
    }

    function updateStateCallbackGenerator(identifier, valueFromEventFn) {
        return (event) => {
            dispatch(setFilter({[identifier]: valueFromEventFn(event)}));
        };
    }

    function updateStateDateCallbackGenerator(identifier) {
        return updateStateCallbackGenerator(identifier, (newValue) => newValue.format("YYYY-MM-DD"));
    }

    function updateStateFromEventValueCallbackGenerator(identifier) {
        return updateStateCallbackGenerator(identifier, (event) => event.target.value);
    }

    function updateStateFromEventCheckedCallbackGenerator(identifier) {
        return updateStateCallbackGenerator(identifier, (event) => event.target.checked);
    }

    function makeTextFieldEntry(classifier, identifier, label) {
        const textInput = <TextField
            label={label}
            value={filters[identifier]}
            onChange={updateStateFromEventValueCallbackGenerator(identifier)}
        />;

        return makeFilterEntry(classifier, identifier, textInput);
    }

    function makeDateFieldEntry(classifier, identifier, label) {
        const picker = <DatePicker
            key={"filters-entry-" + identifier}
            label={label}
            value={filters[identifier]}
            onChange={updateStateDateCallbackGenerator(identifier)}
            renderInput={(params) => <TextField {...params} />}
            inputFormat="DD/MM/YYYY"
        />;

        return makeFilterEntry(classifier, identifier, picker);
    }

    function makeCheckboxFieldEntry(classifier, identifier, label) {
        const textAndCheckbox = <FormControlLabel
            control={
                <Checkbox
                    key={"filters-entry-" + identifier}
                    label={label}
                    checked={filters[identifier]}
                    onChange={updateStateFromEventCheckedCallbackGenerator(identifier)}
                />
            }
            label={label}
        />;

        return makeFilterEntry(classifier, identifier, textAndCheckbox);
    }

    function makeNodeCountSliderFieldEntry(classifier, identifier, label) {
        const scale = [200, 400, 600, 800, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 4000, 5000, 10000];

        function calculateValue(value) {
            return scale[value];
        }

        function reverseValue(value) {
            for (let index = 0; index < scale.length; ++index) {
                if (value <= scale[index])
                    return index;
            }
            return scale.length - 1;
        }

        function valueLabelFormat(value) {
            return value.toLocaleString() + " nodes";
        }

        const slider = <div className={"filter-entry-slider"}>
            <span>{valueLabelFormat(filters.graph_size)}</span>
            <Slider
                key={"filters-entry-" + identifier}
                aria-label={label}
                value={reverseValue(filters.graph_size)}
                onChange={updateStateCallbackGenerator("graph_size", (event) => calculateValue(event.target.value))}
                marks
                min={0}
                max={scale.length - 1}
                step={1}
                scale={calculateValue}
                getAriaValueText={valueLabelFormat}
                valueLabelFormat={valueLabelFormat}
                valueLabelDisplay="auto"
                aria-labelledby="non-linear-slider"
            />
        </div>;

        return makeFilterEntry(classifier, identifier, slider);
    }

    let filterComponents = {
        mesh_heading: makeTextFieldEntry(filterCategories.Article,"mesh_heading", "MeSH"),
        author: makeTextFieldEntry(filterCategories.Author,"author", "Name"),
        first_author: makeCheckboxFieldEntry(
            filterCategories.Author,"first_author", "Restrict to First Authors"),
        last_author: makeCheckboxFieldEntry(
            filterCategories.Author,"last_author", "Restrict to Last Authors"),
        published_after: makeDateFieldEntry(filterCategories.Article,"published_after", "After"),
        published_before: makeDateFieldEntry(filterCategories.Article,"published_before", "Before"),
        journal: makeTextFieldEntry(filterCategories.Journal,"journal", "Journal"),
        article: makeTextFieldEntry(filterCategories.Article,"article", "Title"),
        graph_size: makeNodeCountSliderFieldEntry(filterCategories.Author, "graph_size", "Max Graph Size"),
        graph_type: makeFilterEntry(filterCategories.Graph,"graph_type", <Select
            value={filters.graph_type}
            onChange={updateStateCallbackGenerator("graph_type")}
            >
                <MenuItem value={"author"}>Author</MenuItem>
                <MenuItem value={"mesh"}>Journal</MenuItem>
        </Select>)

    }
    let selectedFilterComponents = activeFilters.map(f => filterComponents[f]);

    function deleteFilter(identifier) {
        dispatch(removeActiveFilter({filter: identifier}));
    }

    const handleFilterSelectionChange = (event) => {
        const {
            target: { value },
        } = event;
        let oldFilters = [...activeFilters]

        let removedFilters = oldFilters.filter(f => !value.includes(f))
        removedFilters.forEach(f => {
            dispatch(resetFilter({filter: f}))
        })

        dispatch(setActiveFilters({filters: value}))
    };

    return <div id="filters">
        <div id="add-filters">
            <Select multiple
                    value={activeFilters}
                    onChange={handleFilterSelectionChange}
                    displayEmpty={true}
                    renderValue={(selected) => {
                        if (selected.length === 0) {
                            return <Button variant="text" startIcon={<Add />} style={{padding: 0}}>
                                Add new filter
                            </Button>
                        } else {
                            return selected.length + " filter" + (selected.length !== 1 ? "s" : "");
                        }
                    }}
                    sx={{border: "white"}}
            >
                {Object.keys(filterNames).map(f =>
                    <MenuItem key={f} value={f}>
                        <Checkbox checked={activeFilters.indexOf(f) > -1} />
                        <ListItemText primary={filterNames[f]} />
                    </MenuItem>)}
            </Select>
        </div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            {selectedFilterComponents}
        </LocalizationProvider>
    </div>;
};

export default Filters;
