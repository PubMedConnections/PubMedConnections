import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    filters: {
        mesh_heading: "",
        author: "",
        first_author: "",
        last_author: "",
        published_before: "",
        published_after: "",
        journal: "",
        article: "",
        graph_size: 100,
        graph_type: "author",
    },
    activeFilters: []
};

export const filterSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setFilter: (state, action) => {
            state.filters = { ...state.filters, ...action.payload }
            return state;
        },
        resetFilter: (state, action) => {
            state.filters = { ...state.filters, [action.payload.filter]: initialState.filters[action.payload.filter] };
            return state;
        },
        setActiveFilters: (state, action) => {
            state.activeFilters = action.payload.filters;
            return state;
        },
        removeActiveFilter: (state, action) => {
            let index = state.activeFilters.indexOf(action.payload.filter);
            if (index > -1) {
                state.activeFilters.splice(index, 1)
            }
            return state;
        },
    },
});

export const { setFilter, resetFilter, setActiveFilters, removeActiveFilter } = filterSlice.actions;

export default filterSlice.reducer;
