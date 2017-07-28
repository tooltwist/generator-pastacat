

##  <%=APP_NAME%>
<%=APP_DESCRIPTION%>

## Starting the application

The website can be run and viewed using gulp:

    cd <%=APP_NAME%>
    gulp main serve

This starts the browser, and will refresh the browser if the website code
is changed. Gulp will recognize changes to Gulp files and Sass files, but may
not always generate dependent files. If you change a layout Pug you may
need to restart the server. For changes to bower files and Javascript files
you might find this suffices:

    gulp copy bower


## About the pastacat Stack
The pastacat Stack makes use of popular technologies to provide highly
functional applications

Pug - Templating engine.  
Angular - HTML enhanced for web apps.  
Sass - Syntactically Awesome Style Sheets.  
TEAservice - shopping functionality.  
Authservice - Authentication and authorization.  
Crowdhound - Social Media, ratings, reviews, forums, etc.  

The last three of these are cloud based services that provide a huge
amount of functionality for little effort. In many cases a fully functional
eCommerce and social media application can be created as 100% static website.



## Changing the configuration
The API endpoints are defined in the following files:

    scripts/environment.js  
    scripts/environment.js.mvp   (when deployed to S3 bucket)  

The S3 bucket configuration is defined in

    ./PUBLISH_TO_S3  

At the time this project was initialized, these were set to

    <%=APP_NAME%>.authservice.io  
    <%=APP_NAME%>.authservice.io  
    <%=APP_NAME%>.authservice.io  
    s3: <%=S3_BUCKET%>  


## Git and source control
This project uses two separate directories that can get checked into different
repositories. The `<%=APP_NAME%>` directory contains the project source and
can be checked into Github as normal project source. The `config` directory
contains configuration information used to deploy and test the application
in multiple environments, and will may hold information you don't want to
become public. For this reason it should not normally be saved to Github.


## Account details
To get new APIKEYs or to manage your backend services go to toolwist.com.
