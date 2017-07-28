

var imagePathsCloudinaryApi = null; // Cloudinary API



function imagePaths_setVariantImages(variant) {
  //console.log('imagePaths_setVariantImages()');

  // Find the first active image
  // No images. Use a placeholder
  variant._image = '/assets/images/cleardot.png';
  if (variant.images) {
    variant.images.sort(function(i1, i2) {
      var s1 = i1.sortId ? i1.sortId : 0;
      var s2 = i2.sortId ? i2.sortId : 0;
      if (s1 < s2) return -1;
      if (s1 > s2) return +1;
      return 0;
    });
    for (var i = 0; i < variant.images.length; i++) {
      var image = variant.images[i];
      if (image.isDisplayed) {
        var path = variant.images[0].imagePath;
        variant._image = imagePaths_convert(path, { width:280, height: 360, crop: "lpad", background: "white" });
        break;
      }
    }
  }
}


function imagePaths_setSupplierImages(supplier) {
  // console.log('setSupplierImages()');

  supplier._logo = imagePaths_convert(supplier.logo, { width:512, height: 512, crop: "scale" });
  supplier._banner = imagePaths_convert(supplier.banner, { width:1920, height: 250, crop: "fill" });
}




function imagePaths_convert(image, cloudinaryOptions) {
  //console.log('convertImagePath(' + image + ')')

  const CLOUDINARY_PREFIX = 'cloudinary:';

  if (!image) {

    // No image
    return '/assets/images/cleardot.png';

  } else if (image.startsWith(CLOUDINARY_PREFIX)) {

    // This is a Cloudinary image.
    if (imagePathsCloudinaryApi == null) {
        imagePathsCloudinaryApi = cloudinary.Cloudinary.new( { cloud_name: CLOUDINARY_CLOUD_NAME});
    }

    // See http://cloudinary.com/documentation/image_transformations#resizing_and_cropping_images
    var publicId = image.substring(CLOUDINARY_PREFIX.length);
    var imageName = publicId + '.jpg';
    return imagePathsCloudinaryApi.url(imageName, cloudinaryOptions);

  } else {

    // Not a cloudinary image.
    return image;
  }
}//- convertImagePath()
