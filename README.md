Deploy Server
=============

Nodejs Chef Server for chef-solo


Assumptions
====

- A tested chef recipes
- Server instances are properly configured to forward ssh keys


Config Options
====

1. `kitchen_path` - the location of the chef kitchen
2. `bootstrap-version` - the version of chef to install to the requesting server during 'initialize'
3. `listen_port` - the port where this server will be listening to

API Calls
====

1. `POST /register` -  Registers the requesting instance


Sample Call: `curl -H "Content-Type: application/json" -d '{"environment": "development","run_list": ["role[dlr-mail]"]}' http://172.28.128.3:8080/register`


2. `POST /initialize` - Initialize the current instance (Installs chef)
3. `POST /deploy` - Deploys to the requesting instance
