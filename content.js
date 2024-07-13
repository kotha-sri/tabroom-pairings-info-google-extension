// TODO: clean up code, then add try/catch errors ("https://www.w3schools.com/js/js_errors.asp")
// also maybe add a fun easter egg when facing Hebron or Hebron CK (or KW now idk)

const pairing = new Map([
    ["opponent", "Hebron FW"],
    ["event name", "Public Forum Debate"],
    ["paradigm", "https://www.tabroom.com/index/paradigm.mhtml?judge_person_id=111998"]
])

const tournName = "THE WILDCAT WINTER WHIRLWIND PLANO SWING"
// chrome.storage.local.set({ "tournName" : tournName }).then(() => {
//     console.log("tournament name loaded")
// })

const tournID = "27950"
// const eventID = "254145"
const opponentRecordLink = "https://www.tabroom.com/index/results/team_results.mhtml?id1=1089568&id2=1089569"
const parser = new DOMParser()

// tabroom calculates record and creates a "team_season" div after the html request it made
// will implement a way to calculate and create this div here after season starts and there's actually stuff to calculate
// the div below is a simply blank one
const placeholderOpponentRecord = `
    <div id="team_season">
    <span data-reactid=".1.1.0.1"> </span>
    <table data-reactid=".1">
        <thead data-reactid=".1.0">
            <tr class="yellowrow" data-reactid=".1.0.0">
                <th data-reactid=".1.0.0.$Comparison">Comparison</th>
                <th data-reactid=".1.0.0.$Prelim Rds">Prelim Rds</th>
                <th data-reactid=".1.0.0.$Prelim Ballots">Prelim Ballots</th>
                <th data-reactid=".1.0.0.$Elim Rds">Elim Rds</th>
                <th data-reactid=".1.0.0.$Elim Ballots">Elim Ballots</th>
                <th data-reactid=".1.0.0.$Total">Total</th>
            </tr>
        </thead>
        <tbody data-reactid=".1.1">
            <tr data-reactid=".1.1.0">
                <td data-reactid=".1.1.0.0:0">Totals</td>
                <td data-reactid=".1.1.0.0:1">0% (0/0)</td>
                <td data-reactid=".1.1.0.0:2">0% (0/0)</td>
                <td data-reactid=".1.1.0.0:3">0% (0/0)</td>
                <td data-reactid=".1.1.0.0:4">0% (0/0)</td>
                <td data-reactid=".1.1.0.0:5">0% (0/0)</td>
            </tr>
        </tbody>
    </table>
    </div> 
`

const recordText = "\n\t\t\t\t\t\t\t\trecord\n\t\t\t\t\t\t\t"
const codeText = "\n\t\t\t\t\t\t\tcode\n\t\t\t\t\t\t"
const opponentText = `<divclass="tablesorter-header-inner">
							opponent
						</div>`
const judgesText = `<divclass="tablesorter-header-inner">
						<spanclass="threesevenths">
							judges
						</span>
						<spanclass="foursevenths">
							results/comments
						</span>
					</div>`

/*
    chrome storage tracker

    {
        "entries": {...}
        "tournName": "THE WILDCAT WINTER WHIRLWIND PLANO SWING"
    }

*/

// chrome.storage.local.get(["tournName"])
//     .then(result => {
//         console.log(result['tournName'])
//     })

// fetch("https://www.tabroom.com/user/student/history.mhtml?tourn_id=27950&student_id=1147308")
//     .then(response => response.text())
//     .then(html =>{
//         console.log(parser.parseFromString(html, "text/html").getElementsByClassName("full nospace martop dkborderbottom marbottommuchmore padleft"))
//     })
//     .catch(error => {
//         console.log(error)
//     })




async function getParadigmContent(paradigmLink) {
    const paradigmPage = await fetch(paradigmLink)
    const paradigmHTML = await paradigmPage.text()
    const paradigm = parser.parseFromString(paradigmHTML, "text/html").getElementsByClassName("paradigm ltborderbottom")[0].outerHTML
    return paradigm
}

