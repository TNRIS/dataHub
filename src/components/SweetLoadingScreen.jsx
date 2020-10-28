import React from 'react';
import { Box } from '@material-ui/core';
import { GridLoader } from "react-spinners";

const SweetLoadingScreen = () => {
    return (
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        className=""
      >
        <GridLoader sizeUnit={"px"} size={25} color={"#1E8DC1"} loading={true} />
      </Box>
    );
  };

export default SweetLoadingScreen