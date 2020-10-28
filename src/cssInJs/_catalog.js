import { makeStyles } from "@material-ui/core/styles";

const useCatalogStyles = makeStyles((theme) => ({
  openDrawer: {
    width: "calc(100% - 280px)",
  },
  closedDrawer: {
    width: "100%",
  },
}));

export default useCatalogStyles;
