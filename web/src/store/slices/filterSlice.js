import { createSlice } from '@reduxjs/toolkit';

const resetState = {
    filters: {
        mesh_heading: "",
        author: "",
        affiliation: "",
        first_author: true,
        last_author: true,
        published_before: "",
        published_after: "",
        journal: "",
        article: "",
        graph_size: 1000,
        graph_type: "author",
        graph_node_size: "matched_nodes",
        graph_node_colour: "matched_nodes",
        graph_edge_size: "coauthored_articles"
    },
    activeFilters: [],
    resultsReturned: false
}

const initialState = {
    filters: {
        mesh_heading: "Brain Stem Neoplasms",
        author: "J ",
        graph_node_size: "edge_count"
    },
    activeFilters: ["mesh_heading", "author", "graph_node_size"],
    resultsReturned: false
};

function copyAndRemoveElement(obj, key) {
    const newObj = { ...obj };
    delete newObj[key];
    return newObj;
}

export const filterSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setFilter: (state, action) => {
            state.filters = { ...state.filters, ...action.payload }
            return state;
        },
        resetFilter: (state, action) => {
            state.filters = copyAndRemoveElement(state.filters, action.payload.filter);
            return state;
        },
        setActiveFilters: (state, action) => {
            state.activeFilters = action.payload.filters;
            // Reset the value of any new filters, and remove any old filters.
            const newFilters = {};
            for (let index = 0; index < action.payload.filters.length; ++index) {
                const filter = action.payload.filters[index];
                newFilters[filter] = (state.filters[filter] !== undefined ? state : resetState).filters[filter];
            }
            state.filters = newFilters;
            return state;
        },
        removeActiveFilter: (state, action) => {
            const index = state.activeFilters.indexOf(action.payload.filter);
            if (index > -1) {
                state.activeFilters.splice(index, 1)
                state.filters = copyAndRemoveElement(state.filters, action.payload.filter);
            }
            return state;
        },
        setFilters: (state, action) => {
            state.filters = { ...action.payload };
            state.activeFilters = [];
            for (let filter in action.payload) {
                if (action.payload.hasOwnProperty(filter)) {
                    state.activeFilters.push(filter);
                }
            }
            return state;
        },
        setResultsReturned: (state, action) => {
            state.resultsReturned = action.payload;
            return state;
        },
        resetAllFilters: (state, action) => {
            return initialState;
        }
    },
});

export const {
    setFilter, resetFilter, setActiveFilters, removeActiveFilter,
    setFilters, setResultsReturned, resetAllFilters
} = filterSlice.actions;

export default filterSlice.reducer;
