'use strict';

var pastacCrowdhoundPostsSequence = 1;

angular.module('pastac-crowdhound-posts', [])

.component('pastacCrowdhoundPosts', {
  //scope: {},
  //templateUrl: 'heroDetail.html',
  controller: PastacCrowdhoundPostsController,
  controllerAs: 'ctrl',
  bindings: {
    // Bind parameters from the HTML element that invokes this
    anchor: '@',
    onDone: '&'
  },

  // Pug seems to install this in the wrong directory
  templateUrl: 'assets/vendor/pastac/pastac-crowdhound-posts/pastac-crowdhound-posts.html'
});





function PastacCrowdhoundPostsController($scope, $timeout, Upload) {
  //alert('HeroDetailController()')
  var ctrl = this;

  ctrl.postsDivId = 'pastacCrowdhoundPostsDiv' + pastacCrowdhoundPostsSequence++;

  //console.log('initializing PastacCrowdhoundPostsController()');

  ctrl.$onInit = function() {
    //alert('init();')
    console.log('$onInit()', ctrl.anchor);


    initCrowdhound(function(err) {
      if (err) return;//ZZZZZ
      console.log('initCrowdhound returned');
      loadPosts(ctrl.anchor, ctrl.postsDivId, function(err) {
        console.log('loadPosts returned');
        //alert('done');
      });
    });
  };



  /*
   *  File uploading stuff.
   *  See https://gist.github.com/philcal/cd169540822af5f3a135c29ab6bf26ad
   *  See https://github.com/danialfarid/ng-file-upload
   */
  ctrl.uploadPost = function(message, file) {
    console.log('upload()');

    var url = 'http://' + CROWDHOUND_HOST + ':' + CROWDHOUND_PORT + '/api/2.0/' + CROWDHOUND_APIKEY + '/element?authenticationToken=XXXXXXXXXXXXXXXXXXXXXXXX';

    // Adjust these anchors as required
    var data = {
      "type" : "post",
      "rootId" : ctrl.anchor,
      "parentId" : ctrl.anchor,
      "description" : ctrl.message,
      "deleted" : 0
    };

    console.log('url is ' + url);
    console.log('data is ', data);
    console.log('file is ', file);


    // See if we have a photo or video to load.
    var activeTabId = $(".composer .tab-pane.active").attr('id');
    if (file && activeTabId === 'composer-tab-photo-video') {

      // Have an image being loaded
      ctrl.filesize = accounting.formatNumber(file.size);
      ctrl.filename = file.name;
      data.file = file;
      Upload.upload({
          //url: 'http://localhost:4000/junkphotos',
          url: url,
          data: data
      }).then(function (resp) {
        console.log('resp: ', resp);
          console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);

          // Reload the posts
          loadPosts(ctrl.anchor, ctrl.postsDivId, function(err) {
            if (err) {
              console.log('Error reloading posts: ', err);
              return;
            }
          });

          // Reset the UI
          $timeout(function(){
            ctrl.message = '';
            ctrl.file = null;
            ctrl.progressPercentage = null; // hide the progress bar again
            $('#composer-status-button').tab('show');
          }, 1);

      }, function (resp) {
          console.log('Error status: ' + resp.status);
      }, function (evt) {
        console.log('evt=', evt);
        // Show the image loading progress
        var perc = parseInt(100.0 * evt.loaded / evt.total);
        console.log('progress: ' + perc + '% ' + evt.config.data.file.name);
        $timeout(function(){
          ctrl.progressPercentage = perc;
        }, 1);
      });
    } else {

      // No image being loaded
      $.ajax({
          type : "POST",
          url : url,
          data : data,
          success : function(messageResponse) {
              if (messageResponse
                  && messageResponse.status
                  && messageResponse.status === "ok") {

                  // Reload the posts
                  loadPosts(ctrl.anchor, ctrl.postsDivId, function(err) {
                    if (err) {
                      console.log('Error reloading posts: ', err);
                      return;
                    }
                  });

                  //clear textarea
                  $timeout(function(){
                    ctrl.message = '';
                    ctrl.file = null;
                    ctrl.progressPercentage = null; // hide the progress bar again
                    $('#composer-status-button').tab('show');
                  }, 1);

              } else {
                  //Alerts.showStandardError(".textarea");
              }
          },

          error : function(qXHR, textStatus, errorThrown) {
              console.log('An error occurred while posting.\n  status: ' + qXHR.status + "\n  responseText: ", qXHR.responseText);
              //Alerts.showStandardError(".textarea");
          }
      });

    }

  };

  ctrl.cancelPost = function() {
    ctrl.file = null;
    ctrl.progressPercentage = null;
    $('#composer-status-button').tab('show');
  }

  ctrl.haveMessage = function() {
    //console.log('message is ', ctrl.message);
    //console.log('file is ', ctrl.file);
    return (
      ctrl.file
      || (ctrl.message && ctrl.message != '')
    );
  }

  ctrl.showDropArea = function() {
    if (ctrl.file) {
      return false;
    }
    return true;
  }

  ctrl.showImage = function() {
    if (ctrl.file) {
      return true;
    }
    return false;
  }

  ctrl.showProgressBar = function() {
    return (
      ctrl.file
      && ctrl.progressPercentage
      && ctrl.progressPercentage < 100
    );
  }

  ctrl.showProcessing = function() {
    return (
      ctrl.file
      && ctrl.progressPercentage
      && ctrl.progressPercentage == 100
    );
  }

  ctrl.getPercentage = function() {
    return ctrl.progressPercentage;
  }

}


  /*
   *  Initialise Crowdhound for this page.
   */
  function initCrowdhound(callback/*(err)*/) {
    //alert('Seller.initCrowdhound()');

    var curiaConfig = {
      serverUrl : '//' + CROWDHOUND_HOST + ':' + CROWDHOUND_PORT,
      apiVersion : CROWDHOUND_VERSION,
      tenantId : CROWDHOUND_TENANT,
      debug: false,

      authenticationToken: authservice.getUserAccessToken(),

      urlive : false,
      flat: false,
      textonly: false,
      cookers: {
        //cook_post : TimelinePost.cookPost,
        //cook_likes : TimelinePost.cookLikes,
        cook_cloudinary : Seller.cookCloudinary,
        //cook_avatars : cookAvatars
      },
      themes : {
        "timeline": {
          "supplier-page_0" : "#timelineList",
          //"wrapper" : "#timelineList",
          "post_0" : "#timelinePost",
          "comment_0" : "#timelinePostComment"
        }

      }
    };

    // initialize Crowdhound
    CrowdHound.init(curiaConfig, function(err) {
      if (callback) return callback(err);
    });
  }//- initCrowdhound()


  /*
   *  Load our posts.
   */
  function loadPosts(anchor, htmlElementId, callback) {
    //alert('loadPosts(' + anchor + ', ' + htmlElementId + ')');
    // if (callback) return callback(null);

    // Select the posts
    CrowdHound.select({
      elementId: anchor,
      type: 'supplier-page',
      withChildren: true
    }, function(err, selection) {
      if (err) return callback(err);
      //console.log('selected:', selection);


      if (selection.elements.length > 0) {

        // Prepare the data
        CrowdHound.cook({ }, selection, function(err, selection) {
          if (err) return callback(err);
          //console.log('cooked:', selection);

          // Now display the data
          CrowdHound.render({
            target: '#' + htmlElementId,
            theme: 'timeline'
          }, selection, function(err, selection) {
            if (err) return callback(err);
            return callback(null); // All ok
          });// render
        });// cook
      } // length > 0
    });// select
  }
