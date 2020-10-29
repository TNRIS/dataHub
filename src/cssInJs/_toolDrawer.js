import { makeStyles } from "@material-ui/core/styles";

const drawerWidth = 256;

const useToolDrawerStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    lineHeight: 1,
  },
  drawerContent: {
    padding: theme.spacing(1),
  },
  drawerPaper: {
    width: drawerWidth,
    zIndex: 999,
    height: 'calc(100vh - 106px)',
    top: 106,
    padding: '0px 8px'
  },
  noScroll: {
    position: "fixed",
    background: "#fff",
  },
  drawerSection: {
    marginBottom: theme.spacing(1)
  },
}));

export default useToolDrawerStyles;