// getParadigmContent("https://www.tabroom.com/index/paradigm.mhtml?judge_person_id=111998")









//-------------------------------------------------------------------getting entries from storage-----------------------------------------------------------
// getEntry(pairing.get("opponent"))



async function getFromLocalStorage(key){
    const name = await chrome.storage.local.get([key])
    return name
}

async function getOpponentRecord(opponentName) {
    // TODO: if the json is loaded, then just pull from there
    let opponentRecordLink = ""
    let records = await chrome.storage.local.get(["entries"])
    records = JSON.parse(JSON.stringify(records))["entries"]
    
    if (records == "") {
        loadEntries()
    }
    
    // magic magic magic get record

    // until the magic is uncovered,
    return placeholderOpponentRecord
}

function getTournName() {
    return document.querySelector("h5.martopmore").textContent.trim().replaceAll(" ", "%20")
}

async function getTournID() {
    const tournName = getTournName()
    const searchURL = `https://www.tabroom.com/index/search.mhtml?search=$${tournName}&caller=%2Findex%2Findex.mhtml`
    const searchPage = await fetch(searchURL)
    const html = await searchPage.text()
    const tournURL = parser.parseFromString(html, "text/html").getElementById("search_results").getElementsByTagName("a")[0].href
    const tournID = /tourn_id=(.*)/gm.exec(tournURL)[1]
    return tournID
}



function getEventName() {
    const eventPageText = document.getElementsByClassName("full graytext semibold bigger")[0].innerText
    const eventName = /Entry in (.*) \(.*\)/gm.exec(eventPageText)[1]
    return eventName
}


async function getEventEntriesURL() {
    // tourn name
    const tournName = document.querySelector("h5.martopmore").textContent.trim()

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

async function noAwaitSad() {
    const jsad = await getEventEntriesURL()
    console.log(jsad)
}

// loads entries to chrome.storage.local
async function loadEntries(entryPage) {
    const response = await fetch(entryPage)
    const html = await response.text()
    const table = parser.parseFromString(html, "text/html").getElementById("fieldsort")
    let entriesJSON = tableToJSON(table)
    entriesJSON = cleanEntryJSON(entriesJSON)
    chrome.storage.local.set({ "entries" : entriesJSON }).then(() => {
        console.log(`entries loaded into local storage`);
    });   
}


function cleanEntryJSON(entriesJSON) { 
    let clean = {}
    entriesJSON.forEach(entry => {
        recordTag = parser.parseFromString(entry[recordText], "text/html")
        const recordLink = recordTag.querySelector("a").href
        clean[entry[codeText].trim()] = recordLink
    })
    return clean
}

function tableToJSON(table) {
    let data = [];

    // first row needs to be headers
    let headers = [];
    for (let i=0; i<table.rows[0].cells.length; i++) {
        headers[i] = table.rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi,'');
    }

    // go through cells
    for (let i=1; i<table.rows.length; i++) {

        const tableRow = table.rows[i];
        let rowData = {};

        for (let j=0; j<tableRow.cells.length; j++) {

            rowData[ headers[j] ] = tableRow.cells[j].innerHTML;

        }

        data.push(rowData);
    }       
    return data;
}


