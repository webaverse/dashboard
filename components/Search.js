import React from 'react';
import SearchIcon from '@material-ui/icons/Search';

export default () => {
  const [searchInput, setSearchInput] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  return (
    <div className="searchContainer">
      <div className="searchInputContainer">
        <SearchIcon className="searchIcon" />
        <input className="searchInput" placeholder="Search avatars, items, and accounts" type="text" onChange={setSearchInput} value={searchInput} />
        {searchResults && searchResults.length > 0 && searchResults.map(result => {
          return (
            <div>A result</div>
          )
        })}
      </div>
    </div>
  )
}
