import React, { Component } from 'react';

class ThemeChooser extends Component {
  constructor(props) {
      super(props);
      this.setColorTheme = this.setColorTheme.bind(this);
  }

  setColorTheme(theme) {
    this.props.setColorTheme(theme);
  }

  render() {
    return (
      <div className="theme-chooser-component">
        {this.props.themeOptions.map(theme => {
          const label = theme.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
          const themeClass = `theme-chooser-option ${theme}-app-theme`;
          const checked = this.props.theme === theme ? <i className='material-icons'>done</i> : '';
          return <button key={theme}
                      onClick={() => this.setColorTheme(theme)}
                      className={themeClass}
                      title={label}>{checked}</button>
        })}
      </div>
    )
  }
}

export default ThemeChooser
