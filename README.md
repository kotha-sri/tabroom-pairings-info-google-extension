# Tabroom Pairings Info

__UPDATE: the extension no longer works as Tabroom is migrating away from its old libraries. Will update the extension once that is compelete.__

A google extension for debaters (any event with a record really) that embeds the judge paradigm and opponent record of the latest pairing directly in the site

To use this extension, clone this repo. Open your browser, and go to Manage Extensions. Enable Developer Mode and click Load Unpacked. Select the folder of this repository. The extension should now be loaded. Turn it on and have fun.

Works by activating on the Tabroom student page (https://www.tabroom.com/user/student/index.mhtml?err=&msg=) and scraping the DOM to find the latest pairing. Using the tournament info on the page, the name and event is found access the opponent record and paradigm from the tournament site using scrapers. That is then formatted and inserted into the page.

Potential Updates
  - collapsible paradigms
  - adapt calculateRecord for other division
  - save entries of the tournament to storage
  - save the latest pairing to storage 
  - support swing tournaments
