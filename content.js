// global variables
const parser = new DOMParser()
// colSpan makes it so that despite varying number of columns, all embedded rows look flush in the table (aka weird html workaround)
const colSpan = document.getElementsByClassName("full nospace martop dkborderbottom marbottommuchmore padleft")[0].getElementsByTagName('tr')[0].children.length 


// helper functions
function HTMLTableToJSON(table) {
    let data = [];

    // first row needs to be headers
    let headers = [];
    for (let i = 0; i < table.rows[0].cells.length; i++) {
        headers[i] = table.rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi,'');
    }

    // go through cells
    for (let i = 1; i < table.rows.length; i++) {
        const tableRow = table.rows[i];
        let rowData = {};

        for (let j = 0; j < tableRow.cells.length; j++) {
            rowData[headers[j]] = tableRow.cells[j].innerHTML;
        }

        data.push(rowData);
    }       
    return data;
}


//---------------------------------------PARADIGM---------------------------------------
// returns paradigms as so: [[name, paradigmLink], [name, paradigmLink] ...]
function getParadigmLinks() {
    const tableBody = document.getElementsByClassName("full nospace martop dkborderbottom marbottommuchmore padleft")[0].children[1].children[1]
    const row = tableBody.children[0].children
    const judgeIndex = row.length - 1
    let links = []
    const judgeDivs = row[judgeIndex].getElementsByClassName("full nospace flexrow")
    Array.from(judgeDivs).forEach(judge => {
        let name = judge.getElementsByClassName("threesevenths nowrap padvert marvertno smallish padleft")[0].title
        const paradgimLink = judge.getElementsByClassName("greytext buttonwhite smaller padmuchless marno")[0].href
        try {
            name = name.split(",").reverse().join(" ").trim() // converting from name "Last, First" to "First Last" without whitespace
        } catch(error) {console.log(error)}
        links.push([name, paradgimLink])
    })
    return links
}


// returns html
async function getParadigmContent(paradigmLink) {
    const paradigmPage = await fetch(paradigmLink)
    const paradigmHTML = await paradigmPage.text()
    const paradigm = parser.parseFromString(paradigmHTML, "text/html").getElementsByClassName("paradigm ltborderbottom")[0].outerHTML
    return paradigm
}


async function formatJudgeContent(judgeArray) {
    let content = ``
    for(let i = 0; i < judgeArray.length; i++) {
        const judge = judgeArray[i]
        let easterEgg = ""
        if(judge[0] == "Measam Ali") {easterEgg = "<--- please read his paradigm, he gets sad if you don't"}
        content += `
            <tr id="${judge[0]} header" class="yellowrow" style="height: 22px; font-size:12px; border: 1px solid white;">
                <td colspan="${colSpan}" style="font-weight: 600; padding: 4px; padding-left: 8px; font-size:12px; border-top: 1px solid white; border-left: 1px solid white;">${judge[0]} Paradigm ${easterEgg}</td>
            </tr>

            <tr id="${judge[0]} paradigm" style="border: 5px;border-color: #ddff00;">
                <td colspan="${colSpan}" style="padding: 0px;">
                    <div class="paradigm ltborderbottom" style="padding: 0px;max-height: 300px;overflow: auto;background-color: #fafafa; border: 1px solid white;">
                        ${await getParadigmContent(judge[1])} ${easterEgg}
                    </div>
                </td>
            </tr>

            <tr>
                <td></td>
            </tr>
        `
    }
    return content
}

//---------------------------------------OPPONENT RECORD---------------------------------------

function getOpponentName() {
    const tableBody = document.getElementsByClassName("full nospace martop dkborderbottom marbottommuchmore padleft")[0].children[1].children[1]
    const row = tableBody.children[0].children
    const oppIndex = row.length - 2
    return row[oppIndex].innerText
}


function getTournName() {
    return document.querySelector("h5.martopmore").textContent.trim()
}


async function getEventEntriesURL() {
    const tournName = getTournName()

    // tourn id
    const searchURL = `https://www.tabroom.com/index/search.mhtml?search=$${tournName.replaceAll(" ", "%20")}&caller=%2Findex%2Findex.mhtml` // 
    const searchPage = await fetch(searchURL)
    const tournIDHTML = await searchPage.text()
    const tournURL = parser.parseFromString(tournIDHTML, "text/html").getElementById("search_results").getElementsByTagName("a")[0].href
    const tournID = /tourn_id=(.*)/gm.exec(tournURL)[1]

    // event name
    const eventPageText = document.getElementsByClassName("full graytext semibold bigger")[0].innerText
    const eventName = /Entry in (.*) \(.*\)/gm.exec(eventPageText)[1]

    // entry page (with record links) link
    const entriesURL = `https://www.tabroom.com/index/tourn/fields.mhtml?tourn_id=${tournID}`
    const entriesPage = await fetch(entriesURL)
    const entryIDHTML = await entriesPage.text()
    const sidenote = parser.parseFromString(entryIDHTML, "text/html").getElementsByClassName("sidenote")[0]
    let link = ""
    sidenote.querySelectorAll('a').forEach(a => {
        if (a.innerText.trim() == eventName){
            link = a.href
        }
    })
    return link
}


