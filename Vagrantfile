# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.require_version ">= 2.1"

ANSIBLE_VERSION = "2.4.*"

Vagrant.configure("2") do |config|

  config.vm.box = "bento/ubuntu-16.04"

  config.vm.synced_folder "./", "/vagrant"
  config.vm.synced_folder "~/.aws", "/home/vagrant/.aws"

  config.vm.provider "virtualbox" do |vb|
    vb.gui = false
    vb.memory = "2048" # React ran out of memory at 1024
  end

  # React development server
  config.vm.network :forwarded_port, guest: 3000, host: 3000

  # Gunicorn for Django app
  config.vm.network :forwarded_port, guest: 8080, host: 8080
 
  # Restify development server
  config.vm.network :forwarded_port, guest: 8000, host: 8000

  config.vm.provision "ansible_local" do |ansible|
    ansible.compatibility_mode = "2.0"
    ansible.install = true
    ansible.install_mode = "pip_args_only"
    ansible.pip_args = "ansible==#{ANSIBLE_VERSION}"
    ansible.playbook = "deployment/ansible/open-apparel-registry.yml"
    ansible.galaxy_role_file = "deployment/ansible/roles.yml"
    ansible.galaxy_roles_path = "deployment/ansible/roles"
  end

  config.vm.provision "shell" do |s|
    s.inline = <<-SHELL
    if ! grep -q "cd /vagrant" "/home/vagrant/.bashrc"; then
      echo "cd /vagrant" >> "/home/vagrant/.bashrc"
    fi

    export AWS_PROFILE=open-apparel-registry
    export OAR_SETTINGS_BUCKET=openapparelregistry-development-config-us-east-1
    
    cd /vagrant
    su vagrant ./scripts/bootstrap
    su vagrant ./scripts/update
    SHELL
  end

end
