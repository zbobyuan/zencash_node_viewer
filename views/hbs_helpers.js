module.exports = function(hbs) {
  hbs.registerHelper('overview', function(overview, downPercent) {
    if (overview === 'up') {
      return '<span class="btn-small green">正常</span>';
    } else if (overview === 'warn') {
      return `<span class="btn-small warn">${downPercent}%停机</span>`;
    } else {
      return `<span class="btn-small red">${downPercent}%停机</span>`;
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
