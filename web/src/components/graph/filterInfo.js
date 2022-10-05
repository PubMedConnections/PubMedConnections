
const filterCategories = {
    Journal: {
        name: "Journal",
        colour: "rgba(169, 103, 224, 0.6)"
    },
    Author: {
        name: "Author",
        colour: "rgba(234, 47, 30, 0.6)"
    },
    Article: {
        name: "Article",
        colour: "rgba(149, 178, 249, 0.6)"
    },
    Graph: {
        name: "Graph",
        colour: "rgba(0, 0, 0, 0.4)"
    }
}

const availableFilters = [
    {
        key: "list_subheader_1",
        name: "Article:",
        category: filterCategories.Article
    },
    {
        key: "mesh_heading",
        name: "MeSH Heading",
        form_name: "MeSH",
        category: filterCategories.Article,
        help: "The name (or part of the name) of the Medical Subject Heading"
    },
    {
        key: "article",
        name: "Article Title",
        form_name: "Article",
        category: filterCategories.Article,
        help: "The title of the article that was published."
    },
    {
        key: "published_before",
        name: "Published Before",
        form_name: "Before",
        category: filterCategories.Article,
        help: "The date before which the articles were published."
    },
    {
        key: "published_after",
        name: "Published After",
        form_name: "After",
        category: filterCategories.Article,
        help: "The date after which the articles were published."
    },
    {
        key: "list_subheader_2",
        name: "Journal:",
        category: filterCategories.Article
    },
    {
        key: "journal",
        name: "Journal Name",
        form_name: "Journal",
        category: filterCategories.Journal,
        help: "The name of the journal that the article was published in."
    },
    {
        key: "list_subheader_3",
        name: "Author:",
        category: filterCategories.Article
    },
    {
        key: "author",
        name: "Author Name",
        form_name: "Author Name",
        category: filterCategories.Author,
        help: "The term used to search by the author's name."
    },
    {
        key: "affiliation",
        name: "Author Affiliation",
        form_name: "Affiliation",
        category: filterCategories.Author,
        help: "The university that the article's author was associated with at the time of publication (if this data is available)."
    },
    {
        key: "first_author",
        name: "Is First Author",
        form_name: "Restrict to First Authors",
        category: filterCategories.Author,
        help: "Whether the author search term should search for articles where they are the first listed author."
    },
    {
        key: "last_author",
        name: "Is Last Author",
        form_name: "Restrict to Last Authors",
        category: filterCategories.Author,
        help: "Whether the author search term should search for articles where they are the last listed author."
    },
    {
        key: "list_subheader_4",
        name: "Graph:",
        category: filterCategories.Article
    },
    {
        key: "graph_size",
        name: "Max Graph Size",
        form_name: "Max Graph Size",
        category: filterCategories.Graph,
        help: "The maximum number of allowable nodes that can be returned by the filters. " +
            "If the filters return too many nodes, then an error will be returned."
    },
    {
        key: "graph_type",
        name: "Graph Type",
        form_name: "Graph Type",
        category: filterCategories.Graph,
        help: "How the database will be searched and the results will be returned."
    },
    {
        key: "graph_node_size",
        name: "Graph Node Size",
        form_name: "Node Size Source",
        category: filterCategories.Graph,
        help: "The metric that determines the size of each node when displayed."
    },
    {
        key: "graph_node_colour",
        name: "Graph Node Colour",
        form_name: "Node Colour Source",
        category: filterCategories.Graph,
        help: "The metric that determines the colour of each node when displayed. The brighter the colour, the higher the value."
    },
    {
        key: "graph_edge_size",
        name: "Graph Edge Width",
        form_name: "Edge Width Source",
        category: filterCategories.Graph,
        help: "The metric that determines the width of each edge (a line between two nodes) when displayed."
    },
    {
        key: "graph_minimum_edges",
        name: "Graph Node Minimum Edges",
        form_name: "Minimum Edges",
        category: filterCategories.Graph,
        help: "The minimum number of edges that each node in the graph should have."
    },
];

const availableFiltersMap = {};
for (let index = 0; index < availableFilters.length; ++index) {
    const filterSpec = availableFilters[index];
    availableFiltersMap[filterSpec.key] = filterSpec;
}

export {availableFilters, availableFiltersMap, filterCategories};
