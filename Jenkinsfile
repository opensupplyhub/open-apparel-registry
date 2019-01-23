#!groovy

node {
	try {
	    // Checkout the proper revision into the workspace.
		stage('checkout') {
			checkout scm 
		}

		env.AWS_PROFILE = 'open-apparel-registry'
		env.AWS_DEFAULT_REGION = 'us-east-1'

		env.OAR_SETTINGS_BUCKET = 'openapparelregistry-testing-config-us-east-1'

	    // Execute `setup` wrapped within a plugin that translates
	    // ANSI color codes to something that renders inside the Jenkins
	    // console.
		stage('setup') {
			wrap([$class: 'AnsiColorBuildWrapper']) {
				sh './scripts/bootstrap'
				sh './scripts/update'
			}
		}

		stage('cibuild') {
			wrap([$class: 'AnsiColorBuildWrapper']) {
				sh './scripts/cibuild'
			}
		}

		env.OAR_SETTINGS_BUCKET = 'openapparelregistry-staging-config-us-east-1'

		if (env.BRANCH_NAME == 'develop' || env.BRANCH_NAME.startsWith('release/') || env.BRANCH_NAME =~ /test\//) {
			// Publish container images built and tested during `cibuild`
			// to the private Amazon Container Registry tagged with the
			// first seven characters of the revision SHA.
			stage('cipublish') {
				// Decode the ECR endpoint stored within Jenkins.
				withCredentials([[$class: 'StringBinding',
								credentialsId: 'OAR_AWS_ECR_ENDPOINT',
								variable: 'OAR_AWS_ECR_ENDPOINT']]) {
					wrap([$class: 'AnsiColorBuildWrapper']) {
						sh './scripts/cipublish'
					}
				}
			}

			// Plan and apply the current state of the instracture as
			// outlined by the `develop` branch of the `open-apparel-registry`
			// repository.
			stage('infra') {
				wrap([$class: 'AnsiColorBuildWrapper']) {
					sh 'docker-compose -f docker-compose.ci.yml run --rm terraform ./scripts/infra plan'
					sh 'docker-compose -f docker-compose.ci.yml run --rm terraform ./scripts/infra apply'
				}
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
