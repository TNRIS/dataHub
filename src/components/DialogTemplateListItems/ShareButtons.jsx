import React from 'react';
import {
  EmailShareButton,
  EmailIcon,
  FacebookShareButton,
  FacebookIcon,
  RedditShareButton,
  RedditIcon,
  TwitterShareButton,
  TwitterIcon
} from 'react-share';

export default class ShareButtons extends React.Component {
  _isMounted = false;

  constructor (props) {
    super(props);
    this.state = {
      urlCopied: false
    };
    this.copyUrl = this.copyUrl.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this.setState({urlCopied: false});
    this._isMounted = false;
  }

  copyUrl () {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.value = window.location.href;
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    this.setState({urlCopied: true});
    setTimeout(() => {
      if (this._isMounted) {
        this.setState({urlCopied: false});
      }
    }, 10000);
  }

  render() {
    const shareUrl = `https://data.tnris.org${window.location.pathname}`;
    const shareTitle = "Check out this TNRIS DataHub data!";
    const shareCombo = `${shareTitle} ${shareUrl}`;

    // react-share use of url for twitter doesn't like the brackets in a filtered
    // catalog url (despite twitter accepts the url when tweeted directly) so
    // we must handle this by swapping the url into the title parameter
    const tweetTitle = shareUrl.includes("[") || shareUrl.includes("]") ?
                       shareCombo : shareTitle;

    const linkIcon = this.state.urlCopied ? 'done' : 'link';

    return (
      <div className="template-content-div">
        <div className="share-bar">
          <div title="Twitter">
            <TwitterShareButton
              url={shareUrl}
              title={tweetTitle}
              className="share-button"
              hashtags={["TNRIS", "DataHolodeck"]}
            >
              <TwitterIcon size={26} round={true} />
            </TwitterShareButton>
          </div>
          <div title="Facebook">
            <FacebookShareButton
              url={shareUrl}
              quote={shareTitle}
              className="share-button"
              hashtag="#TNRIS"
            >
              <FacebookIcon size={26} round={true} />
            </FacebookShareButton>
          </div>
          <div title="Reddit">
            <RedditShareButton
              url={shareUrl}
              title={shareTitle}
              className="share-button"
            >
              <RedditIcon size={26} round={true} />
            </RedditShareButton>
          </div>
          <div title="Email">
            <EmailShareButton
              url={shareUrl}
              subject={shareTitle}
              body={shareCombo}
              className="share-button"
            >
              <EmailIcon size={26} round={true} />
            </EmailShareButton>
          </div>
          <button title="Copy Link" className="share-button share-copy-link"
               onClick={() => this.copyUrl()} tabIndex="0">
            <i className="material-icons">{linkIcon}</i>
          </button>
        </div>
      </div>
    )
  }
}