// code adapted from the MakeArray function in Tabroom's source code
// returns HTML of opponentRecord 
async function calculateRecord(recordLink) {
    const response = await fetch(recordLink)
    const html = await response.text()
    const summaryTable = JSON.parse(/var summaryTable \= \s*([\S\s]+);\n\tvar myArray=MakeArray/gm.exec(html)[1])
    
    let prelim_rounds = 0
    let prelim_wins = 0
    let prelim_ballots = 0
    let prelim_ballots_won = 0
    let elim_rounds = 0
    let elim_wins = 0
    let elim_ballots = 0
    let elim_ballots_won = 0
    let totalRounds = 0
    let totalWins = 0
    
    for (const [key, value] of Object.entries(summaryTable)) {
        if (key.indexOf("together-this_yr") !== -1 ) {
            prelim_rounds += value["prelim_rounds"]
            prelim_wins += value["prelim_wins"]
            prelim_ballots += value["prelim_ballots"]
            prelim_ballots_won += value["prelim_ballots_won"]
            elim_rounds += value["elim_rounds"]
            elim_wins += value["elim_wins"]
            elim_ballots += value["elim_ballots"]
            elim_ballots_won += value["elim_ballots_won"]
            totalRounds += prelim_rounds + elim_rounds
            totalWins += prelim_wins + elim_wins
        }
    }

    return `
        <tr style="font-size:12px;background-color: #fafafa; border: 1px solid white;">
            <td style="heightborder-bottom: 1px sol+id white; border-left: 1px solid white;">Totals</td>
            <td style="border-bottom: 1px solid white;">${(((prelim_wins / prelim_rounds) || 0) * 100).toFixed(1) }% (${prelim_wins}/${prelim_rounds})</td>
            <td style="border-bottom: 1px solid white;">${(((prelim_ballots_won / prelim_ballots) || 0) * 100).toFixed(1)}% (${prelim_ballots_won}/${prelim_ballots})</td>
            <td style="border-bottom: 1px solid white;">${(((elim_wins / elim_rounds) || 0) * 100).toFixed(1)} % (${elim_wins}/${elim_rounds})</td>
            <td style="border-bottom: 1px solid white;">${(((elim_ballots_won / elim_ballots) || 0) * 100).toFixed(1)}% (${elim_ballots_won}/${elim_ballots})</td>
            <td style="border-bottom: 1px solid white; border-right: 1px solid white;">${(((totalWins / totalRounds) || 0) * 100).toFixed(1)}% (${totalWins}/${totalRounds})</td>
        </tr>
    `
}


// returns a JSON from the whole entry table to just the opponent name paired to their record link
function cleanEntryJSON(entriesJSON) { 
    let clean = {}
    Array.from(entriesJSON).forEach(entry => {
        recordTag = parser.parseFromString(entry["\n\t\t\t\t\t\t\t\trecord\n\t\t\t\t\t\t\t"], "text/html") // weird record format cause thats how it is in the html
        const recordLink = recordTag.querySelector("a").href
        clean[entry["\n\t\t\t\t\t\t\tcode\n\t\t\t\t\t\t"].trim()] = recordLink
    })
    return clean
}


async function loadEntries(entryPage) {
    const response = await fetch(entryPage)
    const html = await response.text()

    const table = parser.parseFromString(html, "text/html").getElementById("fieldsort")
    let entriesJSON = HTMLTableToJSON(table)
    entriesJSON = cleanEntryJSON(entriesJSON)

    return entriesJSON
}


async function getOpponentRecord(opponentCode) {
    const entryPage = await getEventEntriesURL()
    const entries = await loadEntries(entryPage)
    const recordLink = entries[opponentCode.trim()]

    const recordHTML = await calculateRecord(recordLink)

    return [recordLink, recordHTML]
}


