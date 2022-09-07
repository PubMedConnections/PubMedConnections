import React, { useEffect, useRef, useState } from 'react';
import {Add, Delete} from '@mui/icons-material'
import {Button, TextField, IconButton, Checkbox, Select, MenuItem, ListItemText, Slider} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import {useSelector, useDispatch} from 'react-redux'
import { setFilter, resetFilter, setActiveFilters, removeActiveFilter } from '../../store/slices/filterSlice'


let filterNames = {
    mesh_heading: "MESH Heading",
    author: "Author name",
    first_author: "First author",
    last_author: "Last author",
    published_before: "Published before",
    published_after: "Published after",
    journal: "Journal name",
    article: "Article name",
    graph_size: "Graph size",
    graph_type: "Graph type",
}

const Filters = () => {
    const filters = useSelector((state) => state.filters.filters);
    const dispatch = useDispatch();

    const activeFilters = useSelector((state) => state.filters.activeFilters)

    const filterCategories = {
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
            <div className="filter-entry">
                {inputField}
            </div>
            <div className="filter-delete">
                <IconButton aria-label="delete" onClick={() => deleteFilter(identifier)}>
                    <Delete />
                </IconButton>
            </div>
        </div>
    }

    function updateStateDateCallbackGenerator(identifier) {
        return (newValue) => {
            dispatch(setFilter({[identifier]: newValue.format("YYYY-MM-DD")}));
        }
    }

    function updateStateCallbackGenerator(identifier) {
        return (event) => {
            dispatch(setFilter({[identifier]: event.target.value}));
        }
    }

    function makeTextFieldEntry(classifier, identifier, label) {
        let textInput = <TextField
            label={label}
            value={filters[identifier]}
            onChange={updateStateCallbackGenerator(identifier)
            }
        />;

        return makeFilterEntry(classifier, identifier, textInput);
    }

    function makeDateFieldEntry(classifier,identifier, label) {
        let picker = <DatePicker
            label={label}
            value={filters[identifier]}
            onChange={updateStateDateCallbackGenerator(identifier)}
            renderInput={(params) => <TextField {...params} />}
            inputFormat="DD/MM/YYYY"
        />

        return makeFilterEntry(classifier, identifier, picker)
    }

    let filterComponents = {
        mesh_heading: makeTextFieldEntry(filterCategories.Article,"mesh_heading", "MESH"),
        author: makeTextFieldEntry(filterCategories.Author,"author", "Name"),
        first_author: makeTextFieldEntry(filterCategories.Author,"first_author", "First author"),
        last_author: makeTextFieldEntry(filterCategories.Author,"last_author", "Last author"),
        published_after: makeDateFieldEntry(filterCategories.Article,"published_after", "After"),
        published_before: makeDateFieldEntry(filterCategories.Article,"published_before", "Before"),
        journal: makeTextFieldEntry(filterCategories.Article,"journal", "Journal"),
        article: makeTextFieldEntry(filterCategories.Article,"article", "Title"),
        graph_size: makeFilterEntry(filterCategories.Author,"graph_size", <Slider
                aria-label="Temperature"
                defaultValue={filters.graph_size}
                onChange={updateStateCallbackGenerator("graph_size")}
                valueLabelDisplay="auto"
                step={10}
                marks
                min={0}
                max={100}
            />
            ),
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
