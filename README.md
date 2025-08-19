# Tabroom Pairings Info

<img width="128" height="128" alt="tab_pair_icon-128" src="https://github.com/user-attachments/assets/022f19b0-dd18-4e3a-8f68-6a404000fd37" />

UPDATE: the extension no longer works as Tabroom is migrating away from its old libraries. Will update the extension once that is compelete.

A google extension for debaters (any event with a record really) that embeds the judge paradigm and opponent record of the latest pairing directly in the site

To use this extension, clone this repo (without the markdown files). Open your browser (assuming it has Chrome Extension support), and go to Manage Extensions. Enable Developer Mode and click Load Unpacked. Select the folder of this repository. The extension should now be in your extensions. Turn it on and have fun.

Works by activating on the Tabroom student page (https://www.tabroom.com/user/student/index.mhtml?err=&msg=) and scraping the DOM to find the latest pairing. Using the tournament info on the page, the name and event is found access the opponent record and paradigm from the tournament site using scrapers. That is then formatted and inserted into the page.

Potential Updates
  - collapsible paradigms
  - adapt calculateRecord for other division
  - save entries of the tournament to storage
  - save the latest pairing to storage 
  - support swing tournaments
