
var Seller = (function() {
  var _supplierId;
  //var _app = null;
  var _$scope = null;
  var _$timeout = null;




  return {

    init: function(supplierId, htmlElementSelector, callback) {
      //alert('Seller.init()');



      Seller.initAngular(function(err, $scope, $timeout) {
        if (err) return callback(err);

        _supplierId = supplierId;
        _$scope = $scope;
        _$timeout = $timeout;


        $scope.supplierId = supplierId;
        $scope.supplier = null;

        /*
         *  Load the supplier.
         */
        Seller.loadSupplier(supplierId, function(supplier) {
          _$timeout(function() {
            _$scope.supplier = supplier;
          }, 10);
        });

        /*
         *  Load the posts.
         */
        // Seller.initCrowdhound(function(err) {
        //   if (err) {
        //     console.log('Error initializing Crowdhound: ', err);
        //     return;
        //   }
        //
        //   Seller.loadPosts(supplierId, htmlElementSelector, function(err) {
        //     if (err) {
        //       console.log('Error loading posts: ', err);
        //       return;
        //     }
        //   });
        // });

      });

    },//- init()


    /************************************************************
     *
     *    Angular code.
     */
    initAngular: function(callback/*(err, $scope, $timeout)*/) {
      //alert('Seller.initAngular()')
      app = angular.module('myApp', [
        'ngSanitize',
        'ngFileUpload',
        'pastac-reviews',
        'pastac-activity',
        'pastac-photos',
        'pastac-likes',
        'pastac-crowdhound-posts'
      ]);

      // Initialize teaservice as an angular directive
      /*
      teaservice.init({
        host: TEASERVICE_HOST,
        port: TEASERVICE_PORT,
        accessToken: TEASERVICE_ACCESS_TOKEN
      });
      */
      //app.controller('myCtrl', function($scope, teaService) {
      app.controller('myCtrl', function($scope, $timeout, Upload) {

        // Get the details of suppliers from TEA.
        //var categoryId = '1';
        var options = {
          storeId: 6,
          supplierId: supplierId
          /*categoryId: categoryId,
          needPricing: true,
          needImages: true*/
          //needCategories: true
        };
        /*
        teaService.getSupplier(options).then(function(suppliers){
          console.log('BACK FROM getSupplier', suppliers);

          // Check we found the supplier
          if (suppliers==null || suppliers.length < 1) {
            alert('Unknown supplier ' + supplierId);
            window.location.href = 'index.html';
            return;
          }
          $scope.supplier = suppliers[0];
        });
        */

        /*
         *  File uploading stuff.
         *  See https://gist.github.com/philcal/cd169540822af5f3a135c29ab6bf26ad
         *  See https://github.com/danialfarid/ng-file-upload
         */
        $scope.uploadPost = function(message, file) {
          console.log('upload()');

          var url = 'http://' + CROWDHOUND_HOST + ':' + CROWDHOUND_PORT + '/api/2.0/' + CROWDHOUND_APIKEY + '/element?authenticationToken=XXXXXXXXXXXXXXXXXXXXXXXX';

          // Adjust these anchors as required
          var anchor = '$supplier-page-' + _supplierId;
          var data = {
            "type" : "post",
            "rootId" : anchor,
            "parentId" : anchor,
            "description" : message,
            "deleted" : 0
          };

          console.log('url is ' + url);
          console.log('data is ', data);
          console.log('file is ', file);


          // See if we have a photo or video to load.
          var activeTabId = $(".composer .tab-pane.active").attr('id');
          if (file && activeTabId === 'composer-tab-photo-video') {

            // Have an image being loaded
            $scope.filesize = accounting.formatNumber(file.size);
            $scope.filename = file.name;
            data.file = file;
            Upload.upload({
                //url: 'http://localhost:4000/junkphotos',
                url: url,
                data: data
            }).then(function (resp) {
              console.log('resp: ', resp);
                console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);

                // Reload the posts
                Seller.loadPosts(supplierId, htmlElementSelector, function(err) {
                  if (err) {
                    console.log('Error reloading posts: ', err);
                    return;
                  }
                });

                // Reset the UI
                $timeout(function(){
                  $scope.message = '';
                  $scope.file = null;
                  $scope.progressPercentage = null; // hide the progress bar again
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
                $scope.progressPercentage = perc;
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
                        Seller.loadPosts(supplierId, htmlElementSelector, function(err) {
                          if (err) {
                            console.log('Error reloading posts: ', err);
                            return;
                          }
                        });

                        //clear textarea
                        $timeout(function(){
                          $scope.message = '';
                          $scope.file = null;
                          $scope.progressPercentage = null; // hide the progress bar again
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

        $scope.cancelPost = function() {
          $scope.file = null;
          $scope.progressPercentage = null;
          $('#composer-status-button').tab('show');
        }

        $scope.haveMessage = function() {
          //console.log('message is ', $scope.message);
          //console.log('file is ', $scope.file);
          return (
            $scope.file
            || ($scope.message && $scope.message != '')
          );
        }

        $scope.showDropArea = function() {
          if ($scope.file) {
            return false;
          }
          return true;
        }

        $scope.showImage = function() {
          if ($scope.file) {
            return true;
          }
          return false;
        }

        $scope.showProgressBar = function() {
          return (
            $scope.file
            && $scope.progressPercentage
            && $scope.progressPercentage < 100
          );
        }

        $scope.showProcessing = function() {
          return (
            $scope.file
            && $scope.progressPercentage
            && $scope.progressPercentage == 100
          );
        }

        $scope.getPercentage = function() {
          return $scope.progressPercentage;
        }



        //if (callback) return callback(null, app, $scope, teaService);
        if (callback) return callback(null, $scope, $timeout);
      });//- app.controller
    },


    /*
     *  Initialise Crowdhound for this page.
     */
    initCrowdhound: function(callback/*(err)*/) {
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
    },//- initCrowdhound()


    /*
     *  Load our posts.
     */
    loadPosts: function(supplierId, htmlElementSelector, callback) {
      //alert('Seller.loadPosts(' + supplierId + ')');
      // if (callback) return callback(null);

      // Create an anchor
      var elementId = '$supplier-page-' + supplierId;

      // Select the posts
      CrowdHound.select({
        elementId: elementId,
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
              target: htmlElementSelector,
              theme: 'timeline'
            }, selection, function(err, selection) {
              if (err) return callback(err);
              return callback(null); // All ok
            });// render
          });// cook
        } // length > 0
      });// select
    },

    loadSupplier: function(supplierId, callback/*(supplier)*/) {
      //alert('loadSupplier()');

      var baseUrl = '//' + TEASERVICE_HOST + ':' + TEASERVICE_PORT;
      var url = baseUrl + '/v3/getSupplier';

      console.log('url is ' + url)
      var params = {
        supplierId: supplierId
      };
      jQuery.ajax({
        method: 'POST',
        url: url,
        headers: {
          "access-token": "0613952f81da9b3d0c9e4e5fab123437",
          "version": "2.0.0"
        },
        data: params,

        success: function(data, textStatus, xhr) {
          console.log('data:', data);
          console.log('textStatus:', textStatus);
          console.log('xhr:', xhr);
          if (xhr.status === 200) {
            return callback(data[0]);
          }
          console.log('Could not find supplier:', jqXHR);
          return callback(null);
        },

        error: function(jqXHR, textStatus, errorThrown) {
          console.log('Error:', jqXHR);
          return callback(null);
        }
      });
    },//- loadSupplier()



    /*
     *  For any attachments stored in Cloudinary, get the
     *  urls for common image sizes.
     */
    cookCloudinary: function(params, selection, callback) {
      //alert('invoked cookCloudinary');

      var cl = null;
      const prefix = 'cloudinary:';
      CrowdHound.traverse(selection, function _cookCloudinary(level, element, parent, next) {

        var filename = element.filename;
        if (filename.startsWith(prefix)) {
          var publicId = filename.substring(prefix.length);
          if (cl == null) {
            //alert('init cl')
            cl = cloudinary.Cloudinary.new( { cloud_name: CLOUDINARY_CLOUD_NAME});
          }

          // See http://cloudinary.com/documentation/image_transformations#resizing_and_cropping_images
          var imageName = publicId + '.jpg';
          element._cloudinaryImage_raw = cl.url(imageName);
          element._cloudinaryImage_lowquality = cl.url(imageName, { width:200, effect:"blur:600", opacity:50, crop: "scale" });

          console.log('----> ' + element._cloudinaryImage_lowquality);
          //console.log('====> ' + cl.imageTab(imageName, { width:100, blur:300, opacity:50 }));
          element._cloudinaryImage_320 = cl.url(imageName, { width: 320, crop: "limit"});
          element._cloudinaryImage_480 = cl.url(imageName, { width: 480, crop: "limit"});
          element._cloudinaryImage_768 = cl.url(imageName, { width: 768, crop: "limit"});
          element._cloudinaryImage_992 = cl.url(imageName, { width: 992, crop: "limit"});
          element._cloudinaryImage_1200 = cl.url(imageName, { width: 1200, crop: "limit"});
          element._cloudinaryImage_1920 = cl.url(imageName, { width: 1920, crop: "limit"});

        }

        // if (element.children) {
        //   for (i = 0; i < element.children.length; i++) {
        //     var childElement = element.children[i];
        //     if (childElement.type === 'externalLink'){
        //
        //       var jsonData = jQuery.parseJSON(childElement.description);
        //       element.htmlLinkPost = TimelinePost.constructPostLinkHTML(jsonData);
        //       element.description = "";
        //       break;
        //     }
        //     else if(childElement.type === 'externalVideo'){
        //       element.description = childElement.description;
        //       break;
        //     }
        //     else if (childElement.type === 'uploadedPhotos'){
        //       var imageJsonArray = jQuery.parseJSON(childElement.description);
        //       element.htmlLinkPost = TimelinePost.constructPostPhotosHTML(element.id, imageJsonArray);
        //     }
        //
        //   }
        //
        // }

        return next(null);

      }, callback);

    },// cookCloudinary


    //
    nocomma: null
  };
})(); // instantiate the class