// for testing/example, has Measam paradigm and empty record (Hebron FW cause they're the opps)
const exampleInsertContent = `<tr>
   <td></td>
   <td></td>
   <td></td>
   <td></td>
   <td></td>
   <td></td>
   <td></td>
</tr>
<tr>
   <td colspan="6" style="margin: 0px; padding: 0px;">
      <p class="biggish semibold" style="background-color: indianred; margin-bottom: 0px; border: 1px solid black; margin: 0px; padding: 4px; font-size: 16px">Measam Ali Paradigm</p>
   </td>
</tr>
<tr style="border: 5px;border-color: #ddff00;height: 300px;">
   <td colspan="6" style="padding: 0px;">
      <div class="paradigm ltborderbottom" style="padding: 0px;height: 300px;overflow: auto;background-color: #ff98b0; border: 1px solid black;">
         <p><em><strong><span style="font-size: 10pt;"><em><strong>***For all of the lifetime of this page, this page will be a work in progress (W.I.P)***</strong></em></span></strong></em></p>
         <p><em><strong><span style="font-size: 10pt;"><em><strong>**Up to date for Plano West TFA (09/09/2023) still subject to change through the event**</strong></em></span></strong></em></p>
         <p><strong>Hiii Everyone!!!</strong></p>
         <p><em>--email: measama380@gmail.com--</em></p>
         <p><span style="font-size: 14pt;"><strong>Some background about me:</strong></span></p>
         <p><span style="font-size: 10pt;">I am Hebron Alumni, currently 21 years old, and a Senior at UNT, studying computer science. Some things I like are video games, watching k-dramas, listening to k-pop, and most of all spending time with friends. I have officially debated in NCX, NPF, and VPF. But I have learned and practiced all forms of speech and debate. I never got a chance to go to state or TOC, due to unfortunate circumstances. I have always enjoyed debating, because of the freedom it gave me, to talk about the real world, without any censorship from adults. With that being said, I appreciate those who truly give their best to their event.</span></p>
         <p><span style="font-size: 10pt;">If you can tell me who my bias is, then I will give you the win ;)<span style="font-size: 8pt;">*its a joke, but I will up ur speaks If u get it right</span></span></p>
         <p></p>
         <p></p>
         <p style="text-align: center;"><strong><span style="font-size: 18pt;">Context to Debate:</span></strong></p>
         <p style="text-align: center;"><span style="font-size: 10pt;">Debate is not mathematics. The round does not exist as a confined 3-dimensional space with certain laws of conservation. Debate is a form of conversation where members of the discussion are presenting their point of view and trying to persuade the listener to agree or join their side. With that being said, I expect that everyone in the round understands, that I am also a human being like everyone, and am prone to making a mistake. I will try my 110% to be objective in the round, so don't dismiss what I have said. You might not like it, and think I am wrong, but understand that all decisions made are still subjective to what made sense in my brain. I have been in your shoes, so please be patient and understanding with me, and we will have a great time.</span></p>
         <p style="text-align: center;"></p>
         <p style="text-align: center;"><span style="font-size: 14pt;"><strong>*****Disregard of the rules of ethics and mannerism in a round is an immediate loss, <em>I Do Not Care!*****</em></strong></span></p>
         <p><span style="font-size: 14pt;"><strong>IE:</strong></span></p>
         <p>I base all my decisions on the criteria presented by NSDA, which differ between each event, if there is anything of concern that happens during the round please let me know immediately so we can fix it.</p>
         <p><span style="font-size: 14pt;"><strong>Congress:</strong></span></p>
         <p>I base all my decisions on the criteria presented by NSDA. I uphold congress to the same integrity as CX, LD, and PF. If there is anything of concern that happens during the round please let me know immediately so we can fix it.</p>
         <p><span style="font-size: 14pt;"><strong>CX, LD, PF:</strong></span></p>
         <p><span style="font-size: 14pt;"><strong>(*For Online Tournaments*)</strong></span></p>
         <p><strong>Pre-round expectations:</strong></p>
         <p><span style="font-size: 10pt;">I expect everyone to have read the paradigm before entering the call. The only question that should be asked is those pertaining to statements that are not clear or have not been discussed on the page.</span></p>
         <p><em><span style="font-size: 10pt;">--&gt;see the rest of the paradigms under the in-person section&lt;--</span></em></p>
         <p></p>
         <p><strong><span style="font-size: 14pt;">(*For in-person tournaments*)</span></strong></p>
         <p><span style="font-size: 12pt;"><strong>Pre-round expectations:</strong></span></p>
         <p><span style="font-size: 10pt;">I expect everyone to have read the paradigm before entering the room. The only question that should be asked is those pertaining to statements that are not clear or have not been discussed on the page.</span></p>
         <p><strong>During the round:</strong></p>
         <p><span style="font-size: 10pt;">All of Crossfire <strong>will not</strong> be noted down on the flow, I will probably listen to the crossfire to make sure that it is still civil, and noted down any points that might affect speaker points. A reminder: Crossfire is for you to ask questions and clarify anything in the round with opponents. Anything that is brought up and you want me to vote off it, you must bring it up in your following speech.</span></p>
         <p><span style="font-size: 10pt;"><strong>Progressive Arguments (aka disad, theory, k):</strong></span></p>
         <p><span style="font-size: 10pt;">I am fine with any progressive argument except Disclosure Theory. PF is not CX, there is no reason to run such an argument. If you still feel like running it, I will not even consider it part of the round when voting, if I didn't buy the reasoning or analysis. Further, if you run </span><span style="font-size: 10pt;">a progressive argument without changing it to be at the VPF level, and I don't understand, I simply won't vote off of it</span></p>
         <p><strong><span style="font-size: 10pt;">Overview and Under view:</span></strong></p>
         <p><span style="font-size: 10pt;">I encourage having it, so I can have some parameters to vote off of, but I will not take it under consideration if it has not been carried throughout the entire round, in each speech (except rebuttal, ask before the round for more details).</span></p>
         <p><strong><span style="font-size: 10pt;">Contention:</span></strong></p>
         <p><span style="font-size: 10pt;">I expect that the contention is readable in 4 minutes without having to spread. So here is your fair warning, DO NOT SPREAD, if I can't follow you at your speed, I will either stop flowing or only write what I hear. This will probably hurt you. So be careful. IF you want to read really fast, send me the speech doc before the round, and make sure that it is the one you are reading. If you fail to do so, I cannot be held responsible for what I missed. I want clear signposting when you transition from Uniqueness, Link, Internal Link, and Impact.</span></p>
         <p><strong><span style="font-size: 10pt;">Rebuttal:</span></strong></p>
         <p><span style="font-size: 10pt;">For the first speaking team, I expect to hear a full frontal attack on the opponent's case. You can preemptively defend your case, but I will On the other hand, I expect the second-speaking team to attack and defend their case in the 4 min. Be sure to warrant analysis. I love to hear about turns on links and impacts, which creates ground for the clash needed in a debate round.</span></p>
         <p><strong><span style="font-size: 10pt;">Summary:</span></strong></p>
         <p><span style="font-size: 10pt;">NO NEW EVIDENCE FROM THE SECOND-SPEAKING TEAM! I expect to hear a summary of the round, with collapsing. Be sure to have Impact calculus or weighing.</span></p>
         <p><strong><span style="font-size: 10pt;">Final Focus: </span></strong></p>
         <p><span style="font-size: 10pt;">Give me voters. Why should I vote for you? NO NEW EVIDENCE!</span></p>
         <p><span style="font-size: 10pt;"><strong>Speaker Points:</strong> </span></p>
         <p><span style="font-size: 10pt;">I am not progressive in speaking. Don't spread, speak with emphasis on tags, speak clearly and loudly, and if you can make me laugh, you get higher speaks.</span></p>
         <p><strong><span style="font-size: 12pt;">After the Round:</span></strong></p>
         <p>I plan to disclose if I can come up with RFD within 5 minutes.<span style="font-size: 12pt;"> If the round is muddled then, It will take more time, be patient.</span></p>
         <p><strong><span style="font-size: 12pt;">The Use of Evi<span style="font-size: 10pt;">dence:</span></span></strong></p>
         <p><span style="font-size: 12pt;"><span style="font-size: 10pt;">I will ask you to show me evidence if I find it unclear, couldn't hear, or suspicious. I might ask you to pull up the original article, so be ready to find it; the only excuse I will take if the wifi is poor or lacking. I will try to search it up on my computer too, but if I cant find it either, we have problems.</span></span></p>
      </div>
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
<tr style="margin: 0px;">
   <td colspan="6" style="margin: 0px; padding: 0px;">
      <p class="biggish semibold" style="background-color: #f2b3f5; margin-bottom: 0px; border: 1px solid black;margin: 0px;padding: 4px; font-size: 16px">Hebron FW Record</p>
   </td>
</tr>
<tr class="yellowrow" data-reactid=".1.0.0" style="font-size:12px; border: 1px solid black;">
   <th data-reactid=".1.0.0.$Comparison" style="font-size:12px; border-top: 1px solid black; border-left: 1px solid black;">Comparison</th>
   <th data-reactid=".1.0.0.$Prelim Rds" style="font-size:12px; border-top: 1px solid black;">Prelim Rds</th>
   <th data-reactid=".1.0.0.$Prelim Ballots" style="font-size:12px; border-top: 1px solid black;">Prelim Ballots</th>
   <th data-reactid=".1.0.0.$Elim Rds" style="font-size:12px; border-top: 1px solid black;">Elim Rds</th>
   <th data-reactid=".1.0.0.$Elim Ballots" style="font-size:12px; border-top: 1px solid black;">Elim Ballots</th>
   <th data-reactid=".1.0.0.$Total" style="font-size:12px; border-top: 1px solid black; border-right: 1px solid black;">Total</th>
</tr>
<tr data-reactid=".1.1.0" style="font-size:12px;background-color: #5d5bff;border: 1px solid black;">
   <td data-reactid=".1.1.0.0:0" style="border-bottom: 1px solid black; border-left: 1px solid black;">Totals</td>
   <td data-reactid=".1.1.0.0:1" style="border-bottom: 1px solid black;">0% (0/0)</td>
   <td data-reactid=".1.1.0.0:2" style="border-bottom: 1px solid black;">0% (0/0)</td>
   <td data-reactid=".1.1.0.0:3" style="border-bottom: 1px solid black;">0% (0/0)</td>
   <td data-reactid=".1.1.0.0:4" style="border-bottom: 1px solid black;">0% (0/0)</td>
   <td data-reactid=".1.1.0.0:5" style="border-bottom: 1px solid black; border-right: 1px solid black;">0% (0/0)</td>
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


function createInsertContent(judgeContent, opponentContent) {
    return `
        <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        </tr>

        ${judgeContent}

    
        ${opponentContent}

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

