#!groovy

node {
	try {
	    // Checkout the proper revision into the workspace.
		stage('checkout') {
			checkout scm 
		}

		env.AWS_PROFILE= 'open-apparel-registry'
		env.OAR_SETTINGS_BUCKET = 'openapparelregistry-development-config-us-east-1'

	    // Execute `setup` wrapped within a plugin that translates
	    // ANSI color codes to something that renders inside the Jenkins
	    // console.
		stage('setup') {
			wrap([$class: 'AnsiColorBuildWrapper']) {
				sh './scripts/update'
				sh './scripts/bootstrap --env'
			}
		}

		stage('cibuild') {
			wrap([$class: 'AnsiColorBuildWrapper']) {
				sh './scripts/cibuild'
			}
		}
	} catch (err) {
	    // Some exception was raised in the `try` block above. Assemble
	    // an appropirate error message for Slack.
	    def slackMessage = ":jenkins-angry: *Open Apparel Registry (${env.BRANCH_NAME}) #${env.BUILD_NUMBER}*"
	    if (env.CHANGE_TITLE) {
	        slackMessage += "\n${env.CHANGE_TITLE} - ${env.CHANGE_AUTHOR}"
	    }
	    slackMessage += "\n<${env.BUILD_URL}|View Build>"
	    slackSend  channel: '#oar', color: 'danger', message: slackMessage

	    // Re-raise the exception so that the failure is propagated to
	    // Jenkins.
	    throw err
	} finally {
	    // Pass or fail, ensure that the services and networks
	    // created by Docker Compose are torn down.
	    sh 'docker-compose down -v'
	}
}