function formatOpponentContent(opponentCode, opponentRecord) {
    let easterEgg = ""
    if(opponentCode == ("Hebron CK")) {easterEgg = "<---- hey that's me"}
    else if (opponentCode.includes("Hebron")) {easterEgg = "<----- Hawk Pride Never Dies"}

    return `
        <tr class="yellowrow" style="height: 22px; font-size:12px; border: 1px solid white;">
                <td colspan="${colSpan}" style="font-weight: 600; padding: 4px; padding-left: 8px; font-size:12px; border-top: 1px solid white; border-left: 1px solid white;">${opponentCode} Record ${easterEgg}</td>
        </tr>

        <tr class="yellowrow" style="font-weight: 600; height: 22px; padding: 4px; padding-left: 8px; font-size:12px; border: 1px solid white;">
            <td style="height: 22px; padding: 4px; padding-left: 8px; border-top: 1px solid white; border-left: 1px solid white;">Comparison</td>
            <td style="height: 22px; padding: 4px; padding-left: 8px; border-top: 1px solid white;">Prelim Rds</td>
            <td style="height: 22px; padding: 4px; padding-left: 8px; border-top: 1px solid white;">Prelim Ballots</td>
            <td style="height: 22px; padding: 4px; padding-left: 8px; border-top: 1px solid white;">Elim Rds</td>
            <td style="height: 22px; padding: 4px; padding-left: 8px; border-top: 1px solid white;">Elim Ballots</td>
            <td style="height: 22px; padding: 4px; padding-left: 8px; border-top: 1px solid white; border-right: 1px solid white;">Total</td>
        </tr>
            ${opponentRecord}
        </tr>
        <tr>
            <td></td>

        </tr>
    `
}

function insertRecordLink(link, code) {
    const newOpponentTD = `
        <td class="smallish" style="padding-left: 0px;">
            <div class="full nospace flexrow" style=" max-width: 171.14px;  padding: 0;"><span class="threesevenths nowrap padvert marvertno smallish padleft" title="${code}" style="width: 99%; max-width: 171.14px; padding-left: 0px; padding-right: 0px;">
                <span class="fifth centeralign nospace" title="Record">
                    <a class="greytext buttonwhite smaller padmuchless marno" target="_blank" href="${link}">R</a>
                </span>${code}</span>
            </div>
        </td>
    `

    const row = document.getElementsByClassName("full nospace martop dkborderbottom marbottommuchmore padleft")[0].getElementsByTagName('tbody')[0].children[0]

    Array.from(row.getElementsByTagName('td')).forEach(td => {
        if(td.innerText.trim() == code) {
            td.outerHTML = newOpponentTD
        }
    })
}

//---------------------------------------FORMATTING AND INSERTING---------------------------------------

// returns html
// the empty <tr> tags are the white space between the rows
function insertContent(judgeContent, opponentContent) {
    document.getElementsByClassName("full nospace martop dkborderbottom marbottommuchmore padleft")[0].children[1].children[1].children[0].outerHTML += 
    `
        <tr style="background-color: white;">
        <td></td>
        </tr>

        ${judgeContent}

    
        ${opponentContent}

        <tr style="background-color: white;">
        <td></td>
        </tr>
    `
}

//---------------------------------------BOB THE BUILDER PUTTING IT TOGETHER---------------------------------------
// wrapping everything in an async functions cause Promises suck
// allows us to use await, so the code will only execute after the Promise has been resolved
async function everythingEverywhereAllAtOnce() {
    let judgeContent
    try {
        const paradgimLinks = getParadigmLinks()
        judgeContent = await formatJudgeContent(paradgimLinks)
    } catch(error) {
        // 404 Paradigm Not Found HTML
        judgeContent = `
            <tr>
                <td colspan="${colSpan}" style="margin: 0px; padding: 0px;">
                    <p class="biggish semibold" style="background-color: #ffbdbd; margin-bottom: 0px; border: 1px solid white; margin: 0px; padding: 4px; font-size: 14px">
                        404 Paradigm Not Found
                    </p>
                </td>
            </tr>

            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        `
    }
    
    let opponentContent
    try {
        const opponentCode = await getOpponentName()
        const [opponentLink, opponentRecord] = await getOpponentRecord(opponentCode)
        opponentContent = formatOpponentContent(opponentCode, opponentRecord)
        insertRecordLink(opponentLink, opponentCode)
    } catch(error) {
        // 404 Opponent Not Found HTML
        opponentContent = `
            <tr style="margin: 0px; padding: 0px; height: 22px;">
                <td colspan="${colSpan}" style="margin: 0px; padding: 0px; height: 22px;">
                    <p class="biggish semibold" style="background-color: #ffbdbd; margin-bottom: 0px; border: 1px solid white; margin: 0px; padding: 4px 4px 4px 8px; font-size: 12px">
                        404 Record Not Found
                    </p>
                </td>
            </tr>

            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        `
    }
    
    insertContent(judgeContent, opponentContent)
}

everythingEverywhereAllAtOnce()
