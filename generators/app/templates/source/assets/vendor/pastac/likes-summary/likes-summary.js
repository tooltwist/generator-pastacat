'use strict';

angular.module('pastac-likes', [])

.component('likesSummary', {
  //scope: {},
  //templateUrl: 'heroDetail.html',
  controller: PastacLikesSummaryController,
  controllerAs: 'ctrl',
  bindings: {
    // Bind parameters from the HTML element that invokes this
    heading: '@',
    anchor: '='
  },
  templateUrl: 'assets/vendor/pastac/likes-summary/likes-summary.html'
});





function PastacLikesSummaryController($scope) {
  var ctrl = this;
}
