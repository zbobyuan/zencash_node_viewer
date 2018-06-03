module.exports = function(hbs) {
  hbs.registerHelper('overview', function(x, overview, downPercent) {
    if (overview === 'up') {
      return `<span class="btn-small green">${x.__('Up')}</span>`;
    } else if (overview === 'warn') {
      return `<span class="btn-small warn">${downPercent}%${x.__('Down')}</span>`;
    } else {
      return `<span class="btn-small red">${downPercent}%${x.__('Down')}</span>`;
    }
  });

  hbs.registerHelper('node_overview', function(status) {
    if (status === 'up') {
      return 'green';
    } else {
      return 'red';
    }
  });
};
