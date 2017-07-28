'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const fs = require('fs');
const mkdirp = require('mkdirp');
const execSync = require('child_process').execSync;

module.exports = class extends Generator {

	constructor(args, opts) {
		super(args, opts);

    // This makes `appname` a required argument.
		this.argument('appname', { type: String, required: true });
	}

	initializing() {

		// Check the length of the appname
		var appname = this.options.appname;
		if (appname.length < 2 || appname.length > 3) {
			this.log("Error: Project code must be 2 or 3 characters only.");
			process.exit(1);
		}

		// Check that the project doesn't already exist.
		var projectDir = projectDirectory(appname);
		if (fs.existsSync(projectDir)) {
			this.log('Error: project directory already exists: ' + projectDir);
			process.exit(1);
		}

		// Display a nice message
		this.log('Project directory is: ' + projectDir);
	}



  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the ' + chalk.red('generator-pastacat') + ' generator!'
    ));


	this.log('This command will produce a working PastaCat stack application.');
	this.log();
	this.log('A pastacat application utilizes cloud bases services for security, shopping, and social');
	this.log('media functionality, and will require an APIKEY from the websites http://authservice.io,');
	this.log('http://teaservice.io, and http://crowdhound.io.');
	this.log('');
	this.log('If you don\'t want the functionality for one of these services you can delete the related');
	this.log('code from your application later. If you want to proceed now without the APIKEYs, you can');
	this.log('add them in later by editing environment.js');
	this.log('');


  const prompts = [
		/*
		{
      type: 'input',
      name: 'APP_NAME',
      message: 'Enter your project code (2 or 3 chars only):',
			validate: function(appname) {
				console.log('Checking ' + appname);
				if (appname.length < 2 || appname.length > 3) {
					return "Project code must be 2 or 3 characters only.";
				}

				// See if the project directory already exists
				if (fs.existsSync(projectDirectory(appname))) {
					return 'Project directory already exists: ' + projectDir;
				}

				return true;
			}
//      default: 'xxx'
    },
		*/
		{
      type: 'input',
      name: 'APP_DESCRIPTION',
      message: 'Enter a description of the project:',
      //default: 'xxxxxxxxxxxxxxxxxxxx'
    },
		{
      type: 'input',
      name: 'DOMAIN_PREFIX',
      message: 'Enter the domain name prefix provided for your API calls:',
      default: 'train'
    },
		/*
    {
      type: 'input',
      name: 'AUTHSERVICE_APIKEY',
      message: 'Enter the APIKEY for Authservice:',
      default: 'xxxxxxxxxxxxxxxxxxxx'
    },
    {
      type: 'input',
      name: 'TEASERVICE_APIKEY',
      message: 'Enter the APIKEY for TEAservice: ',
      default: 'xxxxxxxxxxxxxxxxxxxx'
    },
    {
      type: 'input',
      name: 'CROWDHOUND_APIKEY',
      message: 'Enter the APIKEY for Crowdhound: ',
      default: 'xxxxxxxxxxxxxxxxxxxx'
    },
		*/
    {
      type: 'input',
      name: 'S3_BUCKET',
      message: 'If you wish to deploy as a static site on Amazon,\n  enter the NAME of the S3 Bucket (leave off the s3://):',
      default: 'myproject-devel-s3-bucket'
    },
    /*
    {
      type: 'confirm',
      name: 'someAnswer',
      message: 'Would you like to enable this option?',
      default: true
    },
    */
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {

		// Create the development directory.
		var appname = this.options.appname;
		var projectDir = projectDirectory(appname);
		mkdirp.sync(projectDir);
		mkdirp.sync(projectDir + '/' + appname);
		//mkdirp.sync(projectDir + '/configs');

		this.destinationRoot(projectDir);

  	// Recursive copy
		// See http://stackoverflow.com/questions/20139196/how-do-i-process-multiple-files-as-templates-with-yeoman-generator
		this.fs.copy(
			this.templatePath('source/**'),
			this.destinationPath(appname)
		);

		this.fs.copy(
			this.templatePath('configs/**'),
			this.destinationPath('configs')
		);


		/*
		 *	Now patch values in specific files
		 */
		this.props.APP_NAME = appname;
		this.props.PROJECT_DIR = projectDir;

		this.fs.copyTpl(
				this.templatePath('README.md'),
				this.destinationPath('README.md'),
				this.props,
				{interpolate: /<%=([\s\S]+?)%>/g} // Use <%= ... %>
		);

		this.fs.copyTpl(
				this.templatePath('source/PUBLISH_TO_S3'),
				this.destinationPath(appname + '/PUBLISH_TO_S3'),
				this.props,
				{interpolate: /<%=([\s\S]+?)%>/g} // Use <%= ... %>
		);

		this.fs.copyTpl(
				this.templatePath('source/assets/scripts/environment.js'),
				this.destinationPath(appname + '/assets/scripts/environment.js'),
				this.props,
				{interpolate: /<%=([\s\S]+?)%>/g} // Use <%= ... %>
		);

		this.fs.copyTpl(
				this.templatePath('source/assets/scripts/environment.js-tst'),
				this.destinationPath(appname + '/assets/scripts/environment.js-tst'),
				this.props,
				{interpolate: /<%=([\s\S]+?)%>/g} // Use <%= ... %>
		);

		this.fs.copyTpl(
				this.templatePath('source/layout/layout_main.pug'),
				this.destinationPath(appname + '/layout/layout_main.pug'),
				this.props,
				{interpolate: /<%=([\s\S]+?)%>/g} // Use <%= ... %>
		);

		// this.fs.copyTpl(
		// 		this.templatePath('configs/local-all/SETENV'),
		// 		this.destinationPath('configs/local-all/SETENV'),
		// 		this.props,
		// 		{interpolate: /<%=([\s\S]+?)%>/g} // Use <%= ... %>
		// );
	}//- writing

  install() {
		if (!this.options['skip-install']) {
	    // Change working directory to 'gulp' for dependency install
			var here = process.cwd();
	    var sourceDir = here + '/' + this.props.APP_NAME;
	    process.chdir(sourceDir);

	    this.installDependencies({
	      bower: true,
	      npm: false,
				yarn: true
	    });
	  }
	}//- install


	// initializeGit() {
	// 	execSync('pwd; ls -l');
	// }

	// finalMsg() {
	// 	// This is unfortunately printed out before
	// 	this.log()
	// 	this.log('This project is now ready and can be run using:\n')
	// 	this.log()
	// 	this.log('  $ cd ' + this.props.PROJECT_DIR);
	// 	this.log('  $ gulp main serve')
	// 	this.log()
	// 	this.log('Wait till the gulp command finishes, then refresh the browser window.')
	// }
};


function projectDirectory(appname) {
	var dir = process.cwd() + '/' + appname;
	//var dir = '/Development/projects/' + appname;
	return dir;
}
