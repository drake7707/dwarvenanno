# Dwarven anno
Example engine to simulate Anno or Dwarf fortress like behaviour with tiles, "workers" and their behaviour, storage of buildings, etc. Uses discrete event simulation (DES) to queue up events. Because everything is predetermined and in order on a "world time" in the queue, you can do fun stuff like speeding up the simulation or skipping ahead whole chunks of time.

I originally started experimenting with it in my Typescript editor but as a single file it quickly became slow and unwieldy so I broke it up into parts and moved everything to its own file. There's still some remnants to be found from the original structure, like the globals.ts that used to be just global variables.

The simulated annealing portion has nothing to do with the engine, it's just an experiment that I wanted to test out to see what the result would be based on a trivial scoring system.

## Demo

Try it out [here](https://drake7707.github.io/dwarvenanno/index.html)

## Screenshots

![Screenshot](https://i.imgur.com/6cWGjPQ.png])

## Class diagram

![Class diagram](https://i.imgur.com/N5At9rR.png)

## Running locally

I used VSCode, which has built in typescript support. To debug it uses a tiny webserver to host the files on localhost. 

To run do `npm install` to restore packages and then `npm start` to start the webserver
