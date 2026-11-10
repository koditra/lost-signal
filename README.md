# Lost Signal!

This is just a simple static landing page for the offline communication ysws draft, Lost Signal.

the plan for this ysws is to ship out hardware (LoRa, SDRs, mesh nodes, etc.) to teens so everyone can build communication setups that work completely off-grid without the internet or cell networks.

## deploy locally

no npm install, no build steps, no frameworks. just use python to spin up a quick local server.

run this in your terminal:
python3 -m http.server 4173

then open up http://localhost:4173 in your browser. change any file, hit refresh, and it updates instantly.

if port 4173 is busy, just change the number to something else.

## tech

* plain HTML / CSS / JS
* python's http.server for dev
* can be hosted anywhere that takes static files