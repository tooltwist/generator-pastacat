'use strict';

angular.module('pastac-activity', [])

.component('activitySummary', {
  //scope: {},
  //templateUrl: 'heroDetail.html',
  controller: PastacActivitySummaryController,
  controllerAs: 'ctrl',
  bindings: {
    // Bind parameters from the HTML element that invokes this
    heading: '@',
    onDone: '&'
  },
  //template: '<input ng-model="ctrl.hero.name"/><br><span>Name: {{ctrl.hero.name}}</span><br/><button ng-click=“ctrl.onOk()">ok</button>'

  // Pug seems to install this in the wrong directory
  templateUrl: 'assets/vendor/pastac/activity-summary/activity-summary.html'
  //templateUrl: 'pastacat/heroDetail/heroDetail.html'

  // ztemplate: `
  //   <input ng-model="ctrl.hero.name"/>
  //   <br/>
  //   <span>Name: {{ctrl.hero.name}}</span>
  //   <br/>
  //   <button ng-click="ctrl.callOnDone()">ok</button>
  // `
});





function PastacActivitySummaryController($scope) {
  //alert('HeroDetailController()')
  var ctrl = this;


  this.hero = {
    name: 'Donkey'
  };


  this.callOnDone = function() {
    console.log('callOnDone() in Controller')
    ctrl.onDone({ val: this.hero.name });
  };
}
