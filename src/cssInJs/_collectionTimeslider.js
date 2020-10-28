import { makeStyles } from "@material-ui/core/styles";

const useCollectionTimesliderStyles = makeStyles((theme) => ({
    root: {
      color: theme.palette.primary.main,
      height: 8,
    },
    thumb: {
      height: 16,
      width: 16,
      backgroundColor: theme.palette.primary.light,
      border: '1px solid ' + theme.palette.primary.dark,
      boxShadow: '#ebebeb 0 2px 2px',
      '&:focus, &:hover, &$active': {
        boxShadow: theme.palette.primary.light + ' 0 2px 3px 1px',
      },
      top: 13,
      '& .bar': {
        // display: inline-block !important;
        height: 6,
        width: 1,
        backgroundColor: theme.palette.primary.main,
        marginLeft: 1,
        marginRight: 1,
      },
    },
    active: {},
    track: {
      height: 8,
    },
    rail: {
      color: theme.palette.primary.light,
      opacity: 1,
      height: 4,
    },
  }));

  export default useCollectionTimesliderStyles