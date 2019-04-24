import React from 'react';
import Downshift from 'downshift';
import { MDCTextField } from '@material/textfield';
import { matchPath } from 'react-router-dom';

export default class CollectionSearcher extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchFieldValue: ''
    }

    this.handleClearSearch = this.handleClearSearch.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.updateUrl = this.updateUrl.bind(this);
  }

  componentDidMount() {
    this.searchField = new MDCTextField(document.querySelector('.search-component'));
    this.searchFieldInput = document.querySelector('.mdc-text-field__input');
    // on component mount, check the URl to apply any necessary filters
    // first, check if url has a 'filters' parameter
    const match = matchPath(
        this.props.location.pathname,
        { path: '/catalog/:filters' }
      );
    const filters = match ? match.params.filters : null;
    if (filters) {
      try {
        const allFilters = JSON.parse(decodeURIComponent(filters));
        // second, check if filters param includes search key
        if (Object.keys(allFilters).includes('search')) {
          // third, apply search text and then populate the input box
          this.props.setCollectionSearchQuery(allFilters.search);
          this.props.setCollectionSearchSuggestionsQuery(allFilters.search);
          this.setState({searchFieldValue: allFilters.search});
        }
      } catch (e) {
        console.log(e);
        if (window.location.pathname !== '/404') { this.props.url404(); }
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.collectionSearchQuery !== this.props.collectionSearchQuery){
      this.setState({searchFieldValue: this.props.collectionSearchQuery});
    }
  }

  // clears the text from the search input, resets the local state, and resets
  // the collectionSearchSuggestionsQuery to empty in the app's state
  handleClearSearch() {
    try {
      if (this.props.view === 'catalog') {
        this.handleSearch('');
      }
      this.props.setCollectionSearchSuggestionsQuery('');
      this.setState({searchFieldValue: ''});
      this.searchFieldInput.focus();
    } catch(e) {
      console.log(e);
    }
  }

  // sets the local state with the input value, shows or hides the suggestionList,
  // and sets the collectionSearchsuggestionsQuery to retrieve search suggestions
  // from the search index
  handleInputChange(event) {
    try {
      if (event.target.value) {
        this.setState({searchFieldValue: event.target.value});
        this.props.setCollectionSearchSuggestionsQuery(event.target.value);
      } else {
        this.setState({searchFieldValue: ''});
        this.props.setCollectionSearchSuggestionsQuery('');
      }
    } catch(e) {
      console.log(e);
    }
  }

  // handles firing the search if the user presses enter or blurs the input if
  // they press escape while in the search textField
  handleKeyDown(event) {
    try {
      // we check if the user pressed the enter or escape key
      if (event.keyCode === 13) { // they pressed enter, so fire the search
        event.preventDefault(); // ensure it is only our code that is run
        this.handleSearch(event.target.value);
        this.searchFieldInput.blur();
        if (event.target.value === '666') {
          this.props.setColorTheme('satan');
        }
      }
      else if (event.keyCode === 27) { // they pressed escape, so drop focus
        this.searchFieldInput.blur();
      }
    } catch(e) {
      console.log(e);
    }
  }

  // handles firing search
  handleSearch(value) {
    try {
      this.props.setCollectionSearchQuery(value);
      this.updateUrl(value);
      if (this.props.selectedCollection) {
        this.props.clearSelectedCollection();
      }
    } catch(e) {
      console.log(e);
    }
  }

  // handles firing the search if the user selects an item from the suggestionList
  // or presses enter while a member of the suggestionList is highlighted
  handleStateChange(changes, stateAndHelpers) {
    this.setState({previousChanges: changes});
    // we need to check the changes type to determine what the user is doing.
    // Downshift has a tricky feature where they use a string for the type in dev
    // and an integer in prod, so we have to check for either situation.
    if (changes.type === '__autocomplete_keydown_enter__' || changes.type === 6) {
      // if they choose an item with the arrow keys and not the mouse pointer
      // then press enter, otherwise the keydown method from above is fired
      if (this.state.previousChanges.type === '__autocomplete_keydown_arrow_down__' ||
        this.state.previousChanges.type === 4) {
        this.handleSearch(stateAndHelpers.selectedItem);
        this.searchFieldInput.blur();
      }
    } else if (changes.type === '__autocomplete_click_item__' || changes.type === 9) {
      this.handleSearch(stateAndHelpers.selectedItem);
      this.searchFieldInput.blur();
    }
  }

  // updates the url to reflect the current state of the search input textField
  updateUrl(searchFieldValue) {
    // update URL to reflect new search change
    const prevFilter = this.props.history.location.pathname.includes('/catalog/') ?
      JSON.parse(decodeURIComponent(this.props.history.location.pathname.replace('/catalog/', '')))
      : {};
    const filterObj = {...prevFilter, search: searchFieldValue};
    // if search is empty, remove from the url
    if (filterObj['search'].length === 0) {
      delete filterObj['search'];
    }
    const filterString = JSON.stringify(filterObj);
    // if empty filter settings, use the base home url instead of the filter url
    Object.keys(filterObj).length === 0 ? this.props.setUrl('/') :
      this.props.setUrl('/catalog/' + encodeURIComponent(filterString));
    // log filter change in store
    Object.keys(filterObj).length === 0 ? this.props.logFilterChange('/') :
      this.props.logFilterChange('/catalog/' + encodeURIComponent(filterString));
    // search was fired so catalog grid is returning. set view to be catalog
    // to stay in sync
    this.props.setViewCatalog();
}

  render() {
    return (
      <Downshift
        onStateChange={(changes, stateAndHelpers) => this.handleStateChange(changes, stateAndHelpers)}
        itemToString={item => (item ? item.value : '')}
      >
        {({
          getInputProps,
          getItemProps,
          getMenuProps,
          isOpen,
          inputValue,
          highlightedIndex,
          selectedItem,
        }) => (
          <div
            id="searchparent"
            className={`search-component mdc-text-field mdc-text-field--fullwidth
              mdc-text-field--with-leading-icon mdc-text-field--with-trailing-icon mdc-menu-surface--anchor`}>
            <i id="search-icon" className="material-icons mdc-text-field__icon">search</i>
            <input
              className="search-input downshift-input mdc-text-field__input"
              tabIndex="3"
              {...getInputProps({
                value: this.state.searchFieldValue,
                placeholder: "Search",
                onChange: this.handleInputChange,
                onKeyDown: event => this.handleKeyDown(event)
            })}>
            </input>
            {this.props.collectionSearchSuggestionsQuery ?
              <button
                id='clear-icon'
                className="clear-button mdc-top-app-bar__action-item material-icons mdc-text-field__icon"
                tabIndex="3"
                onClick={this.handleClearSearch}>
                clear
              </button> : ''}
              {isOpen && this.props.collectionSearchSuggestions !== undefined &&
                this.props.collectionSearchSuggestions.length !== 0 ?
                <ul
                  className="suggestion-list downshift-dropdown mdc-list"
                  {...getMenuProps()}>
                  {this.props.collectionSearchSuggestions.slice(0,5).map((item, index) =>
                    <li
                      className="dropdown-item mdc-list-item"
                      {...getItemProps({
                        item,
                        index,
                        key: index
                      })}
                            style={{
                              backgroundColor: highlightedIndex === index ? 'lightgray' : 'white',
                            }}>
                      {item}
                    </li>
                  )}
                </ul> : null}
          </div>
        )}
      </Downshift>
    );
  }
}
