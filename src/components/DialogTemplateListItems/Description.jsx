import React from 'react';


export default class Description extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      wikiExtract: '',
      descriptClass: 'fade-text',
      showButton: true,
      expandText: 'more'
    }

    this.getWiki = this.getWiki.bind(this);
    this.setTextFade = this.setTextFade.bind(this);
    this.toggleText = this.toggleText.bind(this);
  }

  getWiki() {
    // fetch outside entiy description from wiki api
    // if template is outside entity, assign source_name prop to variable else empty string
    const wikiName = this.props.collection.template === 'outside-entity' ? this.props.collection.source_name : '';
    // format needed for no spaces in wikiArticleUrl; wiki api resolves spaces for wikiName
    const formattedWikiName = wikiName !== '' ? wikiName.split(' ').join('_') : '';
    // wikiUrl provides access to the 'extract' key value pair which is the intro paragraph of the wiki article
    // Unauthenticated CORS requests may be made from any origin by setting the "origin" request parameter to "*"
    const wikiUrl = `https://en.wikipedia.org/w/api.php?&origin=*&action=query&prop=extracts&format=json&redirects=1&exintro=&titles=${wikiName}`;
    // wiki attribution variables and html
    const wikiArticleUrl = `https://en.wikipedia.org/wiki/${formattedWikiName}`;
    const wikiLicense = 'https://creativecommons.org/licenses/by-sa/4.0/legalcode';
    const wikiAttribution = wikiName !== '' ? (
      `<p class="wiki-attribution">The extract above is provided by <a href=${wikiArticleUrl} target='_blank'>Wikipedia</a> under <a href=${wikiLicense} target='_blank'>Creative Commons Attribution CC-BY-SA 4.0</a></p>`
      ) : '';

    // assign 'this' to 'self' so state isn't confused with promise in fetch
    const self = this;

    if (wikiName !== '') {
      fetch(wikiUrl).then(function(response) {
        if (!response.ok) {
          throw new Error('Could not retrieve Wikipedia response.');
        }
        return response.json();
      })
      .then(function(data) {
        const extract = data.query.pages[Object.keys(data.query.pages)[0]].extract;
        if (extract) {
          const completeWiki = extract.concat(wikiAttribution);
          self.setState({wikiExtract: completeWiki});
        }
        self.setTextFade();
      })
    }
  }

  setTextFade() {
    const height = this.refs.descript.clientHeight;
    height < 300 ? this.setState({
      descriptClass:'',
      showButton: false
    }) : this.setState({
      descriptClass:'fade-text',
      showButton:true
    })
  }

  toggleText() {
    this.state.expandText === 'more' ? this.setState({
      expandText:'less',
      descriptClass:''
    }) : this.setState({
      expandText:'more',
      descriptClass:'fade-text'
    });
  }

  componentDidMount() {
    this.getWiki();
    this.setTextFade();
  }


  render() {

    const createMarkup = () => {
      return {__html: this.state.wikiExtract};
    }

    const createMarkupDesc = () => {
      return {__html: this.props.collection.description};
    }

    const showButton = this.state.showButton ?  (
      <div className="mdc-button mdc-button--raised expand" onClick={this.toggleText}>
        <i className="material-icons">{`expand_${this.state.expandText}`}</i>
        <p>Show {this.state.expandText}...</p>
      </div>) : '';


    return (
      <div className="template-content-div">
        <div className='mdc-typography--headline5 template-content-div-header'>
          Description
        </div>
        <div ref="descript" className={this.state.descriptClass}>
          <div dangerouslySetInnerHTML={createMarkup()} />
          <p dangerouslySetInnerHTML={createMarkupDesc()} ></p>
        </div>
        {showButton}
      </div>
    )
  }
}
