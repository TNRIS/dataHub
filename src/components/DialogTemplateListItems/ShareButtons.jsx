import React, { useEffect, useState } from "react";
import {
  EmailShareButton,
  EmailIcon,
  FacebookShareButton,
  FacebookIcon,
  RedditShareButton,
  RedditIcon,
  TwitterShareButton,
  TwitterIcon,
} from "react-share";
import { Box, Grid, Icon } from "@material-ui/core";

const CopyUrlButton = () => {
  const btnStyle = {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    border: "none",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    background: "grey",
    color: "white",
    fontSize: "18px",
    cursor: "pointer",
  };
  const copyUrl = () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.value = window.location.href;
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  };

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied === true) {
      const tOut = () =>
        setTimeout(() => {
          setCopied(false);
        }, 6000);
      tOut();
      clearTimeout(tOut);
    }
  }, [copied]);

  return (
    <Box
      onClick={() => {
        copyUrl();
        setCopied(true);
      }}
      tabIndex="0"
      style={btnStyle}
    >
      <Icon fontSize={"small"}>{copied ? "done" : "link"}</Icon>
    </Box>
  );
};

const ShareButtons = () => {
  const shareUrl = `https://data.tnris.org${window.location.pathname}`;
  const shareTitle = "Check out this TNRIS DataHub data!";
  const shareCombo = `${shareTitle} ${shareUrl}`;

  // react-share use of url for twitter doesn't like the brackets in a filtered
  // catalog url (despite twitter accepts the url when tweeted directly) so
  // we must handle this by swapping the url into the title parameter
  const tweetTitle =
    shareUrl.includes("[") || shareUrl.includes("]") ? shareCombo : shareTitle;

  return (
    <Grid container spacing={1} justify="center">
      <Grid item title="Twitter">
        <TwitterShareButton
          url={shareUrl}
          title={tweetTitle}
          className="share-button"
          hashtags={["TNRIS", "DataHolodeck"]}
        >
          <TwitterIcon size={26} round={true} />
        </TwitterShareButton>
      </Grid>
      <Grid item title="Facebook">
        <FacebookShareButton
          url={shareUrl}
          quote={shareTitle}
          className="share-button"
          hashtag="#TNRIS"
        >
          <FacebookIcon size={26} round={true} />
        </FacebookShareButton>
      </Grid>
      <Grid item title="Reddit">
        <RedditShareButton
          url={shareUrl}
          title={shareTitle}
          className="share-button"
        >
          <RedditIcon size={26} round={true} />
        </RedditShareButton>
      </Grid>
      <Grid item title="Email">
        <EmailShareButton
          url={shareUrl}
          subject={shareTitle}
          body={shareCombo}
          className="share-button"
        >
          <EmailIcon size={26} round={true} />
        </EmailShareButton>
      </Grid>
      <Grid item title="Link">
        <CopyUrlButton />
      </Grid>
    </Grid>
  );
};

export default ShareButtons;