async function formatJudgeContent(judgeArray) {
    let content = ``
    for(let i = 0; i < judgeArray.length; i++) {
        const judge = judgeArray[i]
        let easterEgg = ""
        if(judge[0] == "Measam Ali") {easterEgg = "<--- please read his paradigm, he gets sad if you don't"}
        content += `
            <tr>
                <td colspan="6" style="margin: 0px; padding: 0px;">
                    <p class="biggish semibold" style="background-color: indianred; margin-bottom: 0px; border: 1px solid black; margin: 0px; padding: 4px; font-size: 16px">
                        ${judge[0]} Paradigm
                    </p>
                </td>
            </tr>
            <tr style="border: 5px;border-color: #ddff00;height: 300px;">
                <td colspan="6" style="padding: 0px;">
                    <div class="paradigm ltborderbottom" style="padding: 0px;height: 300px;overflow: auto;background-color: #ff98b0; border: 1px solid black;">
                        ${await getParadigmContent(judge[1])} ${easterEgg}
                    </div>
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
    return content
}

function formatOpponentContent(opponentName, opponentRecordLink) {
    // TODO: change the record (last table row element) to getOpponentRecord(opponentName)
    let easterEgg = ""
    if(opponentName == ("Hebron CK")) {
        easterEgg = "<---- hey that's me"
    } else if (opponentName.includes("Hebron")) {easterEgg = "(Hawk Pride Never Dies)"}

    return `
        <tr style="margin: 0px;">
            <td colspan="6" style="margin: 0px; padding: 0px;">
                <p class="biggish semibold" style="background-color: #f2b3f5; margin-bottom: 0px; border: 1px solid black;margin: 0px;padding: 4px; font-size: 16px">
                    ${opponentName} Record ${easterEgg}
                </p>
            </td>
        </tr>
        <tr class="yellowrow" data-reactid=".1.0.0" style="font-size:12px; border: 1px solid black;">
            <th data-reactid=".1.0.0.$Comparison" style="font-size:12px; border-top: 1px solid black; border-left: 1px solid black;">Comparison</th>
            <th data-reactid=".1.0.0.$Prelim Rds" style="font-size:12px; border-top: 1px solid black;">Prelim Rds</th>
            <th data-reactid=".1.0.0.$Prelim Ballots" style="font-size:12px; border-top: 1px solid black;">Prelim Ballots</th>
            <th data-reactid=".1.0.0.$Elim Rds" style="font-size:12px; border-top: 1px solid black;">Elim Rds</th>
            <th data-reactid=".1.0.0.$Elim Ballots" style="font-size:12px; border-top: 1px solid black;">Elim Ballots</th>
            <th data-reactid=".1.0.0.$Total" style="font-size:12px; border-top: 1px solid black; border-right: 1px solid black;">Total</th>
        </tr>
        <tr data-reactid=".1.1.0" style="font-size:12px;background-color: #5d5bff;border: 1px solid black;">
            <td data-reactid=".1.1.0.0:0" style="border-bottom: 1px solid black; border-left: 1px solid black;">Totals</td>
            <td data-reactid=".1.1.0.0:1" style="border-bottom: 1px solid black;">0% (0/0)</td>
            <td data-reactid=".1.1.0.0:2" style="border-bottom: 1px solid black;">0% (0/0)</td>
            <td data-reactid=".1.1.0.0:3" style="border-bottom: 1px solid black;">0% (0/0)</td>
            <td data-reactid=".1.1.0.0:4" style="border-bottom: 1px solid black;">0% (0/0)</td>
            <td data-reactid=".1.1.0.0:5" style="border-bottom: 1px solid black; border-right: 1px solid black;">0% (0/0)</td>
        </tr>
    `
    // still need to figure out the record calculations
}

function insertHTML(html) {
    // TODO: change (if needed) for the current tab on the home page, right now is for the results page
    document.getElementsByClassName("full nospace martop dkborderbottom marbottommuchmore padleft")[0].children[1].children[1].children[0].outerHTML += html
}

function getOpponentName() {
    const tableBody = document.getElementsByClassName("full nospace martop dkborderbottom marbottommuchmore padleft")[0].children[1].children[1]
    const row = tableBody.children[0].children
    const oppIndex = row.length - 2
    return row[oppIndex].innerText
}

function getParadigmLinks() {
    const tableBody = document.getElementsByClassName("full nospace martop dkborderbottom marbottommuchmore padleft")[0].children[1].children[1]
    const row = tableBody.children[0].children
    const judgeIndex = row.length - 1
    let links = []
    const judgeDivs = row[judgeIndex].getElementsByClassName("full nospace flexrow")
    Array.from(judgeDivs).forEach(judge => {
        let name = judge.getElementsByClassName("threesevenths nowrap padvert marvertno smallish padleft")[0].title
        const paradgimLink = judge.getElementsByClassName("greytext buttonwhite smaller padmuchless marno")[0].href
        name = name.split(",").reverse().join(" ").trim() // converting from name "Last, First" to "First Last" without whitespace
        links.push([name, paradgimLink])
    })
    return links
}


const opp = document.getElementsByClassName("full nospace martop dkborderbottom marbottommuchmore padleft")[0].children[1].children[1].children[0].children
const oppIndex = opp.length - 2
//console.log(opp[oppIndex].textContent.trim())


async function everythingEverywhereAllAtOnce() {

    const opponentName = getOpponentName()
    // paradigms in the following format: [[name, paradigmLink], [name, paradigmLink] ...]
    const paradgimLinks = getParadigmLinks()
    // for when calculating records has been discovered
    // const entryPage = await getEventEntriesURL()
    
    // html of opponent record
    const opponentRecord = await getOpponentRecord(opponentName)
    
    const judgeContent = await formatJudgeContent(paradgimLinks)
    const opponentContent = formatOpponentContent(opponentName, opponentRecord)
    const insertContent = createInsertContent(judgeContent, opponentContent)

    insertHTML(insertContent)
}

everythingEverywhereAllAtOnce()
