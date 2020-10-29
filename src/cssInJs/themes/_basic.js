import { createMuiTheme } from "@material-ui/core/styles";

const BasicTheme = createMuiTheme({
    overrides: {
      root: {
        "&$checked": {
          color: "#1e8dc1",
        },
      },
      MuiListSubheader: {
        root: {
          lineHeight: "1rem",
        },
      },
      MuiListItem: {
        root: {
          cursor: "pointer",
          height: 40,
          '&:hover': {
            background: 'rgba(0,0,0,0.08)'
          },
          '&$selected, &$selected:hover': {
            color: '#1E8DC1'
          },
          textTransform: 'capitalize',
        },
      }
    },
    palette: {
      primary: {
        light: "#bbdefb",
        main: "#1E8DC1",
        dark: "#156287",
        contrastText: "#fff",
      },
      secondary: {
        light: "#bbdefb",
        main: "#1E8DC1",
        dark: "#156287",
        contrastText: "#fff",
      },
    },
  });

export default BasicTheme