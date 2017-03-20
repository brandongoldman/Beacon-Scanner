# CIS4930 (Mobile & Pervasive Computing), Lab 4
# University of Florida, Spring 2017

# How it Works

## Android

## Mbed

## Node JS

Our Node JS application makes use of Express for the web server, Socket.io for front-to-back-end communication, and Pug for creating HTML templates. Mosca is also used to emulate an MQTT (Message Queue Telemetry Transport) broker i.e. the service that passes messages between publisher(s) and subscriber(s).

To begin, we modified the MQTT "published" listener to listen for updates on the count of users near each of our zones equipped with beacons. If an update was detected for one of four zones, a helper method is called to send the update not only to the frontend of the Node app, but to the proper mbed board as well. For instance, if the user capacity counter is incremented in zone 1, then the frontend of our app reflects this change in zone 1 and the mbed board assigned to zone 1 also receives the updated county of current users.

Overall, the following files were modified or created for our Node app:
  - server.js
  - views/index.pug
  - package.json (indrectly, via addition of `dotenv` and `mbed-connector-api` modules

Our Node app was installed on a live server from DigitalOcean.com, at the following IP Address: http://45.55.64.92/
You may click that to visit our live application. The Node application is managed by the "pm2" process manager on the Ubuntu install, to allow our application automatic restarting following any traffic overloads or crashes. Web traffic reaches our application via a reverse proxy set up under the Nginx web server.
